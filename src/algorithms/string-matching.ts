import * as keywordData from "../utils/keyword";

class StringMatchResult {
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
    RK: "Rabin-Karp"
};


export function match(input: string, method: string): StringMatchResult {
    input = cleanAccent(input);
    let matchPosition = new Map<string, number[]>();
    if (method == MatchMethod.KMP) {
        keywordData.keywords.forEach((keyword) => {
            matchPosition.set(keyword, knuthMorrisPratt(input, keyword));
        });
    }
    else if (method == MatchMethod.BM) {
        keywordData.keywords.forEach((keyword) => {
            matchPosition.set(keyword, boyerMoore(input, keyword));
        });
    }
    else if (method == MatchMethod.AC) {
        matchPosition = ahoCorasick(input, keywordData.keywords);
    }
    else if (method == MatchMethod.RK) {
        keywordData.keywords.forEach((keyword) => {
            matchPosition.set(keyword, rabinKarp(input, keyword));
        });
    }
    return new StringMatchResult(method, input, matchPosition);
}

export function knuthMorrisPratt(input: string, pattern: string): number[] {
    // Compute border function
    let borderFunction = [0];
    for (let i = 1, j = 0; i < pattern.length; i++) {
        while (j > 0 && !isCharEqual(pattern[i], pattern.charAt(j))) {
            j = borderFunction[j - 1];
        }
        if (isCharEqual(pattern[i], pattern.charAt(j))) j++;
        borderFunction.push(j);
    }

    // Check all occurence
    let result = [];
    for (let i = 0, j = 0; i < input.length; i++) {
        if (j > 0 && !isCharEqual(input[i], pattern.charAt(j))) {
            j = borderFunction[j - 1];
        }
        if (isCharEqual(input[i], pattern.charAt(j))) j++;
        if (j == pattern.length) {
            j = borderFunction[j - 1];
            result.push(i - pattern.length + 1);
        }
    }
    return result;
}

export function boyerMoore(input: string, pattern: string): number[] {
    let lastOccurence: Map<string, number> = new Map();
    for (let i = 0; i < pattern.length; i++) {
        lastOccurence.set(pattern[i], i);
    }

    let result = [];
    let offset = 0;
    while (offset <= input.length - pattern.length) {
        let i = pattern.length - 1;

        while (i >= 0 && isCharEqual(input.charAt(offset + i), pattern[i])) {
            i--;
        }

        if (i < 0) {
            result.push(offset);
            let j = lastOccurence.get(input.charAt(offset + i));
            if (j != undefined) {
                offset += (offset + pattern.length < input.length) ? pattern.length - j : 1;
            }
            else {
                offset++;
            }
        }
        else {
            let j = lastOccurence.get(input.charAt(offset + i));
            if (j != undefined) {
                offset += Math.max(1, i - j);
            }
            else {
                offset++;
            }
        }
    }

    return result;
}

class AhoCorasickTrie {
    next: Map<string, AhoCorasickTrie | undefined> = new Map();
    link: AhoCorasickTrie | undefined = undefined;
    parent: AhoCorasickTrie | undefined;
    char: string;
    word: string | undefined = undefined;

    constructor(parent: AhoCorasickTrie | undefined = undefined, char: string = '\0') {
        this.parent = parent;
        this.char = char;
    }

    insert(word: string) {
        let trie: AhoCorasickTrie | undefined = this;
        let n = word.length;
        for (let i = -1; i < n; i++) {
            let c: string;
            if (i == -1) c = '\0';
            else c = word[i];
            c = normalizeChar(c);

            let next = trie?.next.get(c);
            if (next == undefined) {
                trie?.next.set(c, new AhoCorasickTrie(trie, c));
                trie = trie?.next.get(c);
            }
            else {
                trie = next;
            }
        }
        if (trie != undefined) {
            trie.word = word;
        }
    }

    getLink(): AhoCorasickTrie | undefined {
        if (this.link == undefined) {
            if (this.parent == undefined) {
                this.link = this;
            }
            else if (this.parent.parent == undefined) {
                this.link = this.parent;
            }
            else {
                this.link = this.parent.getLink()?.getNext(this.char);
            }
        }
        return this.link;
    }

    getNext(c: string): AhoCorasickTrie | undefined {
        c = normalizeChar(c);
        if (this.next.get(c) == undefined) {
            if (this.parent == undefined) {
                this.next.set(c, this);
            }
            else {
                this.next?.set(c, this.link?.getNext(c));
            }
        }
        return this.next.get(c);
    }
};

export function ahoCorasick(input: string, patterns: string[]): Map<string, number[]> {
    let trie = new AhoCorasickTrie();
    let result = new Map<string, number[]>();

    for (let i = 0; i < patterns.length; i++) {
        trie.insert(patterns[i]);
    }

    keywordData.keywords.forEach((keyword) => {
        result.set(keyword, []);
    });

    for (let i = 0, now: AhoCorasickTrie | undefined = trie; i < input.length; i++) {
        now = now?.getNext(input[i]);
        if (now?.word != undefined) {
            if (!result.has(now?.word)) {
                result.set(now?.word, [i]);
            }
            else {
                result.get(now?.word)?.push(i);
            }
        }
    }

    return result;
}

export function rabinKarp(input: string, pattern: string): number[] {
    const prime = 173;
    const mod = 524287;

    let primePow = [1];
    for (let i = 1; i < Math.max(input.length, pattern.length); i++) {
        primePow.push(primePow[i - 1] * prime % mod);
    }

    let inputHash = [0];
    for (let i = 0; i < input.length; i++) {
        inputHash.push(inputHash[i] + input.charCodeAt(i) * primePow[i] % mod);
    }

    let patternHash = 0;
    for (let i = 0; i < pattern.length; i++) {
        patternHash = patternHash + pattern.charCodeAt(i) * primePow[i] % mod;
    }

    let result: number[] = [];
    for (let i = 0; i + pattern.length - 1 < input.length; i++) {
        let hash = (inputHash[i + pattern.length] - inputHash[i] + mod) % mod;
        if (hash == patternHash * primePow[i] % mod) {
            result.push(i);
        }
    }
    return result;
}

function cleanAccent(str: string) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeChar(str: string) {
    str = cleanAccent(str)
    return str;
}

function isCharEqual(char1: string, char2: string): boolean {
    return char1 == char2;
}