#!/usr/bin/env python3
from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one anchor, found {count}")
    return text.replace(old, new, 1)

# ---------------------------------------------------------------------------
# Repair the two provenance losses exposed by the first Criterion-P run.
# ---------------------------------------------------------------------------
gen_path = Path("src/core/generator/sml/blocks/constants.ts")
gen = gen_path.read_text()
gen = replace_once(
    gen,
    '''SML.forBlock["con_word"] = function (block) {\n  let code = block.getFieldValue("inputValue").toString().replace("-", "~");\n  return [code, SML.ORDER_NONE];\n};\nSML.forBlock["con_float"] = function (block) {\n  let code = "()";\n  return [code, SML.ORDER_NONE];\n};''',
    '''SML.forBlock["con_word"] = function (block) {\n  const raw = block.getFieldValue("inputValue").toString();\n  // Older serialized workspaces store only the decimal payload; newer parser\n  // states still round-trip through the same field.  Emit the SML word prefix\n  // exactly once.\n  const code = raw.startsWith("0w") ? raw : `0w${raw}`;\n  return [code, SML.ORDER_NONE];\n};\nSML.forBlock["con_float"] = function (block) {\n  // Preserve the fractional spelling instead of collapsing the literal to ().\n  // inputValue is text so leading zeroes (3.05) survive the round trip.\n  const whole = block.getFieldValue("NAME").toString().replace("-", "~");\n  const fraction = block.getFieldValue("inputValue").toString();\n  return [`${whole}.${fraction}`, SML.ORDER_NONE];\n};''',
    "constant generators",
)
gen_path.write_text(gen)

blocks_path = Path("src/core/blocks/constants.ts")
blocks = blocks_path.read_text()
blocks = replace_once(
    blocks,
    '''      .appendField(new Blockly.FieldNumber(0, -Infinity, Infinity, 1), "NAME")\n      .appendField("\\u2022")\n      .appendField(new Blockly.FieldNumber(0, 0), "inputValue");''',
    '''      .appendField(new Blockly.FieldNumber(0, -Infinity, Infinity, 1), "NAME")\n      .appendField("\\u2022")\n      // Text, rather than FieldNumber, preserves leading zeroes in fractions.\n      .appendField(new Blockly.FieldTextInput("0"), "inputValue");''',
    "real literal field",
)
blocks_path.write_text(blocks)

parser_path = Path("src/core/parser/sml_to_visml.ts")
parser = parser_path.read_text()
real_old = '''      case "real": {\n        this.advance();\n        const [whole, fraction = "0"] = token.value.replace("~", "-").split(".");\n        return block("con_float", this.ids, {\n          fields: { NAME: Number(whole), inputValue: Number(fraction) },\n        });\n      }'''
real_new = '''      case "real": {\n        this.advance();\n        const [whole, fraction = "0"] = token.value.replace("~", "-").split(".");\n        return block("con_float", this.ids, {\n          // Keep the fractional lexeme as text: Number("05") would make\n          // 3.05 observationally indistinguishable from 3.5.\n          fields: { NAME: Number(whole), inputValue: fraction },\n        });\n      }'''
# The same literal construction occurs in expressions and patterns.
if parser.count(real_old) != 2:
    raise SystemExit(f"real parser: expected two anchors, found {parser.count(real_old)}")
parser = parser.replace(real_old, real_new)
entry_anchor = '''export function smlToVismlWorkspaceState(source: string) {'''
terminal_helper = '''/** Return lexical token identities used by round-trip Criterion T. */\nexport function terminalTokenSignature(source: string): string[] {\n  return tokenize(source)\n    .filter((token) => token.type !== "eof")\n    .map((token) => `${token.type}:${token.value}`);\n}\n\nexport function smlToVismlWorkspaceState(source: string) {'''
parser = replace_once(parser, entry_anchor, terminal_helper, "terminal token export")
parser_path.write_text(parser)

entry_path = Path("test/roundtrip.entry.ts")
entry = entry_path.read_text()
entry = replace_once(
    entry,
    '''import { smlToVismlWorkspaceState, SmlParseError } from "../src/core/parser/sml_to_visml";''',
    '''import {\n  smlToVismlWorkspaceState,\n  terminalTokenSignature,\n  SmlParseError,\n} from "../src/core/parser/sml_to_visml";''',
    "entry parser import",
)
entry = replace_once(
    entry,
    '''  smlToVismlWorkspaceState,\n  SmlParseError,''',
    '''  smlToVismlWorkspaceState,\n  terminalTokenSignature,\n  SmlParseError,''',
    "entry export",
)
entry_path.write_text(entry)

# ---------------------------------------------------------------------------
# Extend the executable round-trip harness with Criteria T and P.  Five literal
# regressions make the text corpus 96 cases; one repair case is intentionally
# exempt from T, yielding the paper's 95 applicable lexical-recovery cases.
# ---------------------------------------------------------------------------
path = Path("test/run_roundtrip.js")
text = path.read_text()
text = replace_once(
    text,
    '''  smlToVismlWorkspaceState,\n  stateToCode,''',
    '''  smlToVismlWorkspaceState,\n  terminalTokenSignature,\n  stateToCode,''',
    "test helper import",
)

case_anchor = '''  ["nested comments", "(* outer (* inner *) still comment *) val cm = 1"],\n];'''
case_replacement = '''  ["nested comments", "(* outer (* inner *) still comment *) val cm = 1"],\n\n  // -- preservation regressions --------------------------------------------------\n  ["real leading-zero fraction", "val r05 = 3.05"],\n  ["real negative fraction", "val rn = ~2.50"],\n  ["word zero", "val wz = 0w0"],\n  ["word multi digit", "val w4096 = 0w4096"],\n  ["literal patterns", "fun lit 3.05 = 1 | lit 0w7 = 2 | lit _ = 0"],\n];'''
text = replace_once(text, case_anchor, case_replacement, "five regression cases")

anchor = "let failures = 0;\nlet passed = 0;\n"
helper = r'''let failures = 0;
let passed = 0;
let terminalPassed = 0;
let provenancePassed = 0;

/**
 * Criterion T: source lexical tokens must occur in order in regenerated text;
 * any generated token not consumed from the source must be a parenthesis.
 */
function terminalRecoveryHolds(source, generated) {
  const expected = terminalTokenSignature(source);
  const actual = terminalTokenSignature(generated);
  let index = 0;
  for (const token of actual) {
    if (index < expected.length && token === expected[index]) {
      index++;
      continue;
    }
    if (token === "punct:(" || token === "punct:)") continue;
    return false;
  }
  return index === expected.length;
}

/**
 * Criterion P: an implementation-level production/provenance signature.
 *
 * The text generator is allowed to insert explicit expression parentheses,
 * so exp_parentheses is treated as an administrative presentation node and
 * erased before comparison.  IDs, coordinates and other serializer-only
 * fields are deliberately ignored.  Block types, grammar-selecting fields,
 * ordered inputs and next-links are retained.
 */
function productionProvenanceSignature(state) {
  const fieldValue = (value) => {
    if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "value")) {
      return value.value;
    }
    return value;
  };

  const visit = (block) => {
    if (!block || typeof block !== "object") return null;

    // Parentheses may be inserted by the printer solely to make associativity
    // explicit.  They do not count as a provenance change for Criterion P.
    if (block.type === "exp_parentheses") {
      return visit(block.inputs && block.inputs.exp && block.inputs.exp.block);
    }

    const fields = {};
    for (const key of Object.keys(block.fields || {}).sort()) {
      fields[key] = fieldValue(block.fields[key]);
    }

    const inputs = {};
    for (const key of Object.keys(block.inputs || {}).sort()) {
      inputs[key] = visit(block.inputs[key] && block.inputs[key].block);
    }

    return {
      type: block.type || null,
      fields,
      inputs,
      next: visit(block.next && block.next.block),
    };
  };

  return JSON.stringify((state && state.blocks && state.blocks.blocks || []).map(visit));
}
'''
text = replace_once(text, anchor, helper, "criterion helpers")

anchor2 = "    const state2 = smlToVismlWorkspaceState(first.code);\n    const second = stateToCode(state2);\n\n    if (warnings.length > 0) {"
insert2 = r'''    const state2 = smlToVismlWorkspaceState(first.code);
    const second = stateToCode(state2);

    // Criterion T has one deliberate exception: this malformed historical
    // spelling is a repair input, so preserving it would be the wrong result.
    if (name !== "generated opaque space") {
      if (!terminalRecoveryHolds(source, first.code)) {
        fail(
          name,
          "source terminal sequence was not recovered",
          `--- source ---\n${source}\n--- generated ---\n${first.code}`
        );
        continue;
      }
      terminalPassed++;
    }

    // Criterion P: production-bearing visual structure must survive the
    // text -> blocks -> text -> blocks round trip, modulo administrative
    // parentheses inserted by the generator.
    const provenance1 = productionProvenanceSignature(state1);
    const provenance2 = productionProvenanceSignature(state2);
    if (provenance1 !== provenance2) {
      fail(
        name,
        "production/provenance signature changed",
        `--- source-derived ---\n${provenance1}\n--- regenerated ---\n${provenance2}`
      );
      continue;
    }
    provenancePassed++;

    if (warnings.length > 0) {'''
text = replace_once(text, anchor2, insert2, "S/T/P checks")

anchor3 = r'''  `\n${passed}/${CASES.length} text round-trips passed, ` +
  `${samplesPassed}/${sampleNames.length} sample round-trips passed, ` +
  `${layoutPassed}/${layoutCases.length} layout-state cases passed` +'''
replace3 = r'''  `\n${passed}/${CASES.length} text round-trips passed, ` +
  `${terminalPassed}/${CASES.length - 1} terminal-recovery checks passed, ` +
  `${provenancePassed}/${CASES.length} provenance checks passed, ` +
  `${samplesPassed}/${sampleNames.length} sample round-trips passed, ` +
  `${layoutPassed}/${layoutCases.length} layout-state cases passed` +'''
text = replace_once(text, anchor3, replace3, "summary")

path.write_text(text)
print("patched literal generators/parser and S/T/P round-trip harness")
