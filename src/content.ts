// TO DO: Akan dilakukan perombakan Hover menggunakan overlay (kemungkinan)
// Ini dipanggil saat DOM selesai diload

// chrome.runtime.sendMessage will send a message to the background script, 
// which will then forward it to the popup script.

import { exactMatching, fuzzyMacthing } from './algorithms/string-matching';
import { MatchMethod, StringMatchResult } from './algorithms/string-match-result';
import { extractTextNodes } from './content/extractor';
import type { TextNodeData, Message } from './types/types';
import { ElementMatchResult } from './types/types';
import { createHover } from './content/hover';
import { addMatchToSemanticContainer, attachSemanticListeners} from './content/semantic';
import { applyAllHighlights, clearHighlights } from './content/highlight';

// Global state
let elementMatches: ElementMatchResult[] = [];
let hoverPopup: HTMLDivElement | null = null;
const semanticMatches = new Map<HTMLElement, ElementMatchResult[]>();


// CEK LAGIIII !!!!! done i think
chrome.runtime.onMessage.addListener((msg: Message, _sender, sendResponse) => {
    if (msg.type === 'scan') {
        if (!hoverPopup) {
            hoverPopup = createHover();
        }
        runScan(msg.algorithm);
        sendResponse({ 
            success: true,
            result: elementMatches
        });
    }
    else if (msg.type === 'clear') {
        clearHighlights();
        sendResponse({ 
            success: true,
        });
    }
    return true;
});

/**
 * Main Pipeline
 */
function runScan(methodChoice: string): void {
    clearHighlights();
    elementMatches = [];
    const textNodes = extractTextNodes();
    semanticMatches.clear();  // Clear old mappings on rescans

    for (const textNode of textNodes) {
        const resultExact = analyzeTextNode(textNode, methodChoice);
        const resultRegEx = analyzeTextNode(textNode, "RGX");
        const resultFuzzy = analyzeTextNode(textNode, "LD");

        const results = [resultExact, resultRegEx, resultFuzzy];

        for (const result of results) {
            if (result && result.result.totalMatch() > 0) {
                const elemMatch = result;
                elementMatches.push(elemMatch);

                // Add to semantic container (finds semantic parent)
                addMatchToSemanticContainer(semanticMatches, textNode.node, elemMatch);
            }
        }
    }

    applyAllHighlights(elementMatches);
    attachSemanticListeners(semanticMatches, hoverPopup);
}

// Ini gatau better taruh mana
// Analyze a single text node with all algorithms and return the first match result found
function analyzeTextNode(textNode: TextNodeData, methodChoice: string): ElementMatchResult | null {
    const { originalText } = textNode;
    if (!originalText.trim()) return null;

    let method: string = "";
    switch (methodChoice) {
        case "KMP": 
            method = MatchMethod.KMP;
            break;
        case "BM":
            method = MatchMethod.BM;
            break;
        case "AC":
            method = MatchMethod.AC;
            break;
        case "RK":
            method = MatchMethod.RK;
            break;
        case "RGX":
            method = MatchMethod.RGX;
            break;
        case "LD":
            method = MatchMethod.LD;
            break; 
        default:
            method = MatchMethod.KMP;
            break;
    }

    let startTime = performance.now();
    let result: StringMatchResult;
    if (method !== MatchMethod.LD) {
        result = exactMatching(originalText, method);
    }
    else {
        result = fuzzyMacthing(originalText);
    }

    if (result.totalMatch() > 0) {
        const execTime = performance.now() - startTime;
        return new ElementMatchResult(textNode.node, result, execTime);
    }

    return null;
}