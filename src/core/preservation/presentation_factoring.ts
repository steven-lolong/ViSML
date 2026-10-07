import { Derivation, Grammar, smlGrammar, validateDerivation, PreservationError } from "./formal_codec";
import grammarData from "./formal_sml_grammar.json";
/** Remove the table's list/argument shorthands before the seven-constructor theorem. */
export const factoredGrammar: Grammar = (grammarData as any).factored_grammar;
const source = new Map(smlGrammar.productions.map(p => [p.id, p]));
const factored = new Map(factoredGrammar.productions.map(p => [p.id, p]));
function mapState(e: any, u: any, node: (d: Derivation) => Derivation, forward: boolean): any {
    if (e.kind === "args") {
        if (forward) {
            if (!u.items.length)
                return null;
            const items = u.items.map(node), stem = "__args_" + e.role;
            return u.style === "bare" ? { p: stem + ".0", rhs: items[0] } : { p: stem + ".1", rhs: ["(", pack(items, 1, ","), ")"] };
        }
        if (u === null)
            return { style: "bare", items: [] };
        if (u.p === "__args_" + e.role + ".0")
            return { style: "bare", items: [node(u.rhs)] };
        if (u.p !== "__args_" + e.role + ".1")
            throw new PreservationError("Invalid argument factoring descriptor");
        return { style: "parenthesized", items: unpack(u.rhs[1], 1).map(node) };
    }
    if (e.kind === "rep" && e.separator) {
        const minimum = e.min >= 2 || (e.exclude || []).includes(1) ? 2 : 1;
        if (forward) {
            if (!u.length)
                return null;
            return pack(u.map((x: any) => mapState(e.item, x, node, true)), minimum, e.separator);
        }
        if (u === null)
            return [];
        return unpack(u, minimum).map((x: any) => mapState(e.item, x, node, false));
    }
    switch (e.kind) {
        case "n": return node(u);
        case "seq": return e.items.map((x: any, i: number) => mapState(x, u[i], node, forward));
        case "opt": return u === null ? null : mapState(e.item, u, node, forward);
        case "rep": return u.map((x: any) => mapState(e.item, x, node, forward));
        case "choice": return { branch: u.branch, value: mapState(e.items[u.branch], u.value, node, forward) };
        default: return u;
    }
}
function pack(items: any[], minimum: number, separator: string): any[] {
    const result: any[] = [items[0]];
    for (let i = 1; i < minimum; i++)
        result.push(separator, items[i]);
    result.push(items.slice(minimum).map(x => [separator, x]));
    return result;
}
function unpack(state: any[], minimum: number): any[] {
    return [...Array.from({ length: minimum }, (_, i) => state[i * 2]), ...state[state.length - 1].map((pair: any[]) => pair[1])];
}
export function factorDerivation(d: Derivation): Derivation {
    const p = source.get(d.p);
    if (!p)
        throw new PreservationError("Unknown source presentation row");
    validateDerivation(d, p.lhs, smlGrammar);
    const node = (d: Derivation): Derivation => ({ p: d.p, rhs: mapState(source.get(d.p).rhs, d.rhs, node, true) });
    const result = node(d);
    validateDerivation(result, p.lhs, factoredGrammar);
    return result;
}
export function unfactorDerivation(d: Derivation): Derivation {
    const p = factored.get(d.p);
    if (!p || !source.has(d.p))
        throw new PreservationError("Unknown original root row");
    validateDerivation(d, p.lhs, factoredGrammar);
    const node = (d: Derivation): Derivation => ({ p: d.p, rhs: mapState(source.get(d.p).rhs, d.rhs, node, false) });
    const result = node(d);
    validateDerivation(result, p.lhs, smlGrammar);
    return result;
}
