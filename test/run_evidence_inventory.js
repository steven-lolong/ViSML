#!/usr/bin/env node
/**
 * Step 5 evidence inventory.
 *
 * Runs the existing round-trip suite unchanged while wrapping the exported
 * parser/state helpers so every block type instantiated by the corpus is
 * recorded.  At process exit it compares those exercised types with the SML
 * generator registry.  This keeps the coverage denominator executable rather
 * than manually maintained in the paper.
 */

const bundle = require("./dist/roundtrip.bundle.js");

const exercised = new Set();

function collectTypes(state) {
  for (const type of bundle.collectBlockTypes(state)) exercised.add(type);
}

const parse = bundle.smlToVismlWorkspaceState;
bundle.smlToVismlWorkspaceState = function instrumentedParse(source) {
  const state = parse(source);
  collectTypes(state);
  return state;
};

const stateToCode = bundle.stateToCode;
bundle.stateToCode = function instrumentedStateToCode(state) {
  collectTypes(state);
  return stateToCode(state);
};

const realExit = process.exit.bind(process);
let reported = false;
process.exit = function inventoryExit(code) {
  if (!reported) {
    reported = true;
    const generatorTypes = Object.keys(bundle.SML.forBlock || {}).sort();
    const generatorSet = new Set(generatorTypes);
    const exercisedGeneratorTypes = [...exercised].filter((type) => generatorSet.has(type)).sort();
    const uncovered = generatorTypes.filter((type) => !exercised.has(type));
    const exercisedWithoutGenerator = [...exercised].filter((type) => !generatorSet.has(type)).sort();

    console.log("\nStep 5 executable evidence inventory:");
    console.log(`generator-registered block types: ${generatorTypes.length}`);
    console.log(`generator block types exercised by corpus: ${exercisedGeneratorTypes.length}`);
    console.log(`generator block types not exercised: ${uncovered.length}`);
    console.log(`uncovered generator block types: ${JSON.stringify(uncovered)}`);
    console.log(`exercised block types without SML generator: ${JSON.stringify(exercisedWithoutGenerator)}`);
    console.log(
      "EVIDENCE_INVENTORY_JSON=" +
        JSON.stringify({
          generatorRegistered: generatorTypes.length,
          exercisedGeneratorTypes: exercisedGeneratorTypes.length,
          uncoveredGeneratorTypes: uncovered,
          exercisedWithoutGenerator,
        })
    );
  }
  realExit(code);
};

require("./run_roundtrip.js");
