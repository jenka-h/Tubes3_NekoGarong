import type { TextNodeData } from "../types/types";

export function extractTextNodes(): TextNodeData[] {
    const results: TextNodeData[] = [];

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(node) {
                const parent = node.parentElement;

                if (!parent) {
                    return NodeFilter.FILTER_REJECT;
                }

                const forbiddenTags = [
                    "SCRIPT",
                    "STYLE",
                    "NOSCRIPT"
                ];

                if (forbiddenTags.includes(parent.tagName)) {
                    return NodeFilter.FILTER_REJECT;
                }

                const text = node.textContent?.trim();

                if (!text) {
                    return NodeFilter.FILTER_REJECT;
                }

                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    let currentNode;

    while ((currentNode = walker.nextNode())) {
        results.push({
            node: currentNode as Text,
            originalText: currentNode.textContent || ""
        });
    }

    return results;
}