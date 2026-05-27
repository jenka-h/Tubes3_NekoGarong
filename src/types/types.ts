// Module that defines TypeScript interfaces for representing text nodes, match occurrences, and match results in the context of string matching algorithms.


// Type interface for extractor.ts
export interface TextNodeData {
    node: Text
    originalText: string
}


// Match result statistic and occurence for result matching

// A temporary type

// Gather each algorithm result 
// [This can be use for PopUpStatistics]
export interface AlgorithmResult {
    algorithm: string;
    found: Map<string, number[]>; // Pos so it can be highlighted
    executionTime: number;
    comparisonCount: number;
}

// To gather position of an occurence
export interface HoverResult { // There should be a parser per element (?)
    keyword: string;
    algorithm: string;
    occurrence: number;
    execTime: number;
    startPos: number;
    endPos: number;
}