import { Grammar, Derivation, encodeDerivation, decodeCanonicalWorkspace, PreservationError } from "./formal_codec";

/** Minimum production-node realization with only strict one-step alias edges.
 * Legal removals are non-root unary alias nodes with a different child role.
 * Adjacent removals are forbidden: they would require a transitive witness.
 * Local RHS state and every surviving occurrence path are unchanged.
 */
export function compactAliases(d: Derivation, grammar: Grammar): any {
    const graph = encodeDerivation(d, grammar);
    const registry = new Map(grammar.productions.map(p => [p.id, p]));
    const nodes = new Map<string, any>(graph.nodes.map((n: any) => [n.id, n]));
    const edges = (rhs: any): any[] => {
        if (!rhs || typeof rhs !== "object") return [];
        if (rhs.slot && typeof rhs.node === "string") return [rhs];
        return Object.values(rhs).flatMap(edges);
    };
    const scores = new Map<string, { keep: number; remove: number }>();
    const score = (id: string) => {
        const n = nodes.get(id), p = registry.get(n.production), children = edges(n.rhs);
        children.forEach(e => score(e.node));
        const eligible = id !== graph.root && p.rhs.kind === "n" && p.rhs.role !== p.lhs;
        scores.set(id, {
            keep: children.reduce((s, e) => s + Math.max(scores.get(e.node).keep, scores.get(e.node).remove), 0),
            remove: eligible ? 1 + children.reduce((s, e) => s + scores.get(e.node).keep, 0) : -Infinity,
        });
    };
    score(graph.root);
    const removed = new Set<string>();
    const select = (id: string, parentRemoved: boolean) => {
        const s = scores.get(id), take = id !== graph.root && !parentRemoved && s.remove > s.keep;
        if (take) removed.add(id);
        edges(nodes.get(id).rhs).forEach(e => select(e.node, take));
    };
    select(graph.root, true);
    for (const n of graph.nodes) if (!removed.has(n.id)) for (const e of edges(n.rhs)) {
        if (removed.has(e.node)) {
            const alias = nodes.get(e.node);
            e.node = alias.rhs.node;
            e.witness = alias.production;
        }
    }
    const result = { ...graph, nodes: graph.nodes.filter((n: any) => !removed.has(n.id)) };
    // This is an executable safety check, not the independent test oracle.
    const decoded = decodeCanonicalWorkspace(result, grammar);
    if (JSON.stringify(decoded) !== JSON.stringify(d)) throw new PreservationError("Alias compaction changed derivation");
    return result;
}
