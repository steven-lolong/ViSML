/**
 * @fileoverview SML text -> Visual-SML (ViSML) block converter.
 *
 * This module is the inverse of the SML code generator
 * (src/core/generator/sml): it parses the Standard ML text the generator
 * emits (and a tolerant superset of it) and rebuilds the corresponding
 * Blockly workspace serialization state, so the Code tab can be edited as
 * text and converted back into blocks.
 *
 * Coverage mirrors the generator block by block:
 *  - core declarations: val / fun / type / datatype / abstype / exception /
 *    local / open / infix / infixr / nonfix / structure
 *  - module language: signature and functor bindings, sig / struct
 *    expressions, specifications (val, type, eqtype, datatype, exception,
 *    structure, include, sharing) and refinements (where type)
 *  - expressions, matches, patterns and types, including the primitive
 *    arithmetic / logic operator blocks and generic infix applications
 */

type BlockState = {
  type: string;
  id: string;
  x?: number;
  y?: number;
  deletable?: boolean;
  movable?: boolean;
  editable?: boolean;
  fields?: Record<string, any>;
  extraState?: Record<string, any>;
  inputs?: Record<string, { block: BlockState }>;
};

type TokenType =
  | "id" // alphanumeric identifier
  | "kw" // reserved word
  | "sym" // symbolic identifier or reserved symbol (=, =>, ->, :, :>, |, #)
  | "tyvar" // 'a or ''a
  | "int"
  | "real"
  | "word"
  | "string"
  | "char"
  | "punct" // ( ) [ ] { } , ; . _ ...
  | "eof";

type Token = {
  type: TokenType;
  value: string;
  position: number;
};

const MAIN_PROGRAM_ID = "wka+5-ZSnLLMV2hW(||?";

const KEYWORDS = new Set([
  "abstype", "and", "andalso", "as", "case", "datatype", "do", "else",
  "end", "eqtype", "exception", "fn", "fun", "functor", "handle", "if",
  "in", "include", "infix", "infixr", "let", "local", "nonfix", "of",
  "op", "open", "orelse", "raise", "rec", "sharing", "sig", "signature",
  "struct", "structure", "then", "type", "val", "where", "while", "with",
  "withtype",
]);

const SYMBOLIC_CHARS = "!%&$#+-/:<=>?@\\~^|*";

/** Symbols that are reserved by the SML grammar (never infix operators). */
const RESERVED_SYMBOLS = new Set([":", "|", "=", "=>", "->", "#", ":>"]);

/** Operators rendered by the dedicated arithmetic operator block. */
const ARITH_OPERATORS = new Set(["+", "-", "*", "/"]);
/** Operators rendered by the dedicated logic operator block. */
const LOGIC_OPERATORS = new Set(["=", "<>", "<", "<=", ">", ">="]);
/** Alphanumeric identifiers that are infix in the SML basis. */
const BASIS_INFIX_WORDS = new Set(["div", "mod", "o"]);
/** Primitive types rendered by the typ_primtv block. */
const PRIMITIVE_TYPES = new Set(["int", "word", "real", "char", "string", "bool"]);

/** Keywords that start a core declaration. */
const DEC_KEYWORDS = new Set([
  "val", "fun", "type", "datatype", "abstype", "exception", "local",
  "open", "infix", "infixr", "nonfix", "structure",
]);

/** Keywords that begin a prefix expression form extending maximally right. */
const PREFIX_EXP_KEYWORDS = new Set(["raise", "if", "while", "case", "fn"]);

export class SmlParseError extends Error {
  constructor(message: string, readonly position: number) {
    super(`${message} at character ${position + 1}.`);
    this.name = "SmlParseError";
  }
}

class IdFactory {
  private nextId = 1;

  create(prefix = "sml"): string {
    return `${prefix}_${this.nextId++}`;
  }
}

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  const length = source.length;

  while (index < length) {
    const char = source[index];

    if (/\s/.test(char)) {
      index++;
      continue;
    }

    // Nested block comments (* ... (* ... *) ... *).
    if (char === "(" && source[index + 1] === "*") {
      const start = index;
      let depth = 1;
      index += 2;
      while (index < length && depth > 0) {
        if (source[index] === "(" && source[index + 1] === "*") {
          depth++;
          index += 2;
        } else if (source[index] === "*" && source[index + 1] === ")") {
          depth--;
          index += 2;
        } else {
          index++;
        }
      }
      if (depth > 0) throw new SmlParseError("Unterminated comment", start);
      continue;
    }

    // Character literal #"c".
    if (char === "#" && source[index + 1] === '"') {
      const start = index;
      index += 2;
      let value = "";
      while (index < length && source[index] !== '"') {
        if (source[index] === "\\" && index + 1 < length) {
          value += source[index] + source[index + 1];
          index += 2;
        } else {
          value += source[index++];
        }
      }
      if (source[index] !== '"') throw new SmlParseError("Unterminated character literal", start);
      index++;
      tokens.push({ type: "char", value, position: start });
      continue;
    }

    // String literal "...".
    if (char === '"') {
      const start = index++;
      let value = "";
      while (index < length && source[index] !== '"') {
        if (source[index] === "\\" && index + 1 < length) {
          value += source[index] + source[index + 1];
          index += 2;
        } else {
          value += source[index++];
        }
      }
      if (source[index] !== '"') throw new SmlParseError("Unterminated string literal", start);
      index++;
      tokens.push({ type: "string", value, position: start });
      continue;
    }

    // Type variables 'a and ''a.
    if (char === "'") {
      const match = source.slice(index).match(/^'{1,2}[A-Za-z0-9_']*/);
      if (match && match[0].replace(/^'+/, "").length > 0) {
        tokens.push({ type: "tyvar", value: match[0], position: index });
        index += match[0].length;
        continue;
      }
      throw new SmlParseError("Expected a type variable after '", index);
    }

    // Word, real and integer literals (including SML negation ~).
    const wordMatch = source.slice(index).match(/^0w\d+/);
    if (wordMatch) {
      tokens.push({ type: "word", value: wordMatch[0], position: index });
      index += wordMatch[0].length;
      continue;
    }
    const numberMatch = source.slice(index).match(/^~?\d+(\.\d+)?/);
    if (numberMatch && (char !== "~" || /\d/.test(source[index + 1] ?? ""))) {
      tokens.push({
        type: numberMatch[1] ? "real" : "int",
        value: numberMatch[0],
        position: index,
      });
      index += numberMatch[0].length;
      continue;
    }

    // Alphanumeric identifiers and keywords.
    const idMatch = source.slice(index).match(/^[A-Za-z][A-Za-z0-9_']*/);
    if (idMatch) {
      tokens.push({
        type: KEYWORDS.has(idMatch[0]) ? "kw" : "id",
        value: idMatch[0],
        position: index,
      });
      index += idMatch[0].length;
      continue;
    }

    // Record pattern wildcard "...".
    if (source.startsWith("...", index)) {
      tokens.push({ type: "punct", value: "...", position: index });
      index += 3;
      continue;
    }

    if ("()[]{},;._".includes(char)) {
      tokens.push({ type: "punct", value: char, position: index });
      index++;
      continue;
    }

    // Symbolic identifiers and reserved symbols (maximal munch).
    if (SYMBOLIC_CHARS.includes(char)) {
      const start = index;
      while (index < length && SYMBOLIC_CHARS.includes(source[index])) index++;
      tokens.push({ type: "sym", value: source.slice(start, index), position: start });
      continue;
    }

    throw new SmlParseError(`Unexpected character '${char}'`, index);
  }

  tokens.push({ type: "eof", value: "<eof>", position: length });
  return tokens;
}

// ---------------------------------------------------------------------------
// Block state helpers
// ---------------------------------------------------------------------------

function block(type: string, ids: IdFactory, extra: Partial<BlockState> = {}): BlockState {
  return { type, id: ids.create(type), ...extra };
}

function input(blockState: BlockState) {
  return { block: blockState };
}

function indexedInputs(blocks: BlockState[], prefix = "ADD"): Record<string, { block: BlockState }> {
  return blocks.reduce((inputs, child, index) => {
    inputs[`${prefix}${index}`] = input(child);
    return inputs;
  }, {} as Record<string, { block: BlockState }>);
}

function checkbox(on: boolean): string {
  return on ? "TRUE" : "FALSE";
}

function splitTypeVar(name: string) {
  if (name.startsWith("''")) return { constrType: "''", inputValue: name.slice(2) };
  if (name.startsWith("'")) return { constrType: "'", inputValue: name.slice(1) };
  return { constrType: "'", inputValue: name };
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

class Parser {
  private index = 0;
  private ids = new IdFactory();
  /** Identifiers declared infix by the user (infix / infixr declarations). */
  private userInfix = new Set<string>();

  constructor(private readonly tokens: Token[]) {}

  // -- token plumbing -------------------------------------------------------

  private peek(offset = 0): Token {
    return this.tokens[Math.min(this.index + offset, this.tokens.length - 1)];
  }

  private advance(): Token {
    const token = this.peek();
    this.index = Math.min(this.index + 1, this.tokens.length - 1);
    return token;
  }

  private mark(): number {
    return this.index;
  }

  private reset(mark: number) {
    this.index = mark;
  }

  private is(type: TokenType, value?: string): boolean {
    const token = this.peek();
    return token.type === type && (value === undefined || token.value === value);
  }

  private isValue(value: string): boolean {
    return this.peek().value === value;
  }

  private matchValue(value: string): boolean {
    if (!this.isValue(value)) return false;
    this.advance();
    return true;
  }

  private matchKeyword(keyword: string): boolean {
    if (!this.is("kw", keyword)) return false;
    this.advance();
    return true;
  }

  private expectValue(value: string, what?: string): Token {
    if (!this.isValue(value)) throw this.error(what ?? `Expected '${value}'`);
    return this.advance();
  }

  private expectIdentifier(what = "Expected an identifier"): Token {
    if (!this.is("id")) throw this.error(what);
    return this.advance();
  }

  private error(message: string): SmlParseError {
    return new SmlParseError(message, this.peek().position);
  }

  private skipSeparators() {
    while (this.matchValue(";")) { /* separators between declarations */ }
  }

  /** An "infix" occurrence: symbolic operator or user/basis infix word. */
  private isInfixOccurrence(token: Token): boolean {
    if (token.type === "sym") return !RESERVED_SYMBOLS.has(token.value) && token.value !== "~";
    if (token.type === "id") return BASIS_INFIX_WORDS.has(token.value) || this.userInfix.has(token.value);
    return false;
  }

  // -- shared identifier helpers -------------------------------------------

  private idBlock(name: string): BlockState {
    return block("id_id", this.ids, { fields: { inputValue: name } });
  }

  /** Parse `id (. id)*` and wrap it in an id_long_id block. */
  private parseLongIdBlock(first?: string): BlockState {
    const parts: string[] = [first ?? this.expectIdentifier().value];
    while (this.isValue(".") && this.peek(1).type === "id") {
      this.advance();
      parts.push(this.advance().value);
    }
    return this.longIdBlock(parts);
  }

  private longIdBlock(parts: string[]): BlockState {
    return block("id_long_id", this.ids, {
      extraState: { itemCount: parts.length },
      inputs: indexedInputs(parts.map((part) => this.idBlock(part))),
    });
  }

  /** Parse a record label (identifier or positional number). */
  private parseLabBlock(): BlockState {
    const token = this.peek();
    if (token.type === "int") {
      this.advance();
      return block("id_lab", this.ids, { fields: { MODE: "NUM", inputNum: Number(token.value) } });
    }
    if (token.type === "id") {
      this.advance();
      return block("id_lab", this.ids, {
        fields: { MODE: "ID" },
        inputs: { inputId: input(this.idBlock(token.value)) },
      });
    }
    throw this.error("Expected a record label");
  }

  /**
   * Parse an optional type-variable sequence ('a | ('a, 'b) | 'a, 'b) as used
   * before val/fun/type/datatype binders. Returns an id_long_var block.
   */
  private parseTyVarSeqOpt(): BlockState | undefined {
    const names: string[] = [];
    if (this.is("tyvar")) {
      names.push(this.advance().value);
      // The generator prints multiple binders as a bare comma list.
      while (this.isValue(",") && this.peek(1).type === "tyvar") {
        this.advance();
        names.push(this.advance().value);
      }
    } else if (this.isValue("(") && this.peek(1).type === "tyvar") {
      this.advance();
      names.push(this.advance().value);
      while (this.matchValue(",")) {
        if (!this.is("tyvar")) throw this.error("Expected a type variable");
        names.push(this.advance().value);
      }
      this.expectValue(")");
    } else {
      return undefined;
    }
    return block("id_long_var", this.ids, {
      extraState: { itemCount: names.length },
      inputs: indexedInputs(names.map((name) =>
        block("id_var", this.ids, { fields: splitTypeVar(name) })
      )),
    });
  }

  /** A single type variable (used by typrefin, which takes a "var" input). */
  private parseTyVarOpt(): BlockState | undefined {
    if (!this.is("tyvar")) return undefined;
    return block("id_var", this.ids, { fields: splitTypeVar(this.advance().value) });
  }

  // -- program --------------------------------------------------------------

  parseProgram(): BlockState[] {
    const items: BlockState[] = [];
    this.skipSeparators();

    while (!this.is("eof")) {
      if (this.matchKeyword("signature")) {
        items.push(block("program_signature", this.ids, {
          inputs: { sigbind: input(this.parseSigbindChain()) },
        }));
      } else if (this.matchKeyword("functor")) {
        items.push(block("program_functor", this.ids, {
          inputs: { fctbind: input(this.parseFctbindChain()) },
        }));
      } else {
        items.push(this.parseDeclaration());
      }
      this.skipSeparators();
    }

    return items;
  }

  // -- declarations ----------------------------------------------------------

  private parseDeclaration(): BlockState {
    if (this.matchKeyword("val")) return this.parseValDeclaration();
    if (this.matchKeyword("fun")) return this.parseFunDeclaration();
    if (this.matchKeyword("type")) {
      return block("dec_type", this.ids, {
        inputs: { typbind: input(this.parseTypbindChain()) },
      });
    }
    if (this.matchKeyword("datatype")) return this.parseDatatypeDeclaration();
    if (this.matchKeyword("abstype")) return this.parseAbstypeDeclaration();
    if (this.matchKeyword("exception")) {
      return block("dec_exception", this.ids, {
        inputs: { exnbind: input(this.parseExnbindChain()) },
      });
    }
    if (this.matchKeyword("local")) {
      const localDec = this.parseDeclarationSequence(["in"]);
      this.expectValue("in", "Expected 'in' inside local declaration");
      const inDec = this.parseDeclarationSequence(["end"]);
      this.expectValue("end", "Expected 'end' to close local declaration");
      const inputs: Record<string, { block: BlockState }> = {};
      if (localDec) inputs.local = input(localDec);
      if (inDec) inputs.in = input(inDec);
      return block("dec_local", this.ids, { inputs });
    }
    if (this.matchKeyword("open")) {
      const paths: BlockState[] = [];
      while (this.is("id")) paths.push(this.parseLongIdBlock());
      if (paths.length === 0) throw this.error("Expected a structure name after 'open'");
      return block("dec_open", this.ids, {
        extraState: { itemCount: paths.length },
        inputs: indexedInputs(paths),
      });
    }
    if (this.is("kw", "infix") || this.is("kw", "infixr")) {
      const keyword = this.advance().value;
      let digit = "";
      if (this.is("int") && /^\d$/.test(this.peek().value)) digit = this.advance().value;
      const names = this.parseFixityNames();
      names.forEach((name) => this.userInfix.add(name));
      return block(keyword === "infix" ? "dec_infix" : "dec_infixr", this.ids, {
        fields: { digit },
        extraState: { itemCount: names.length },
        inputs: indexedInputs(names.map((name) => this.idBlock(name))),
      });
    }
    if (this.matchKeyword("nonfix")) {
      const names = this.parseFixityNames();
      names.forEach((name) => this.userInfix.delete(name));
      return block("dec_nonfix", this.ids, {
        extraState: { itemCount: names.length },
        inputs: indexedInputs(names.map((name) => this.idBlock(name))),
      });
    }
    if (this.matchKeyword("structure")) {
      return block("dec_structure", this.ids, {
        inputs: { strbind: input(this.parseStrbindChain()) },
      });
    }
    throw this.error("Expected a declaration");
  }

  private parseFixityNames(): string[] {
    const names: string[] = [];
    while (this.is("id") || (this.is("sym") && !RESERVED_SYMBOLS.has(this.peek().value))) {
      names.push(this.advance().value);
    }
    if (names.length === 0) throw this.error("Expected at least one operator name");
    return names;
  }

  /**
   * Parse zero or more declarations (used by let/local/struct bodies) and
   * wrap them in a dec_sequence block when there is more than one.
   */
  private parseDeclarationSequence(stopValues: string[]): BlockState | undefined {
    const stops = new Set(stopValues);
    const declarations: BlockState[] = [];
    this.skipSeparators();
    while (!this.is("eof") && !stops.has(this.peek().value)) {
      declarations.push(this.parseDeclaration());
      this.skipSeparators();
    }
    if (declarations.length === 0) return undefined;
    if (declarations.length === 1) return declarations[0];
    return block("dec_sequence", this.ids, {
      extraState: { itemCount: declarations.length },
      inputs: indexedInputs(declarations),
    });
  }

  private parseValDeclaration(): BlockState {
    const tyVars = this.parseTyVarSeqOpt();
    const bindings = [this.parseValBinding()];
    while (this.matchKeyword("and")) bindings.push(this.parseValBinding());

    const inputs = indexedInputs(bindings);
    if (tyVars) inputs.inVar = input(tyVars);
    return block("dec_val", this.ids, {
      fields: { chkTyp: checkbox(!!tyVars) },
      extraState: { itemCount: bindings.length },
      inputs,
    });
  }

  private parseValBinding(): BlockState {
    const isRec = this.matchKeyword("rec");
    const pattern = this.parsePattern();
    this.expectValue("=", "Expected '=' in value binding");
    const expression = this.parseExpression();
    return block("valbind", this.ids, {
      fields: { recVal: isRec ? "rec" : "" },
      inputs: { pat: input(pattern), exp: input(expression) },
    });
  }

  private parseFunDeclaration(): BlockState {
    const tyVars = this.parseTyVarSeqOpt();
    const groups = [this.parseFunMatchGroup()];
    while (this.matchKeyword("and")) groups.push(this.parseFunMatchGroup());

    const inputs = indexedInputs(groups);
    if (tyVars) inputs.inVar = input(tyVars);
    return block("dec_fun", this.ids, {
      fields: { chkTyp: checkbox(!!tyVars) },
      extraState: { itemCount: groups.length },
      inputs,
    });
  }

  /** One `fun` binding: clauses separated by `|`. */
  private parseFunMatchGroup(): BlockState {
    const clauses = [this.parseFunClause()];
    while (this.matchValue("|")) clauses.push(this.parseFunClause());
    if (clauses.length === 1) return clauses[0];
    return block("funmatch_more_row", this.ids, {
      extraState: { itemCount: clauses.length },
      inputs: indexedInputs(clauses),
    });
  }

  private parseFunClause(): BlockState {
    // Nonfix clause: [op] name atpat+ [: typ] = exp
    const startsNonfix =
      this.is("kw", "op") ||
      (this.is("id") && !this.isInfixOccurrence(this.peek(1)));
    if (startsNonfix) return this.parseNonfixFunClause();

    // Parenthesised infix clause: ( pat id pat ) atpat* [: typ] = exp
    if (this.isValue("(")) {
      const marked = this.mark();
      try {
        return this.parseParenthesisedInfixFunClause();
      } catch (error) {
        if (!(error instanceof SmlParseError)) throw error;
        this.reset(marked);
      }
    }

    // Plain infix clause: pat id pat [: typ] = exp
    return this.parseInfixFunClause(undefined);
  }

  private parseNonfixFunClause(): BlockState {
    const usesOp = this.matchKeyword("op");
    const nameToken = this.peek();
    if (nameToken.type !== "id" && !(usesOp && nameToken.type === "sym")) {
      throw this.error("Expected a function name");
    }
    this.advance();

    const patterns: BlockState[] = [];
    while (this.startsAtomicPattern()) patterns.push(this.parseAtomicPattern());
    if (patterns.length === 0) throw this.error("Expected at least one function argument pattern");

    let returnType: BlockState | undefined;
    if (this.matchValue(":")) returnType = this.parseType();
    this.expectValue("=", "Expected '=' in function clause");
    const expression = this.parseExpression();

    const inputs: Record<string, { block: BlockState }> = {
      id: input(this.idBlock(nameToken.value)),
      ...indexedInputs(patterns),
      exp: input(expression),
    };
    if (returnType) inputs.inVar = input(returnType);
    return block("funmatch_nonfix", this.ids, {
      fields: { optr: usesOp ? "op" : " ", chkTyp: checkbox(!!returnType) },
      extraState: { itemCount: patterns.length },
      inputs,
    });
  }

  private parseParenthesisedInfixFunClause(): BlockState {
    this.expectValue("(");
    const left = this.parseConstructedPattern();
    const opToken = this.peek();
    if (!this.isInfixOccurrence(opToken)) throw this.error("Expected an infix operator");
    this.advance();
    const right = this.parseConstructedPattern();
    this.expectValue(")");

    const extraPatterns: BlockState[] = [];
    while (this.startsAtomicPattern()) extraPatterns.push(this.parseAtomicPattern());

    let returnType: BlockState | undefined;
    if (this.matchValue(":")) returnType = this.parseType();
    this.expectValue("=", "Expected '=' in function clause");
    const expression = this.parseExpression();

    if (extraPatterns.length === 0) {
      return this.buildInfixFunClause(left, opToken.value, right, returnType, expression);
    }
    const inputs: Record<string, { block: BlockState }> = {
      pat1: input(left),
      id: input(this.idBlock(opToken.value)),
      pat2: input(right),
      ...indexedInputs(extraPatterns),
      exp: input(expression),
    };
    if (returnType) inputs.inVar = input(returnType);
    return block("funmatch_infix_n_inhabitant", this.ids, {
      fields: { chkTyp: checkbox(!!returnType) },
      extraState: { itemCount: extraPatterns.length },
      inputs,
    });
  }

  private parseInfixFunClause(left?: BlockState): BlockState {
    const lhs = left ?? this.parseConstructedPattern();
    const opToken = this.peek();
    if (!this.isInfixOccurrence(opToken)) throw this.error("Expected an infix operator");
    this.advance();
    const rhs = this.parseConstructedPattern();

    let returnType: BlockState | undefined;
    if (this.matchValue(":")) returnType = this.parseType();
    this.expectValue("=", "Expected '=' in function clause");
    const expression = this.parseExpression();
    return this.buildInfixFunClause(lhs, opToken.value, rhs, returnType, expression);
  }

  private buildInfixFunClause(
    left: BlockState,
    operator: string,
    right: BlockState,
    returnType: BlockState | undefined,
    expression: BlockState
  ): BlockState {
    const inputs: Record<string, { block: BlockState }> = {
      pat1: input(left),
      id: input(this.idBlock(operator)),
      pat2: input(right),
      inexp: input(expression),
    };
    if (returnType) inputs.inTyp = input(returnType);
    return block("funmatch_infix", this.ids, {
      fields: { chkTyp: checkbox(!!returnType) },
      inputs,
    });
  }

  private parseTypbindChain(): BlockState {
    const bindings = [this.parseTypbind()];
    while (this.matchKeyword("and")) bindings.push(this.parseTypbind());
    if (bindings.length === 1) return bindings[0];
    return block("typebind_more_inhabitants", this.ids, {
      extraState: { itemCount: bindings.length },
      inputs: indexedInputs(bindings),
    });
  }

  private parseTypbind(): BlockState {
    const tyVars = this.parseTyVarSeqOpt();
    const name = this.expectIdentifier("Expected a type name").value;
    this.expectValue("=", "Expected '=' in type binding");
    const typeBlock = this.parseType();
    const inputs: Record<string, { block: BlockState }> = {
      id: input(this.idBlock(name)),
      inTyp: input(typeBlock),
    };
    if (tyVars) inputs.inVar = input(tyVars);
    return block("typbind", this.ids, {
      fields: { chkTyp: checkbox(!!tyVars) },
      inputs,
    });
  }

  private parseDatatypeDeclaration(): BlockState {
    // datatype id = datatype longid  (replication)
    if (
      this.is("id") &&
      this.peek(1).value === "=" &&
      this.peek(2).value === "datatype"
    ) {
      const name = this.advance().value;
      this.advance(); // =
      this.advance(); // datatype
      return block("dec_datatype_replication", this.ids, {
        inputs: {
          id: input(this.idBlock(name)),
          longid: input(this.parseLongIdBlock()),
        },
      });
    }

    const datbind = this.parseDatbindChain();
    let withType: BlockState | undefined;
    if (this.matchKeyword("withtype")) withType = this.parseTypbindChain();

    const inputs: Record<string, { block: BlockState }> = { datbind: input(datbind) };
    if (withType) inputs.inVar = input(withType);
    return block("dec_datatype_bind", this.ids, {
      fields: { chkTyp: checkbox(!!withType) },
      inputs,
    });
  }

  private parseAbstypeDeclaration(): BlockState {
    const datbind = this.parseDatbindChain();
    let withType: BlockState | undefined;
    if (this.matchKeyword("withtype")) withType = this.parseTypbindChain();
    this.expectValue("with", "Expected 'with' in abstype declaration");
    const body = this.parseDeclarationSequence(["end"]);
    this.expectValue("end", "Expected 'end' to close abstype declaration");

    const inputs: Record<string, { block: BlockState }> = { datbind: input(datbind) };
    if (withType) inputs.inVar = input(withType);
    if (body) inputs.withDec = input(body);
    return block("dec_abstype", this.ids, {
      fields: { chkTyp: checkbox(!!withType) },
      inputs,
    });
  }

  private parseDatbindChain(): BlockState {
    const bindings = [this.parseDatbind()];
    while (this.matchKeyword("and")) bindings.push(this.parseDatbind());
    if (bindings.length === 1) return bindings[0];
    return block("databind_more_inhabitants", this.ids, {
      extraState: { itemCount: bindings.length },
      inputs: indexedInputs(bindings),
    });
  }

  private parseDatbind(): BlockState {
    const tyVars = this.parseTyVarSeqOpt();
    const name = this.expectIdentifier("Expected a datatype name").value;
    this.expectValue("=", "Expected '=' in datatype binding");
    const constructors = this.parseConbindChain();
    const inputs: Record<string, { block: BlockState }> = {
      id: input(this.idBlock(name)),
      inConbind: input(constructors),
    };
    if (tyVars) inputs.inVar = input(tyVars);
    return block("datbind", this.ids, {
      fields: { chkTyp: checkbox(!!tyVars) },
      inputs,
    });
  }

  private parseConbindChain(): BlockState {
    const constructors = [this.parseConbind()];
    while (this.matchValue("|")) constructors.push(this.parseConbind());
    if (constructors.length === 1) return constructors[0];
    return block("conbind_more_inhabitants", this.ids, {
      extraState: { itemCount: constructors.length },
      inputs: indexedInputs(constructors),
    });
  }

  private parseConbind(): BlockState {
    const name = this.expectIdentifier("Expected a constructor name").value;
    let ofType: BlockState | undefined;
    if (this.matchKeyword("of")) ofType = this.parseType();
    const inputs: Record<string, { block: BlockState }> = { id: input(this.idBlock(name)) };
    if (ofType) inputs.inVar = input(ofType);
    return block("conbind", this.ids, {
      fields: { chkTyp: checkbox(!!ofType) },
      inputs,
    });
  }

  private parseExnbindChain(): BlockState {
    const bindings = [this.parseExnbind()];
    while (this.matchKeyword("and")) bindings.push(this.parseExnbind());
    if (bindings.length === 1) return bindings[0];
    return block("exnbind_more_inhabitants", this.ids, {
      extraState: { itemCount: bindings.length },
      inputs: indexedInputs(bindings),
    });
  }

  private parseExnbind(): BlockState {
    const name = this.expectIdentifier("Expected an exception name").value;
    if (this.matchValue("=")) {
      return block("exnbind_renaming", this.ids, {
        inputs: {
          id: input(this.idBlock(name)),
          longId: input(this.parseLongIdBlock()),
        },
      });
    }
    let ofType: BlockState | undefined;
    if (this.matchKeyword("of")) ofType = this.parseType();
    const inputs: Record<string, { block: BlockState }> = { id: input(this.idBlock(name)) };
    if (ofType) inputs.inVar = input(ofType);
    return block("exnbind", this.ids, {
      fields: { chkTyp: checkbox(!!ofType) },
      inputs,
    });
  }

  // -- structures ------------------------------------------------------------

  private parseStrbindChain(): BlockState {
    const bindings = [this.parseStrbind()];
    while (this.matchKeyword("and")) bindings.push(this.parseStrbind());
    if (bindings.length === 1) return bindings[0];
    return block("strbind_nested", this.ids, {
      extraState: { itemCount: bindings.length },
      inputs: indexedInputs(bindings),
    });
  }

  /** Parse `:`/`:>` (also tolerating the generator's spaced `: >`). */
  private matchSignatureConstraint(): "" | ">" | undefined {
    if (this.matchValue(":>")) return ">";
    if (this.isValue(":")) {
      this.advance();
      if (this.matchValue(">")) return ">";
      return "";
    }
    return undefined;
  }

  private parseStrbind(): BlockState {
    const name = this.expectIdentifier("Expected a structure name").value;
    const constraint = this.matchSignatureConstraint();
    let signature: BlockState | undefined;
    if (constraint !== undefined) signature = this.parseSignatureExpression();
    this.expectValue("=", "Expected '=' in structure binding");
    const structure = this.parseStructureExpression();

    const inputs: Record<string, { block: BlockState }> = {
      id: input(this.idBlock(name)),
      inputStr: input(structure),
    };
    if (signature) inputs.inputSig = input(signature);
    // The greatherSign dropdown only exists while chkSub is checked.
    const fields: Record<string, any> = { chkSub: checkbox(constraint !== undefined) };
    if (constraint !== undefined) fields.greatherSign = constraint === ">" ? ">" : "";
    return block("strbind_single", this.ids, { fields, inputs });
  }

  private parseStructureExpression(): BlockState {
    let structure = this.parseAtomicStructureExpression();
    // Signature annotations: str : sig (transparent) / str :> sig (opaque).
    for (;;) {
      const constraint = this.matchSignatureConstraint();
      if (constraint === undefined) break;
      const signature = this.parseSignatureExpression();
      structure = block(
        constraint === ">" ? "str_opaque_annotation" : "str_transparent_annotation",
        this.ids,
        { inputs: { str: input(structure), sig: input(signature) } }
      );
    }
    return structure;
  }

  private parseAtomicStructureExpression(): BlockState {
    if (this.matchKeyword("struct")) {
      const body = this.parseDeclarationSequence(["end"]);
      this.expectValue("end", "Expected 'end' to close structure");
      return block("str_structure", this.ids, {
        inputs: body ? { dec: input(body) } : {},
      });
    }
    if (this.matchKeyword("let")) {
      const declarations = this.parseDeclarationSequence(["in"]);
      this.expectValue("in", "Expected 'in' inside structure-level let");
      const structure = this.parseStructureExpression();
      this.expectValue("end", "Expected 'end' to close structure-level let");
      const inputs: Record<string, { block: BlockState }> = { str: input(structure) };
      if (declarations) inputs.dec = input(declarations);
      return block("str_local_declaration", this.ids, { inputs });
    }
    if (this.is("id")) {
      const name = this.advance().value;
      // Functor application: FunctorName ( str-or-dec ).
      if (this.isValue("(") && this.peek(1).value !== ".") {
        this.advance();
        const inner = this.peek();
        const isStructureArg =
          inner.type === "id" || inner.value === "struct" || inner.value === "let";
        if (isStructureArg) {
          const argument = this.parseStructureExpression();
          this.expectValue(")", "Expected ')' after functor argument");
          return block("str_functor_application_str", this.ids, {
            inputs: { id: input(this.idBlock(name)), str: input(argument) },
          });
        }
        const argument = this.parseDeclarationSequence([")"]);
        this.expectValue(")", "Expected ')' after functor argument");
        return block("str_functor_application_dec", this.ids, {
          inputs: {
            id: input(this.idBlock(name)),
            ...(argument ? { dec: input(argument) } : {}),
          },
        });
      }
      return block("str_identifier", this.ids, {
        inputs: { longId: input(this.parseLongIdBlock(name)) },
      });
    }
    throw this.error("Expected a structure expression");
  }

  // -- signatures ------------------------------------------------------------

  private parseSigbindChain(): BlockState {
    const bindings = [this.parseSigbind()];
    while (this.matchKeyword("and")) bindings.push(this.parseSigbind());
    if (bindings.length === 1) return bindings[0];
    return block("sigbind_nested", this.ids, {
      extraState: { itemCount: bindings.length },
      inputs: indexedInputs(bindings),
    });
  }

  private parseSigbind(): BlockState {
    const name = this.expectIdentifier("Expected a signature name").value;
    this.expectValue("=", "Expected '=' in signature binding");
    const signature = this.parseSignatureExpression();
    return block("sigbind_single", this.ids, {
      inputs: { inputId: input(this.idBlock(name)), inputVar: input(signature) },
    });
  }

  private parseSignatureExpression(): BlockState {
    let signature = this.parseAtomicSignatureExpression();
    while (this.matchKeyword("where")) {
      this.expectValue("type", "Expected 'type' after 'where'");
      const refinement = this.parseTyprefinChain();
      signature = block("sig_refinement", this.ids, {
        inputs: { sig: input(signature), typrefin: input(refinement) },
      });
    }
    return signature;
  }

  private parseAtomicSignatureExpression(): BlockState {
    if (this.matchKeyword("sig")) {
      const body = this.parseSpecificationSequence();
      this.expectValue("end", "Expected 'end' to close signature");
      return block("sig_signature", this.ids, {
        inputs: body ? { spec: input(body) } : {},
      });
    }
    if (this.is("id")) {
      return block("sig_id", this.ids, {
        inputs: { id: input(this.idBlock(this.advance().value)) },
      });
    }
    throw this.error("Expected a signature expression");
  }

  private parseTyprefinChain(): BlockState {
    const refinements = [this.parseTyprefin()];
    while (this.matchKeyword("and")) {
      this.matchKeyword("type"); // tolerate the standard `and type` form
      refinements.push(this.parseTyprefin());
    }
    if (refinements.length === 1) return refinements[0];
    return block("typrefin_nested", this.ids, {
      extraState: { itemCount: refinements.length },
      inputs: indexedInputs(refinements),
    });
  }

  private parseTyprefin(): BlockState {
    const tyVar = this.parseTyVarOpt();
    const path = this.parseLongIdBlock();
    this.expectValue("=", "Expected '=' in type refinement");
    const typeBlock = this.parseType();
    const inputs: Record<string, { block: BlockState }> = {
      inputLongid: input(path),
      inputTyp: input(typeBlock),
    };
    if (tyVar) inputs.inputVar = input(tyVar);
    return block("typrefin_single", this.ids, {
      fields: { chkSub: checkbox(!!tyVar) },
      inputs,
    });
  }

  // -- specifications ---------------------------------------------------------

  private parseSpecificationSequence(): BlockState | undefined {
    let specs: BlockState[] = [];
    for (;;) {
      this.skipSeparators();
      if (this.matchKeyword("sharing")) {
        // `sharing [type] longid = longid ...` constrains the preceding specs.
        const sharingType = this.matchKeyword("type") ? "type" : "";
        const paths = [this.parseLongIdBlock()];
        while (this.matchValue("=")) paths.push(this.parseLongIdBlock());
        const preceding = this.wrapSpecs(specs);
        specs = [
          block("spec_type_sharing", this.ids, {
            fields: { sharingType },
            extraState: { itemCount: paths.length },
            inputs: {
              ...(preceding ? { specBlock: input(preceding) } : {}),
              ...indexedInputs(paths),
            },
          }),
        ];
        continue;
      }
      const spec = this.parseSpecificationOpt();
      if (!spec) break;
      specs.push(spec);
    }
    return this.wrapSpecs(specs);
  }

  private wrapSpecs(specs: BlockState[]): BlockState | undefined {
    if (specs.length === 0) return undefined;
    if (specs.length === 1) return specs[0];
    return block("spec_sequence", this.ids, {
      extraState: { itemCount: specs.length },
      inputs: indexedInputs(specs),
    });
  }

  private parseSpecificationOpt(): BlockState | undefined {
    if (this.matchKeyword("val")) {
      return block("spec_value", this.ids, {
        inputs: { valdesc: input(this.parseValdescChain()) },
      });
    }
    if (this.is("kw", "type") || this.is("kw", "eqtype")) {
      const keyword = this.advance().value;
      // A `type` spec with '=' is a type abbreviation backed by typbind.
      const marked = this.mark();
      this.parseTyVarSeqOpt();
      this.expectIdentifier("Expected a type name");
      const isAbbreviation = this.isValue("=");
      this.reset(marked);

      if (keyword === "type" && isAbbreviation) {
        return block("spec_type_abbreviation", this.ids, {
          inputs: { typbind: input(this.parseTypbindChain()) },
        });
      }
      return block(keyword === "type" ? "spec_type" : "spec_equality_type", this.ids, {
        inputs: { typdesc: input(this.parseTypdescChain()) },
      });
    }
    if (this.matchKeyword("datatype")) {
      if (
        this.is("id") &&
        this.peek(1).value === "=" &&
        this.peek(2).value === "datatype"
      ) {
        const name = this.advance().value;
        this.advance(); // =
        this.advance(); // datatype
        return block("spec_datatype_replication", this.ids, {
          inputs: {
            datId: input(this.idBlock(name)),
            datLongId: input(this.parseLongIdBlock()),
          },
        });
      }
      return block("spec_datatype", this.ids, {
        inputs: { datdesc: input(this.parseDatdescChain()) },
      });
    }
    if (this.matchKeyword("exception")) {
      return block("spec_exception", this.ids, {
        inputs: { exndesc: input(this.parseExndescChain()) },
      });
    }
    if (this.matchKeyword("structure")) {
      return block("spec_structure", this.ids, {
        inputs: { strdesc: input(this.parseStrdescChain()) },
      });
    }
    if (this.matchKeyword("include")) {
      // Several bare signature ids -> spec_inclusion; otherwise a full sigexp.
      if (this.is("id") && this.peek(1).type === "id") {
        const names: BlockState[] = [];
        while (this.is("id")) names.push(this.idBlock(this.advance().value));
        return block("spec_inclusion", this.ids, {
          extraState: { itemCount: names.length },
          inputs: indexedInputs(names),
        });
      }
      return block("spec_inclusion_sig", this.ids, {
        inputs: { sig: input(this.parseSignatureExpression()) },
      });
    }
    return undefined;
  }

  private parseValdescChain(): BlockState {
    const items = [this.parseValdesc()];
    while (this.matchKeyword("and")) items.push(this.parseValdesc());
    if (items.length === 1) return items[0];
    return block("valdesc_nested", this.ids, {
      extraState: { itemCount: items.length },
      inputs: indexedInputs(items),
    });
  }

  private parseValdesc(): BlockState {
    const name = this.expectIdentifier("Expected a value name").value;
    this.expectValue(":", "Expected ':' in value description");
    return block("valdesc_single", this.ids, {
      inputs: {
        inputId: input(this.idBlock(name)),
        inputTyp: input(this.parseType()),
      },
    });
  }

  private parseTypdescChain(): BlockState {
    const items = [this.parseTypdesc()];
    while (this.matchKeyword("and")) items.push(this.parseTypdesc());
    if (items.length === 1) return items[0];
    return block("typdesc_nested", this.ids, {
      extraState: { itemCount: items.length },
      inputs: indexedInputs(items),
    });
  }

  private parseTypdesc(): BlockState {
    const tyVars = this.parseTyVarSeqOpt();
    const name = this.expectIdentifier("Expected a type name").value;
    const inputs: Record<string, { block: BlockState }> = {
      inputId: input(this.idBlock(name)),
    };
    if (tyVars) inputs.inputVar = input(tyVars);
    return block("typdesc_single", this.ids, {
      fields: { chkSub: checkbox(!!tyVars) },
      inputs,
    });
  }

  private parseDatdescChain(): BlockState {
    const items = [this.parseDatdesc()];
    while (this.matchKeyword("and")) items.push(this.parseDatdesc());
    if (items.length === 1) return items[0];
    return block("datdesc_nested", this.ids, {
      extraState: { itemCount: items.length },
      inputs: indexedInputs(items),
    });
  }

  private parseDatdesc(): BlockState {
    const tyVars = this.parseTyVarSeqOpt();
    const name = this.expectIdentifier("Expected a datatype name").value;
    this.expectValue("=", "Expected '=' in datatype description");
    const constructors = this.parseCondescChain();
    const inputs: Record<string, { block: BlockState }> = {
      inputId: input(this.idBlock(name)),
      inputConDesc: input(constructors),
    };
    if (tyVars) inputs.inputVar = input(tyVars);
    return block("datdesc_single", this.ids, {
      fields: { chkSub: checkbox(!!tyVars) },
      inputs,
    });
  }

  private parseCondescChain(): BlockState {
    const items = [this.parseCondesc()];
    while (this.matchValue("|")) items.push(this.parseCondesc());
    if (items.length === 1) return items[0];
    return block("condesc_nested", this.ids, {
      extraState: { itemCount: items.length },
      inputs: indexedInputs(items),
    });
  }

  private parseCondesc(): BlockState {
    const name = this.expectIdentifier("Expected a constructor name").value;
    let ofType: BlockState | undefined;
    if (this.matchKeyword("of")) ofType = this.parseType();
    const inputs: Record<string, { block: BlockState }> = {
      inputId: input(this.idBlock(name)),
    };
    if (ofType) inputs.inputVar = input(ofType);
    return block("condesc_single", this.ids, {
      fields: { chkSub: checkbox(!!ofType) },
      inputs,
    });
  }

  private parseExndescChain(): BlockState {
    const items = [this.parseExndesc()];
    while (this.matchKeyword("and")) items.push(this.parseExndesc());
    if (items.length === 1) return items[0];
    return block("exndesc_nested", this.ids, {
      extraState: { itemCount: items.length },
      inputs: indexedInputs(items),
    });
  }

  private parseExndesc(): BlockState {
    const name = this.expectIdentifier("Expected an exception name").value;
    let ofType: BlockState | undefined;
    if (this.matchKeyword("of")) ofType = this.parseType();
    const inputs: Record<string, { block: BlockState }> = {
      inputId: input(this.idBlock(name)),
    };
    if (ofType) inputs.inputVar = input(ofType);
    return block("exndesc_single", this.ids, {
      fields: { chkSub: checkbox(!!ofType) },
      inputs,
    });
  }

  private parseStrdescChain(): BlockState {
    const items = [this.parseStrdesc()];
    while (this.matchKeyword("and")) items.push(this.parseStrdesc());
    if (items.length === 1) return items[0];
    return block("strdesc_nested", this.ids, {
      extraState: { itemCount: items.length },
      inputs: indexedInputs(items),
    });
  }

  private parseStrdesc(): BlockState {
    const name = this.expectIdentifier("Expected a structure name").value;
    this.expectValue(":", "Expected ':' in structure description");
    return block("strdesc_single", this.ids, {
      inputs: {
        inputId: input(this.idBlock(name)),
        inputSig: input(this.parseSignatureExpression()),
      },
    });
  }

  // -- functors ---------------------------------------------------------------

  private parseFctbindChain(): BlockState {
    const bindings = [this.parseFctbind()];
    while (this.matchKeyword("and")) bindings.push(this.parseFctbind());
    if (bindings.length === 1) return bindings[0];
    return block("fctbind_nested", this.ids, {
      extraState: { itemCount: bindings.length },
      inputs: indexedInputs(bindings),
    });
  }

  private parseFctbind(): BlockState {
    const name = this.expectIdentifier("Expected a functor name").value;
    this.expectValue("(", "Expected '(' after functor name");

    // Plain form: functor F ( X : SIG ) ... / opened form: functor F ( spec ) ...
    const isPlain = this.is("id") && (this.peek(1).value === ":" || this.peek(1).value === ":>");
    let argumentName: string | undefined;
    let argumentSig: BlockState | undefined;
    let argumentSpec: BlockState | undefined;
    if (isPlain) {
      argumentName = this.advance().value;
      this.expectValue(":", "Expected ':' after functor argument name");
      argumentSig = this.parseSignatureExpression();
    } else {
      argumentSpec = this.parseSpecificationSequence();
      if (!argumentSpec) throw this.error("Expected a functor argument");
    }
    this.expectValue(")", "Expected ')' after functor argument");

    const constraint = this.matchSignatureConstraint();
    let resultSig: BlockState | undefined;
    if (constraint !== undefined) resultSig = this.parseSignatureExpression();
    this.expectValue("=", "Expected '=' in functor binding");
    const body = this.parseStructureExpression();

    // The isTrans dropdown only exists while chkSub is checked.
    const fields: Record<string, any> = { chkSub: checkbox(constraint !== undefined) };
    if (constraint !== undefined) fields.isTrans = constraint === ">" ? ">" : "";
    if (argumentName !== undefined) {
      const inputs: Record<string, { block: BlockState }> = {
        inputId1: input(this.idBlock(name)),
        inputId2: input(this.idBlock(argumentName)),
        inputSig: input(argumentSig!),
        inputStr: input(body),
      };
      if (resultSig) inputs.inputVar = input(resultSig);
      return block("fctbind_plain", this.ids, { fields, inputs });
    }
    const inputs: Record<string, { block: BlockState }> = {
      inputId: input(this.idBlock(name)),
      inputSpec: input(argumentSpec!),
      inputStr: input(body),
    };
    if (resultSig) inputs.inputVar = input(resultSig);
    return block("fctbind_opened", this.ids, { fields, inputs });
  }

  // -- expressions -------------------------------------------------------------

  private parseExpression(): BlockState {
    const token = this.peek();
    if (token.type === "kw" && PREFIX_EXP_KEYWORDS.has(token.value)) {
      switch (token.value) {
        case "raise": {
          this.advance();
          return block("exp_raise", this.ids, {
            inputs: { exp: input(this.parseExpression()) },
          });
        }
        case "if": {
          this.advance();
          const condition = this.parseExpression();
          this.expectValue("then", "Expected 'then' after if condition");
          const thenExpression = this.parseExpression();
          this.expectValue("else", "Expected 'else' after then branch");
          const elseExpression = this.parseExpression();
          return block("exp_if_else", this.ids, {
            inputs: {
              if: input(condition),
              then: input(thenExpression),
              else: input(elseExpression),
            },
          });
        }
        case "while": {
          this.advance();
          const condition = this.parseExpression();
          this.expectValue("do", "Expected 'do' after while condition");
          return block("exp_while_do", this.ids, {
            inputs: { while: input(condition), do: input(this.parseExpression()) },
          });
        }
        case "case": {
          this.advance();
          const scrutinee = this.parseExpression();
          this.expectValue("of", "Expected 'of' after case expression");
          return block("exp_case", this.ids, {
            inputs: { case: input(scrutinee), of: input(this.parseMatch()) },
          });
        }
        case "fn": {
          this.advance();
          return block("exp_fn", this.ids, {
            inputs: { fn: input(this.parseMatch()) },
          });
        }
      }
    }
    return this.parseHandleExpression();
  }

  /** Right operand of a binary operator (may itself be a prefix form). */
  private parseOperand(next: () => BlockState): BlockState {
    const token = this.peek();
    if (token.type === "kw" && PREFIX_EXP_KEYWORDS.has(token.value)) {
      return this.parseExpression();
    }
    return next.call(this);
  }

  private parseHandleExpression(): BlockState {
    let expression = this.parseOrelseExpression();
    while (this.matchKeyword("handle")) {
      expression = block("exp_handle", this.ids, {
        inputs: { exp: input(expression), match: input(this.parseMatch()) },
      });
    }
    return expression;
  }

  private parseOrelseExpression(): BlockState {
    let expression = this.parseAndalsoExpression();
    while (this.matchKeyword("orelse")) {
      expression = block("exp_orelse", this.ids, {
        inputs: {
          exp1: input(expression),
          exp2: input(this.parseOperand(this.parseAndalsoExpression)),
        },
      });
    }
    return expression;
  }

  private parseAndalsoExpression(): BlockState {
    let expression = this.parseTypedExpression();
    while (this.matchKeyword("andalso")) {
      expression = block("exp_andalso", this.ids, {
        inputs: {
          exp1: input(expression),
          exp2: input(this.parseOperand(this.parseTypedExpression)),
        },
      });
    }
    return expression;
  }

  private parseTypedExpression(): BlockState {
    let expression = this.parseInfix3Expression();
    while (this.matchValue(":")) {
      expression = block("exp_with_type", this.ids, {
        inputs: { exp: input(expression), typ: input(this.parseType()) },
      });
    }
    return expression;
  }

  private infixApplication(left: BlockState, operator: string, right: BlockState): BlockState {
    return block("exp_infix_application", this.ids, {
      inputs: {
        exp1: input(left),
        id: input(this.idBlock(operator)),
        exp2: input(right),
      },
    });
  }

  private arithmeticOperator(left: BlockState, operator: string, right: BlockState): BlockState {
    return block("exp_primtv_optr_arith", this.ids, {
      fields: { opt: operator },
      inputs: { exp_1: input(left), exp_2: input(right) },
    });
  }

  /** Precedence 3: `o` and `:=`. */
  private parseInfix3Expression(): BlockState {
    let expression = this.parseInfix4Expression();
    while (this.isValue(":=") || this.is("id", "o")) {
      const operator = this.advance().value;
      expression = this.infixApplication(
        expression,
        operator,
        this.parseOperand(this.parseInfix4Expression)
      );
    }
    return expression;
  }

  /** Precedence 4: comparisons plus any other (user-declared) infix ids. */
  private parseInfix4Expression(): BlockState {
    let expression = this.parseInfix5Expression();
    for (;;) {
      const token = this.peek();
      if (token.type === "sym" && LOGIC_OPERATORS.has(token.value)) {
        this.advance();
        expression = block("exp_primtv_optr_logic", this.ids, {
          fields: { opt: token.value },
          inputs: {
            exp_1: input(expression),
            exp_2: input(this.parseOperand(this.parseInfix5Expression)),
          },
        });
        continue;
      }
      const isOtherInfix =
        this.isInfixOccurrence(token) &&
        !ARITH_OPERATORS.has(token.value) &&
        !BASIS_INFIX_WORDS.has(token.value) &&
        token.value !== "::" && token.value !== "@" &&
        token.value !== "^" && token.value !== ":=";
      if (isOtherInfix) {
        this.advance();
        expression = this.infixApplication(
          expression,
          token.value,
          this.parseOperand(this.parseInfix5Expression)
        );
        continue;
      }
      return expression;
    }
  }

  /** Precedence 5 (right associative): `::` and `@`. */
  private parseInfix5Expression(): BlockState {
    const left = this.parseInfix6Expression();
    if (this.isValue("::") || this.isValue("@")) {
      const operator = this.advance().value;
      return this.infixApplication(
        left,
        operator,
        this.parseOperand(this.parseInfix5Expression)
      );
    }
    return left;
  }

  /** Precedence 6: `+`, `-` (arith block) and `^`. */
  private parseInfix6Expression(): BlockState {
    let expression = this.parseInfix7Expression();
    while (this.isValue("+") || this.isValue("-") || this.isValue("^")) {
      const operator = this.advance().value;
      const right = this.parseOperand(this.parseInfix7Expression);
      expression = operator === "^"
        ? this.infixApplication(expression, operator, right)
        : this.arithmeticOperator(expression, operator, right);
    }
    return expression;
  }

  /** Precedence 7: `*`, `/` (arith block) and `div`, `mod`. */
  private parseInfix7Expression(): BlockState {
    let expression = this.parseApplicationExpression();
    while (
      this.isValue("*") || this.isValue("/") ||
      this.is("id", "div") || this.is("id", "mod")
    ) {
      const operator = this.advance().value;
      const right = this.parseOperand(this.parseApplicationExpression);
      expression = operator === "*" || operator === "/"
        ? this.arithmeticOperator(expression, operator, right)
        : this.infixApplication(expression, operator, right);
    }
    return expression;
  }

  private parseApplicationExpression(): BlockState {
    let expression = this.parseAtomicExpression();
    while (this.startsAtomicExpression()) {
      expression = block("exp_application", this.ids, {
        inputs: { exp1: input(expression), exp2: input(this.parseAtomicExpression()) },
      });
    }
    return expression;
  }

  private startsAtomicExpression(): boolean {
    const token = this.peek();
    switch (token.type) {
      case "int": case "real": case "word": case "string": case "char":
        return true;
      case "punct":
        return token.value === "(" || token.value === "[" || token.value === "{";
      case "sym":
        return token.value === "#" || token.value === "~";
      case "id":
        return !BASIS_INFIX_WORDS.has(token.value) && !this.userInfix.has(token.value);
      case "kw":
        return token.value === "op" || token.value === "let";
      default:
        return false;
    }
  }

  private parseAtomicExpression(): BlockState {
    const token = this.peek();

    switch (token.type) {
      case "int": {
        this.advance();
        return block("con_int", this.ids, {
          fields: { inputValue: Number(token.value.replace("~", "-")) },
        });
      }
      case "real": {
        this.advance();
        const [whole, fraction = "0"] = token.value.replace("~", "-").split(".");
        return block("con_float", this.ids, {
          fields: { NAME: Number(whole), inputValue: Number(fraction) },
        });
      }
      case "word": {
        this.advance();
        return block("con_word", this.ids, {
          fields: { inputValue: Number(token.value.slice(2)) },
        });
      }
      case "string": {
        this.advance();
        return block("con_string", this.ids, { fields: { inputValue: token.value } });
      }
      case "char": {
        this.advance();
        return block("con_char", this.ids, { fields: { inputValue: token.value } });
      }
    }

    if (token.value === "#") {
      this.advance();
      return block("exp_record_select", this.ids, {
        inputs: { lab: input(this.parseLabBlock()) },
      });
    }
    if (token.value === "~") {
      // Unary negation is the ~ function applied by juxtaposition.
      this.advance();
      return this.boundExpression(["~"], false);
    }
    if (this.matchKeyword("op")) {
      const operator = this.peek();
      if (operator.type !== "id" && operator.type !== "sym") {
        throw this.error("Expected an identifier after 'op'");
      }
      this.advance();
      return this.boundExpression([operator.value], true);
    }
    if (this.matchKeyword("let")) return this.parseLetExpression();

    if (token.type === "id") {
      const parts = [this.advance().value];
      while (this.isValue(".") && this.peek(1).type === "id") {
        this.advance();
        parts.push(this.advance().value);
      }
      return this.boundExpression(parts, false);
    }

    if (token.value === "(") return this.parseParenthesisedExpression();
    if (token.value === "[") {
      this.advance();
      const items: BlockState[] = [];
      if (!this.isValue("]")) {
        items.push(this.parseExpression());
        while (this.matchValue(",")) items.push(this.parseExpression());
      }
      this.expectValue("]", "Expected ']' to close list");
      return block("exp_list", this.ids, {
        extraState: { itemCount: items.length },
        inputs: indexedInputs(items),
      });
    }
    if (token.value === "{") {
      this.advance();
      const rows: BlockState[] = [];
      if (!this.isValue("}")) {
        rows.push(this.parseExpressionRow());
        while (this.matchValue(",")) rows.push(this.parseExpressionRow());
      }
      this.expectValue("}", "Expected '}' to close record");
      return block("exp_record", this.ids, {
        extraState: { itemCount: rows.length },
        inputs: indexedInputs(rows),
      });
    }

    throw this.error("Expected an expression");
  }

  private boundExpression(parts: string[], usesOp: boolean): BlockState {
    return block("exp_bound", this.ids, {
      fields: { opt: usesOp ? "OP" : "NON_OP" },
      inputs: { longid: input(this.longIdBlock(parts)) },
    });
  }

  private parseExpressionRow(): BlockState {
    const lab = this.parseLabBlock();
    this.expectValue("=", "Expected '=' in record row");
    return block("exprow", this.ids, {
      inputs: { lab: input(lab), exp: input(this.parseExpression()) },
    });
  }

  private parseParenthesisedExpression(): BlockState {
    this.expectValue("(");
    if (this.matchValue(")")) {
      // Unit: an empty tuple prints as ().
      return block("exp_tuple", this.ids, { extraState: { itemCount: 0 }, inputs: {} });
    }

    const first = this.parseExpression();
    if (this.matchValue(",")) {
      const items = [first, this.parseExpression()];
      while (this.matchValue(",")) items.push(this.parseExpression());
      this.expectValue(")", "Expected ')' to close tuple");
      return block("exp_tuple", this.ids, {
        extraState: { itemCount: items.length },
        inputs: indexedInputs(items),
      });
    }
    if (this.matchValue(";")) {
      const items = [first, this.parseExpression()];
      while (this.matchValue(";")) items.push(this.parseExpression());
      this.expectValue(")", "Expected ')' to close expression sequence");
      return block("exp_sequence", this.ids, {
        extraState: { itemCount: items.length },
        inputs: indexedInputs(items),
      });
    }
    this.expectValue(")", "Expected ')' after expression");
    // Operator and sequence blocks emit their own parentheses; wrapping them
    // again would add a pair of parentheses on every round-trip.
    if (
      first.type === "exp_primtv_optr_arith" ||
      first.type === "exp_primtv_optr_logic" ||
      first.type === "exp_sequence"
    ) {
      return first;
    }
    return block("exp_parentheses", this.ids, { inputs: { exp: input(first) } });
  }

  private parseLetExpression(): BlockState {
    const declarations = this.parseDeclarationSequence(["in"]);
    this.expectValue("in", "Expected 'in' inside let expression");

    // The generator prints multiple body expressions inside { ... }.
    const braced = this.matchValue("{");
    const expressions = [this.parseExpression()];
    while (this.matchValue(";")) expressions.push(this.parseExpression());
    if (braced) this.expectValue("}", "Expected '}' to close let body");
    this.expectValue("end", "Expected 'end' to close let expression");

    const inputs: Record<string, { block: BlockState }> = indexedInputs(expressions);
    if (declarations) inputs.let = input(declarations);
    return block("exp_let_in_end", this.ids, {
      extraState: { itemCount: expressions.length },
      inputs,
    });
  }

  // -- matches -----------------------------------------------------------------

  private parseMatch(): BlockState {
    const rules = [this.parseMatchRule()];
    while (this.matchValue("|")) rules.push(this.parseMatchRule());
    if (rules.length === 1) return rules[0];
    return block("matchs", this.ids, {
      extraState: { itemCount: rules.length },
      inputs: indexedInputs(rules),
    });
  }

  private parseMatchRule(): BlockState {
    const pattern = this.parsePattern();
    this.expectValue("=>", "Expected '=>' in match rule");
    return block("match", this.ids, {
      inputs: { pat: input(pattern), exp: input(this.parseExpression()) },
    });
  }

  // -- patterns ----------------------------------------------------------------

  private parsePattern(): BlockState {
    // Layered pattern: [op] id [: typ] as pat
    const marked = this.mark();
    const layered = this.tryParseLayeredPattern();
    if (layered) return layered;
    this.reset(marked);

    let pattern = this.parseInfixPattern();
    while (this.matchValue(":")) {
      pattern = block("pat_type_annotation", this.ids, {
        inputs: { pat: input(pattern), typ: input(this.parseType()) },
      });
    }
    return pattern;
  }

  private tryParseLayeredPattern(): BlockState | undefined {
    try {
      const usesOp = this.matchKeyword("op");
      if (!this.is("id") || this.peek(1).value === ".") return undefined;
      const name = this.advance().value;
      let annotation: BlockState | undefined;
      if (this.matchValue(":")) annotation = this.parseType();
      if (!this.matchKeyword("as")) return undefined;

      const inputs: Record<string, { block: BlockState }> = {
        id: input(this.idBlock(name)),
        inPat: input(this.parsePattern()),
      };
      if (annotation) inputs.inTyp = input(annotation);
      return block("pat_layered", this.ids, {
        fields: {
          Op: usesOp ? "operator" : "nothing",
          chkTyp: checkbox(!!annotation),
        },
        inputs,
      });
    } catch (error) {
      if (error instanceof SmlParseError) return undefined;
      throw error;
    }
  }

  private parseInfixPattern(): BlockState {
    const left = this.parseConstructedPattern();
    const token = this.peek();
    if (this.isInfixOccurrence(token)) {
      this.advance();
      return block("pat_infix", this.ids, {
        inputs: {
          pat_lhs: input(left),
          id: input(this.idBlock(token.value)),
          // Right associative, matching the list constructor `::`.
          pat_rhs: input(this.parseInfixPattern()),
        },
      });
    }
    return left;
  }

  /** A possibly-applied constructor pattern: [op] longid atpat | atpat. */
  private parseConstructedPattern(): BlockState {
    const usesOp = this.is("kw", "op") && (this.peek(1).type === "id" || this.peek(1).type === "sym");
    if (usesOp) this.advance();

    if (this.is("id")) {
      const parts = [this.advance().value];
      while (this.isValue(".") && this.peek(1).type === "id") {
        this.advance();
        parts.push(this.advance().value);
      }
      if (this.startsAtomicPattern()) {
        return block("pat_long_id", this.ids, {
          fields: { OP: usesOp ? "operator" : "nothing", patOpt: "pattern" },
          inputs: {
            longId: input(this.longIdBlock(parts)),
            PATTERN: input(this.parseAtomicPattern()),
          },
        });
      }
      return this.identifierPattern(parts, usesOp);
    }
    if (usesOp && this.is("sym")) {
      return this.identifierPattern([this.advance().value], true);
    }
    return this.parseAtomicPattern();
  }

  private identifierPattern(parts: string[], usesOp: boolean): BlockState {
    if (parts.length === 1) {
      return block("pat_id", this.ids, {
        fields: { OP: usesOp ? "operator" : "nothing" },
        inputs: { id: input(this.idBlock(parts[0])) },
      });
    }
    return block("pat_long_id", this.ids, {
      fields: { OP: usesOp ? "operator" : "nothing", patOpt: "nothing" },
      inputs: { longId: input(this.longIdBlock(parts)) },
    });
  }

  private startsAtomicPattern(): boolean {
    const token = this.peek();
    switch (token.type) {
      case "int": case "real": case "word": case "string": case "char":
        return true;
      case "punct":
        return token.value === "(" || token.value === "[" ||
          token.value === "{" || token.value === "_";
      case "id":
        return !BASIS_INFIX_WORDS.has(token.value) && !this.userInfix.has(token.value);
      case "kw":
        return token.value === "op";
      default:
        return false;
    }
  }

  private parseAtomicPattern(): BlockState {
    const token = this.peek();

    if (token.value === "_") {
      this.advance();
      return block("pat_wildcard", this.ids);
    }
    switch (token.type) {
      case "int": {
        this.advance();
        return block("con_int", this.ids, {
          fields: { inputValue: Number(token.value.replace("~", "-")) },
        });
      }
      case "real": {
        this.advance();
        const [whole, fraction = "0"] = token.value.replace("~", "-").split(".");
        return block("con_float", this.ids, {
          fields: { NAME: Number(whole), inputValue: Number(fraction) },
        });
      }
      case "word": {
        this.advance();
        return block("con_word", this.ids, {
          fields: { inputValue: Number(token.value.slice(2)) },
        });
      }
      case "string": {
        this.advance();
        return block("con_string", this.ids, { fields: { inputValue: token.value } });
      }
      case "char": {
        this.advance();
        return block("con_char", this.ids, { fields: { inputValue: token.value } });
      }
    }

    if (this.is("kw", "op")) {
      // op inside an atomic position: [op] id without argument.
      this.advance();
      const nameToken = this.peek();
      if (nameToken.type !== "id" && nameToken.type !== "sym") {
        throw this.error("Expected an identifier after 'op'");
      }
      this.advance();
      return this.identifierPattern([nameToken.value], true);
    }

    if (token.type === "id") {
      const parts = [this.advance().value];
      while (this.isValue(".") && this.peek(1).type === "id") {
        this.advance();
        parts.push(this.advance().value);
      }
      return this.identifierPattern(parts, false);
    }

    if (token.value === "(") {
      this.advance();
      if (this.matchValue(")")) {
        return block("pat_tuple", this.ids, { extraState: { itemCount: 0 }, inputs: {} });
      }
      const first = this.parsePattern();
      if (this.matchValue(",")) {
        const items = [first, this.parsePattern()];
        while (this.matchValue(",")) items.push(this.parsePattern());
        this.expectValue(")", "Expected ')' to close tuple pattern");
        return block("pat_tuple", this.ids, {
          extraState: { itemCount: items.length },
          inputs: indexedInputs(items),
        });
      }
      this.expectValue(")", "Expected ')' after pattern");
      return block("pat_parentheses", this.ids, { inputs: { pat: input(first) } });
    }
    if (token.value === "[") {
      this.advance();
      const items: BlockState[] = [];
      if (!this.isValue("]")) {
        items.push(this.parsePattern());
        while (this.matchValue(",")) items.push(this.parsePattern());
      }
      this.expectValue("]", "Expected ']' to close list pattern");
      return block("pat_list", this.ids, {
        extraState: { itemCount: items.length },
        inputs: indexedInputs(items),
      });
    }
    if (token.value === "{") {
      this.advance();
      const rows: BlockState[] = [];
      if (!this.isValue("}")) {
        rows.push(this.parsePatternRow());
        while (this.matchValue(",")) rows.push(this.parsePatternRow());
      }
      this.expectValue("}", "Expected '}' to close record pattern");
      return block("pat_record", this.ids, {
        extraState: { itemCount: rows.length },
        inputs: indexedInputs(rows),
      });
    }

    throw this.error("Expected a pattern");
  }

  private parsePatternRow(): BlockState {
    if (this.matchValue("...")) return block("patrow_wildcard", this.ids);

    // lab = pat (label may be a number or an identifier)
    if (this.is("int") || (this.is("id") && this.peek(1).value === "=")) {
      const lab = this.parseLabBlock();
      this.expectValue("=", "Expected '=' in record pattern row");
      return block("patrow_lab_pat", this.ids, {
        inputs: { lab: input(lab), pat: input(this.parsePattern()) },
      });
    }

    // id [: typ] [as pat] shorthand row.
    const name = this.expectIdentifier("Expected a record pattern row").value;
    let annotation: BlockState | undefined;
    if (this.matchValue(":")) annotation = this.parseType();
    let layered: BlockState | undefined;
    if (this.matchKeyword("as")) layered = this.parsePattern();

    const inputs: Record<string, { block: BlockState }> = { id: input(this.idBlock(name)) };
    if (annotation) inputs.inTyp = input(annotation);
    if (layered) inputs.inPat = input(layered);
    return block("patrow_variable", this.ids, {
      fields: { chkTyp: checkbox(!!annotation), chkAs: checkbox(!!layered) },
      inputs,
    });
  }

  // -- types --------------------------------------------------------------------

  private parseType(): BlockState {
    const from = this.parseTupleType();
    if (this.matchValue("->")) {
      return block("typ_function", this.ids, {
        inputs: { from: input(from), to: input(this.parseType()) },
      });
    }
    return from;
  }

  private parseTupleType(): BlockState {
    const parts = [this.parseConstructedType()];
    while (this.isValue("*")) {
      this.advance();
      parts.push(this.parseConstructedType());
    }
    if (parts.length === 1) return parts[0];
    return block("typ_tuple", this.ids, {
      extraState: { itemCount: parts.length },
      inputs: indexedInputs(parts),
    });
  }

  private parseConstructedType(): BlockState {
    let typeBlock = this.parseAtomicType();
    // Postfix constructors: t list, t option, t Foo.map, ...
    while (this.is("id")) {
      if (this.peek().value === "list") {
        this.advance();
        typeBlock = block("typ_list", this.ids, { inputs: { typ: input(typeBlock) } });
        continue;
      }
      typeBlock = block("typ_constructor", this.ids, {
        extraState: { itemCount: 1 },
        inputs: { ADD0: input(typeBlock), longid: input(this.parseLongIdBlock()) },
      });
    }
    return typeBlock;
  }

  private parseAtomicType(): BlockState {
    const token = this.peek();

    if (token.type === "tyvar") {
      this.advance();
      return block("typ_var", this.ids, {
        inputs: {
          typ_var: input(block("id_var", this.ids, { fields: splitTypeVar(token.value) })),
        },
      });
    }
    if (token.type === "id") {
      if (PRIMITIVE_TYPES.has(token.value) && this.peek(1).value !== ".") {
        this.advance();
        return block("typ_primtv", this.ids, { fields: { type: token.value } });
      }
      return block("typ_constructor", this.ids, {
        extraState: { itemCount: 0 },
        inputs: { longid: input(this.parseLongIdBlock()) },
      });
    }
    if (token.value === "(") {
      this.advance();
      const items = [this.parseType()];
      while (this.matchValue(",")) items.push(this.parseType());
      this.expectValue(")", "Expected ')' in type");
      if (items.length === 1) {
        return block("typ_parentheses", this.ids, { inputs: { typ: input(items[0]) } });
      }
      // ( t1, t2 ) tycon
      if (!this.is("id")) throw this.error("Expected a type constructor after ')'");
      return block("typ_constructor", this.ids, {
        extraState: { itemCount: items.length },
        inputs: { ...indexedInputs(items), longid: input(this.parseLongIdBlock()) },
      });
    }
    if (token.value === "{") {
      this.advance();
      const labs: BlockState[] = [];
      const typs: BlockState[] = [];
      if (!this.isValue("}")) {
        do {
          labs.push(this.parseLabBlock());
          this.expectValue(":", "Expected ':' in record type row");
          typs.push(this.parseType());
        } while (this.matchValue(","));
      }
      this.expectValue("}", "Expected '}' to close record type");
      const inputs = {
        ...indexedInputs(labs, "ADD"),
        ...indexedInputs(typs, "TYP"),
      };
      return block("typ_record", this.ids, {
        extraState: { itemCount: labs.length },
        inputs,
      });
    }

    throw this.error("Expected a type");
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Parse SML source text and produce the Blockly workspace serialization state
 * of the equivalent ViSML block program.
 * @param source The SML source text (comments are ignored).
 * @returns A state object accepted by Blockly.serialization.workspaces.load.
 */
export function smlToVismlWorkspaceState(source: string) {
  const tokens = tokenize(source);
  const parser = new Parser(tokens);
  const declarations = parser.parseProgram();

  const program: BlockState = {
    type: "program",
    id: MAIN_PROGRAM_ID,
    x: 50,
    y: 110,
    deletable: false,
    movable: true,
    editable: true,
    extraState: { itemCount: Math.max(1, declarations.length) },
    inputs: indexedInputs(declarations),
  };

  return {
    blocks: {
      languageVersion: 0,
      blocks: [program],
    },
  };
}
