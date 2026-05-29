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
export class ScanStatistic {
    totalMatches: number;
    methodResults: Map<string, MethodResult>;
    topKeywords: { keyword: string; count: number }[];

    constructor(totalMatches: number = 0, methodResults: Map<string, MethodResult> = new Map<string, MethodResult>(), topKeywords: { keyword: string; count: number }[] = []) {
        this.totalMatches = totalMatches;
        this.methodResults = methodResults;
        this.topKeywords = topKeywords;
    }
}

// Gather each method result 
export class MethodResult {
    executionTime: number;
    comparisonCount: number;
    
    constructor(executionTime: number = 0, comparisonCount: number = 0) {
        this.executionTime = executionTime;
        this.comparisonCount = comparisonCount;
    }
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