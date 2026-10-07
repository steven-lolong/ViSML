#!/usr/bin/env node
/**
 * Executable evidence for the five contextual distinctions reported by the
 * T2BB paper.  The checks intentionally inspect the actual headless Blockly
 * workspace produced by the text parser rather than a hand-maintained mapping.
 *
 * The two con cases are distinguished by the target slot that accepts the
 * shared con_int block.  prog ::= dec is witnessed by the program root's
 * declaration/program slot.  lab ::= id and sig ::= id use the concrete
 * production wrappers present in ViSML.
 *
 * Run with: npm run test:contextual
 */

const {
  Blockly,
  smlToVismlWorkspaceState,
  findUnregisteredType,
} = require("./dist/roundtrip.bundle.js");

function fail(message) {
  throw new Error(message);
}

function checks(connection) {
  const raw = connection && typeof connection.getCheck === "function"
    ? connection.getCheck()
    : null;
  return Array.isArray(raw) ? raw : raw == null ? [] : [raw];
}

function oneBlock(workspace, type) {
  const matches = workspace.getAllBlocks(false).filter((block) => block.type === type);
  if (matches.length !== 1) {
    fail(`expected exactly one ${type} block, found ${matches.length}`);
  }
  return matches[0];
}

function targetSlotChecks(block) {
  const target = block.outputConnection && block.outputConnection.targetConnection;
  if (!target) fail(`${block.type} is not connected to a parent slot`);
  return checks(target);
}

function withWorkspace(source, check) {
  const state = smlToVismlWorkspaceState(source);
  const unregistered = findUnregisteredType(state);
  if (unregistered) fail(`parser produced unregistered block type '${unregistered}'`);

  const workspace = new Blockly.Workspace();
  try {
    Blockly.serialization.workspaces.load(state, workspace);
    check(workspace);
  } finally {
    workspace.dispose();
  }
}

const CASES = [
  {
    name: "pat ::= con",
    source: "fun f 0 = x",
    check(workspace) {
      const con = oneBlock(workspace, "con_int");
      const target = targetSlotChecks(con);
      if (!target.includes("pat") || target.includes("exp")) {
        fail(`con_int expected a pat-only target slot, got ${JSON.stringify(target)}`);
      }
    },
  },
  {
    name: "exp ::= con",
    source: "val x = 1",
    check(workspace) {
      const con = oneBlock(workspace, "con_int");
      const target = targetSlotChecks(con);
      if (!target.includes("exp") || target.includes("pat")) {
        fail(`con_int expected an exp-only target slot, got ${JSON.stringify(target)}`);
      }
    },
  },
  {
    name: "prog ::= dec",
    source: "val x = y",
    check(workspace) {
      const program = oneBlock(workspace, "program");
      const input = program.getInput("ADD0");
      if (!input || !input.connection) fail("program ADD0 slot is missing");
      const accepted = checks(input.connection);
      if (!accepted.includes("dec") || !accepted.includes("program")) {
        fail(`program ADD0 must accept dec/program, got ${JSON.stringify(accepted)}`);
      }
      const child = input.connection.targetBlock();
      if (!child || !checks(child.outputConnection).includes("dec")) {
        fail(`program ADD0 is not filled by a declaration-root block`);
      }
    },
  },
  {
    name: "lab ::= id",
    source: "val r = {foo = 1}",
    check(workspace) {
      const lab = oneBlock(workspace, "id_lab");
      const input = lab.getInput("inputId");
      if (!input || !input.connection) fail("id_lab inputId slot is missing");
      const child = input.connection.targetBlock();
      if (!child || child.type !== "id_id") {
        fail(`id_lab must wrap id_id, got ${child ? child.type : "no child"}`);
      }
      if (!checks(lab.outputConnection).includes("lab")) {
        fail("id_lab does not expose the lab role");
      }
    },
  },
  {
    name: "sig ::= id",
    source: "structure S : SIG = struct val x = y end",
    check(workspace) {
      const sig = oneBlock(workspace, "sig_id");
      const input = sig.getInput("id");
      if (!input || !input.connection) fail("sig_id id slot is missing");
      const child = input.connection.targetBlock();
      if (!child || child.type !== "id_id") {
        fail(`sig_id must wrap id_id, got ${child ? child.type : "no child"}`);
      }
      if (!checks(sig.outputConnection).includes("sig")) {
        fail("sig_id does not expose the sig role");
      }
    },
  },
];

let passed = 0;
const results = [];
for (const testCase of CASES) {
  try {
    withWorkspace(testCase.source, testCase.check);
    passed += 1;
    results.push({ name: testCase.name, ok: true });
    console.log(`ok    ${testCase.name}`);
  } catch (error) {
    results.push({ name: testCase.name, ok: false, error: error.message || String(error) });
    console.error(`FAIL  ${testCase.name}: ${error.message || String(error)}`);
  }
}

console.log(`\nContextual distinctions: ${passed}/${CASES.length} passing`);
console.log("CONTEXTUAL_DISTINCTIONS_JSON=" + JSON.stringify({ passed, total: CASES.length, results }));

if (passed !== CASES.length) process.exit(1);
