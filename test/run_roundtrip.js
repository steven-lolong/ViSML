#!/usr/bin/env node
/**
 * Round-trip test for the SML <-> ViSML block conversion.
 *
 * For every SML program in the battery below:
 *   1. parse the text into a workspace state (text -> blocks),
 *   2. load it into a headless Blockly workspace and generate SML back
 *      (blocks -> text),
 *   3. parse the generated text again and regenerate (the fixed-point check:
 *      generation must be stable from the first generated form onwards).
 *
 * Run with: npm run test:roundtrip
 */

const {
  Blockly,
  smlToVismlWorkspaceState,
  stateToCode,
  findUnregisteredType,
  sampleWorkspaces,
} = require("./dist/roundtrip.bundle.js");

/** SML programs covering every construct the generator can emit. */
const CASES = [
  // -- values, literals and operators ---------------------------------------
  ["arith precedence", "val x = 1 + 2 * 3 - 4"],
  ["logic operators", "val b = 1 < 2 andalso 2 <= 3 orelse 4 = 5 andalso 6 <> 7"],
  ["big and negative ints", "val big = 100000\nval neg = ~5"],
  ["string char literals", 'val s = "hello"\nval c = #"a"'],
  ["unit and parens", "val u = ()\nval p = (1 + 2)"],
  ["tuple", 'val t = (1, "two", #"3")'],
  ["list", "val l = [1, 2, 3]\nval empty = []"],
  ["sequence", 'val q = (print "a"; print "b"; 1)'],
  ["cons and append", "val c2 = 1 :: 2 :: nil\nval d = [1] @ [2]"],
  ["string concat and div mod", 'val e = "a" ^ "b"\nval f = 7 div 2 + 7 mod 2'],
  ["composition", "fun inc x = x + 1\nval g = inc o inc"],
  ["typed expression", "val ty = 1 : int"],
  ["op prefix", "val plus = op +\nval prod = op * (2, 3)"],
  ["record", 'val r = {name = "a", age = 30}\nval n = #name r\nval sel = #age'],
  ["numeric labels", "val pair = {1 = true, 2 = false}\nval fst = #1 pair"],
  ["real literal", "val pi = 3.14"],
  ["word literal", "val w = 0w255"],
  ["long identifiers", "val v = Real.Math.cos 0"],

  // -- bindings and functions -------------------------------------------------
  ["val rec fn", "val rec fact = fn n => if n <= 1 then 1 else n * fact (n - 1)"],
  ["val and chain", "val a = 1 and b = 2 and c = 3"],
  ["val tyvarseq", "val 'a id = fn x => x"],
  ["fun simple", "fun add x y = x + y"],
  ["fun clauses", "fun fact 0 = 1 | fact n = n * fact (n - 1)"],
  ["fun annotated", "fun add2 (x : int) (y : int) : int = x + y"],
  ["fun and chain", "fun even 0 = true | even n = odd (n - 1) and odd 0 = false | odd n = even (n - 1)"],
  ["fun infix clause", "infix 6 ++\nfun x ++ y = x + y\nval z = 1 ++ 2"],
  ["fun infix extra args", "fun (x ** y) z = x + y + z"],
  ["fun op name", "fun op --- (x, y) = x - y"],
  ["fun tyvarseq", "fun 'a self (x : 'a) : 'a = x"],

  // -- patterns ----------------------------------------------------------------
  ["list pattern", "fun len (x :: xs) = 1 + len xs | len [] = 0"],
  ["wildcard and literals", 'fun what 0 = "z" | what 1 = "o" | what _ = "m"'],
  ["tuple pattern", "fun swap (x, y) = (y, x)"],
  ["record pattern", "fun getAge {age, ...} = age\nfun getX {x = a, y = 2} = a | getX r = #x r"],
  ["record row typed as", "fun rowty {x : int as p} = p"],
  ["layered pattern", "fun dup (all as x :: xs) = x :: all"],
  ["layered typed", "fun dep (w : int list as y :: ys) = w"],
  ["constructor pattern", "fun un (SOME x) = x | un NONE = 0"],
  ["long constructor pattern", "fun um (Opt.SOME x) = x"],
  ["annotated pattern", "val (xx : int) = 1"],

  // -- control expressions -------------------------------------------------------
  ["if else", "val m = if true then 1 else 2"],
  ["while do", 'val u2 = while false do print "x"'],
  ["case", 'fun test x = case x of 0 => "z" | 1 => "o" | _ => "m"'],
  ["fn match", "val h = fn 0 => 1 | n => n"],
  ["let single", "val z2 = let val a = 1 val b = 2 in a + b end"],
  ["let multi body", 'val w2 = let val a = 1 in { print "x"; a } end'],
  ["let plain multi body", 'val w3 = let val a = 1 in (print "x"; a) end'],
  ["raise handle", 'exception Bad of string\nval r2 = (raise Bad "x") handle Bad s => s | _ => ""'],

  // -- types and datatypes ---------------------------------------------------------
  ["type record", "type point = {x : int, y : int}"],
  ["type tyvar pair", "type 'a pair = 'a * 'a"],
  ["type two tyvars", "type ('a, 'b) mapping = 'a -> 'b list"],
  ["type and chain", "type t2 = int and t3 = bool"],
  ["type parens list", "type tf = (int -> bool) list"],
  ["type constructor app", "type io = int Opt.wrapped"],
  ["datatype", "datatype 'a opt = NONE2 | SOME2 of 'a"],
  ["datatype withtype", "datatype tree = LEAF | NODE of tree * tree withtype forest = tree list"],
  ["datatype and chain", "datatype aa = A | B and bb = C of int"],
  ["datatype replication", "datatype d2 = datatype Other.d"],
  ["abstype", "abstype cent = CENT of int with fun mk x = CENT x end"],
  ["exception plain", "exception E"],
  ["exception chain", "exception E2 of int and E3"],
  ["exception renaming", "exception E4 = Other.E"],

  // -- structure-level declarations ----------------------------------------------
  ["local", "local val x = 1 in val y = x end"],
  ["open", "open List Foo.Bar"],
  ["fixity", "infix 7 **\ninfixr 5 +++\nnonfix **"],
  ["structure", "structure S = struct val x = 1 fun f y = y end"],
  ["structure annotated", "structure T : SIG = struct val x = 1 end"],
  ["structure opaque", "structure U :> SIG = struct type t = int end"],
  ["structure functor app", "structure V = F (S)"],
  ["structure functor dec app", "structure W = F (val x = 1)"],
  ["structure let", "structure X = let val z = 1 in struct val w = z end end"],
  ["structure and chain", "structure A2 = S and B2 = T"],
  ["structure path", "structure P = Compiler.Frontend"],

  // -- signatures --------------------------------------------------------------------
  [
    "signature full",
    [
      "signature SIG2 = sig",
      "  val x : int",
      "  type t",
      "  eqtype eq",
      "  type u = int",
      "  datatype d = D of int | E",
      "  exception Bad2 of string",
      "  structure Sub : BASE",
      "end",
    ].join("\n"),
  ],
  ["signature include", "signature I1 = sig include BASE end"],
  ["signature include many", "signature I2 = sig include B1 B2 end"],
  ["signature sharing type", "signature SH = sig type t type u sharing type t = u end"],
  ["signature sharing structure", "signature SH2 = sig structure A : S structure B : S sharing A = B end"],
  ["signature datatype replication", "signature R = sig datatype d = datatype M.d end"],
  ["signature refinement", "signature S3 = BASE where type t = int"],
  ["signature refinement tyvar", "signature S4 = BASE where type 'a u = 'a list"],
  ["signature and chain", "signature X1 = sig end and X2 = BASE"],
  ["signature val chain", "signature VC = sig val a : int and b : bool end"],
  ["signature type chain", "signature TC = sig type q and r end"],

  // -- functors ------------------------------------------------------------------------
  ["functor plain", "functor F2 (X : SIG2) = struct val y = X.x end"],
  ["functor opened", "functor G2 (val x : int) = struct val y = x end"],
  ["functor result sig", "functor H2 (X : SIG2) :> SIG2 = X"],
  ["functor transparent result", "functor H3 (X : SIG2) : SIG2 = X"],
  ["functor and chain", "functor F3 (X : SIG2) = X and F4 (Y : SIG2) = Y"],

  // -- generator-shaped input (what the Output pane prints) ---------------------------
  ["generated let braces", "val lb = let val a = 1 in { a; a + 1 } end"],
  ["generated opaque space", "structure OS : > SIG2 = struct val x = 1 end"],
  ["nested comments", "(* outer (* inner *) still comment *) val cm = 1"],
];

let failures = 0;
let passed = 0;

function fail(name, message, detail) {
  failures++;
  console.log(`\nFAIL  ${name}: ${message}`);
  if (detail) console.log(detail.split("\n").map((l) => "      " + l).join("\n"));
}

for (const [name, source] of CASES) {
  // Capture Blockly's serializer warnings; they signal bad block states.
  const warnings = [];
  const originalWarn = console.warn;
  const originalError = console.error;
  console.warn = (...args) => warnings.push(args.join(" "));
  console.error = (...args) => warnings.push(args.join(" "));

  try {
    // 1. text -> blocks
    const state1 = smlToVismlWorkspaceState(source);
    const unregistered = findUnregisteredType(state1);
    if (unregistered) {
      fail(name, `parser produced unregistered block type '${unregistered}'`);
      continue;
    }

    // 2. blocks -> text
    const first = stateToCode(state1);

    // 3. text -> blocks -> text again: generation must be a fixed point.
    const state2 = smlToVismlWorkspaceState(first.code);
    const second = stateToCode(state2);

    if (warnings.length > 0) {
      fail(name, "Blockly reported problems while loading", warnings.join("\n"));
      continue;
    }
    if (second.code !== first.code) {
      fail(
        name,
        "regenerated SML is not stable",
        `--- first ---\n${first.code}\n--- second ---\n${second.code}`
      );
      continue;
    }
    passed++;
    console.log(`ok    ${name}`);
  } catch (error) {
    fail(name, error && error.message ? error.message : String(error));
  } finally {
    console.warn = originalWarn;
    console.error = originalError;
  }
}

// -- blocks-first round-trips: the built-in sample workspaces ------------------
// These states were hand-built in the block editor, so they exercise block
// shapes the text parser must accept (blocks -> text -> blocks -> text).
console.log("\nSample workspaces (blocks -> text -> blocks):");
let samplesPassed = 0;
const sampleNames = Object.keys(sampleWorkspaces);
for (const sampleName of sampleNames) {
  const warnings = [];
  const originalWarn = console.warn;
  const originalError = console.error;
  console.warn = (...args) => warnings.push(args.join(" "));
  console.error = (...args) => warnings.push(args.join(" "));
  try {
    const first = stateToCode(sampleWorkspaces[sampleName]);
    const reparsed = smlToVismlWorkspaceState(first.code);
    const second = stateToCode(reparsed);
    const third = stateToCode(smlToVismlWorkspaceState(second.code));
    if (warnings.length > 0) {
      fail(sampleName, "Blockly reported problems while loading", warnings.join("\n"));
      continue;
    }
    // The first regeneration may normalize; from then on it must be stable.
    if (third.code !== second.code) {
      fail(
        sampleName,
        "regenerated SML is not stable",
        `--- second ---\n${second.code}\n--- third ---\n${third.code}`
      );
      continue;
    }
    samplesPassed++;
    console.log(`ok    ${sampleName}`);
  } catch (error) {
    fail(sampleName, error && error.message ? error.message : String(error));
  } finally {
    console.warn = originalWarn;
    console.error = originalError;
  }
}

console.log(
  `\n${passed}/${CASES.length} text round-trips passed, ` +
  `${samplesPassed}/${sampleNames.length} sample round-trips passed` +
  (failures ? `, ${failures} FAILED` : "")
);
process.exit(failures ? 1 : 0);
