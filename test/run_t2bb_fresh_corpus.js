#!/usr/bin/env node
/** Re-render retained T2BB derivations using THIS ViSML checkout.
 * Usage: node test/run_t2bb_fresh_corpus.js states.json.gz output.json.gz
 * Run npm run test:preservation first to build test/dist/roundtrip.bundle.js.
 * This script only reruns the renderer and structural codec; compare its
 * output with the independent Python oracle in the T2BB artifact.
 */
const fs = require('fs');
const zlib = require('zlib');
const assert = require('assert/strict');
const crypto = require('crypto');
const cp = require('child_process');
const path = require('path');
const m = require('./dist/roundtrip.bundle.js');
const [input, output] = process.argv.slice(2);
if (!input || !output || path.resolve(input) === path.resolve(output)) {
    console.error('Usage: node test/run_t2bb_fresh_corpus.js states.json.gz NEW-output.json.gz');
    process.exit(2);
}
const digest = v => crypto.createHash('sha256').update(v).digest('hex');
const raw = fs.readFileSync(input);
const data = JSON.parse(zlib.gunzipSync(raw).toString('utf8'));
// Archived 2026-10-07 derivations have historical auxiliary __args_* rows and
// null argument shorthands. They are not canonical for the current codec.
// Re-import ORIGINAL SOURCE with the current ViSML grammar rather than silently
// migrating archived expected trees or weakening the full-state validator.
const currentGrammar = require('../src/core/preservation/formal_sml_grammar.json');
const backend = m.createBlocklyBackend(m.factoredGrammar, 't2bb_fresh_corpus');
let checkedSaveLoad = 0;
const cases = data.cases.map((row) => {
    if (row.status !== 'pass') return row;
    // Compare complete source derivations including branch, optional, repetition
    // and lexical state, not only their projections.
    const importedState = m.smlToVismlWorkspaceState(row.source);
    const expected = m.decodeVismlWorkspace(importedState);
    const canonical = m.encodeDerivation(expected);
    assert.deepStrictEqual(m.decodeCanonicalWorkspace(canonical), expected, row.name);
    const factored = m.factorDerivation(expected);
    assert.deepStrictEqual(m.unfactorDerivation(factored), expected, row.name + '/unfactor');
    // Exercise live generated Blockly save/load, not just a stored JSON audit.
    const workspace = new m.Blockly.Workspace();
    try {
        m.Blockly.serialization.workspaces.load(backend.encode(factored, false), workspace);
        const saved = backend.save(workspace);
        assert.deepStrictEqual(m.unfactorDerivation(backend.decode(saved)), expected, row.name + '/saved');
        const reloaded = new m.Blockly.Workspace();
        try {
            m.Blockly.serialization.workspaces.load(saved, reloaded);
            assert.deepStrictEqual(m.unfactorDerivation(backend.decode(backend.save(reloaded))), expected, row.name + '/reloaded');
        } finally { reloaded.dispose(); }
        checkedSaveLoad++;
    } finally { workspace.dispose(); }
    const generated = m.renderDerivation(expected, currentGrammar, true);
    return { ...row, expected, generated };
});
const out = { ...data, grammar: currentGrammar, cases };
fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
fs.writeFileSync(output, zlib.gzipSync(Buffer.from(JSON.stringify(out))));
const git = cp.execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const codec = fs.readFileSync(path.join(__dirname, '../src/core/preservation/formal_codec.ts'));
const report = {
    status: 'renderer_executed_oracle_pending',
    revision: git,
    source_sha256: digest(codec),
    input_sha256: digest(raw),
    output_sha256: digest(fs.readFileSync(output)),
    cases: cases.length,
    successful_reexports: cases.filter(x => x.status === 'pass').length,
    derivation_source: 're-imported current ViSML from original program text; archived derivations left unchanged',
    live_generated_backend_save_load: checkedSaveLoad,
    output,
};
console.log(JSON.stringify(report, null, 2));
