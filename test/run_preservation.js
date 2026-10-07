#!/usr/bin/env node
/** Exact production/lexeme checks for the preservation revision. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');
const m = require('./dist/roundtrip.bundle.js');
const clone = x => JSON.parse(JSON.stringify(x));
const source = fs.readFileSync(path.join(__dirname, 'run_roundtrip.js'), 'utf8');
const cases = vm.runInNewContext(source.match(/const CASES = (\[[\s\S]*?\n\]);/)[1]);
const exempt = new Set(['let multi body', 'generated let braces', 'legacy opaque space']);
const tokens = s => m.tokenize(s).filter(x => x.type !== 'eof').map(x => [x.type, x.value]);
let assertions = 0;
const check = f => { f(); assertions++; };
function cycle(s, exact = true) {
    const state = m.smlToVismlWorkspaceState(s), d = m.decodeVismlWorkspace(state);
    const workspace = new m.Blockly.Workspace();
    try {
        m.Blockly.serialization.workspaces.load(state, workspace);
        const saved = m.Blockly.serialization.workspaces.save(workspace);
        check(() => assert.deepEqual(m.decodeVismlWorkspace(saved), d));
        check(() => assert.equal(m.preservingWorkspaceToCode(workspace), m.renderDerivation(d)));
    }
    finally {
        workspace.dispose();
    }
    const factored = m.factorDerivation(d);
    check(() => assert.deepEqual(m.unfactorDerivation(factored), d));
    check(() => assert.deepEqual(m.decodeCanonicalWorkspace(m.encodeDerivation(factored, m.factoredGrammar), m.factoredGrammar), factored));
    const w = m.encodeDerivation(d), out = m.printCanonicalWorkspace(w);
    check(() => assert.deepEqual(m.decodeCanonicalWorkspace(w), d));
    check(() => assert.deepEqual(m.decodeVismlWorkspace(m.smlToVismlWorkspaceState(out)), d));
    if (exact)
        check(() => assert.deepEqual(tokens(out), tokens(s)));
    return { d, w, out, state };
}
for (const [name, s] of cases) {
    try {
        cycle(s, !exempt.has(name));
    }
    catch (e) {
        e.message = `${name}: ${e.message}`;
        throw e;
    }
}
const regression = [
    '', ';', ';;', ';val x = 01;;', 'val x = 9007199254740993',
    'val x = 0w001', 'val x = ~0.5', 'val x = 0x00AF', 'val x = ~0x00Af',
    'val x = 0wx00Af', 'val x = 1.0e3', 'val x = 01e~003', 'val x = ~01.00e03',
    'val x = ((1 + 2));;', 'val x = "a-b"', 'val x = " "', 'val x = #"-"',
    'val x = "a\\n-b"', 'val x = #"\\065"', 'val x = {01 = 2}',
    "type ('a) t = 'a", "type ('a,'b) t = 'a * 'b",
    'infix 6 ++ fun (x ++ y) = x', 'infix 6 ++ fun (x ++ y) z w = z',
    'structure X = struct ;val x = 01;; end', 'structure X = struct ;; end', 'signature S = sig ;val x : int;; end', 'signature S = sig ;; end',
];
for (const s of regression)
    cycle(s);
for (const [name, state] of Object.entries(m.sampleWorkspaces)) {
    const workspace = new m.Blockly.Workspace();
    try {
        m.Blockly.serialization.workspaces.load(state, workspace);
        const out = m.preservingWorkspaceToCode(workspace);
        const reparsed = m.decodeVismlWorkspace(m.smlToVismlWorkspaceState(out));
        check(() => assert.equal(m.renderDerivation(reparsed, undefined, true), out, `${name}: canonical text stability`));
    }
    finally {
        workspace.dispose();
    }
}
// Source separators survive a change in the editor's number of sequence slots.
{
    const workspace = new m.Blockly.Workspace();
    try {
        m.Blockly.serialization.workspaces.load(m.smlToVismlWorkspaceState('val x = 01;'), workspace);
        const root = workspace.getTopBlocks(false)[0];
        root.itemCount_ = 2;
        root.updateShape_();
        const newState = m.smlToVismlWorkspaceState('val y = 2').blocks.blocks[0].inputs.ADD0.block;
        const rename = b => { b.id += 'edited'; Object.values(b.inputs || {}).forEach(x => rename(x.block)); };
        rename(newState);
        const added = m.Blockly.serialization.blocks.append(newState, workspace);
        root.getInput('ADD1').connection.connect(added.outputConnection);
        check(() => assert.deepEqual(tokens(m.preservingWorkspaceToCode(workspace)), tokens('val x = 01; val y = 2')));
        added.getInputTargetBlock('ADD0').getInput('exp').connection.disconnect();
        check(() => assert.throws(() => m.preservingWorkspaceToCode(workspace)));
    }
    finally {
        workspace.dispose();
    }
}
for (const s of ['0x', '0wx', '0w', '1e', '1.0e', '1e~', '1.0e~']) {
    check(() => assert.throws(() => m.smlToVismlWorkspaceState('val x = ' + s)));
}
// Every source row is exercised, including slot-free epsilon and lexical rows.
const byRole = new Map();
for (const p of m.smlGrammar.productions) {
    if (!byRole.has(p.lhs))
        byRole.set(p.lhs, []);
    byRole.get(p.lhs).push(p);
}
function rhs(e, stack) {
    switch (e.kind) {
        case 'eps': return null;
        case 't': return e.value;
        case 'c': return { digit: '1', letter: 'a', hexDigit: 'A', ascii: 'x' }[e.name];
        case 'n': return node(e.role, stack);
        case 'seq': return e.items.map(x => rhs(x, stack));
        case 'opt': return null;
        case 'rep': return Array.from({ length: e.min }, () => rhs(e.item, stack));
        case 'choice': return { branch: 0, value: rhs(e.items[0], stack) };
        case 'args': return { style: 'bare', items: [] };
        default: throw Error('Unrecognized source constructor ' + e.kind);
    }
}
function node(role, stack = []) {
    if (stack.includes(role))
        throw Error('recursive candidate');
    for (const p of byRole.get(role)) {
        try {
            return { p: p.id, rhs: rhs(p.rhs, [...stack, role]) };
        }
        catch (e) {
            if (e.message !== 'recursive candidate')
                throw e;
        }
    }
    throw Error('recursive candidate');
}
for (const p of m.smlGrammar.productions) {
    const grammar = { ...m.smlGrammar, start: p.lhs }, d = { p: p.id, rhs: rhs(p.rhs, []) };
    check(() => assert.deepEqual(m.decodeCanonicalWorkspace(m.encodeDerivation(d, grammar), grammar), d));
    check(() => assert.deepEqual(m.unfactorDerivation(m.factorDerivation(d)), d));
}
const sourceByRole = new Map(byRole);
byRole.clear();
for (const p of m.factoredGrammar.productions) {
    if (!byRole.has(p.lhs))
        byRole.set(p.lhs, []);
    byRole.get(p.lhs).push(p);
}
const contains = (e, kind) => e.kind === kind || (e.items || []).some(x => contains(x, kind)) || (e.item && contains(e.item, kind));
function realizable(e) {
    if (["eps", "t", "c", "n"].includes(e.kind))
        return true;
    if (e.kind === "seq")
        return e.items.every(realizable);
    if (e.kind === "opt")
        return realizable(e.item);
    if (e.kind === "choice")
        return e.items.every(x => realizable(x) && !contains(x, "n"));
    if (e.kind === "rep")
        return realizable(e.item) && !contains(e.item, "rep") && [0, 1, 2].includes(e.min) && (!(e.exclude || []).length || JSON.stringify(e.exclude) === "[1]");
    return false;
}
for (const p of m.factoredGrammar.productions) {
    check(() => assert.ok(realizable(p.rhs), p.id + ": realizable fragment"));
    const grammar = { ...m.factoredGrammar, start: p.lhs }, d = { p: p.id, rhs: rhs(p.rhs, []) };
    check(() => assert.deepEqual(m.decodeCanonicalWorkspace(m.encodeDerivation(d, grammar), grammar), d));
}
byRole.clear();
for (const [key, value] of sourceByRole)
    byRole.set(key, value);
// A one-step witness belongs to the slot's expected role, not its parent LHS.
const base = cycle('val x = 01');
const alias = clone(base.w), vb = alias.nodes.find(n => n.production === 'valbind.0');
const edge = vb.rhs[2], exp = alias.nodes.find(n => n.id === edge.node);
check(() => assert.equal(exp.production, 'exp.0'));
edge.node = exp.rhs.node;
edge.witness = 'exp.0';
alias.nodes = alias.nodes.filter(n => n !== exp);
check(() => assert.deepEqual(m.decodeCanonicalWorkspace(alias), base.d));
const badWitness = clone(alias);
badWitness.nodes.find(n => n.production === 'valbind.0').rhs[2].witness = 'prog.0';
check(() => assert.equal(m.tryDecodeCanonicalWorkspace(badWitness), undefined));
const rejectGraph = change => { const w = clone(base.w); change(w); check(() => assert.equal(m.tryDecodeCanonicalWorkspace(w), undefined)); };
rejectGraph(w => { w.nodes[0].production = 'prog ::= invented'; });
rejectGraph(w => { w.nodes[0].role = 'dec'; });
rejectGraph(w => { w.nodes[0].rhs.slot.path = 'wrong'; });
rejectGraph(w => { w.nodes[0].rhs.node = w.root; });
rejectGraph(w => { w.nodes.push({ ...w.nodes[0], id: 'unreachable' }); });
rejectGraph(w => { w.nodes.push(clone(w.nodes[0])); });
rejectGraph(w => { w.nodes.find(n => n.production === 'num.0').rhs = []; });
rejectGraph(w => { w.nodes.find(n => n.production === 'int.0').rhs[0] = '~wrong'; });
rejectGraph(w => { w.nodes.find(n => n.production === 'valbind.0').rhs.reverse(); });
const rejectState = change => { const s = clone(base.state); change(s); check(() => assert.equal(m.validateVismlWorkspace(s).ok, false)); };
const binding = s => s.blocks.blocks[0].inputs.ADD0.block.inputs.ADD0.block;
rejectState(s => { delete binding(s).inputs.exp; });
rejectState(s => { binding(s).inputs.exp.block.fields.inputValue = '01bad'; });
rejectState(s => { s.blocks.blocks[0].extraState.itemCount = -1; });
rejectState(s => { binding(s).inputs.extra = clone(binding(s).inputs.exp); });
rejectState(s => { s.blocks.blocks.push(clone(s.blocks.blocks[0])); });
rejectState(s => { s.blocks.blocks[0].extraState.t2bbSource.separators = [-1, 0]; });
check(() => assert.notDeepEqual(cycle('val x = 1 + 2').d, cycle('val x = ((1 + 2))').d));
const result = { schema: 1, source_cases: cases.length, exact_token_cases: cases.length - exempt.size,
    importer_repairs: [...exempt], regression_cases: regression.length, block_authored_samples: Object.keys(m.sampleWorkspaces).length, formal_production_rows: m.smlGrammar.productions.length, factored_production_rows: m.factoredGrammar.productions.length,
    assertions, status: 'pass' };
if (process.argv[2])
    fs.writeFileSync(process.argv[2], JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
