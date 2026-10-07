/** Validators keep literal spellings as strings, including radix and zeros. */
export const INT = /^(?:~|-)?(?:0x[0-9a-fA-F]+|[0-9]+)$/;
export const REAL = /^(?:~|-)?[0-9]+(?:\.[0-9]+e(?:~|-)?[0-9]+|e(?:~|-)?[0-9]+|\.[0-9]+)$/;
export const WORD = /^0w(?:x[0-9a-fA-F]+|[0-9]+)$/;
export function intLiteral(value: string): string | null {
    return INT.test(value) ? value.replace(/^-/, "~") : null;
}
export function realLiteral(value: string): string | null {
    return REAL.test(value) ? value.replace(/-/g, "~") : null;
}
export function wordLiteral(value: string): string | null {
    const spelling = /^[0-9]+$/.test(value) ? "0w" + value : value;
    return WORD.test(spelling) ? spelling : null;
}
