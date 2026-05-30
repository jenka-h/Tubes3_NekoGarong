import { ElementMatchResult } from '../types/types';

export function createHover(): HTMLDivElement {
    const popup = document.createElement('div');
    popup.id = 'judol-hover-popup';
    popup.style.cssText = `
        position: fixed;
        z-index: 999999;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s ease-in-out;
    `;
    popup.innerHTML = `
        <div style="
            position: relative;
            background: #1a1a2e;
            border: 1px solid #e94560;
            border-radius: 10px;
            padding: 20px 24px 26px 24px;
            width: 200px;
            box-shadow: 0 20px 50px -10px rgba(0,0,0,0.5);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #fff;
        ">
            <div style="position: absolute; top: -14px; left: 20px; width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-bottom: 14px solid #e94560;"></div>
            <div style="position: absolute; top: -11px; left: 21px; width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-bottom: 12px solid #1a1a2e;"></div>
            <div style="position: absolute; top: -14px; right: 20px; width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-bottom: 14px solid #e94560;"></div>
            <div style="position: absolute; top: -11px; right: 21px; width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-bottom: 12px solid #1a1a2e;"></div>

            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 12px;">
                <div style="width: 24px; height: 24px; background: #e94560; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px; color: #1a1a2e;" class="jv-badge">KMP</div>
                <h3 style="margin: 0; font-size: 10px; font-weight: bold; color: #e94560;">Konten Terdeteksi</h3>
            </div>

            <div style="display: flex; align-items: center; gap: 0px; margin-bottom: 12px; font-size: 10px; color: #888;">
                <span style="flex: 1; height: 1px; background: #333;"></span>
                <span>= ^ . ^ =</span>
                <span style="flex: 1; height: 1px; background: #333;"></span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 8px;">
                <div style="display: flex; justify-content: space-between; gap: 8px;">
                    <span style="color: #888;">Keyword</span>
                    <span style="font-family: monospace;" class="jv-keyword">-</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 8px;">
                    <span style="color: #888;">Occurrences</span>
                    <span class="jv-occurrences">-</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 8px;">
                    <span style="color: #888;">Algorithm</span>
                    <span style="font-family: monospace;" class="jv-algorithm">-</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 8px;">
                    <span style="color: #888;">Execution Time</span>
                    <span style="font-family: monospace;" class="jv-time">-</span>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
    return popup;
}

export function getAlgoCode(algorithm: string): string {
    if (algorithm == 'Knuth-Morris-Pratt') return 'KMP';
    if (algorithm == 'Boyer-Moore') return 'BM';
    if (algorithm == 'Aho-Corasick') return 'AC';
    if (algorithm == 'Rabin-Karp') return 'RK';
    if (algorithm == 'Levenshtein Distance') return 'LD';
    if (algorithm == 'Regex') return 'RGX';
    return '???';
}

export function hideHover(popup: HTMLElement | null): void {
    if (popup) popup.style.opacity = '0';
}

export function moveHover(popup: HTMLElement | null, e: MouseEvent): void {
    if (popup) {
        popup.style.left = `${e.clientX + 18}px`;
        popup.style.top = `${e.clientY + 18}px`;
    }
}

// bad code alert !! lolol
export function showElementHover(popup: HTMLElement | null, e: MouseEvent, matches: ElementMatchResult[]): void {
    if (!popup) return;

    const keywordEl = popup.querySelector('.jv-keyword');
    const occEl = popup.querySelector('.jv-occurrences');
    const algoEl = popup.querySelector('.jv-algorithm');
    const timeEl = popup.querySelector('.jv-time');
    const badgeEl = popup.querySelector('.jv-badge');

    if (matches.length > 0) {
        // Collect all unique algorithms
        const algorithms = [...new Set(matches.map(m => getAlgoCode(m.result.method)))];

        // Aggregate keywords and total occurrences
        const keywords = new Set<string>();
        let totalOccurrences = 0;
        let totalExecTime = 0;

        for (const match of matches) {
            totalExecTime += match.execTime;
            for (const [keyword, positions] of match.result.matchPosition) {
                keywords.add(keyword);
                totalOccurrences += positions.length;
            }
        }

        if (keywordEl) keywordEl.textContent = [...keywords].join(', ') || '-';
        if (occEl) occEl.textContent = String(totalOccurrences);
        if (algoEl) algoEl.textContent = algorithms.join(', ');
        if (timeEl) timeEl.textContent = `${totalExecTime.toFixed(2)}ms`;
        if (badgeEl) badgeEl.textContent = algorithms[0] || '-';

    } else {
        if (keywordEl) keywordEl.textContent = '-';
        if (occEl) occEl.textContent = '-';
        if (algoEl) algoEl.textContent = '-';
        if (timeEl) timeEl.textContent = '-';
        if (badgeEl) badgeEl.textContent = '-';
    }

    popup.style.left = `${e.clientX + 18}px`;
    popup.style.top = `${e.clientY + 18}px`;
    popup.style.opacity = '1';
}