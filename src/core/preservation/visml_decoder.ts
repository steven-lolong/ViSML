import { Derivation, make, role, productions, validateDerivation, PreservationError } from "./formal_codec";
/** Explicit bindings to source rows; no tooltips or regenerated text are read. */
function asciiUnits(text: string): string[] {
    const units = text.match(/\\(?:\s+\\|[0-9]{3}|\^[\x40-\x5f]|.)|[^\\]/gs) || [];
    if (units.join("") !== text)
        throw new PreservationError("Invalid ASCII escape payload");
    return units;
}
export function lexicalDerivation(kind: string, text: string): Derivation {
    const num = (s: string) => make("num.0", s.split(""));
    const hex = (s: string) => make("hex.0", s.split(""));
    const branch = (ch: string) => ({ branch: /[A-Za-z]/.test(ch) ? 0 : /[0-9]/.test(ch) ? 1 : ch === "'" ? 2 : 3, value: ch });
    if (kind === "id") {
        if (/^[A-Za-z][A-Za-z0-9_']*$/.test(text))
            return make("id.0", text[0], text.slice(1).split("").map(branch));
        const symbols = "!%&$#+-/:<=>?@\\~^|*";
        return make("id.1", text.split("").map(ch => ({ branch: symbols.indexOf(ch), value: ch })));
    }
    if (kind === "var") {
        if (!/^'{1,2}[A-Za-z0-9_']*$/.test(text))
            throw new PreservationError("Invalid type-variable payload");
        return make(text.startsWith("''") ? "var.1" : "var.0", text.slice(text.startsWith("''") ? 2 : 1).split("").map(branch));
    }
    if (kind === "int") {
        const m = /^(~)?(0x)?([0-9A-Fa-f]+)$/.exec(text);
        if (!m)
            throw new PreservationError("Invalid integer payload");
        return m[2] ? make("int.1", m[1] ? true : null, hex(m[3])) : make("int.0", m[1] ? true : null, num(m[3]));
    }
    if (kind === "word") {
        const m = /^0w(x)?([0-9A-Fa-f]+)$/.exec(text);
        if (!m)
            throw new PreservationError("Invalid word payload");
        return make(m[1] ? "word.1" : "word.0", m[1] ? hex(m[2]) : num(m[2]));
    }
    if (kind === "float") {
        const m = /^(~)?([0-9]+)(?:\.([0-9]+))?(?:e(~)?([0-9]+))?$/.exec(text);
        if (!m || (!m[3] && !m[5]))
            throw new PreservationError("Invalid real payload");
        return m[5] ? make("float.1", m[1] ? true : null, num(m[2]), m[3] ? num(m[3]) : null, m[4] ? true : null, num(m[5])) : make("float.0", m[1] ? true : null, num(m[2]), num(m[3]));
    }
    if (kind === "string")
        return make("string.0", asciiUnits(text).map(ch => make("ascii.0", ch)));
    if (kind === "char") {
        const units = asciiUnits(text);
        if (units.length !== 1)
            throw new PreservationError("Character must contain exactly one ASCII/escape unit");
        return make("char.0", make("ascii.0", units[0]));
    }
    throw new PreservationError(`Unknown lexical role ${kind}`);
}
function coerce(d: Derivation, expected: string): Derivation {
    if (role(d) === expected)
        return d;
    const aliases = [...productions.values()].filter(p => p.lhs === expected && p.rhs.kind === "n" && p.rhs.role === role(d));
    if (aliases.length !== 1)
        throw new PreservationError(`No unique one-step alias ${expected} -> ${role(d)}`);
    return make(aliases[0].id, d);
}
function appendTail(d: Derivation, tail: Derivation | null): Derivation {
    if (!tail)
        return d;
    if (d.p === "valbind.1")
        return make("valbind.1", appendTail(d.rhs, tail));
    const p = productions.get(d.p), e = p.rhs.items?.[p.rhs.items.length - 1];
    if (e?.kind !== "opt" || e.item.kind !== "seq" || e.item.items[e.item.items.length - 1]?.kind !== "n" || e.item.items[e.item.items.length - 1].role !== role(tail))
        throw new PreservationError(`No recursive tail for ${d.p}`);
    const copy = JSON.parse(JSON.stringify(d));
    copy.rhs[copy.rhs.length - 1] = e.item.items.map((x: any) => x.kind === "t" ? x.value : tail);
    return copy;
}
function chain(items: Derivation[]): Derivation | null { return items.reduceRight((tail, item) => appendTail(item, tail), null as Derivation | null); }
function sequence(items: Derivation[], root: string, separators?: number[]): Derivation {
    const empty = () => make(root === "prog" ? "prog.3" : root === "dec" ? "dec.8" : "spec.8");
    const p = root === "prog" ? "prog.4" : root === "dec" ? "dec.9" : "spec.9";
    const counts = separators || Array(items.length + 1).fill(0);
    if (counts.length !== items.length + 1 || counts.some(n => !Number.isSafeInteger(n) || n < 0))
        throw new PreservationError("Invalid source separator state");
    if (!items.length) {
        let d = empty();
        for (let i = 0; i < counts[0]; i++)
            d = make(p, empty(), true, d);
        return d;
    }
    const nodes: Derivation[] = [], tags: boolean[] = [];
    if (counts[0] > 0) {
        nodes.push(empty());
        for (let j = 1; j < counts[0]; j++) {
            tags.push(true);
            nodes.push(empty());
        }
        tags.push(true);
    }
    items.forEach((item, i) => {
        nodes.push(item);
        const count = counts[i + 1];
        if (i + 1 < items.length) {
            for (let j = 1; j < count; j++) {
                tags.push(true);
                nodes.push(empty());
            }
            tags.push(count > 0);
        }
        else
            for (let j = 0; j < count; j++) {
                tags.push(true);
                nodes.push(empty());
            }
    });
    if (!nodes.length)
        return empty();
    let tail = nodes[nodes.length - 1];
    for (let i = nodes.length - 2; i >= 0; i--)
        tail = make(p, nodes[i], tags[i] ? true : null, tail);
    return tail;
}
export function decodeVismlWorkspace(state: any): Derivation {
    const tops = state?.blocks?.blocks;
    if (!Array.isArray(tops) || tops.length !== 1 || tops[0].type !== "program")
        throw new PreservationError("Exactly one program root is required");
    const seen = new Set<any>(), ids = new Set<string>();
    const decode = (b: any, expected: string): Derivation => {
        if (!b || typeof b !== "object" || seen.has(b))
            throw new PreservationError("Missing, cyclic or shared block");
        seen.add(b);
        if (typeof b.id !== "string" || ids.has(b.id))
            throw new PreservationError("Duplicate/missing block ID");
        ids.add(b.id);
        if (b.next)
            throw new PreservationError("Unexpected statement chain in a value realization");
        const used = new Set<string>(), fields = b.fields || {}, extra = b.extraState || {};
        const f = (key: string, defaultValue: any = "") => { const v = fields[key] ?? defaultValue; return v === true ? "TRUE" : v === false ? "FALSE" : v; };
        for (const [key, value] of Object.entries(fields)) {
            if (key.startsWith("chk") && !["TRUE", "FALSE", true, false].includes(value as any))
                throw new PreservationError(`${b.type}: invalid optional tag ${key}`);
        }
        const selectors: any = { spec_type_sharing: { sharingType: ["", "type"] }, exp_primtv_optr_arith: { opt: ["+", "-", "*", "/"] }, exp_primtv_optr_logic: { opt: ["=", "<>", "<", "<=", ">", ">="] }, id_var: { constrType: ["'", "''"] }, id_lab: { MODE: ["NUM", "ID"] }, exp_bound: { opt: ["NON_OP", "OP"] }, pat_id: { OP: ["nothing", "operator"] }, pat_long_id: { OP: ["nothing", "operator"], patOpt: ["nothing", "pattern"] }, pat_layered: { Op: ["nothing", "operator"] }, valbind: { recVal: ["", "rec"] }, funmatch_nonfix: { optr: [" ", "op"] }, strbind_single: { greatherSign: ["", ">"] }, fctbind_plain: { isTrans: ["", ">"] }, fctbind_opened: { isTrans: ["", ">"] } };
        for (const [key, values] of Object.entries(selectors[b.type] || {})) {
            if (fields[key] !== undefined && !(values as any[]).includes(fields[key]))
                throw new PreservationError(`${b.type}: invalid selector ${key}`);
        }
        const has = (key: string) => !!b.inputs?.[key]?.block;
        if (b.type === "pat_long_id" && fields.patOpt !== undefined && (f("patOpt") === "pattern") !== has("PATTERN"))
            throw new PreservationError("Inconsistent pattern optional tag");
        const child = (key: string, role: string, nullable = false): Derivation => {
            used.add(key);
            if (!has(key)) {
                if (nullable && ["dec", "spec"].includes(role))
                    return make(role === "dec" ? "dec.8" : "spec.8");
                throw new PreservationError(`${b.type}: missing ${key}`);
            }
            return decode(b.inputs[key].block, role);
        };
        const optional = (key: string, role: string, flag?: string) => {
            if (flag && fields[flag] !== undefined && (f(flag) === "TRUE") !== has(key))
                throw new PreservationError(`${b.type}: inconsistent optional tag ${flag}`);
            used.add(key);
            return has(key) ? child(key, role) : null;
        };
        const list = (role: string, prefix = "ADD"): Derivation[] => {
            const count = b.type === "typ_constructor" && extra.itemCount == null ? 0 : extra.itemCount;
            if (!Number.isSafeInteger(count) || count < 0)
                throw new PreservationError(`${b.type}: invalid repetition count`);
            return Array.from({ length: count }, (_, i) => child(prefix + i, role));
        };
        const args = (key: string, flag?: string) => {
            if (flag && fields[flag] !== undefined && (f(flag) === "TRUE") !== has(key))
                throw new PreservationError(`${b.type}: inconsistent argument tag ${flag}`);
            used.add(key);
            if (!has(key))
                return { style: "bare", items: [] };
            const arg = b.inputs[key].block;
            if (arg.type !== "id_long_var")
                return { style: "bare", items: [decode(arg, "var")] };
            if (typeof arg.id !== "string" || arg.next || seen.has(arg) || ids.has(arg.id))
                throw new PreservationError("Shared argument helper");
            seen.add(arg);
            ids.add(arg.id);
            const count = arg.extraState?.itemCount;
            if (!Number.isSafeInteger(count) || count < 1)
                throw new PreservationError("Invalid argument helper count");
            const items = Array.from({ length: count }, (_, i) => decode(arg.inputs?.["ADD" + i]?.block, "var"));
            if (Object.keys(arg.inputs || {}).some(k => !/^ADD\d+$/.test(k) || Number(k.slice(3)) >= count))
                throw new PreservationError("Extra argument input");
            return { style: arg.extraState?.t2bbSource?.argumentStyle ?? (count > 1 ? "parenthesized" : "bare"), items };
        };
        const sigConstraint = (key: string, flag: string, selector: string) => {
            const sig = optional(key, "sig", flag);
            return sig ? [f(selector) === '>' ? true : null, sig] : null;
        };
        let d: Derivation;
        const type = b.type;
        const wrappers: any = { program_functor: ["prog.1", "fctbind", "fctbind"], program_signature: ["prog.2", "sigbind", "sigbind"], exp_raise: ["exp.12", "exp", "exp"], exp_fn: ["exp.19", "fn", "match"], exp_record_select: ["exp.7", "lab", "lab"], exp_parentheses: ["exp.4", "exp", "exp"], pat_parentheses: ["pat.5", "pat", "pat"], typ_parentheses: ["typ.2", "typ", "typ"], typ_var: ["typ.0", "typ_var", "var"], dec_type: ["dec.2", "typbind", "typbind"], dec_exception: ["dec.6", "exnbind", "exnbind"], dec_structure: ["dec.7", "strbind", "strbind"], str_identifier: ["str.0", "longId", "longid"], sig_id: ["sig.0", "id", "id"], spec_value: ["spec.0", "valdesc", "valdesc"], spec_type: ["spec.1", "typdesc", "typdesc"], spec_equality_type: ["spec.2", "typdesc", "typdesc"], spec_type_abbreviation: ["spec.3", "typbind", "typbind"], spec_datatype: ["spec.4", "datdesc", "datdesc"], spec_exception: ["spec.6", "exndesc", "exndesc"], spec_structure: ["spec.7", "strdesc", "strdesc"], spec_inclusion_sig: ["spec.10", "sig", "sig"] };
        const binaries: any = { exp_application: ["exp.2", "exp1", "exp", "exp2", "exp"], exp_with_type: ["exp.11", "exp", "exp", "typ", "typ"], exp_handle: ["exp.13", "exp", "exp", "match", "match"], exp_andalso: ["exp.14", "exp1", "exp", "exp2", "exp"], exp_orelse: ["exp.15", "exp1", "exp", "exp2", "exp"], exp_while_do: ["exp.17", "while", "exp", "do", "exp"], exp_case: ["exp.18", "case", "exp", "of", "match"], pat_type_annotation: ["pat.9", "pat", "pat", "typ", "typ"], typ_function: ["typ.3", "from", "typ", "to", "typ"], str_transparent_annotation: ["str.2", "str", "str", "sig", "sig"], str_opaque_annotation: ["str.3", "str", "str", "sig", "sig"], str_functor_application_str: ["str.4", "id", "id", "str", "str"], str_functor_application_dec: ["str.5", "id", "id", "dec", "dec"], sig_refinement: ["sig.2", "sig", "sig", "typrefin", "typrefin"] };
        const containers: any = { typebind_more_inhabitants: "typbind", databind_more_inhabitants: "datbind", conbind_more_inhabitants: "conbind", exnbind_more_inhabitants: "exnbind", strbind_nested: "strbind", sigbind_nested: "sigbind", typrefin_nested: "typrefin", valdesc_nested: "valdesc", typdesc_nested: "typdesc", datdesc_nested: "datdesc", condesc_nested: "condesc", exndesc_nested: "exndesc", strdesc_nested: "strdesc", fctbind_nested: "fctbind", matchs: "match", funmatch_more_row: "funmatch" };
        if (wrappers[type]) {
            const [p, k, r] = wrappers[type];
            d = make(p, child(k, r));
        }
        else if (binaries[type]) {
            const [p, a, ar, c, cr] = binaries[type];
            d = make(p, child(a, ar), child(c, cr));
        }
        else if (containers[type]) {
            d = chain(list(containers[type]));
            if (!d)
                throw new PreservationError("Empty recursive container");
        }
        else
            switch (type) {
                case "dec_empty":
                    d = make("dec.8");
                    break;
                case "spec_empty":
                    d = make("spec.8");
                    break;
                case "program": {
                    const items = extra.itemCount === 1 && !has("ADD0") ? [] : list("prog");
                    d = sequence(items, "prog", extra.t2bbSource?.separators);
                    break;
                }
                case "con_int":
                case "con_word":
                case "con_float":
                case "con_char":
                case "con_string": {
                    const kind: any = { con_int: ["con.0", "int", "0"], con_word: ["con.1", "word", "0w0"], con_float: ["con.2", "float", "0.0"], con_char: ["con.3", "char", "a"], con_string: ["con.4", "string", ""] };
                    const [p, k, v] = kind[type];
                    let value = String(f("inputValue", v));
                    if (k === "word" && !value.startsWith("0w"))
                        value = "0w" + value;
                    d = make(p, lexicalDerivation(k, ["int", "float"].includes(k) ? value.replace(/-/g, "~") : value));
                    break;
                }
                case "id_id":
                    d = lexicalDerivation("id", String(f("inputValue", "x")));
                    break;
                case "id_var":
                    d = lexicalDerivation("var", String(f("constrType", "'")) + String(f("inputValue", "a")));
                    break;
                case "id_long_id":
                    d = make("longid.0", list("id"));
                    break;
                case "id_lab":
                    d = f("MODE", "NUM") === "ID" ? make("lab.0", child("inputId", "id")) : make("lab.1", make("num.0", String(f("inputNum", "1")).split("")));
                    break;
                case "exp_bound":
                    d = make("exp.1", f("opt") === "OP" ? true : null, child("longid", "longid"));
                    break;
                case "exp_infix_application":
                    d = make("exp.3", child("exp1", "exp"), child("id", "id"), child("exp2", "exp"));
                    break;
                case "exp_primtv_optr_arith":
                case "exp_primtv_optr_logic":
                    d = make("exp.3", child("exp_1", "exp"), lexicalDerivation("id", String(f("opt", type.endsWith("arith") ? "+" : "="))), child("exp_2", "exp"));
                    break;
                case "exp_if_else":
                    d = make("exp.16", child("if", "exp"), child("then", "exp"), child("else", "exp"));
                    break;
                case "exp_tuple":
                case "exp_list":
                case "exp_sequence":
                    d = make(type === "exp_tuple" ? "exp.5" : type === "exp_list" ? "exp.8" : "exp.9", list("exp"));
                    break;
                case "exp_let_in_end":
                    d = make("exp.10", child("let", "dec", true), list("exp"));
                    break;
                case "exp_record":
                    d = make("exp.6", chain(list("exprow")));
                    break;
                case "exprow":
                    d = make("exprow.0", child("lab", "lab"), child("exp", "exp"), null);
                    break;
                case "match":
                    d = make("match.0", child("pat", "pat"), child("exp", "exp"), null);
                    break;
                case "pat_wildcard":
                    d = make("pat.1");
                    break;
                case "pat_id":
                    d = make("pat.2", f("OP") === "operator" ? true : null, child("id", "id"));
                    break;
                case "pat_long_id":
                    d = make("pat.3", f("OP") === "operator" ? true : null, child("longId", "longid"), optional("PATTERN", "pat"));
                    break;
                case "pat_infix":
                    d = make("pat.4", child("pat_lhs", "pat"), child("id", "id"), child("pat_rhs", "pat"));
                    break;
                case "pat_layered":
                    d = make("pat.10", f("Op") === "operator" ? true : null, child("id", "id"), optional("inTyp", "typ", "chkTyp"), child("inPat", "pat"));
                    break;
                case "pat_tuple":
                case "pat_list":
                    d = make(type === "pat_tuple" ? "pat.6" : "pat.8", list("pat"));
                    break;
                case "pat_record":
                    d = make("pat.7", chain(list("patrow")));
                    break;
                case "patrow_wildcard":
                    d = make("patrow.0");
                    break;
                case "patrow_lab_pat":
                    d = make("patrow.1", child("lab", "lab"), child("pat", "pat"), null);
                    break;
                case "patrow_variable":
                    d = make("patrow.2", child("id", "id"), optional("inTyp", "typ", "chkTyp"), optional("inPat", "pat", "chkAs"), null);
                    break;
                case "typ_primtv":
                    d = make("typ.1", { style: "bare", items: [] }, make("longid.0", [lexicalDerivation("id", String(f("type", "int")))]));
                    break;
                case "typ_list":
                    d = make("typ.1", { style: "bare", items: [child("typ", "typ")] }, make("longid.0", [lexicalDerivation("id", "list")]));
                    break;
                case "typ_constructor": {
                    const items = list("typ");
                    d = make("typ.1", { style: items.length > 1 ? "parenthesized" : "bare", items }, child("longid", "longid"));
                    break;
                }
                case "typ_tuple":
                    d = make("typ.4", list("typ"));
                    break;
                case "typ_record": {
                    const labs = list("lab"), types = list("typ", "TYP");
                    d = make("typ.5", chain(labs.map((l, i) => make("typrow.0", l, types[i], null))));
                    break;
                }
                case "dec_val": {
                    const bindings = list("valbind");
                    d = make("dec.0", args("inVar", "chkTyp"), chain(bindings));
                    break;
                }
                case "valbind": {
                    d = make("valbind.0", child("pat", "pat"), child("exp", "exp"), null);
                    if (f("recVal") === "rec")
                        d = make("valbind.1", d);
                    break;
                }
                case "dec_fun": {
                    const clauses = list("funmatch").map(x => make("funbind.0", x, null));
                    d = make("dec.1", args("inVar", "chkTyp"), chain(clauses));
                    break;
                }
                case "funmatch_nonfix":
                    d = make("funmatch.0", String(f("optr")).trim() === "op" ? true : null, child("id", "id"), list("pat"), optional("inVar", "typ", "chkTyp"), child("exp", "exp"), null);
                    break;
                case "funmatch_infix":
                    d = make("funmatch.1", child("pat1", "pat"), child("id", "id"), child("pat2", "pat"), optional("inTyp", "typ", "chkTyp"), child("inexp", "exp"), null);
                    break;
                case "funmatch_infix_n_inhabitant":
                    d = make("funmatch.2", child("pat1", "pat"), child("id", "id"), child("pat2", "pat"), list("pat"), optional("inVar", "typ", "chkTyp"), child("exp", "exp"), null);
                    break;
                case "dec_datatype_bind":
                    d = make("dec.3", child("datbind", "datbind"), optional("inVar", "typbind", "chkTyp"));
                    break;
                case "dec_datatype_replication":
                    d = make("dec.4", child("id", "id"), child("longid", "longid"));
                    break;
                case "dec_abstype":
                    d = make("dec.5", child("datbind", "datbind"), optional("inVar", "typbind", "chkTyp"), child("withDec", "dec", true));
                    break;
                case "dec_local":
                    d = make("dec.10", child("local", "dec", true), child("in", "dec", true));
                    break;
                case "dec_sequence":
                case "spec_sequence":
                    d = sequence(list(type === "dec_sequence" ? "dec" : "spec"), type === "dec_sequence" ? "dec" : "spec", extra.t2bbSource?.separators);
                    break;
                case "dec_open":
                    d = make("dec.11", list("longid"));
                    break;
                case "dec_nonfix":
                    d = make("dec.12", list("id"));
                    break;
                case "dec_infix":
                case "dec_infixr":
                    d = make(type === "dec_infix" ? "dec.13" : "dec.14", String(f("digit")).trim() || null, list("id"));
                    break;
                case "typbind":
                    d = make("typbind.0", args("inVar", "chkTyp"), child("id", "id"), child("inTyp", "typ"), null);
                    break;
                case "datbind":
                    d = make("datbind.0", args("inVar", "chkTyp"), child("id", "id"), child("inConbind", "conbind"), null);
                    break;
                case "conbind":
                    d = make("conbind.0", child("id", "id"), optional("inVar", "typ", "chkTyp"), null);
                    break;
                case "exnbind":
                    d = make("exnbind.0", child("id", "id"), optional("inVar", "typ", "chkTyp"), null);
                    break;
                case "exnbind_renaming":
                    d = make("exnbind.1", child("id", "id"), child("longId", "longid"), null);
                    break;
                case "str_structure":
                    d = make("str.1", child("dec", "dec", true));
                    break;
                case "str_local_declaration":
                    d = make("str.6", child("dec", "dec", true), child("str", "str"));
                    break;
                case "strbind_single":
                    d = make("strbind.0", child("id", "id"), sigConstraint("inputSig", "chkSub", "greatherSign"), child("inputStr", "str"), null);
                    break;
                case "sig_signature":
                    d = make("sig.1", child("spec", "spec", true));
                    break;
                case "typrefin_single": {
                    const v = optional("inputVar", "var", "chkSub");
                    d = make("typrefin.0", { style: "bare", items: v ? [v] : [] }, child("inputLongid", "longid"), child("inputTyp", "typ"), null);
                    break;
                }
                case "spec_datatype_replication":
                    d = make("spec.5", child("datId", "id"), child("datLongId", "longid"));
                    break;
                case "spec_inclusion":
                    d = make("spec.11", list("id"));
                    break;
                case "spec_type_sharing":
                    d = make(f("sharingType") === "type" ? "spec.12" : "spec.13", child("specBlock", "spec", true), list("longid"));
                    break;
                case "valdesc_single":
                    d = make("valdesc.0", child("inputId", "id"), child("inputTyp", "typ"), null);
                    break;
                case "typdesc_single":
                    d = make("typdesc.0", args("inputVar", "chkSub"), child("inputId", "id"), null);
                    break;
                case "datdesc_single":
                    d = make("datdesc.0", args("inputVar", "chkSub"), child("inputId", "id"), child("inputConDesc", "condesc"), null);
                    break;
                case "condesc_single":
                    d = make("condesc.0", child("inputId", "id"), optional("inputVar", "typ", "chkSub"), null);
                    break;
                case "exndesc_single":
                    d = make("exndesc.0", child("inputId", "id"), optional("inputVar", "typ", "chkSub"), null);
                    break;
                case "strdesc_single":
                    d = make("strdesc.0", child("inputId", "id"), child("inputSig", "sig"), null);
                    break;
                case "sigbind_single":
                    d = make("sigbind.0", child("inputId", "id"), child("inputVar", "sig"), null);
                    break;
                case "fctbind_plain":
                    d = make("fctbind.0", child("inputId1", "id"), child("inputId2", "id"), child("inputSig", "sig"), sigConstraint("inputVar", "chkSub", "isTrans"), child("inputStr", "str"), null);
                    break;
                case "fctbind_opened":
                    d = make("fctbind.1", child("inputId", "id"), child("inputSpec", "spec", true), sigConstraint("inputVar", "chkSub", "isTrans"), child("inputStr", "str"), null);
                    break;
                default: throw new PreservationError(`No formal source binding for ${type}`);
            }
        if (Object.keys(b.inputs || {}).some(k => !used.has(k) && b.inputs[k]?.block))
            throw new PreservationError(`${type}: unexpected input occurrence`);
        if (extra.t2bbSource?.boundary) {
            const root = role(d);
            if (!["dec", "spec"].includes(root))
                throw new PreservationError("Layout boundary on non-sequence role");
            d = sequence([d], root, extra.t2bbSource.boundary);
        }
        return coerce(d, expected);
    };
    const d = decode(tops[0], "prog");
    validateDerivation(d);
    return d;
}
export function validateVismlWorkspace(state: any): {
    ok: boolean;
    reason?: string;
} {
    try {
        decodeVismlWorkspace(state);
        return { ok: true };
    }
    catch (e) {
        return { ok: false, reason: e instanceof Error ? e.message : String(e) };
    }
}
