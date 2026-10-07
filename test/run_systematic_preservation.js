#!/usr/bin/env node
/**
 * Deterministic bounded combinatorial preservation suite.
 *
 * The main 98-case corpus remains the primary empirical denominator. This
 * additional suite systematically combines representative expression,
 * control-flow, pattern, and type forms and checks the same S/T/P obligations:
 *   S: generated text is a fixed point;
 *   T: concrete lexical fidelity under the documented normalization;
 *   P: parser-derivation equality without consulting visual provenance data.
 *
 * It is a bounded generated suite, not an exhaustive generator for the full
 * 132-production presentation and not a replacement for the main corpus.
 */

const {
  smlToVismlWorkspaceState,
  stateToCode,
  findUnregisteredType,
  smlParserDerivationOracle,
  lexicalFidelity,
} = require("./dist/roundtrip.bundle.js");

const cases = [];

const pairs = [
  ["0", "1"],
  ["3.05", "3.5"],
  ["true", "false"],
  ['"a"', '"b"'],
  ["[1]", "[2]"],
  ["x", "y"],
];
const operators = ["+", "-", "*", "div", "mod", "<", "<=", "=", "<>", "andalso", "orelse", "::", "@", "^"];

for (const op of operators) {
  for (let i = 0; i < pairs.length; i++) {
    const [left, right] = pairs[i];
    cases.push([`operator-${op}-${i}`, `val g_${cases.length} = ${left} ${op} ${right}`]);
  }
}

const atoms = ["0", "1", "3.05", "true", "false", '"x"', "[1, 2]", "(1, 2)"];
for (let i = 0; i < atoms.length; i++) {
  const a = atoms[i];
  const b = atoms[(i + 1) % atoms.length];
  cases.push([`if-${i}`, `val gi_${i} = if true then ${a} else ${b}`]);
  cases.push([`let-${i}`, `val gl_${i} = let val z = ${a} in z end`]);
  cases.push([`case-${i}`, `val gc_${i} = case ${a} of _ => ${b}`]);
}

const patterns = [
  "_",
  "x",
  "(x, y)",
  "[x, y]",
  "x :: xs",
  "{x, ...}",
  "SOME x",
  "(x : int)",
];
for (let i = 0; i < patterns.length; i++) {
  cases.push([`pattern-${i}`, `val ${patterns[i]} = 1`]);
}

const types = [
  "int",
  "bool",
  "int list",
  "int * bool",
  "int -> bool",
  "{x : int, y : bool}",
  "'a",
  "(int -> bool) list",
];
for (let i = 0; i < types.length; i++) {
  cases.push([`type-${i}`, `val gt_${i} : ${types[i]} = 1`]);
}

const EXPECTED_CASES = 124;
if (cases.length !== EXPECTED_CASES) {
  throw new Error(`generated case count drifted: expected ${EXPECTED_CASES}, got ${cases.length}`);
}

let passed = 0;
const failures = [];

function difference(expected, actual) {
  const limit = Math.min(expected.length, actual.length);
  let index = 0;
  while (index < limit && expected[index] === actual[index]) index++;
  return `first difference at character ${index}`;
}

for (const [name, source] of cases) {
  try {
    const sourceOracle = smlParserDerivationOracle(source);
    const state1 = smlToVismlWorkspaceState(source);
    const unregistered = findUnregisteredType(state1);
    if (unregistered) throw new Error(`parser produced unregistered block type '${unregistered}'`);

    const first = stateToCode(state1);
    const terminal = lexicalFidelity(source, first.code);
    if (!terminal.ok) throw new Error(`T failed: ${terminal.reason}`);

    const generatedOracle = smlParserDerivationOracle(first.code);
    if (generatedOracle !== sourceOracle) {
      throw new Error(`P failed: ${difference(sourceOracle, generatedOracle)}`);
    }

    const second = stateToCode(smlToVismlWorkspaceState(first.code));
    if (second.code !== first.code) throw new Error("S failed: regenerated text is not stable");

    passed++;
  } catch (error) {
    failures.push({ name, source, error: error && error.message ? error.message : String(error) });
    console.log(`FAIL  ${name}: ${failures[failures.length - 1].error}`);
  }
}

console.log(`\nBounded systematic preservation suite: ${passed}/${cases.length} S/T/P cases passed`);
console.log(
  "SYSTEMATIC_PRESERVATION_JSON=" +
    JSON.stringify({ generated: cases.length, passed, failed: failures })
);

process.exit(failures.length ? 1 : 0);
