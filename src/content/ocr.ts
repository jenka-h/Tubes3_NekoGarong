import Tesseract from "tesseract.js";

export async function recognizeImage(dataUrl: string | null, language = "ind"): Promise<string> {
    if (!dataUrl) return "";
    const result = await Tesseract.recognize(dataUrl, language);
    return result.data.text || "";
}

export function coverImage(target: HTMLImageElement, coverSrc: string): void {
    const parent = target.parentElement;
    if (!parent) return;

    const parentStyle = window.getComputedStyle(parent);
    if (parentStyle.position === "static") {
        parent.style.position = "relative";
    }

    const overlay = document.createElement("img");
    overlay.src = coverSrc;
    overlay.alt = "blocked";
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.width = `${target.clientWidth}px`;
    overlay.style.height = `${target.clientHeight}px`;
    overlay.style.objectFit = "cover";
    overlay.style.zIndex = "999999";
    overlay.style.pointerEvents = "none";
    overlay.dataset.judolCover = "true";

    parent.appendChild(overlay);
}