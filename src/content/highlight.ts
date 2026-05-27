import { ElementMatchResult } from '../types/types';

// Import elementMatches from main content.ts
import '../content';

export function applyAllHighlights(elementMatches: ElementMatchResult[]): void {
    clearHighlights();
    for (const elemMatch of elementMatches) {
        applyHighlight(elemMatch);
    }
}

// Applies highlight to a single text node based on the match result
export function applyHighlight(elemMatch: ElementMatchResult): void {
    const { node, result } = elemMatch;
    const originalText = node.textContent || '';

    const highlights: { start: number; end: number; keyword: string }[] = [];
    result.matchPosition.forEach((positions, keyword) => {
        for (const pos of positions) {
            highlights.push({ start: pos, end: pos + keyword.length, keyword });
        }
    });
    
    // Sort highlights by start position to ensure correct order when building the fragment
    highlights.sort((a, b) => a.start - b.start);

    const frag = buildHighlightFragment(originalText, highlights);
    const parent = node.parentNode;
    if (parent) parent.replaceChild(frag, node);
}

// Builds a DocumentFragment with text and <mark> elements for highlights
function buildHighlightFragment(originalText: string, highlights: { start: number; end: number; keyword: string }[]): DocumentFragment {
    const frag = document.createDocumentFragment();
    let lastEnd = 0;

    for (const h of highlights) {
        if (h.start > lastEnd) {
            frag.appendChild(document.createTextNode(originalText.slice(lastEnd, h.start)));
        }
        const mark = createHighlightMark();
        mark.textContent = originalText.slice(h.start, h.end);
        frag.appendChild(mark);
        lastEnd = h.end;
    }

    if (lastEnd < originalText.length) {
        frag.appendChild(document.createTextNode(originalText.slice(lastEnd)));
    }

    return frag;
}

// Creates a styled <mark> element for highlighting matched keywords
export function createHighlightMark(): HTMLElement {
    const mark = document.createElement('mark');
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
    return mark;
}

// Clears all highlights by replacing <mark> elements with their text content
export function clearHighlights(): void {
    document.querySelectorAll('mark').forEach(el => {
        const parent = el.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(el.textContent || ''), el);
        }
    });
}
