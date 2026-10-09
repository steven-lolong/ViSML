import grammarData from "./formal_sml_grammar.json";
export type Derivation = {
    p: string;
    rhs: any;
};
export type Grammar = {
    start: string;
    grouping?: string[];
    lexical_roles?: string[];
    productions: any[];
    terminal_classes?: Record<string, { pattern: string; sample: string }>;
};
export const smlGrammar: Grammar = grammarData;
export const productions = new Map(smlGrammar.productions.map(p => [p.id, p]));
export class PreservationError extends Error {
}
function requireState(condition: any, message: string): asserts condition {
    if (!condition)
        throw new PreservationError(message);
}
/** Explicit presence keeps [epsilon] and nested optional states distinct.
 * Legacy null/bare values remain exact only when the operand's state cannot
 * itself be null. Nonterminal states are objects even for nullable productions.
 */
export function readOptionalState(e: any, u: any): { present: boolean; value: any; tagged: boolean } {
    requireState(e?.kind === "opt", "Expected optional RHS constructor");
    if (u && typeof u === "object" && !Array.isArray(u) && Object.prototype.hasOwnProperty.call(u, "present")) {
        requireState(typeof u.present === "boolean", "Invalid optional presence tag");
        const keys = Object.keys(u).sort();
        requireState(JSON.stringify(keys) === JSON.stringify(u.present ? ["present", "value"] : ["present"]), "Invalid optional tagged state");
        return { present: u.present, value: u.value, tagged: true };
    }
    requireState(!["eps", "opt"].includes(e.item.kind), "Explicit optional presence tag required for epsilon or nested optional operand");
    return { present: u !== null, value: u, tagged: false };
}
export function mapOptionalState(e: any, u: any, map: (value: any) => any): any {
    const s = readOptionalState(e, u);
    if (s.tagged) return s.present ? { present: true, value: map(s.value) } : { present: false };
    return s.present ? map(s.value) : null;
}
export function role(d: Derivation): string {
    const p = productions.get(d?.p);
    requireState(p, `Unknown production ${d?.p}`);
    return p.lhs;
}
export function terminalClass(name: string, value: any, grammar?: Grammar): boolean {
    if (typeof value !== "string")
        return false;
    const declared = grammar?.terminal_classes?.[name];
    if (declared) return new RegExp(`^(?:${declared.pattern})$`, "u").test(value);
    switch (name) {
        case "digit": return /^[0-9]$/.test(value);
        case "letter": return /^[A-Za-z]$/.test(value);
        case "hexDigit": return /^[0-9A-Fa-f]$/.test(value);
        case "ascii": return /^(?:[\x20-\x21\x23-\x5b\x5d-\x7e]|\\(?:[abtnvfr\\"]|[0-9]{3}|\^[\x40-\x5f]|\s+\\))$/.test(value) && (!/^\\[0-9]{3}$/.test(value) || Number(value.slice(1)) <= 255);
        default: return false;
    }
}
/** Construct only members of the exact source registry, never tooltip strings. */
export function make(p: string, ...values: any[]): Derivation {
    const production = productions.get(p);
    requireState(production, `Unknown production ${p}`);
    const fill = (e: any, input: any[]): any => {
        switch (e.kind) {
            case "eps": return null;
            case "t": return e.value;
            case "n":
            case "c":
                requireState(input.length, `Missing ${p} component`);
                return input.shift();
            case "seq": return e.items.map((x: any) => fill(x, input));
            case "opt": {
                requireState(input.length, `Missing optional tag for ${p}`);
                const v = input.shift();
                const state = readOptionalState(e, v);
                if (state.tagged) return v;
                if (v === null)
                    return null;
                const args = v === true ? [] : Array.isArray(v) ? [...v] : [v];
                const result = fill(e.item, args);
                requireState(!args.length, `Extra optional state for ${p}`);
                return result;
            }
            case "rep": {
                const items = input.shift();
                requireState(Array.isArray(items), `Missing repetition for ${p}`);
                return items.map(v => { const args = Array.isArray(v) ? [...v] : [v]; const r = fill(e.item, args); requireState(!args.length, `Extra repetition state for ${p}`); return r; });
            }
            case "args": return input.shift();
            case "choice": {
                const v = input.shift();
                requireState(v && e.items[v.branch], `Invalid branch for ${p}`);
                const args = e.items[v.branch].kind === "t" ? [] : [v.value];
                return { branch: v.branch, value: fill(e.items[v.branch], args) };
            }
            default: throw new PreservationError(`Unknown RHS constructor ${e.kind}`);
        }
    };
    const input = [...values], d = { p, rhs: fill(production.rhs, input) };
    requireState(!input.length, `Extra state for ${p}`);
    validateDerivation(d, production.lhs);
    return d;
}
/** Validation includes slot-free state; connector compatibility is insufficient. */
export function validateDerivation(d: Derivation, expected = smlGrammar.start, grammar: Grammar = smlGrammar): void {
    const registry = new Map(grammar.productions.map(p => [p.id, p]));
    const seen = new Set<any>();
    const node = (value: any, rootRole: string) => {
        requireState(value && typeof value === "object" && !seen.has(value), "Cyclic or shared derivation node");
        seen.add(value);
        const p = registry.get(value.p);
        requireState(p && p.lhs === rootRole, `Production/root-role mismatch: ${value.p}, expected ${rootRole}`);
        requireState(Object.keys(value).every(k => ["p", "rhs"].includes(k)), "Unknown derivation metadata");
        walk(p.rhs, value.rhs, value.p, "rhs");
    };
    const walk = (e: any, u: any, pid: string, path: string) => {
        const error = `${pid}/${path}: invalid ${e.kind} state`;
        switch (e.kind) {
            case "eps":
                requireState(u === null, error);
                break;
            case "t":
                requireState(u === e.value, error);
                break;
            case "c":
                requireState(terminalClass(e.name, u, grammar), error);
                break;
            case "n":
                node(u, e.role);
                break;
            case "seq":
                requireState(Array.isArray(u) && u.length === e.items.length, error);
                e.items.forEach((x: any, i: number) => walk(x, u[i], pid, `${path}/${i}`));
                break;
            case "opt": {
                const state = readOptionalState(e, u);
                if (state.present) walk(e.item, state.value, pid, `${path}/present`);
                break;
            }
            case "rep":
                requireState(Array.isArray(u) && u.length >= e.min && !(e.exclude || []).includes(u.length), error);
                u.forEach((x: any, i: number) => walk(e.item, x, pid, `${path}/item/${i}`));
                break;
            case "choice":
                requireState(u && Number.isInteger(u.branch) && e.items[u.branch] && Object.keys(u).length === 2, error);
                walk(e.items[u.branch], u.value, pid, `${path}/branch/${u.branch}`);
                break;
            case "args":
                requireState(u && Array.isArray(u.items) && ["bare", "parenthesized"].includes(u.style) && (u.style === "bare" ? u.items.length <= 1 : u.items.length >= 1), error);
                u.items.forEach((x: any) => node(x, e.role));
                break;
            default: throw new PreservationError(error);
        }
    };
    node(d, expected);
}
export function encodeDerivation(d: Derivation, grammar: Grammar = smlGrammar): any {
    validateDerivation(d, grammar.start, grammar);
    const registry = new Map(grammar.productions.map(p => [p.id, p]));
    const nodes: any[] = [];
    const encode = (d: Derivation): string => {
        const p = registry.get(d.p), id = `p${nodes.length}`;
        const target: any = { id, production: d.p, role: p.lhs };
        nodes.push(target);
        const walk = (e: any, u: any, path: string): any => {
            switch (e.kind) {
                case "n": return { node: encode(u), slot: { production: d.p, path, expect: e.role } };
                case "seq": return e.items.map((x: any, i: number) => walk(x, u[i], `${path}/${i}`));
                case "opt": return mapOptionalState(e, u, value => walk(e.item, value, `${path}/present`));
                case "rep": return u.map((x: any, i: number) => walk(e.item, x, `${path}/item/${i}`));
                case "choice": return { branch: u.branch, value: walk(e.items[u.branch], u.value, `${path}/branch/${u.branch}`) };
                case "args": return { style: u.style, items: u.items.map((x: any, i: number) => ({ node: encode(x), slot: { production: d.p, path: `${path}/item/${i}`, expect: e.role } })) };
                default: return u;
            }
        };
        target.rhs = walk(p.rhs, d.rhs, "rhs");
        return id;
    };
    return { schema: 1, root: encode(d), nodes };
}
/** Partial production decoder: invalid graphs have no derivation. No text is parsed. */
export function decodeCanonicalWorkspace(w: any, grammar: Grammar = smlGrammar): Derivation {
    requireState(w?.schema === 1 && Array.isArray(w.nodes), "Invalid canonical workspace");
    const registry = new Map(grammar.productions.map(p => [p.id, p])), nodes = new Map<string, any>();
    for (const n of w.nodes) {
        requireState(n && typeof n.id === "string" && !nodes.has(n.id), "Duplicate/missing node ID");
        nodes.set(n.id, n);
    }
    const visited = new Set<string>();
    const decode = (id: string, expected: string): Derivation => {
        requireState(nodes.has(id) && !visited.has(id), "Missing, shared, or cyclic production node");
        visited.add(id);
        const n = nodes.get(id), p = registry.get(n.production);
        requireState(p && p.lhs === expected && n.role === expected, "Invalid root role/production descriptor");
        const edge = (u: any, role: string, path: string): Derivation => {
            requireState(u && u.slot?.production === p.id && u.slot?.path === path && u.slot?.expect === role, "Source slot/path mismatch");
            const child = nodes.get(u.node);
            requireState(child, "Missing required child");
            if (child.role === role) {
                requireState(!u.witness, "Unnecessary alias witness");
                return decode(u.node, role);
            }
            const alias = registry.get(u.witness);
            requireState(alias && alias.lhs === role && alias.rhs.kind === "n" && alias.rhs.role === child.role, "Missing or invalid one-step alias witness");
            return { p: alias.id, rhs: decode(u.node, child.role) };
        };
        const walk = (e: any, u: any, path: string): any => {
            switch (e.kind) {
                case "n": return edge(u, e.role, path);
                case "seq":
                    requireState(Array.isArray(u) && u.length === e.items.length, "Invalid sequence state");
                    return e.items.map((x: any, i: number) => walk(x, u[i], `${path}/${i}`));
                case "opt": return mapOptionalState(e, u, value => walk(e.item, value, `${path}/present`));
                case "rep":
                    requireState(Array.isArray(u), "Invalid repetition state");
                    return u.map((x: any, i: number) => walk(e.item, x, `${path}/item/${i}`));
                case "choice":
                    requireState(u && e.items[u.branch], "Invalid lexical branch");
                    return { branch: u.branch, value: walk(e.items[u.branch], u.value, `${path}/branch/${u.branch}`) };
                case "args":
                    requireState(u && Array.isArray(u.items), "Invalid argument state");
                    return { style: u.style, items: u.items.map((x: any, i: number) => edge(x, e.role, `${path}/item/${i}`)) };
                default: return u;
            }
        };
        return { p: p.id, rhs: walk(p.rhs, n.rhs, "rhs") };
    };
    const d = decode(w.root, grammar.start);
    requireState(visited.size === nodes.size, "Unreachable production-owned node");
    validateDerivation(d, grammar.start, grammar);
    return d;
}
export function tryDecodeCanonicalWorkspace(w: any, grammar: Grammar = smlGrammar): Derivation | undefined {
    try {
        return decodeCanonicalWorkspace(w, grammar);
    }
    catch (e) {
        if (e instanceof PreservationError)
            return undefined;
        throw e;
    }
}
/** Full certificate includes source order, all EBNF states, and lexical payload. */
export function certificate(d: Derivation): any { validateDerivation(d, role(d)); return JSON.parse(JSON.stringify(d)); }
export function renderDerivation(d: Derivation, grammar: Grammar = smlGrammar, preserveAssociation = false): string {
    validateDerivation(d, new Map(grammar.productions.map(p => [p.id, p])).get(d.p).lhs, grammar);
    const registry = new Map(grammar.productions.map(p => [p.id, p]));
    const infixPrecedence = (op: string) => ["o", ":="].includes(op) ? 7 : ["::", "@"].includes(op) ? 9 : ["+", "-", "^"].includes(op) ? 10 : ["*", "/", "div", "mod"].includes(op) ? 11 : 8;
    const expPrecedence = (d: Derivation): number => d.p === "exp.3" ? infixPrecedence(node(d.rhs[1])) : d.p === "exp.2" ? 12 : d.p === "exp.11" ? 4 : d.p === "exp.13" ? 1 : d.p === "exp.14" ? 3 : d.p === "exp.15" ? 2 : ["exp.12", "exp.16", "exp.17", "exp.18", "exp.19"].includes(d.p) ? 0 : 13;
    const typPrecedence = (d: Derivation) => d.p === "typ.3" ? 0 : d.p === "typ.4" ? 1 : 2;
    // Module ascription is a single lexical unit only at these grammar-owned
    // optional sequence sites. Spelling alone must never merge ':' and '>'.
    const ascriptionSites: Record<string, string> = {
        "strbind.0": "rhs/1/present",
        "fctbind.0": "rhs/6/present",
        "fctbind.1": "rhs/4/present",
    };
    const node = (d: Derivation): string => {
        const p = registry.get(d.p), lexical = (grammar.lexical_roles || []).includes(p.lhs);
        const join = (parts: string[]) => parts.filter(x => x !== "").reduce((a, b) => a + (lexical ? "" : " ") + b, "").trim();
        const child = (e: any, u: Derivation, path: string): string => {
            const text = node(u);
            if (!preserveAssociation)
                return text;
            let group = false;
            if (e.role === "exp") {
                const prec = expPrecedence(u), parent = expPrecedence(d), right = path === "rhs/2";
                if (d.p === "exp.2")
                    group = prec < (path === "rhs/0" ? 12 : 13);
                else if (["exp.3", "exp.11", "exp.13", "exp.14", "exp.15"].includes(d.p)) {
                    const rightAssociative = d.p === "exp.3" && ["::", "@"].includes(node(d.rhs[1]));
                    group = prec < parent || prec === parent && (rightAssociative ? !right : right);
                }
            }
            else if (e.role === "typ") {
                if (d.p === "typ.3")
                    group = typPrecedence(u) < 0 || path === "rhs/0" && typPrecedence(u) === 0;
                else if (d.p === "typ.4")
                    group = typPrecedence(u) <= 1;
            }
            else if (e.role === "pat") {
                if (d.p === "pat.3")
                    group = u.p === "pat.3" && u.rhs[2] !== null || ["pat.4", "pat.9", "pat.10"].includes(u.p);
                if (d.p === "pat.4")
                    group = ["pat.9", "pat.10"].includes(u.p) || path === "rhs/0" && u.p === "pat.4";
            }
            return group ? `( ${text} )` : text;
        };
        const walk = (e: any, u: any, path = "rhs"): string => {
            switch (e.kind) {
                case "eps": return "";
                case "t":
                case "c": return u;
                case "n": return child(e, u, path);
                case "seq": {
                    // The three source-owned ascription shorthands assemble ':'
                    // and the optional '>' before spacing nonlexical units.
                    const owned = ascriptionSites[d.p] === path && e.items.length === 3
                        && e.items[0].kind === "t" && e.items[0].value === ":"
                        && e.items[1].kind === "opt" && e.items[1].item?.kind === "t"
                        && e.items[1].item.value === ">" && e.items[2].kind === "n"
                        && e.items[2].role === "sig";
                    if (owned) {
                        const s = readOptionalState(e.items[1], u[1]);
                        return (s.present ? ":>" : ":") + " " + walk(e.items[2], u[2], `${path}/2`);
                    }
                    return join(e.items.map((x: any, i: number) => walk(x, u[i], `${path}/${i}`)));
                }
                case "opt": {
                    const state = readOptionalState(e, u);
                    return state.present ? walk(e.item, state.value, `${path}/present`) : "";
                }
                case "choice": return walk(e.items[u.branch], u.value, `${path}/branch/${u.branch}`);
                case "rep": return u.map((x: any, i: number) => walk(e.item, x, `${path}/item/${i}`)).join(lexical ? (e.separator || "") : e.separator ? ` ${e.separator} ` : " ");
                case "args": {
                    const value = u.items.map((x: Derivation) => preserveAssociation && e.role === "typ" && u.style === "bare" && typPrecedence(x) < 2 ? `( ${node(x)} )` : node(x)).join(", ");
                    return u.style === "parenthesized" ? `(${value})` : value;
                }
                default: throw new PreservationError("Unknown renderer constructor");
            }
        };
        return walk(p.rhs, d.rhs);
    };
    return node(d);
}
export function printCanonicalWorkspace(w: any, grammar: Grammar = smlGrammar): string { return renderDerivation(decodeCanonicalWorkspace(w, grammar), grammar); }
