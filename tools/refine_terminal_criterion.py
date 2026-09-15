#!/usr/bin/env python3
from pathlib import Path

path = Path("test/run_roundtrip.js")
text = path.read_text()
old = r'''function terminalRecoveryHolds(source, generated) {
  // The pretty-printer is allowed to normalize grouping/layout punctuation:
  // expression/type-variable parentheses and declaration semicolons.  All
  // remaining lexical token identities must be exactly equal and in order.
  const ignoredLayout = new Set(["punct:(", "punct:)", "punct:;"]);
  const expected = terminalTokenSignature(source).filter((t) => !ignoredLayout.has(t));
  const actual = terminalTokenSignature(generated).filter((t) => !ignoredLayout.has(t));
  return JSON.stringify(actual) === JSON.stringify(expected);
}'''
new = r'''function terminalRecoveryHolds(source, generated) {
  // Parentheses are presentation normalization and may be inserted or removed.
  // Every other source token, including source semicolons, must still occur in
  // order.  The printer may add semicolons as declaration-layout separators;
  // those are the only unmatched generated tokens permitted.
  const withoutParens = (tokens) =>
    tokens.filter((t) => t !== "punct:(" && t !== "punct:)");
  const expected = withoutParens(terminalTokenSignature(source));
  const actual = withoutParens(terminalTokenSignature(generated));
  let index = 0;
  for (const token of actual) {
    if (index < expected.length && token === expected[index]) {
      index++;
      continue;
    }
    if (token === "punct:;") continue;
    return false;
  }
  return index === expected.length;
}'''
if text.count(old) != 1:
    raise SystemExit(f"terminal criterion anchor count: {text.count(old)}")
path.write_text(text.replace(old, new, 1))
print("refined Criterion T: source non-parenthesis tokens preserved; only extra semicolons allowed")
