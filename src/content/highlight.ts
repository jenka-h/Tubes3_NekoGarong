import { ElementMatchResult } from '../types/types';
import type { Range } from '../types/types';

export function applyAllHighlights(elementMatches: ElementMatchResult[], useBlur: boolean = false): void {
    clearHighlights();
    for (const elemMatch of elementMatches) {
        applyHighlight(elemMatch, useBlur);
    }
}

export function applyHighlight(elemMatch: ElementMatchResult, useBlur: boolean = false): void {
    const { node } = elemMatch;
    const currentText = node.textContent || '';

    // Get highlights from match result
    const highlights = buildHighlightRanges(elemMatch);

    // Skip if no valid highlights
    if (highlights.length === 0) return;

    // Valid highlights 
    const validHighlights = highlights.filter(h =>
        h.start >= 0 &&
        h.end <= currentText.length &&
        h.start < h.end
    );

    if (validHighlights.length === 0) return;

    // Start building fragmennttttttttt
    const frag = buildHighlightFragment(currentText, validHighlights, useBlur);
    const parent = node.parentNode;
    if (parent) {
        parent.replaceChild(frag, node);
    }
}

// Fixing previous problem
function mergeOverlappingRanges(ranges: Range[]): Range[] {
    if (ranges.length === 0) return [];

    // Sort by start position
    const sorted = [...ranges].sort((a, b) => a.start - b.start);
    const merged: Range[] = [];

    let current = { ...sorted[0] };

    for (let i = 1; i < sorted.length; i++) {
        const next = sorted[i];

        // Overlap: next.start < current.end 
        if (next.start < current.end) {
            // Take the longer end, keep first keyword
            current.end = Math.max(current.end, next.end);
        } else {
            // Gap between ranges - push current and start new
            merged.push(current);
            current = { ...next };
        }
    }
    merged.push(current);

    return merged;
}

function buildHighlightRanges(result: ElementMatchResult): Range[] {
    const ranges: Range[] = [];

    // Create again [This might cause overhead: beware of malicious intention :shockface:]
    result.result.matchPosition.forEach((positions, keyword) => {
        for (const pos of positions) {
            ranges.push({
                start: pos,
                end: pos + keyword.length,
                keyword
            });
        }
    });

    return mergeOverlappingRanges(ranges);
}

function buildHighlightFragment(originalText: string, highlights: Range[], useBlur: boolean = false): DocumentFragment {
    const frag = document.createDocumentFragment();
    let lastEnd = 0;

    for (const h of highlights) {
        // Slicee, maintaining whitespace
        if (h.start > lastEnd) {
            const plainText = originalText.slice(lastEnd, h.start);
            frag.appendChild(document.createTextNode(plainText));
        }

        // Skip if this highlight overlaps with already-processed range
        if (h.start < lastEnd) {
            continue;
        }

        const mark = createHighlightMark(useBlur);
        mark.textContent = originalText.slice(h.start, h.end);
        frag.appendChild(mark);

        lastEnd = h.end;
    }

    // Add whitespace after
    if (lastEnd < originalText.length) {
        frag.appendChild(document.createTextNode(
            originalText.slice(lastEnd)
        ));
    }

    return frag;
}

export function createHighlightMark(useBlur: boolean = false): HTMLElement {
    const mark = document.createElement('mark');
    if (!useBlur) {
        mark.style.cssText = `
            background: rgba(168, 85, 247, 0.25);
            color: inherit;
            display: inline;
            line-height: inherit;
            font-size: inherit;
            font-weight: inherit;
            border-radius: 2px;
            box-decoration-break: clone;
            -webkit-box-decoration-break: clone;
        `;
    }
    else {
        mark.style.cssText = `
            background: rgba(168, 85, 247, 0.25);
            color: inherit;
            display: inline;
            line-height: inherit;
            font-size: inherit;
            font-weight: inherit;
            border-radius: 2px;
            box-decoration-break: clone;
            -webkit-box-decoration-break: clone;
            filter: blur(5px);
        `;
    }

    return mark;
}

export function clearHighlights(): void {
    document.querySelectorAll('mark').forEach(el => {
        const parent = el.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(el.textContent || ''), el);
        }
    });
}