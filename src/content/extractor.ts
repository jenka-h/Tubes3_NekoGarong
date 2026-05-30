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

export interface ImageTarget {
  element: HTMLImageElement;
  src: string;
}

export function extractImages(): ImageTarget[] {
    const images = Array.from(document.images);
    return images
        .filter(img => img.src && img.complete && img.naturalWidth > 0)
        .map(img => ({ element: img, src: img.currentSrc || img.src }))
        .filter(({ src }) => {
            if (!src) return false;
            // Allow data URLs or http/https for fetch, not blobs
            if (src.startsWith("data:image/")) {
                return src.startsWith("data:image/png")
                    || src.startsWith("data:image/jpeg")
                    || src.startsWith("data:image/jpg")
                    || src.startsWith("data:image/webp")
                    || src.startsWith("data:image/bmp")
                    || src.startsWith("data:image/gif");
            }
            return src.startsWith("http://") || src.startsWith("https://");
        });
}