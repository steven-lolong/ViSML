#!/usr/bin/env node
/**
 * Executable RQ4 evidence for T2BB presentation simplifications.
 *
 * Four ES cases check the concrete interactive-field realizations used for
 * con/id/var/lab and then run the same S/T/P round-trip obligations as the
 * primary corpus. One VE case checks the str ::= longid wrapper realization:
 * the str role is recovered through the wrapper, the longid child remains
 * structurally explicit, and neither block relies on a FieldImage supporting
 * color. The VE case also runs S/T/P.
 */

const {
  Blockly,
  smlToVismlWorkspaceState,
  stateToCode,
  smlParserDerivationOracle,
  lexicalFidelity,
} = require("./dist/roundtrip.bundle.js");

function fail(message) {
  throw new Error(message);
}

function blocksOfType(workspace, type) {
  return workspace.getAllBlocks(false).filter((block) => block.type === type);
}

function hasFieldOfClass(block, fieldName, klass) {
  const field = block.getField(fieldName);
  return !!field && field instanceof klass;
}

function hasFieldImage(block) {
  return block.inputList.some((input) =>
    input.fieldRow.some((field) => field instanceof Blockly.FieldImage)
  );
}

function checks(connection) {
  const raw = connection && typeof connection.getCheck === "function"
    ? connection.getCheck()
    : null;
  return Array.isArray(raw) ? raw : raw == null ? [] : [raw];
}

function assertSTP(source, state) {
  const sourceOracle = smlParserDerivationOracle(source);
  const first = stateToCode(state);
  const t = lexicalFidelity(source, first.code);
  if (!t.ok) fail(`T failed: ${t.reason}`);
  const generatedOracle = smlParserDerivationOracle(first.code);
  if (generatedOracle !== sourceOracle) fail("P parser-derivation oracle mismatch");
  const secondState = smlToVismlWorkspaceState(first.code);
  const second = stateToCode(secondState);
  if (second.code !== first.code) fail("S fixed-point stability failed");
}

function withWorkspace(source, check) {
  const state = smlToVismlWorkspaceState(source);
  const workspace = new Blockly.Workspace();
  try {
    Blockly.serialization.workspaces.load(state, workspace);
    check(workspace);
    assertSTP(source, state);
  } finally {
    workspace.dispose();
  }
}

const ES_CASES = [
  {
    name: "ES con uses interactive literal text field",
    source: "val x = 1",
    check(workspace) {
      const blocks = blocksOfType(workspace, "con_int");
      if (blocks.length < 1) fail("expected con_int");
      if (!hasFieldOfClass(blocks[0], "inputValue", Blockly.FieldTextInput)) {
        fail("con_int inputValue is not a FieldTextInput");
      }
    },
  },
  {
    name: "ES id uses interactive text field",
    source: "val x = y",
    check(workspace) {
      const blocks = blocksOfType(workspace, "id_id");
      if (blocks.length < 1) fail("expected id_id");
      if (!blocks.some((b) => hasFieldOfClass(b, "inputValue", Blockly.FieldTextInput))) {
        fail("id_id inputValue is not a FieldTextInput");
      }
    },
  },
  {
    name: "ES var uses interactive dropdown/text fields",
    source: "type 'a box = 'a",
    check(workspace) {
      const blocks = blocksOfType(workspace, "id_var");
      if (blocks.length < 1) fail("expected id_var");
      if (!blocks.some((b) => hasFieldOfClass(b, "constrType", Blockly.FieldDropdown))) {
        fail("id_var constrType is not a FieldDropdown");
      }
      if (!blocks.some((b) => hasFieldOfClass(b, "inputValue", Blockly.FieldTextInput))) {
        fail("id_var inputValue is not a FieldTextInput");
      }
    },
  },
  {
    name: "ES lab uses interactive label selector",
    source: "val r = {foo = 1}",
    check(workspace) {
      const blocks = blocksOfType(workspace, "id_lab");
      if (blocks.length < 1) fail("expected id_lab");
      if (!blocks.some((b) => hasFieldOfClass(b, "MODE", Blockly.FieldDropdown))) {
        fail("id_lab MODE is not a FieldDropdown");
      }
    },
  },
];

const VE_CASES = [
  {
    name: "VE str-longid wrapper preserves roles without supporting-color field images",
    source: "structure P = Compiler.Frontend",
    check(workspace) {
      const wrappers = blocksOfType(workspace, "str_identifier");
      const longids = blocksOfType(workspace, "id_long_id");
      if (wrappers.length !== 1) fail(`expected one str_identifier, found ${wrappers.length}`);
      if (longids.length !== 1) fail(`expected one id_long_id, found ${longids.length}`);
      const wrapper = wrappers[0];
      const longid = longids[0];
      const input = wrapper.getInput("longId");
      if (!input || !input.connection) fail("str_identifier.longId input missing");
      if (!checks(input.connection).includes("longid")) fail("str_identifier does not require longid");
      const child = input.connection.targetBlock();
      if (!child || child.type !== "id_long_id") fail("str_identifier does not wrap id_long_id");
      if (!checks(wrapper.outputConnection).includes("str")) fail("str_identifier does not expose str");
      if (!checks(longid.outputConnection).includes("longid")) fail("id_long_id does not expose longid");
      if (hasFieldImage(wrapper) || hasFieldImage(longid)) {
        fail("VE representative still contains a FieldImage supporting-color cue");
      }
    },
  },
];

function runGroup(name, cases) {
  let passed = 0;
  const results = [];
  for (const testCase of cases) {
    try {
      withWorkspace(testCase.source, testCase.check);
      passed++;
      results.push({ name: testCase.name, ok: true });
      console.log(`ok    ${testCase.name}`);
    } catch (error) {
      results.push({ name: testCase.name, ok: false, error: error.message || String(error) });
      console.error(`FAIL  ${testCase.name}: ${error.message || String(error)}`);
    }
  }
  console.log(`${name}: ${passed}/${cases.length} passing`);
  return { passed, total: cases.length, results };
}

const es = runGroup("Element Substitution", ES_CASES);
const ve = runGroup("Visual Encapsulation", VE_CASES);
const report = { es, ve };
console.log("SIMPLIFICATION_EVIDENCE_JSON=" + JSON.stringify(report));

if (es.passed !== es.total || ve.passed !== ve.total) process.exit(1);
