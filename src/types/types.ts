// Module that defines TypeScript interfaces for representing text nodes, match occurrences, and match results in the context of string matching algorithms.

import type { StringMatchResult } from "../algorithms/string-match-result";


// #Type interface for extractor.ts
export interface TextNodeData {
    node: Text
    originalText: string
}

// #Interface for message

export type MessageType =
    | "scan"
    | "clear"
    | "getStats"
    | "toggleBlur";

export type Algorithm =
    | "KMP"
    | "BM"
    | "AC"
    | "RK"
    | "RGX"
    | "LD";

export interface Message {
    type: MessageType;
    algorithm: Algorithm;
    payload?: any;
}


// #Match result statistic and occurence for result matching

// [Statistics] ===========
// Concat all algorithm
export interface ScanStatistics {
    totalMatches: number;
    totalExecTime: number; // This can be delete and counted from algorithm results, just for efficiency
    algorithmResults: AlgorithmResult[];
}

// Gather each algorithm result 
export interface AlgorithmResult {
    algorithm: string;
    found: Map<string, number[]>; 
    executionTime: number;
    comparisonCount: number;
}

// [Hover] ===========
// Scan per element, for easier highlighting
export class ElementMatchResult {

    node: Text;
    result: StringMatchResult;
    execTime: number;

    constructor(node: Text, result: StringMatchResult, time: number = 0) {
        this.node = node;
        this.result = result;
        this.execTime = time;
    }
}

// #Interface for UI -- kyknya susah kalau mau akalin, ts cheat code
export interface Range {
    start: number;
    end: number;
    keyword: string;
}