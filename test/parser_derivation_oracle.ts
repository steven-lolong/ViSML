import { Parser, tokenize } from "../src/core/parser/sml_to_visml";

type TraceNode = {
  method: string;
  start: number;
  end: number;
  children: TraceNode[];
};

type CanonicalNode = {
  m: string;
  t?: string[];
  c?: CanonicalNode[];
};

const IGNORED_PUNCT = new Set(["(", ")", ";"]);
const STRUCTURAL_SYMBOLS = new Set([":", ":>", "=", "=>", "->", "|", "#"]);
const LEFT_FOLD_METHODS = new Set([
  "parseHandleExpression",
  "parseOrelseExpression",
  "parseAndalsoExpression",
  "parseTypedExpression",
  "parseInfix3Expression",
  "parseInfix4Expression",
  "parseInfix6Expression",
  "parseInfix7Expression",
]);

function projectedToken(token: any): string | undefined {
  if (!token || token.type === "eof") return undefined;
  if (token.type === "punct") {
    if (IGNORED_PUNCT.has(token.value)) return undefined;
    return `punct:${token.value}`;
  }
  if (token.type === "kw") return `kw:${token.value}`;
  if (token.type === "sym") {
    return STRUCTURAL_SYMBOLS.has(token.value) ? `sym:${token.value}` : "sym:operator";
  }
  if (["id", "tyvar", "int", "real", "word", "string", "char"].includes(token.type)) {
    return token.type;
  }
  return `${token.type}:${token.value}`;
}

function canonicalize(node: TraceNode, tokens: any[], root = false): CanonicalNode {
  const covered = (index: number) =>
    node.children.some((child) => child.start <= index && index < child.end);
  const localTokens: string[] = [];
  for (let i = node.start; i < node.end; i++) {
    if (covered(i)) continue;
    const projected = projectedToken(tokens[i]);
    if (projected !== undefined) localTokens.push(projected);
  }
  const children = node.children.map((child) => canonicalize(child, tokens, false));

  // Several recursive-descent precedence methods implement a left-associative
  // chain as one loop.  A printer-inserted parenthesis can cause the same chain
  // to be observed as nested invocations of that method.  Convert both forms to
  // the same explicit left fold before comparing derivations.
  if (
    LEFT_FOLD_METHODS.has(node.method) &&
    localTokens.length > 0 &&
    children.length === localTokens.length + 1
  ) {
    let folded = children[0];
    for (let i = 0; i < localTokens.length; i++) {
      folded = { m: `${node.method}#step`, t: [localTokens[i]], c: [folded, children[i + 1]] };
    }
    return folded;
  }

  // Parser precedence plumbing and source-only parentheses frequently form a
  // transparent one-child layer.  Collapsing only such layers quotients the
  // printer's permitted parenthesis normalization without erasing branching,
  // repetition, operator, declaration, pattern, or type structure.
  if (!root && localTokens.length === 0 && children.length === 1) return children[0];

  const result: CanonicalNode = { m: node.method };
  if (localTokens.length > 0) result.t = localTokens;
  if (children.length > 0) result.c = children;
  return result;
}

/**
 * Build a source-side derivation signature from recursive-descent parser control
 * flow.  This oracle never reads Blockly block types, fields, IDs, coordinates,
 * serialization metadata, or preservation metadata.
 *
 * It intentionally shares ViSML's tokenizer/parser implementation; its
 * independence is from the visual provenance channel, not from the parser.
 */
export function smlParserDerivationOracle(source: string): string {
  const tokens: any[] = (tokenize as any)(source);
  const parser: any = new (Parser as any)(tokens);
  const prototype = Object.getPrototypeOf(parser);
  const methodNames = Object.getOwnPropertyNames(prototype)
    .filter((name) => /^(parse|tryParse)/.test(name) && typeof parser[name] === "function");

  const stack: TraceNode[] = [];
  let root: TraceNode | undefined;

  for (const name of methodNames) {
    const original = parser[name];
    parser[name] = (...args: any[]) => {
      const parent = stack[stack.length - 1];
      const node: TraceNode = {
        method: name,
        start: parser.index,
        end: parser.index,
        children: [],
      };
      stack.push(node);
      try {
        const result = original.apply(parser, args);
        node.end = parser.index;
        stack.pop();
        // Optional/speculative parsers returning undefined did not select a
        // grammar alternative and therefore do not enter the oracle tree.
        if (result !== undefined) {
          if (parent) parent.children.push(node);
          else if (name === "parseProgram") root = node;
        }
        return result;
      } catch (error) {
        stack.pop();
        throw error;
      }
    };
  }

  parser.parseProgram();
  if (!root) throw new Error("derivation oracle did not observe parseProgram");
  return JSON.stringify(canonicalize(root, tokens, true));
}

function parenthesisPairs(tokens: any[]): Array<[number, number]> {
  const stack: number[] = [];
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type !== "punct") continue;
    if (token.value === "(") {
      stack.push(i);
    } else if (token.value === ")") {
      const open = stack.pop();
      if (open !== undefined) pairs.push([open, i]);
    }
  }
  return pairs;
}

function removeCharacters(source: string, positions: number[]): string {
  const chars = source.split("");
  for (const position of [...positions].sort((a, b) => b - a)) chars.splice(position, 1);
  return chars.join("");
}

/**
 * Return exactly those parenthesis token positions that are demonstrably
 * presentation-only for this parser derivation.  A pair is erasable only when:
 *  - it encloses at least one token (so unit `()` can never be erased), and
 *  - deleting exactly that matched pair still parses to the same canonical
 *    derivation.
 *
 * Tuple, sequence, module-application, and other grammar-owned parentheses are
 * therefore retained unless the parser can prove the pair is structure-neutral.
 */
function presentationParenthesisPositions(source: string): Set<number> {
  const tokens: any[] = (tokenize as any)(source).filter((token: any) => token.type !== "eof");
  const baseline = smlParserDerivationOracle(source);
  const erasable = new Set<number>();

  for (const [openIndex, closeIndex] of parenthesisPairs(tokens)) {
    if (closeIndex <= openIndex + 1) continue;
    const open = tokens[openIndex];
    const close = tokens[closeIndex];
    const candidate = removeCharacters(source, [open.position, close.position]);
    try {
      if (smlParserDerivationOracle(candidate) === baseline) {
        erasable.add(open.position);
        erasable.add(close.position);
      }
    } catch {
      // If removing the pair makes the program unparsable, the parentheses are
      // grammar-owned for this occurrence and must remain concrete fidelity tokens.
    }
  }
  return erasable;
}

function lexicalTokens(source: string): any[] {
  const presentationParens = presentationParenthesisPositions(source);
  return (tokenize as any)(source).filter((token: any) =>
    token.type !== "eof" &&
    !(token.type === "punct" &&
      (token.value === "(" || token.value === ")") &&
      presentationParens.has(token.position))
  );
}

function sameConcreteToken(a: any, b: any): boolean {
  return a.type === b.type && a.value === b.value;
}

/**
 * Executable conservative check of the paper's directional lexical-fidelity
 * relation.  Unlike the former strip-all-parentheses implementation, this keeps
 * grammar-owned parentheses in the concrete token stream and normalizes only
 * matched pairs proven structure-neutral by the parser derivation oracle.
 */
export function lexicalFidelity(source: string, generated: string): { ok: boolean; reason?: string } {
  const expected = lexicalTokens(source);
  const actual = lexicalTokens(generated);
  let i = 0;
  let j = 0;

  while (i < expected.length && j < actual.length) {
    if (sameConcreteToken(expected[i], actual[j])) {
      i++;
      j++;
      continue;
    }
    // The only unmatched generated token admitted after structure-sensitive
    // parenthesis normalization is a declaration/layout semicolon.  Source
    // semicolons are consumed normally by the equality branch above.
    if (actual[j].type === "punct" && actual[j].value === ";") {
      j++;
      continue;
    }
    return {
      ok: false,
      reason: `expected ${expected[i].type}:${expected[i].value} but generated ${actual[j].type}:${actual[j].value}`,
    };
  }

  if (i !== expected.length) {
    const token = expected[i];
    return { ok: false, reason: `generated output ended before source token ${token.type}:${token.value}` };
  }
  while (j < actual.length) {
    if (!(actual[j].type === "punct" && actual[j].value === ";")) {
      return { ok: false, reason: `unexpected generated token ${actual[j].type}:${actual[j].value}` };
    }
    j++;
  }
  return { ok: true };
}
