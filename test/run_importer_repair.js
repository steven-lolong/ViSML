#!/usr/bin/env node
const assert=require('assert/strict'),fs=require('fs');
const m=require('./dist/roundtrip.bundle.js'),fixtures=require('./importer_repair_fixtures.json');
function walk(x,fn){if(!x||typeof x!=='object')return;if(x.p&&'rhs'in x)fn(x);Object.values(x).forEach(v=>Array.isArray(v)?v.forEach(y=>walk(y,fn)):walk(v,fn));}
function source(s){return m.decodeVismlWorkspace(m.smlToVismlWorkspaceState(s));}
function value(d,name){let answer;walk(d,n=>{if(n.p==='valbind.0'&&m.renderDerivation(n.rhs[0],m.smlGrammar)===name)answer=n.rhs[2];});assert(answer,name);return answer;}
function shape(d){if(d.p==='exp.4')return shape(d.rhs[1]);if(d.p==='exp.3')return [m.renderDerivation(d.rhs[1],m.smlGrammar),shape(d.rhs[0]),shape(d.rhs[2])];if(d.p==='exp.2')return ['app',shape(d.rhs[0]),shape(d.rhs[1])];return m.renderDerivation(d,m.smlGrammar);}
let passed=0;const outputs=[];const backend=m.createBlocklyBackend(m.factoredGrammar,'repair_regression');
for(const c of [...fixtures.positive,...fixtures.legacy]){
 const d=source(c.source),state=m.smlToVismlWorkspaceState(c.source),w=new m.Blockly.Workspace();
 try{m.Blockly.serialization.workspaces.load(state,w);assert.deepEqual(m.decodeVismlWorkspace(m.Blockly.serialization.workspaces.save(w)),d);}finally{w.dispose();}
 const expected=m.factorDerivation(d);
 for(const compact of [false,true]){const w=new m.Blockly.Workspace();try{m.Blockly.serialization.workspaces.load(backend.encode(expected,compact),w);const saved=backend.save(w);assert.deepEqual(backend.decode(saved),expected);m.Blockly.serialization.workspaces.load(saved,w);assert.deepEqual(backend.decode(backend.save(w)),expected);}finally{w.dispose();}}
 const frontier=m.renderDerivation(d,m.smlGrammar,false);if(!fixtures.legacy.includes(c))assert.deepEqual(m.tokenize(frontier).map(t=>[t.type,t.value]),m.tokenize(c.source).map(t=>[t.type,t.value]));
 outputs.push({name:c.name,source:c.source,generated:m.renderDerivation(d,m.smlGrammar,true),legacy:fixtures.legacy.includes(c)});passed++;
}
for(const c of fixtures.negative){assert.throws(()=>source(c.source),m.SmlParseError,c.name);passed++;}
// Expectations below follow specified SML precedence/associativity, not codec output.
assert.deepEqual(shape(value(source(fixtures.positive.find(c=>c.name==='custom-precedence').source),'x')),['+','1',['*',['++','2','3'],'4']]);
assert.deepEqual(shape(value(source(fixtures.positive.find(c=>c.name==='right-associativity').source),'x')),['++','1',['++','2','3']]);
assert.deepEqual(shape(value(source(fixtures.positive.find(c=>c.name==='left-associativity').source),'x')),['++',['++','1','2'],'3']);
assert.deepEqual(shape(value(source(fixtures.positive.find(c=>c.name==='before-precedence').source),'x')),['before','1',[':=','r','2']]);
assert.deepEqual(shape(value(source(fixtures.positive.find(c=>c.name==='nonfix-basis').source),'x')),['app','+','( 1 , 2 )']);
assert.deepEqual(shape(value(source(fixtures.positive.find(c=>c.name==='let-fixity-scope').source),'y')),['++','1','2']);
assert.deepEqual(shape(value(source(fixtures.positive.find(c=>c.name==='struct-fixity-scope').source),'y')),['+','1','2']);
assert.deepEqual(shape(value(source(fixtures.positive.find(c=>c.name==='local-hidden-fixity').source),'z')),['+','1','2']);
assert.deepEqual(shape(value(source(fixtures.positive.find(c=>c.name==='local-exported-fixity').source),'z')),['app','+','( 1 , 2 )']);
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify({status:'pass',positive:fixtures.positive.length,legacy:fixtures.legacy.length,negative:fixtures.negative.length,checks:passed,outputs},null,2)+'\n');
console.log(`Importer repair: ${fixtures.positive.length} source fixtures, ${fixtures.legacy.length} explicit legacy fixture, ${fixtures.negative.length} negative probes; ${passed} passed.`);
