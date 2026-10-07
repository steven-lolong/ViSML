#!/usr/bin/env node
/** Expected derivations are supplied by a separate Python fixture constructor. */
const fs = require('fs'), assert = require('assert/strict'), path = require('path');
const m = require('./dist/roundtrip.bundle.js');
const input = JSON.parse(fs.readFileSync(process.argv[2] || path.join(__dirname, 'fixtures/blockly_refinement.json'), 'utf8'));
const output = process.argv[3] || path.join(__dirname, 'dist/blockly-refinement-states.json');
const backend = m.createBlocklyBackend(input.grammar, 'formal_refinement');
const cases = input.fixtures || input.programs;
const results = [];
let assertions = 0;
let connectorPairs = 0;
const representatives = new Map(input.grammar.productions.map(p => [p.lhs, p.id]));
const checkerWorkspace = new m.Blockly.Workspace();
const outputs = new Map([...representatives].map(([role,pid]) => [role,checkerWorkspace.newBlock(backend.types.get(pid))]));
for (const item of cases) {
    const start = item.start || input.grammar.start;
    const states = [];
    for (const compact of [false, true]) {
        const w = new m.Blockly.Workspace();
        try {
            const encoded = backend.encode(item.expected, compact, start);
            m.Blockly.serialization.workspaces.load(encoded, w);
            const saved = backend.save(w);
            for (const b of w.getAllBlocks(false)) {
                const slots = new Map();
                const collect = x => {if(x?.slot)slots.set(x.slot.path,x.slot.expect);else if(x && typeof x==='object')Object.values(x).forEach(collect);};
                collect(b.saveExtraState().rhs);
                for (const i of b.inputList.filter(i=>i.connection)) for (const [role,child] of outputs) {
                    const expected = backend.accepted(slots.get(i.name)).includes(role);
                    assert.equal(w.connectionChecker.doTypeChecks(i.connection,child.outputConnection),expected);connectorPairs++;
                }
            }
            assert.deepEqual(backend.decode(saved, start), item.expected); assertions++;
            if (item.source !== undefined) { assert.equal(m.renderDerivation(backend.decode(saved,start), input.grammar), item.source); assertions++; }
            const reloaded = new m.Blockly.Workspace();
            try {
                const projected = backend.project(saved);
                m.Blockly.serialization.workspaces.load(backend.reify(projected,start), reloaded);
                assert.deepEqual(backend.decode(backend.save(reloaded), start), item.expected); assertions++;
                assert.deepEqual(backend.project(backend.save(reloaded)),projected); assertions++;
            } finally { reloaded.dispose(); }
            states.push({ compact, blocks: w.getAllBlocks(false).length, saved });
        } catch (e) { e.message = `${item.name} (${compact}): ${e.message}`; throw e; }
        finally { w.dispose(); }
    }
    results.push({ ...item, states });
}
checkerWorkspace.dispose();
// Grammar-declared lexical predicates extend the generated backend without
// changing its structural compiler.
{
 const g={start:'Bits',lexical_roles:['Bits'],terminal_classes:{binary:{pattern:'[01]',sample:'0'}},productions:[{id:'bits',lhs:'Bits',rhs:{kind:'rep',min:1,item:{kind:'c',name:'binary'}}}]};
 const b=m.createBlocklyBackend(g,'declared_lexical_class');const w=new m.Blockly.Workspace();
 try {m.Blockly.serialization.workspaces.load(b.encode({p:'bits',rhs:['0','1']}),w);assert.deepEqual(b.decode(b.save(w)),{p:'bits',rhs:['0','1']});assert.equal(m.renderDerivation(b.decode(b.save(w)),g),'01');assertions++;} finally {w.dispose();}
}
// Editing a lexical field changes the exported payload; no hidden whole-tree
// certificate is available to mask that edit.
if (input.grammar.start === 'prog') {
    const w = new m.Blockly.Workspace();
    try {
        const d = {p: 'num.0', rhs: ['1', '2']};
        m.Blockly.serialization.workspaces.load(backend.encode(d, false, 'num'), w);
        const root = w.getTopBlocks(false)[0];
        root.setFieldValue('7', 'payload:rhs/item/0');
        assert.deepEqual(backend.decode(backend.save(w), 'num'), {p: 'num.0', rhs: ['7','2']}); assertions++;
        const local = root.saveExtraState().rhs; local.push('3'); root.setLocalState(local);
        assert.deepEqual(backend.decode(backend.save(w), 'num'), {p: 'num.0', rhs: ['7','2','3']}); assertions++;
    } finally { w.dispose(); }
}
const invalid = [];
const base = results.find(x => x.states[0].blocks > 3);
const clone = x => JSON.parse(JSON.stringify(x));
const mutate = (name, fn) => {
    const state = clone(base.states[0].saved); fn(state);
    let rejected = false;
    try { backend.decode(state, base.start || input.grammar.start); } catch (e) { if (!(e instanceof m.PreservationError)) throw e; rejected = true; }
    assert(rejected, name); assertions++;
    invalid.push({ name, start: base.start || input.grammar.start, state, typescript_rejected: rejected });
};
mutate('missing production descriptor', s => delete s.blocks.blocks[0].extraState.production);
mutate('duplicate root', s => s.blocks.blocks.push(clone(s.blocks.blocks[0])));
mutate('missing required child', s => delete s.blocks.blocks[0].inputs[Object.keys(s.blocks.blocks[0].inputs)[0]]);
mutate('wrong occurrence path', s => { const e=s.blocks.blocks[0].extraState.rhs; const go=x=>{if(x?.slot){x.slot.path='wrong';return true;} return x && typeof x==='object' && Object.values(x).some(go);}; go(e); });
mutate('unexpected occupied slot', s => s.blocks.blocks[0].inputs.extra=clone(Object.values(s.blocks.blocks[0].inputs)[0]));
mutate('descriptor/type mismatch', s => s.blocks.blocks[0].type='other_backend_0');
mutate('shared child ID', s => { const b=s.blocks.blocks[0];Object.values(b.inputs)[0].block.id=b.id; });
mutate('wrong one-step witness', s => { const go=x=>{if(x?.slot){x.witness='invented.production';return true;}return x && typeof x==='object' && Object.values(x).some(go);};go(s.blocks.blocks[0].extraState.rhs);});
mutate('lexical field/state mismatch', s => { const go=b=>{if(Object.keys(b.fields||{}).length){b.fields[Object.keys(b.fields)[0]]='bad';return true;}return Object.values(b.inputs||{}).some(x=>go(x.block));};if(!go(s.blocks.blocks[0]))s.blocks.blocks[0].fields={invented:'bad'}; });
const report = {schema: 1, status: 'pass', namespace:'formal_refinement', grammar: input.grammar, fixtures: results, invalid,
    summary: { cases: results.length, assertions, connector_pairs: connectorPairs, uncompressed_blocks: results.reduce((s,x)=>s+x.states[0].blocks,0), compact_blocks: results.reduce((s,x)=>s+x.states[1].blocks,0), uncompressed_bytes:results.reduce((s,x)=>s+Buffer.byteLength(JSON.stringify(x.states[0].saved)),0), compact_bytes:results.reduce((s,x)=>s+Buffer.byteLength(JSON.stringify(x.states[1].saved)),0) }};
fs.writeFileSync(output, JSON.stringify(report, null, 2)+'\n');
console.log(JSON.stringify(report.summary));
