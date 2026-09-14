#!/usr/bin/env python3
from pathlib import Path

path = Path("test/run_roundtrip.js")
text = path.read_text()

anchor = "let failures = 0;\nlet passed = 0;\n"
if anchor not in text:
    raise SystemExit("counter anchor not found")
helper = r'''let failures = 0;
let passed = 0;
let provenancePassed = 0;

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
text = text.replace(anchor, helper, 1)

anchor2 = "    const state2 = smlToVismlWorkspaceState(first.code);\n    const second = stateToCode(state2);\n\n    if (warnings.length > 0) {"
if anchor2 not in text:
    raise SystemExit("round-trip anchor not found")
insert2 = r'''    const state2 = smlToVismlWorkspaceState(first.code);
    const second = stateToCode(state2);

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
text = text.replace(anchor2, insert2, 1)

anchor3 = r'''  `\n${passed}/${CASES.length} text round-trips passed, ` +
  `${samplesPassed}/${sampleNames.length} sample round-trips passed, ` +
  `${layoutPassed}/${layoutCases.length} layout-state cases passed` +'''
if anchor3 not in text:
    raise SystemExit("summary anchor not found")
replace3 = r'''  `\n${passed}/${CASES.length} text round-trips passed, ` +
  `${provenancePassed}/${CASES.length} provenance checks passed, ` +
  `${samplesPassed}/${sampleNames.length} sample round-trips passed, ` +
  `${layoutPassed}/${layoutCases.length} layout-state cases passed` +'''
text = text.replace(anchor3, replace3, 1)

path.write_text(text)
print("patched", path)
