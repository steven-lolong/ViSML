import * as Blockly from "blockly";
/** Source separators are owned tokens, never printer normalization. */
export function sourceSeparator(block: any, index: number): string {
    const counts = block.t2bbSource_?.separators;
    if (!counts)
        return "";
    const count = counts[index] ?? 0;
    if (!Number.isSafeInteger(count) || count < 0)
        throw new Error("Invalid source separator count");
    return ";".repeat(count);
}
/** Keep provenance through Blockly's own save/load boundary and editor changes. */
export function installSourceMetadata(generator: any): void {
    for (const definition of Object.values(Blockly.Blocks) as any[]) {
        if (definition.__t2bbSourceInstalled)
            continue;
        const save = definition.saveExtraState, load = definition.loadExtraState;
        definition.saveExtraState = function (...args: any[]) {
            const state = save ? save.apply(this, args) : {};
            return { ...state, ...(this.t2bbSource_ ? { t2bbSource: this.t2bbSource_ } : {}) };
        };
        definition.loadExtraState = function (state: any, ...args: any[]) {
            this.t2bbSource_ = state?.t2bbSource;
            this.t2bbLoading_ = true;
            try {
                if (load)
                    load.call(this, state, ...args);
            }
            finally {
                this.t2bbLoading_ = false;
            }
        };
        const shape = definition.updateShape_;
        if (shape)
            definition.updateShape_ = function (...args: any[]) {
                const result = shape.apply(this, args);
                const counts = this.t2bbSource_?.separators;
                if (!this.t2bbLoading_ && counts && counts.every((n: number) => Number.isSafeInteger(n) && n >= 0)) {
                    const count = this.type === "program" && this.itemCount_ === 1 && !this.getInputTargetBlock("ADD0") ? 0 : this.itemCount_;
                    if (counts.length !== count + 1) {
                        // Preserve existing tokens when an editor mutation adds/removes slots.
                        const next = Array(count + 1).fill(0);
                        counts.forEach((n: number, i: number) => { next[Math.min(i, count)] += n; });
                        this.t2bbSource_ = { ...this.t2bbSource_, separators: next };
                    }
                }
                return result;
            };
        definition.__t2bbSourceInstalled = true;
    }
    for (const type of Object.keys(generator.forBlock)) {
        const original = generator.forBlock[type];
        if (original.__t2bbSourceInstalled)
            continue;
        const wrapped = function (block: any, ...args: any[]) {
            const result = original(block, ...args);
            const boundary = block.t2bbSource_?.boundary;
            if (!boundary)
                return result;
            if (boundary.length !== 2 || boundary.some((n: any) => !Number.isSafeInteger(n) || n < 0)) {
                throw new Error("Invalid source separator boundary");
            }
            const decorate = (code: string) => ";".repeat(boundary[0]) + code + ";".repeat(boundary[1]);
            return Array.isArray(result) ? [decorate(result[0]), result[1]] : decorate(result);
        };
        (wrapped as any).__t2bbSourceInstalled = true;
        generator.forBlock[type] = wrapped;
    }
}
