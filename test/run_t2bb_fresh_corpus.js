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
const cases = data.cases.map((row) => {
    if (row.status !== 'pass') return row;
    // Compare complete source derivations including branch, optional, repetition
    // and lexical state, not only their projections.
    const canonical = m.encodeDerivation(row.expected);
    assert.deepStrictEqual(m.decodeCanonicalWorkspace(canonical), row.expected, row.name);
    const generated = m.renderDerivation(row.expected, undefined, true);
    return { ...row, generated };
});
const out = { ...data, cases };
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
    output,
};
console.log(JSON.stringify(report, null, 2));
