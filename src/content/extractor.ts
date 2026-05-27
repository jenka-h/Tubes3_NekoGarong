// Module that defines the function to extract text nodes from the document, while filtering out unwanted nodes based on their parent elements and content.

import type { TextNodeData } from "../types/types";

export function extractTextNodes(): TextNodeData[] {
    const results: TextNodeData[] = [];

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(node) {
                const parent = node.parentElement; // Get the parent element of the text node

                if (!parent) {
                    return NodeFilter.FILTER_REJECT;
                }
                
                // Define a list of tags to ignore
                const forbiddenTags = [
                    "SCRIPT",
                    "STYLE",
                    "NOSCRIPT",
                    "TEXTAREA",
                    "INPUT",
                    "CODE"
                ];

                // Reject text nodes that are children of forbidden tags
                if (forbiddenTags.includes(parent.tagName)) {
                    return NodeFilter.FILTER_REJECT;
                }
                
                // Trim the text content to check if it's empty or just whitespace
                const text = node.textContent?.trim();

                // Reject text nodes that are empty or contain only whitespace
                if (!text) {
                    return NodeFilter.FILTER_REJECT;
                }

                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    let currentNode;
    
    // Traverse the document and collect text nodes that pass the filter
    while ((currentNode = walker.nextNode())) {
        results.push({
            node: currentNode as Text, // Type assertion to Text
            originalText: currentNode.textContent || ""
        });
    }

    return results;
}