#!/usr/bin/env node
/**
 * Targeted executable coverage for the nine generator-registered block types
 * not reached by the 98-case round-trip corpus.
 *
 * This is intentionally reported separately from corpus coverage: it checks
 * registration, headless instantiation, and generator execution for each known
 * gap without pretending that these are additional S/T/P round-trip cases.
 */

const { Blockly, SML } = require("./dist/roundtrip.bundle.js");

const TARGETS = [
  "datdesc_nested",
  "exndesc_nested",
  "exp_primtv_optr_list_hd",
  "exp_primtv_optr_list_tail",
  "exp_primtv_optr_record",
  "str_opaque_annotation",
  "str_transparent_annotation",
  "strdesc_nested",
  "typrefin_nested",
];

let passed = 0;
const failures = [];

for (const type of TARGETS) {
  const workspace = new Blockly.Workspace();
  try {
    if (!Blockly.Blocks[type]) throw new Error("block is not registered");
    if (typeof SML.forBlock[type] !== "function") throw new Error("SML generator is not registered");

    const block = workspace.newBlock(type);
    const generated = SML.blockToCode(block);
    if (generated === undefined || generated === null) {
      throw new Error("generator returned no result");
    }

    passed++;
    console.log(`ok    ${type}`);
  } catch (error) {
    failures.push({ type, error: error && error.message ? error.message : String(error) });
    console.log(`FAIL  ${type}: ${failures[failures.length - 1].error}`);
  } finally {
    workspace.dispose();
  }
}

console.log(
  `\nTargeted generator coverage: ${passed}/${TARGETS.length} previously uncovered types passed`
);
console.log(
  "TARGETED_COVERAGE_JSON=" +
    JSON.stringify({ targeted: TARGETS.length, passed, failed: failures })
);

if (TARGETS.length !== 9 || passed !== TARGETS.length) process.exit(1);
