// TO DO: Akan dilakukan perombakan Hover menggunakan overlay (kemungkinan)
// Ini dipanggil saat DOM selesai diload

// chrome.runtime.sendMessage will send a message to the background script, 
// which will then forward it to the popup script.

import { exactMatching, fuzzyMacthing } from './algorithms/string-matching';
import { MatchMethod, StringMatchResult } from './algorithms/string-match-result';
import { extractTextNodes, extractImages } from './content/extractor';
import { type TextNodeData, type Message, ScanStatistic, MethodResult } from './types/types';
import { ElementMatchResult } from './types/types';
import { createHover } from './content/hover';
import { addMatchToSemanticContainer, attachSemanticListeners } from './content/semantic';
import { applyAllHighlights, clearHighlights } from './content/highlight';
import { recognizeImage, coverImage, removeCoverImage } from "./content/ocr";

// Global state
let algorithm: string = "KMP";
let useBlur: boolean = false;
let useOcr: boolean = false;
let elementMatches: ElementMatchResult[] = [];
let hoverPopup: HTMLDivElement | null = null;
const semanticMatches = new Map<HTMLElement, ElementMatchResult[]>();

chrome.storage.local.get(["algorithm"], (result) => {
    const saved = result?.algorithm;
    if (saved) {
        algorithm = saved as string;
    }
});

chrome.storage.local.get(["useBlur"], (result) => {
    const saved = result?.useBlur;
    if (saved != undefined && saved == true) {
        useBlur = true;
    }
});


chrome.storage.local.get(["useOcr"], (result) => {
    const saved = result?.useOcr;
    if (saved != undefined && saved == true) {
        useOcr = true;
    }
});

chrome.storage.local.get(["autoScan"], (result) => {
    const saved = result?.autoScan;
    if (saved != undefined && saved == true) {
        if (!hoverPopup) {
            hoverPopup = createHover();
        }
        asyncScan(algorithm, useBlur, useOcr);
    }
});

chrome.runtime.onMessage.addListener((msg: Message, _sender, sendResponse) => {
    if (msg.type === 'scan') {
        if (!hoverPopup) {
            hoverPopup = createHover();
        }
        const statistic = runScan(msg.algorithm, msg.blur, msg.ocr);
        const methodResultsObj = Object.fromEntries(statistic.methodResults);
        sendResponse({
            success: true,
            statistic: {
                ...statistic,
                methodResults: methodResultsObj
            }
        });
    }
    else if (msg.type === 'clear') {
        clear();
        sendResponse({
            success: true,
        });
    }
    return true;
});

async function asyncScan(algorithm: string, blur: boolean, ocr: boolean) {
    runScan(algorithm, blur, ocr);
}

/**
 * Main Pipeline
 */
function runScan(algorithm: string, blur: boolean, ocr: boolean): ScanStatistic {
    clear();
    elementMatches = [];
    const textNodes = extractTextNodes();
    semanticMatches.clear();  // Clear old mappings on rescans

    const methods = [algorithm, "RGX", "LD"]
    let statistic = new ScanStatistic();
    const keywordCounts: Map<string, number> = new Map();

    for (const method of methods) {
        const startTime = performance.now();
        let count = 0;
        for (const textNode of textNodes) {
            const result = analyzeTextNode(textNode, method);

            if (result && result.result.totalMatch() > 0) {
                const elemMatch = result;
                elementMatches.push(elemMatch);
                count += elemMatch.result.totalMatch();

                // accumulate keyword counts
                elemMatch.result.matchPosition.forEach((positions, keyword) => {
                    const prev = keywordCounts.get(keyword) || 0;
                    keywordCounts.set(keyword, prev + positions.length);
                });

                // Add to semantic container (finds semantic parent)
                addMatchToSemanticContainer(semanticMatches, textNode.node, elemMatch);
            }
        }
        const execTime = performance.now() - startTime;
        const methodResult = new MethodResult(execTime, count);
        statistic.methodResults.set(algCodeToString(method), methodResult);
        statistic.totalMatches += count;
    }

    applyAllHighlights(elementMatches, blur);
    attachSemanticListeners(semanticMatches, hoverPopup);
    const top = Array.from(keywordCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([keyword, count]) => ({ keyword, count }));
    statistic.topKeywords = top;

    if (ocr) runOcrScan(algorithm);

    return statistic;
}

async function runOcrScan(algorithm: string): Promise<void> {
    const images = extractImages();
    for (const { element, src } of images) {
        const dataUrl = await fetchAsDataUrl(src);
        if (!dataUrl) continue;

        let texts: string[] = [];
        try {
            texts.push(await recognizeImage(dataUrl, "ind"));
            texts.push(await recognizeImage(dataUrl, "eng"));
        } catch {
            continue;
        }

        const methods = [algorithm, "RGX", "LD"];
        for (const method of methods) {
            for (const text of texts) {
                if (analyzeText(text, method)) {
                    coverImage(element, chrome.runtime.getURL("images/mrpeanutsiswatching.png"));
                    break;
                }
            }
        }
    }
}

function clear(): void {
    clearHighlights();
    removeCoverImage();
}

// Analyze a single text node with all algorithms and return the first match result found
function analyzeTextNode(textNode: TextNodeData, methodChoice: string): ElementMatchResult | null {
    const { originalText } = textNode;
    if (!originalText.trim()) return null;

    const method = algCodeToString(methodChoice);

    const startTime = performance.now();
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

function algCodeToString(alg: string): string {
    switch (alg) {
        case "KMP":
            return MatchMethod.KMP;
        case "BM":
            return MatchMethod.BM;
        case "AC":
            return MatchMethod.AC;
        case "RK":
            return MatchMethod.RK;
        case "RGX":
            return MatchMethod.RGX;
        case "LD":
            return MatchMethod.LD;
        default:
            return MatchMethod.KMP;
    }
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
    try {
        if (url.startsWith("data:image/")) {
            const type = url.slice("data:".length, url.indexOf(";"));
            return isImageTypeSupported(type) ? url : null;
        }
        if (url.startsWith("blob:")) return null;

        const res = await fetch(url, { mode: "cors" });
        if (!res.ok) return null;

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.startsWith("image/") || !isImageTypeSupported(contentType)) return null;

        const blob = await res.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

function isImageTypeSupported(type: string): boolean {
    return type === "image/png"
        || type === "image/jpeg"
        || type === "image/jpg"
        || type === "image/webp"
        || type === "image/bmp"
        || type === "image/gif";
}

function analyzeText(text: string, methodChoice: string): boolean {
    if (!text.trim()) return false;

    const method = algCodeToString(methodChoice);

    let result: StringMatchResult;
    if (method !== MatchMethod.LD) {
        result = exactMatching(text, method);
    }
    else {
        result = fuzzyMacthing(text);
    }

    if (result.totalMatch() > 0) {
        return true
    }

    return false;
}