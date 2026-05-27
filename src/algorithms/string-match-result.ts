export class StringMatchResult {
    method: string;
    input: string;
    matchPosition: Map<string, number[]>;

    constructor(method: string, input: string, matchPosition: Map<string, number[]>) {
        this.method = method;
        this.input = input;
        this.matchPosition = matchPosition;
    }

    totalMatch(): number {
        let count = 0;
        this.matchPosition.forEach((v) => {
            count += v.length;
        })
        return count;
    }
}

export const MatchMethod = {
    KMP: "Knuth-Morris-Pratt",
    BM: "Boyer-Moore",
    AC: "Aho-Corasick",
    RK: "Rabin-Karp",
    LD: "Levenshtein Distance",
    RGX: "Regex"
};