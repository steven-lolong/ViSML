/**
 * @fileoverview SML layout formatter.
 *
 * Re-flows generated SML into a standard layout (single spaces, no spaces
 * inside parentheses/brackets, blank line between top-level declarations,
 * indented `let`/`local`/`struct`/`sig` bodies and aligned `|` alternatives).
 *
 * SML is layout-insensitive, so this only changes whitespace: the token
 * sequence (identifiers, literals, comments) is preserved exactly, which means
 * formatting can never change the meaning of the program.
 */

/** Top-level declaration keywords (get a blank line before them). */
const DECL = new Set([
  "val", "fun", "datatype", "type", "structure", "signature",
  "exception", "open", "infix", "infixr", "nonfix", "abstype",
]);
/** Block openers whose body is indented and closed by `end`. */
const OPENERS = new Set(["let", "local", "struct", "sig"]);
const OPEN_DELIM = new Set(["(", "[", "{"]);
const CLOSE_DELIM = new Set([")", "]", "}"]);

interface Tok {
  t: string;
  k: string;
}

/**
 * Tokenize SML source, treating string literals, character literals and block
 * comments as single atomic tokens (so their contents are never reformatted).
 * @param src The SML source to tokenize.
 * @returns The ordered list of tokens.
 */
function tokenize(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  const n = src.length;
  const sym = "!#$%&*+-/:<=>?@\\^|~";
  while (i < n) {
    const c = src[i];
    if (c === " " || c === "\t" || c === "\n" || c === "\r") {
      i++;
      continue;
    }
    if (c === "(" && src[i + 1] === "*") {
      let d = 1;
      let j = i + 2;
      while (j < n && d > 0) {
        if (src[j] === "(" && src[j + 1] === "*") {
          d++;
          j += 2;
        } else if (src[j] === "*" && src[j + 1] === ")") {
          d--;
          j += 2;
        } else {
          j++;
        }
      }
      toks.push({ t: src.slice(i, j), k: "comment" });
      i = j;
      continue;
    }
    if (c === "#" && src[i + 1] === '"') {
      let j = i + 2;
      while (j < n && src[j] !== '"') {
        if (src[j] === "\\") j += 2;
        else j++;
      }
      j++;
      toks.push({ t: src.slice(i, j), k: "char" });
      i = j;
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      while (j < n && src[j] !== '"') {
        if (src[j] === "\\") j += 2;
        else j++;
      }
      j++;
      toks.push({ t: src.slice(i, j), k: "string" });
      i = j;
      continue;
    }
    if ("()[]{},;".indexOf(c) !== -1) {
      toks.push({ t: c, k: "delim" });
      i++;
      continue;
    }
    if (/[A-Za-z_']/.test(c)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_'.]/.test(src[j])) j++;
      toks.push({ t: src.slice(i, j), k: "word" });
      i = j;
      continue;
    }
    if (/[0-9]/.test(c) || (c === "~" && /[0-9]/.test(src[i + 1]))) {
      let j = i + 1;
      while (j < n && /[0-9.eExXwabcdefABCDEF]/.test(src[j])) j++;
      toks.push({ t: src.slice(i, j), k: "num" });
      i = j;
      continue;
    }
    if (sym.indexOf(c) !== -1) {
      let j = i;
      while (j < n && sym.indexOf(src[j]) !== -1) j++;
      toks.push({ t: src.slice(i, j), k: "sym" });
      i = j;
      continue;
    }
    if (c === ".") {
      // Keep dot runs (the record wildcard "...") as a single token.
      let j = i;
      while (j < n && src[j] === ".") j++;
      toks.push({ t: src.slice(i, j), k: "word" });
      i = j;
      continue;
    }
    toks.push({ t: c, k: "other" });
    i++;
  }
  return toks;
}

interface Line {
  indent: string;
  text: string;
  lastTok: string;
  breakAfter: boolean;
}

/**
 * Format generated SML into a standard, readable layout. Only whitespace is
 * changed; the token sequence is preserved.
 * @param src The raw generated SML.
 * @returns The reformatted SML.
 */
export function formatSml(src: string): string {
  const toks = tokenize(src);
  const UNIT = "    ";
  let depth = 0;
  let parenDepth = 0;
  let pendingCase = 0;
  const lines: Line[] = [];
  let cur: Line | null = null;
  let firstAlt = false;

  const flush = () => {
    if (cur) lines.push(cur);
  };

  for (let idx = 0; idx < toks.length; idx++) {
    const tok = toks[idx];
    const t = tok.t;
    const word = tok.k === "word" ? t : "";
    const atTop = depth === 0 && parenDepth === 0;
    let doBreak = false;
    let blank = false;
    let lineIndent = depth;
    let altKind = "";

    if (cur === null) {
      doBreak = true;
    } else if (parenDepth === 0 && DECL.has(word)) {
      doBreak = true;
      blank = atTop;
      if (atTop) pendingCase = 0;
    } else if (parenDepth === 0 && word === "and") {
      doBreak = true;
    } else if (parenDepth === 0 && (word === "in" || word === "end")) {
      doBreak = true;
      if (word === "end") depth = Math.max(0, depth - 1);
      lineIndent = word === "end" ? depth : Math.max(0, depth - 1);
    } else if (parenDepth === 0 && t === "|") {
      doBreak = true;
      altKind = "bar";
    } else if (firstAlt) {
      doBreak = true;
      altKind = "first";
    } else if (cur && cur.breakAfter) {
      doBreak = true;
    }

    if (doBreak) {
      let ind = UNIT.repeat(Math.max(0, lineIndent));
      if (altKind === "bar") ind = UNIT.repeat(Math.max(0, lineIndent)) + "  ";
      else if (altKind === "first") ind = UNIT.repeat(Math.max(0, lineIndent)) + UNIT;
      if (blank) {
        flush();
        lines.push({ indent: "", text: "", lastTok: "", breakAfter: false });
      } else {
        flush();
      }
      cur = { indent: ind, text: "", lastTok: "", breakAfter: false };
      firstAlt = false;
    }

    // emit token with horizontal spacing rules
    if (cur!.text === "") {
      cur!.text = t;
    } else {
      const prev = cur!.lastTok;
      let space = " ";
      if (CLOSE_DELIM.has(t) || t === "," || t === ";") space = "";
      else if (OPEN_DELIM.has(prev)) space = "";
      cur!.text += space + t;
    }
    cur!.lastTok = t;

    if (OPEN_DELIM.has(t)) parenDepth++;
    else if (CLOSE_DELIM.has(t)) parenDepth = Math.max(0, parenDepth - 1);

    cur!.breakAfter = false;
    if (parenDepth === 0 && tok.k === "word") {
      if (OPENERS.has(word)) {
        depth++;
        cur!.breakAfter = true;
      } else if (word === "case") {
        pendingCase++;
      } else if (word === "of") {
        if (pendingCase > 0) {
          pendingCase--;
          firstAlt = true;
          cur!.breakAfter = true;
        }
        // otherwise `of` belongs to a datatype/exception constructor: keep inline
      } else if (word === "in") {
        cur!.breakAfter = true;
      }
    }
  }
  flush();

  const outLines = lines.map((l) => (l.text === "" ? "" : l.indent + l.text));
  return outLines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "")
    .replace(/\s+$/, "") + "\n";
}

export default formatSml;
