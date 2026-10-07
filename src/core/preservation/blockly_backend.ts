import * as Blockly from "blockly";
import { Grammar, Derivation, PreservationError, encodeDerivation, decodeCanonicalWorkspace } from "./formal_codec";
import { compactAliases } from "./alias_compaction";

const copy = (x: any) => JSON.parse(JSON.stringify(x));
const must = (ok: any, message: string) => { if (!ok) throw new PreservationError(message); };

/** A generated, editable Blockly realization of the canonical schema.
 * Child derivations live ONLY in connections. Extra state contains the local
 * EBNF state, source slot descriptors and optional one-step witnesses.
 */
export function createBlocklyBackend(grammar: Grammar, namespace: string) {
    must(/^[a-zA-Z0-9_]+$/.test(namespace), "Invalid backend namespace");
    const supported = (e: any, inRepetition = false, slotFree = false): boolean => {
        if (["eps", "t", "c"].includes(e.kind)) return true;
        if (e.kind === "n") return !slotFree;
        if (e.kind === "seq") return e.items.every((x: any) => supported(x, inRepetition, slotFree));
        if (e.kind === "opt") return supported(e.item, inRepetition, slotFree);
        if (e.kind === "choice") return e.items.every((x: any) => supported(x, inRepetition, true));
        if (e.kind === "rep") return !inRepetition && [0, 1, 2].includes(e.min) && (!(e.exclude || []).length || e.min === 0 && JSON.stringify(e.exclude) === "[1]") && supported(e.item, true, slotFree);
        return false;
    };
    must(new Set(grammar.productions.map(p => p.id)).size === grammar.productions.length && grammar.productions.every(p => supported(p.rhs)), "Grammar outside generated Blockly fragment");
    const registry = new Map(grammar.productions.map(p => [p.id, p]));
    const types = new Map(grammar.productions.map((p, i) => [p.id, `${namespace}_${i}`]));
    const accepted = (expected: string) => [expected, ...grammar.productions.filter(p => p.lhs === expected && p.rhs.kind === "n").map(p => p.rhs.role)];
    const check = (role: string) => `${namespace}:${role}`;
    const blank = (e: any, p: any, path: string): any => {
        switch (e.kind) {
            case "eps": return null;
            case "t": return e.value;
            case "c": return grammar.terminal_classes?.[e.name]?.sample ?? { digit: "1", letter: "a", hexDigit: "A", ascii: "x" }[e.name] ?? "";
            case "n": return { slot: { production: p.id, path, expect: e.role } };
            case "seq": return e.items.map((x: any, i: number) => blank(x, p, `${path}/${i}`));
            case "opt": return null;
            case "rep": return Array.from({ length: e.min }, (_, i) => blank(e.item, p, `${path}/item/${i}`));
            case "choice": return { branch: 0, value: blank(e.items[0], p, `${path}/branch/0`) };
            default: throw new PreservationError(`Elaborate unsupported constructor ${e.kind} before Blockly generation`);
        }
    };
    // One traversal drives shape, serialization and projection; source paths
    // are never recovered from geometry, field order or regenerated source.
    const walk = (e: any, u: any, path: string, visit: (e: any, u: any, path: string) => void): void => {
        visit(e, u, path);
        switch (e.kind) {
            case "seq":
                must(Array.isArray(u) && u.length === e.items.length, "Invalid sequence shape");
                e.items.forEach((x: any, i: number) => walk(x, u[i], `${path}/${i}`, visit)); break;
            case "opt": if (u !== null) walk(e.item, u, `${path}/present`, visit); break;
            case "rep":
                must(Array.isArray(u) && u.length >= e.min && !(e.exclude || []).includes(u.length), "Invalid repetition shape");
                u.forEach((x: any, i: number) => walk(e.item, x, `${path}/item/${i}`, visit)); break;
            case "choice":
                must(u && Number.isInteger(u.branch) && e.items[u.branch], "Invalid choice shape");
                walk(e.items[u.branch], u.value, `${path}/branch/${u.branch}`, visit); break;
            case "eps": must(u === null, "Invalid epsilon state"); break;
            case "t": must(u === e.value, "Invalid fixed terminal"); break;
            case "n": must(u?.slot?.path === path && u.slot.expect === e.role, "Invalid source slot descriptor"); break;
            case "c": must(typeof u === "string", "Invalid lexical state"); break;
            default: throw new PreservationError(`Unsupported constructor ${e.kind}`);
        }
    };
    const replaceAt = (u: any, path: string, value: any): any => {
        const parts = path.split("/").slice(1);
        if (!parts.length) return value;
        let target = u;
        // Canonical RHS uses arrays for seq/rep and {branch,value} for choice.
        const keys: (number | string)[] = [];
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] === "present") continue;
            if (parts[i] === "item") { keys.push(Number(parts[++i])); continue; }
            if (parts[i] === "branch") { i++; keys.push("value"); continue; }
            keys.push(Number(parts[i]));
        }
        keys.slice(0, -1).forEach(k => target = target[k]);
        target[keys[keys.length - 1]] = value;
        return u;
    };
    for (const p of grammar.productions) {
        const type = types.get(p.id);
        must(!Blockly.Blocks[type], `Backend namespace already registered: ${namespace}`);
        Blockly.Blocks[type] = {
            init: function () {
                this.setOutput(true, check(p.lhs));
                this.setColour(210);
                this.setTooltip(`${p.id}: ${p.lhs}`);
                this.rhs_ = blank(p.rhs, p, "rhs");
                this.rebuild_();
            },
            localState_: function () {
                let state = copy(this.rhs_);
                walk(p.rhs, state, "rhs", (e, u, path) => {
                    if (e.kind === "c") state = replaceAt(state, path, this.getFieldValue(`payload:${path}`));
                });
                return state;
            },
            setLocalState: function (state: any) {
                const children = new Map(this.inputList.filter((i: any) => i.connection?.targetConnection)
                    .map((i: any) => [i.name, i.connection.targetConnection]));
                walk(p.rhs, state, "rhs", (e, u) => {
                    if (e.kind === "n") must(u.slot.production === p.id && !u.node, "Invalid local slot ownership");
                });
                this.rhs_ = copy(state);
                this.rebuild_();
                children.forEach((connection: any, name: string) => {
                    const input = this.getInput(name);
                    if (input?.connection && this.workspace.connectionChecker.doTypeChecks(input.connection, connection)) input.connection.connect(connection);
                });
            },
            rebuild_: function () {
                [...this.inputList].forEach((i: any) => this.removeInput(i.name));
                this.appendDummyInput("descriptor").appendField(p.id);
                walk(p.rhs, this.rhs_, "rhs", (e, u, path) => {
                    if (e.kind === "n") this.appendValueInput(path).setCheck(accepted(e.role).map(check)).appendField(e.role);
                    else if (e.kind === "t") this.appendDummyInput(`label:${path}`).appendField(e.value);
                    else if (e.kind === "c") this.appendDummyInput(`lexical:${path}`).appendField(e.name).appendField(new Blockly.FieldTextInput(u), `payload:${path}`);
                    else if (["opt", "rep", "choice"].includes(e.kind)) this.appendDummyInput(`state:${path}`).appendField(`${e.kind} ${path}: ${e.kind === "opt" ? u !== null : e.kind === "rep" ? u.length : u.branch}`);
                });
                this.setInputsInline(false);
            },
            saveExtraState: function () { return { schema: 1, production: p.id, rhs: this.localState_() }; },
            loadExtraState: function (state: any) {
                must(state?.schema === 1 && state.production === p.id, "Blockly type/descriptor mismatch");
                this.setLocalState(state.rhs);
            },
            customContextMenu: function (options: any[]) {
                const state = this.localState_();
                const change = (path: string, value: any) => this.setLocalState(replaceAt(copy(state), path, value));
                walk(p.rhs, state, "rhs", (e, u, path) => {
                    if (e.kind === "opt") options.push({ text: `Toggle ${path}`, enabled: true, callback: () => change(path, u === null ? blank(e.item, p, `${path}/present`) : null) });
                    if (e.kind === "rep") for (const delta of [-1, 1]) {
                        let n = u.length + delta;
                        while ((e.exclude || []).includes(n)) n += delta;
                        options.push({ text: `${delta > 0 ? "Add" : "Remove"} item ${path}`, enabled: n >= e.min, callback: () => change(path, Array.from({ length: n }, (_, i) => u[i] || blank(e.item, p, `${path}/item/${i}`))) });
                    }
                    if (e.kind === "choice") e.items.forEach((branch: any, i: number) => options.push({ text: `Branch ${i} at ${path}`, enabled: i !== u.branch, callback: () => change(path, { branch: i, value: blank(branch, p, `${path}/branch/${i}`) }) }));
                    if (e.kind === "n") {
                        options.push({ text: `Clear witness at ${path}`, enabled: !!u.witness, callback: () => change(path, { slot: u.slot }) });
                        grammar.productions.filter(a => a.lhs === e.role && a.rhs.kind === "n" && a.rhs.role !== a.lhs).forEach(a => options.push({ text: `Witness ${a.id} at ${path}`, enabled: true, callback: () => change(path, { ...u, witness: a.id }) }));
                    }
                });
            },
        };
    }
    const reify = (graph: any, start = grammar.start) => {
        decodeCanonicalWorkspace(graph, { ...grammar, start });
        const nodes = new Map<string, any>(graph.nodes.map((n: any) => [n.id, n]));
        const block = (id: string): any => {
            const n = nodes.get(id), p = registry.get(n.production), inputs: any = {}, local = copy(n.rhs);
            walk(p.rhs, local, "rhs", (e, u, path) => {
                if (e.kind === "n") { inputs[path] = { block: block(u.node) }; delete u.node; }
            });
            return { type: types.get(p.id), id, extraState: { schema: 1, production: p.id, rhs: local }, inputs };
        };
        return { blocks: { languageVersion: 0, blocks: [block(graph.root)] } };
    };
    const encode = (d: Derivation, compact = false, start = grammar.start) => {
        const specification = { ...grammar, start };
        return reify(compact ? compactAliases(d, specification) : encodeDerivation(d, specification), start);
    };
    const project = (state: any) => {
        const tops = state?.blocks?.blocks;
        must(Array.isArray(tops) && tops.length === 1, "Exactly one generated root is required");
        const nodes: any[] = [], seen = new Set<string>();
        const visit = (b: any): string => {
            must(b && typeof b.id === "string" && !seen.has(b.id) && !b.next && !b.shadow, "Invalid Blockly production spine");
            seen.add(b.id);
            const meta = b.extraState, p = registry.get(meta?.production);
            must(meta?.schema === 1 && p && b.type === types.get(p.id), "Missing/mismatched production descriptor");
            let rhs = copy(meta.rhs);
            const slots = new Set<string>(), fields = new Set<string>();
            walk(p.rhs, rhs, "rhs", (e, u, path) => {
                if (e.kind === "n") {
                    must(u.slot.production === p.id && !u.node, "Source slot ownership mismatch");
                    slots.add(path);
                    const input = b.inputs?.[path];
                    must(input?.block && !input.shadow, `Missing required source slot ${path}`);
                    u.node = visit(input.block);
                } else if (e.kind === "c") {
                    const name = `payload:${path}`;
                    fields.add(name);
                    if (b.fields && name in b.fields) {
                        must(b.fields[name] === u, "Serialized lexical field/state disagreement");
                    }
                }
            });
            must(Object.keys(b.inputs || {}).every(k => slots.has(k)), "Unexpected occupied Blockly input");
            must(Object.keys(b.fields || {}).every(k => fields.has(k)), "Unexpected Blockly field");
            nodes.push({ id: b.id, production: p.id, role: p.lhs, rhs });
            return b.id;
        };
        const root = visit(tops[0]);
        return { schema: 1, root, nodes };
    };
    const decode = (state: any, start = grammar.start) => decodeCanonicalWorkspace(project(state), { ...grammar, start });
    return { grammar, types, accepted, encode, reify, project, decode,
        save: (workspace: Blockly.Workspace) => Blockly.serialization.workspaces.save(workspace),
        toolbox: { kind: "flyoutToolbox", contents: [...types.values()].map(type => ({ kind: "block", type })) } };
}
