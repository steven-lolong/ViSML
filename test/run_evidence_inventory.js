#!/usr/bin/env node
/**
 * Step 5 evidence inventory.
 *
 * Runs the existing round-trip suite unchanged while wrapping the parser/state
 * helpers at module-load time so every block type instantiated by the corpus is
 * recorded. Webpack exposes the bundle through getter-backed exports, so the
 * wrappers are supplied to run_roundtrip.js through Node's module loader rather
 * than by mutating the bundle object.
 *
 * The final assertions intentionally lock the evidence snapshot reported by the
 * paper. Any future registry/corpus change must update both this inventory and
 * the manuscript rather than silently drifting the denominator.
 */

const Module = require("module");
const bundle = require("./dist/roundtrip.bundle.js");
const bundlePath = require.resolve("./dist/roundtrip.bundle.js");

const EXPECTED_REGISTERED = 132;
const EXPECTED_EXERCISED = 123;
const EXPECTED_UNCOVERED = [
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

const exercised = new Set();

function collectTypes(state) {
  for (const type of bundle.collectBlockTypes(state)) exercised.add(type);
}

const parse = bundle.smlToVismlWorkspaceState;
function instrumentedParse(source) {
  const state = parse(source);
  collectTypes(state);
  return state;
}

const stateToCode = bundle.stateToCode;
function instrumentedStateToCode(state) {
  collectTypes(state);
  return stateToCode(state);
}

const wrappedBundle = {
  ...bundle,
  smlToVismlWorkspaceState: instrumentedParse,
  stateToCode: instrumentedStateToCode,
};

// run_roundtrip.js destructures the bundle on load. Intercept exactly that
// require so it receives the instrumented functions without changing the
// production bundle or duplicating the test corpus.
const originalLoad = Module._load;
Module._load = function step5Load(request, parent, isMain) {
  let resolved;
  try {
    resolved = Module._resolveFilename(request, parent, isMain);
  } catch (_) {
    return originalLoad.apply(this, arguments);
  }
  if (resolved === bundlePath) return wrappedBundle;
  return originalLoad.apply(this, arguments);
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

    const mismatch =
      generatorTypes.length !== EXPECTED_REGISTERED ||
      exercisedGeneratorTypes.length !== EXPECTED_EXERCISED ||
      JSON.stringify(uncovered) !== JSON.stringify(EXPECTED_UNCOVERED) ||
      exercisedWithoutGenerator.length !== 0;
    if (mismatch) {
      console.error("Step 5 evidence inventory drifted from the locked paper snapshot.");
      code = 1;
    } else {
      console.log("Step 5 evidence inventory matches the locked paper snapshot.");
    }
  }
  realExit(code);
};

require("./run_roundtrip.js");