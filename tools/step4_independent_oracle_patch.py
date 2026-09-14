#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: Path, old: str, new: str, label: str):
    text = path.read_text()
    if new in text:
        print(f"{label}: already applied")
        return
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one old anchor, found {count}")
    path.write_text(text.replace(old, new, 1))
    print(f"{label}: applied")


def replace_count(path: Path, old: str, new: str, expected: int, label: str):
    text = path.read_text()
    count = text.count(old)
    if count == 0 and text.count(new) >= expected:
        print(f"{label}: already applied")
        return
    if count != expected:
        raise RuntimeError(f"{label}: expected {expected} old anchors, found {count}")
    path.write_text(text.replace(old, new))
    print(f"{label}: applied ({expected})")


parser = ROOT / "src/core/parser/sml_to_visml.ts"
replace_once(
    parser,
    "function tokenize(source: string): Token[] {",
    "export function tokenize(source: string): Token[] {",
    "export tokenizer for test oracle",
)
replace_once(
    parser,
    "class Parser {",
    "export class Parser {",
    "export parser for test oracle",
)
replace_count(
    parser,
    'fields: { NAME: Number(whole), inputValue: Number(fraction) },',
    'fields: { NAME: Number(whole), inputValue: fraction },',
    2,
    "preserve real-literal fractional spelling",
)

blocks = ROOT / "src/core/blocks/constants.ts"
replace_once(
    blocks,
    '.appendField(new Blockly.FieldNumber(0, 0), "inputValue");',
    '.appendField(new Blockly.FieldTextInput("0", (value) => /^\\d+$/.test(value) ? value : null), "inputValue");',
    "real fraction field preserves digit string",
)

generator = ROOT / "src/core/generator/sml/blocks/constants.ts"
replace_once(
    generator,
    '''SML.forBlock["con_word"] = function (block) {
  let code = block.getFieldValue("inputValue").toString().replace("-", "~");
  return [code, SML.ORDER_NONE];
};''',
    '''SML.forBlock["con_word"] = function (block) {
  let code = "0w" + block.getFieldValue("inputValue").toString();
  return [code, SML.ORDER_NONE];
};''',
    "restore word-literal prefix",
)
replace_once(
    generator,
    '''SML.forBlock["con_float"] = function (block) {
  let code = "()";
  return [code, SML.ORDER_NONE];
};''',
    '''SML.forBlock["con_float"] = function (block) {
  const whole = block.getFieldValue("NAME").toString().replace("-", "~");
  const fraction = block.getFieldValue("inputValue").toString();
  return [`${whole}.${fraction}`, SML.ORDER_NONE];
};''',
    "restore real-literal generator",
)

let_generator = ROOT / "src/core/generator/sml/blocks/expressions/expression_let_in_end.ts"
replace_once(
    let_generator,
    '''  code =
    "let \\n" +
    decLet +
    (number_of_exp > 1 ? " in {\\n" : " in ") +
    codeExp +
    (number_of_exp > 1 ? " }\\n" : "") +
    " end\\n";''',
    '''  code =
    "let \\n" +
    decLet +
    " in " +
    codeExp +
    " end\\n";''',
    "emit standard SML let sequence without braces",
)

strbind_generator = ROOT / "src/core/generator/sml/blocks/declarations/strbind.ts"
replace_once(
    strbind_generator,
    '''      block.getFieldValue("chkSub") == "TRUE"
        ? ": " +
          block.getFieldValue("greatherSign") +
          " " +
          SML.valueToCode(block, "inputSig", SML.ORDER_NONE)
        : "",''',
    '''      block.getFieldValue("chkSub") == "TRUE"
        ? (block.getFieldValue("greatherSign") == ">" ? ":> " : ": ") +
          SML.valueToCode(block, "inputSig", SML.ORDER_NONE)
        : "",''',
    "emit opaque ascription as one :> token",
)

entry = ROOT / "test/roundtrip.entry.ts"
replace_once(
    entry,
    '''} from "../src/ui/layout_state";

export {''',
    '''} from "../src/ui/layout_state";
import {
  smlParserDerivationOracle,
  lexicalFidelity,
} from "./parser_derivation_oracle";

export {''',
    "import independent parser oracle",
)
replace_once(
    entry,
    '''  normalizeIdeLayoutState,
};''',
    '''  normalizeIdeLayoutState,
  smlParserDerivationOracle,
  lexicalFidelity,
};''',
    "export independent parser oracle",
)

runner = ROOT / "test/run_roundtrip.js"
replace_once(
    runner,
    '''  normalizeIdeLayoutState,
} = require("./dist/roundtrip.bundle.js");''',
    '''  normalizeIdeLayoutState,
  smlParserDerivationOracle,
  lexicalFidelity,
} = require("./dist/roundtrip.bundle.js");''',
    "load criterion P/T helpers",
)
replace_once(
    runner,
    '''let failures = 0;
let passed = 0;''',
    '''let failures = 0;
let passed = 0;
let pCases = 0;
let pPassed = 0;
let tCases = 0;
let tPassed = 0;

// These inputs deliberately exercise the tolerant parser rather than source
// derivations in the SML presentation used by the paper.  They remain
// stability/repair regressions but are excluded from source-derivation P/T.
const FIDELITY_EXEMPT = new Set([
  "let multi body",
  "generated let braces",
  "generated opaque space",
]);

function signatureDifference(expected, actual) {
  const limit = Math.min(expected.length, actual.length);
  let index = 0;
  while (index < limit && expected[index] === actual[index]) index++;
  const from = Math.max(0, index - 80);
  return [
    `first difference at character ${index}`,
    `source oracle:    ${expected.slice(from, index + 160)}`,
    `generated oracle: ${actual.slice(from, index + 160)}`,
  ].join("\\n");
}''',
    "criterion P/T counters and exemptions",
)
replace_once(
    runner,
    '''  try {
    // 1. text -> blocks
    const state1 = smlToVismlWorkspaceState(source);''',
    '''  try {
    const fidelityApplicable = !FIDELITY_EXEMPT.has(name);
    const sourceOracle = fidelityApplicable ? smlParserDerivationOracle(source) : undefined;
    if (fidelityApplicable) {
      pCases++;
      tCases++;
    }

    // 1. text -> blocks
    const state1 = smlToVismlWorkspaceState(source);''',
    "capture source-side parser oracle before blocks",
)
replace_once(
    runner,
    '''    // 3. text -> blocks -> text again: generation must be a fixed point.
    const state2 = smlToVismlWorkspaceState(first.code);''',
    '''    if (fidelityApplicable) {
      const fidelityErrors = [];
      const terminalCheck = lexicalFidelity(source, first.code);
      if (terminalCheck.ok) {
        tPassed++;
      } else {
        fidelityErrors.push(`T lexical fidelity: ${terminalCheck.reason}`);
      }

      const generatedOracle = smlParserDerivationOracle(first.code);
      if (generatedOracle === sourceOracle) {
        pPassed++;
      } else {
        fidelityErrors.push(`P parser derivation oracle:\n${signatureDifference(sourceOracle, generatedOracle)}`);
      }

      if (fidelityErrors.length > 0) {
        fail(name, "source-derivation fidelity failed", fidelityErrors.join("\\n"));
        continue;
      }
    }

    // 3. text -> blocks -> text again: generation must be a fixed point.
    const state2 = smlToVismlWorkspaceState(first.code);''',
    "evaluate executable T and independent P",
)
replace_once(
    runner,
    '''  `\\n${passed}/${CASES.length} text round-trips passed, ` +
  `${samplesPassed}/${sampleNames.length} sample round-trips passed, ` +
  `${layoutPassed}/${layoutCases.length} layout-state cases passed` +''',
    '''  `\\n${passed}/${CASES.length} text round-trips passed, ` +
  `T ${tPassed}/${tCases} lexical-fidelity cases passed, ` +
  `P ${pPassed}/${pCases} parser-oracle cases passed, ` +
  `${samplesPassed}/${sampleNames.length} sample round-trips passed, ` +
  `${layoutPassed}/${layoutCases.length} layout-state cases passed` +''',
    "report T and P counts",
)

# Strengthen the existing real-literal case without changing the current
# 91-case text corpus denominator: both spellings would have collapsed under
# the historical numeric fraction representation.
replace_once(
    runner,
    '["real literal", "val pi = 3.14"],',
    '["real literal", "val a = 3.05\\nval b = 3.5"],',
    "real-literal leading-zero regression",
)

print("Step 4 patch complete")
