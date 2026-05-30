// Basic logic for finding nearest box
// TO DO: fix semantic error on title tags

import { ElementMatchResult } from '../types/types';
import { showElementHover, hideHover, moveHover } from '../content/hover';

// Semantic tags that make good hover targets
export const SEMANTIC_TAGS = new Set([
    // Headings
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    // Content blocks
    'P', 'LI', 'TD', 'TH', 'DD', 'DT',
    // Interactive
    'BUTTON', 'A', 'LABEL',
    // Text containers
    'SPAN', 'STRONG', 'EM', 'MARK', 'SMALL',
    // Media/citations
    'FIGCAPTION', 'BLOCKQUOTE', 'CITE',
]);

// Tags to skip (too giant or layout wrappers)
export const SKIP_TAGS = new Set([
    'BODY', 'HTML',
    // App/root wrappers
    'APP', 'ROOT', 'MAIN',
    // Layout containers
    'DIV', 'HEADER', 'FOOTER', 'NAV', 'SECTION', 'ARTICLE', 'ASIDE', 'FIGURE',
]);

// Max depth to traverse up the DOM when looking for semantic containers
export const MAX_DEPTH = 10;

export function findSemanticHoverContainer(element: Element | null): HTMLElement | null {
    if (!element) return null;

    let current: Element | null = element;
    let depth = 0;

    while (current && depth < MAX_DEPTH) {
        const tagName = current.tagName;

        // Found semantic tag - use it
        if (SEMANTIC_TAGS.has(tagName)) {
            return current as HTMLElement;
        }

        // Hit skip tag - stop here
        if (SKIP_TAGS.has(tagName)) {
            break;
        }

        current = current.parentElement;
        depth++;
    }

    // Fallback: use direct parent if safe
    const fallback = element.parentElement;
    if (fallback && !SKIP_TAGS.has(fallback.tagName)) {
        return fallback;
    }
    return null;
}

// Adds a match to the semantic container mapping, creating an entry if it doesn't exist
export function addMatchToSemanticContainer(semanticMatches: Map<HTMLElement, ElementMatchResult[]>, textNode: Text, match: ElementMatchResult): void {
    const container = findSemanticHoverContainer(textNode.parentElement);
    if (!container) return;

    const existing = semanticMatches.get(container) || [];
    existing.push(match);
    semanticMatches.set(container, existing);
}


// Ini gatau bagusnya taruh di mana
export function attachSemanticListeners(semanticMatches: Map<HTMLElement, ElementMatchResult[]>, hoverPopup: HTMLDivElement | null): void {
    semanticMatches.forEach((matches, container) => {
        if (container.dataset.judolHoverAttached) return;
        container.dataset.judolHoverAttached = 'true';
        container.addEventListener('mouseenter', (e: MouseEvent) => showElementHover(hoverPopup, e, matches));
        container.addEventListener('mousemove', (e: MouseEvent) => moveHover(hoverPopup, e));
        container.addEventListener('mouseleave', () => hideHover(hoverPopup));
    });
}