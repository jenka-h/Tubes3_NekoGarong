import * as keywordUtils from "../utils/keyword";
import { StringMatchResult, MatchMethod } from "./string-match-result"

export function exactMatching(input: string, method: string): StringMatchResult {
    let matchPosition = new Map<string, number[]>();
    if (method == MatchMethod.KMP) {
        let inputModified = keywordUtils.cleanAccent(input);
        inputModified = keywordUtils.normalizeString(inputModified);
        keywordUtils.keywords.forEach((keyword) => {
            const x = knuthMorrisPratt(inputModified, keyword);
            if (x.length > 0) {
                matchPosition.set(keyword, x);
            }
        });
    }
    else if (method == MatchMethod.BM) {
        let inputModified = keywordUtils.cleanAccent(input);
        inputModified = keywordUtils.normalizeString(inputModified);
        keywordUtils.keywords.forEach((keyword) => {
            const x = boyerMoore(inputModified, keyword);
            if (x.length > 0) {
                matchPosition.set(keyword, x);
            }
        });
    }
    else if (method == MatchMethod.AC) {
        let inputModified = keywordUtils.cleanAccent(input);
        inputModified = keywordUtils.normalizeString(inputModified);
        const x = ahoCorasick(inputModified, keywordUtils.keywords);
        x.forEach((v, k) => {
            if (v.length > 0) {
                matchPosition.set(k, v);
            }
        });
    }
    else if (method == MatchMethod.RK) {
        let inputModified = keywordUtils.cleanAccent(input);
        inputModified = keywordUtils.normalizeString(inputModified);
        keywordUtils.keywords.forEach((keyword) => {
            const x = rabinKarp(inputModified, keyword);
            if (x.length > 0) {
                matchPosition.set(keyword, x);
            }
        });
    }
    else if (method == MatchMethod.RGX) {
        let inputModified = keywordUtils.cleanAccent(input);
        const x = regexMatch(inputModified);
        x.forEach((v, k) => {
            if (v.length > 0) {
                matchPosition.set(k, v);
            }
        });
    }
    return new StringMatchResult(method, input, matchPosition);
}

function knuthMorrisPratt(input: string, pattern: string): number[] {
    let inputChars = Array.from(input);

    // Compute border function
    let borderFunction = [0];
    for (let i = 1, j = 0; i < pattern.length; i++) {
        while (j > 0 && pattern[i] != pattern[j]) {
            j = borderFunction[j - 1];
        }
        if (pattern[i] == pattern[j]) j++;
        borderFunction.push(j);
    }

    // Check all occurence
    let result = [];
    for (let i = 0, j = 0; i < inputChars.length; i++) {
        if (j > 0 && inputChars[i] != pattern[j]) {
            j = borderFunction[j - 1];
        }
        if (keywordUtils.isCharEqual(inputChars[i], pattern[j])) j++;
        if (j == pattern.length) {
            j = borderFunction[j - 1];
            result.push(i - pattern.length + 1);
        }
    }
    return result;
}

function boyerMoore(input: string, pattern: string): number[] {
    let inputChars = Array.from(input);

    let lastOccurence: Map<string, number> = new Map();
    for (let i = 0; i < pattern.length; i++) {
        lastOccurence.set(pattern[i], i);
    }

    let result = [];
    let offset = 0;
    while (offset <= inputChars.length - pattern.length) {
        let i = pattern.length - 1;

        while (i >= 0 && inputChars[offset + i] == pattern[i]) {
            i--;
        }

        if (i < 0) {
            result.push(offset);
            let j = lastOccurence.get(inputChars[offset + i]);
            if (j != undefined) {
                offset += (offset + pattern.length < inputChars.length) ? pattern.length - j : 1;
            }
            else {
                offset++;
            }
        }
        else {
            let j = lastOccurence.get(inputChars[offset + i]);
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
        for (let i = 0; i < n; i++) {
            let c = word[i];
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
        if (this.next.get(c) == undefined) {
            if (this.parent == undefined) {
                this.next.set(c, this);
            }
            else {
                this.next?.set(c, this.getLink()?.getNext(c));
            }
        }
        return this.next.get(c);
    }
};

function ahoCorasick(input: string, patterns: string[]): Map<string, number[]> {
    let trie = new AhoCorasickTrie();
    let result = new Map<string, number[]>();

    for (let i = 0; i < patterns.length; i++) {
        trie.insert(patterns[i]);
    }

    keywordUtils.keywords.forEach((keyword) => {
        result.set(keyword, []);
    });

    for (let i = 0, now: AhoCorasickTrie | undefined = trie; i < input.length; i++) {
        now = now?.getNext(input[i]);
        let temp: AhoCorasickTrie | undefined = now;
        while (temp?.word != undefined) {
            if (!result.has(temp?.word)) {
                result.set(temp?.word, [i - temp?.word.length + 1]);
            }
            else {
                result.get(temp?.word)?.push(i - temp?.word.length + 1);
            }
            temp = temp?.getLink();
        }
    }

    return result;
}

function rabinKarp(input: string, pattern: string): number[] {
    const prime = BigInt(173);
    const mod = BigInt(1e9 + 7);

    let primePow = [BigInt(1)];
    for (let i = 1; i < Math.max(input.length, pattern.length); i++) {
        primePow.push(primePow[i - 1] * prime % mod);
    }

    let inputHash = [BigInt(0)];
    for (let i = 0; i < input.length; i++) {
        inputHash.push(inputHash[i] + BigInt(input.charCodeAt(i)) * primePow[i] % mod);
    }

    let patternHash = BigInt(0);
    for (let i = 0; i < pattern.length; i++) {
        patternHash = patternHash + BigInt(pattern.charCodeAt(i)) * primePow[i] % mod;
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

function regexMatch(input: string): Map<string, number[]> {

    const regex = /\b[A-Z]{2,}[0-9]{2,3}\b/gi; // only handle 2 - 3 number after a word, JENKA123 should still be detected, despite not in keyword 

    let result = new Map<string, number[]>();

    let match;

    while ((match = regex.exec(input)) !== null) {

        const keyword = match[0];
        const start = match.index;

        if (!result.has(keyword)) {
            result.set(keyword, [start]);
        }
        else {
            result.get(keyword)?.push(start);
        }
    }

    return result;
}

export function fuzzyMacthing(input: string): StringMatchResult {
    input = keywordUtils.cleanAccent(input);
    let matchPosition = new Map<string, number[]>();
    keywordUtils.keywords.forEach((keyword) => {
        const x = levenshteinDistance(input, keyword, 0.2);
        if (x.length > 0) {
            matchPosition.set(keyword, x);
        }
    });
    return new StringMatchResult(MatchMethod.LD, input, matchPosition);
}

function levenshteinDistance(input: string, pattern: string, errorPecentage: number): number[] {
    let resultDistance: number[] = [];
    let maxDistance = pattern.length <= 3 ? 0 : errorPecentage * pattern.length;
    for (let a = 0; a < input.length; a++) {
        let minDistance = maxDistance + 1;
        let distance: number[][] = [];
        for (let i = 0; i <= input.length - a; i++) {
            distance.push([]);
            for (let j = 0; j <= pattern.length; j++) {
                if (i == 0) {
                    distance[i].push(j);
                }
                else if (j == 0) {
                    distance[i].push(i);
                }
                else {
                    let v1 = input[i - 1 + a] == " " ? 0.1 : 0.8;
                    let v2 = pattern[j - 1] == " " ? 0.1 : 0.6;
                    let v3 = input[i - 1 + a] == pattern[j - 1] ? 0 : 1;
                    distance[i].push(Math.min(v2 + distance[i - 1][j], v1 + distance[i][j - 1], v3 + distance[i - 1][j - 1]));
                }
            }
            minDistance = Math.min(minDistance, distance[i][pattern.length]);
            if (distance[i][pattern.length] > pattern.length) break;
        }
        resultDistance.push(minDistance);
    }
    let result: number[] = [];
    for (let i = 0; i < resultDistance.length; i++) {
        if (resultDistance[i] > maxDistance) continue;
        let insertIndex = true;
        if (i > 0 && resultDistance[i] > resultDistance[i - 1]) insertIndex = false;
        if (i < resultDistance.length - 1 && resultDistance[i] > resultDistance[i + 1]) insertIndex = false;
        if (insertIndex) result.push(i);
    }
    return result;
}