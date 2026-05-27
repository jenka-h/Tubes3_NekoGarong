// TO DO: Akan dilakukan perombakan Hover menggunakan overlay (kemungkinan)
// Ini dipanggil saat DOM selesai diload

// chrome.runtime.sendMessage will send a message to the background script, 
// which will then forward it to the popup script.

import { exactMatching, fuzzyMacthing } from './algorithms/string-matching';
import { MatchMethod } from './algorithms/string-match-result';
import { extractTextNodes } from './content/extractor';
import type { TextNodeData, Message } from './types/types';
import { ElementMatchResult } from './types/types';
import { createHover } from './content/hover';
import { addMatchToSemanticContainer, attachSemanticListeners} from './content/semantic';
import { applyAllHighlights } from './content/highlight';

// Global state
let elementMatches: ElementMatchResult[] = [];
let hoverPopup: HTMLDivElement | null = null;
const semanticMatches = new Map<HTMLElement, ElementMatchResult[]>();


// CEK LAGIIII !!!!!
chrome.runtime.onMessage.addListener((msg: Message, _sender, sendResponse) => {
    if (msg.type === 'scan') {
        runScan();
        sendResponse({ success: true });
    }
    return true;
});

/**
 * Main Pipeline
 */
function runScan(): void {
    const textNodes = extractTextNodes();
    elementMatches = [];
    semanticMatches.clear();  // Clear old mappings on rescans

    for (const textNode of textNodes) {
        const result = analyzeTextNode(textNode);

        if (result && result.result.totalMatch() > 0) {
            const elemMatch = result;
            elementMatches.push(elemMatch);

            // Add to semantic container (finds semantic parent)
            addMatchToSemanticContainer(semanticMatches, textNode.node, elemMatch);
        }
    }

    applyAllHighlights(elementMatches);
    attachSemanticListeners(semanticMatches, hoverPopup);
}

// Ini gatau better taruh mana
// Analyze a single text node with all algorithms and return the first match result found
function analyzeTextNode(textNode: TextNodeData): ElementMatchResult | null {
    const { originalText } = textNode;
    if (!originalText.trim()) return null;

    const exactAlgorithms = [MatchMethod.KMP, MatchMethod.BM, MatchMethod.AC, MatchMethod.RK];

    for (const method of exactAlgorithms) {
        const startTime = performance.now();
        const result = exactMatching(originalText, method);
        if (result.totalMatch() > 0) {
            const execTime = performance.now() - startTime;
            return new ElementMatchResult(textNode.node, result, execTime);
        }
    }

    const regexResult = exactMatching(originalText, MatchMethod.RGX);
    if (regexResult.totalMatch() > 0) {
        const execTime = 0;
        return new ElementMatchResult(textNode.node, regexResult, execTime);
    }

    const fuzzyResult = fuzzyMacthing(originalText);
    if (fuzzyResult.totalMatch() > 0) {
        const execTime = 0;
        return new ElementMatchResult(textNode.node, fuzzyResult, execTime);
    }
    return null;
}

// Auto-trigger: ini jangan lupa diganti ntar
function triggerScan(): void {
    console.log('[Judol Detector] Triggering scan...');
    hoverPopup = createHover();
    runScan();
    console.log('[Judol Detector] Scan complete');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', triggerScan);
} else {
    triggerScan();
}
