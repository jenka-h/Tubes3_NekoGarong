// This will be use for overall statistics.
import "../style.css";
import Chart from 'chart.js/auto';
import type { ChartConfiguration } from "chart.js";
import { ScanStatistic } from '../types/types';

const style = getComputedStyle(document.documentElement);
const gridColor = style.getPropertyValue("--social-bg").trim();
const accentBg = style.getPropertyValue("--accent-bg").trim();
const accentBorder = style.getPropertyValue("--accent-border").trim();
const status = document.getElementById("status");
const selectAlgorithm = document.getElementById("algorithm") as HTMLSelectElement | null;;
const canvas = document.getElementById("keywords-chart") as HTMLCanvasElement | null;
const scanButton = document.getElementById("scan-button");
const blurCheckbox = document.getElementById("blur") as HTMLInputElement | null;
const clearButton = document.getElementById("clear-button");
const scanIndicator = document.getElementById("scanning-indicator")

if (status) {
    status.textContent = "Extension ready to use ദ്ദി(• ⩊ •マ";
}

const labels = ["none", "nothing", "no", "empty"];
const data = {
    labels: labels,
    datasets: [{
        axis: 'y',
        data: [100, 90, 230, 30],
        fill: false,
        backgroundColor: accentBg,
        borderColor: accentBorder,
        borderWidth: 1
    }]
};

const config: ChartConfiguration<"bar", number[], string> = {
    type: 'bar',
    data: data,
    options: {
        indexAxis: 'y',
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                grid: {
                    color: gridColor
                }
            },
            y: {
                grid: {
                    color: gridColor
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false
    }
};

let keywordsChart: any = null;
if (canvas) {
    keywordsChart = new Chart(canvas, config);
}

if (scanIndicator) {
    scanIndicator.style.display = "none";
}

// Load last saved statistic on popup open
chrome.storage.local.get(['lastStatistic'], (result) => {
    const saved = result?.lastStatistic;
    if (!saved) return;
    const statistic = normalizeStatistic(saved);
    updateStatistic(statistic);
});

chrome.storage.local.get(['useBlur'], (result) => {
    const saved = result?.useBlur;
    if (saved == undefined) return;
    if (blurCheckbox) {
        blurCheckbox.checked = saved as boolean;
    }
});

if (scanButton && selectAlgorithm && status) {
    scanButton.addEventListener("click", () => {
        status.textContent = "Loading...";
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (!activeTab?.id) return;

            if (scanIndicator) {
                scanIndicator.style.display = "flex";
            }
            chrome.tabs.sendMessage(activeTab.id, {
                type: "scan",
                algorithm: selectAlgorithm.value
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.warn(chrome.runtime.lastError.message);
                    return;
                }
                if (!response) {
                    console.log("Failed to get scan statistic.");
                }

                let statistic: ScanStatistic = response.statistic;
                statistic = normalizeStatistic(statistic);
                updateStatistic(statistic);
                const methodResultsObj = Object.fromEntries(statistic.methodResults);
                chrome.storage.local.set({
                    lastStatistic: {
                        ...statistic,
                        methodResults: methodResultsObj
                    }
                });
                console.log("Scan completed.");
                if (scanIndicator) {
                    scanIndicator.style.display = "none";
                }
            });
        });
        status.textContent = "Extension ready to use ദ്ദി(• ⩊ •マ";
    });
}

if (blurCheckbox) {
    blurCheckbox.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (!activeTab?.id) return;

            chrome.tabs.sendMessage(activeTab.id, {
                type: "toggleBlur",
                payload: blurCheckbox.checked
            });
        });
    })
}

if (clearButton) {
    clearButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (!activeTab?.id) return;

            chrome.tabs.sendMessage(activeTab.id, { type: "clear" }, (response) => {
                if (response) {
                    console.log("Highlight cleared.");
                }
            });
        });
    });
}

function updateStatistic(statistic: ScanStatistic): void {
    const algUsedEl = document.getElementById('algorithm-used');
    const totalKeywordsEl = document.getElementById('total-keywords');
    const executionTimeEl = document.getElementById('execution-time');
    const matchEl = document.getElementById('match');

    function algCodeToName(code: string): string {
        switch (code) {
            case 'KMP': return 'Knuth-Morris-Pratt';
            case 'BM': return 'Boyer-Moore';
            case 'AC': return 'Aho-Corasick';
            case 'RK': return 'Rabin-Karp';
            case 'RGX': return 'Regex';
            case 'LD': return 'Levenshtein Distance';
            default: return code;
        }
    }

    const selectedCode = selectAlgorithm ? selectAlgorithm.value : 'KMP';
    const patternName = algCodeToName(selectedCode);
    const regexName = algCodeToName('RGX');
    const fuzzyName = algCodeToName('LD');

    const patternRes = statistic.methodResults.get(patternName);
    const regexRes = statistic.methodResults.get(regexName);
    const fuzzyRes = statistic.methodResults.get(fuzzyName);

    if (algUsedEl) algUsedEl.textContent = patternName;

    if (totalKeywordsEl) totalKeywordsEl.textContent = `${statistic.totalMatches} keywords found`;

    const patternTime = patternRes ? patternRes.executionTime.toFixed(2) : '0.00';
    const regexTime = regexRes ? regexRes.executionTime.toFixed(2) : '0.00';
    const fuzzyTime = fuzzyRes ? fuzzyRes.executionTime.toFixed(2) : '0.00';
    if (executionTimeEl) executionTimeEl.innerHTML =
        `Exact Matching: ${patternTime} ms<br>RegEx Matching: ${regexTime} ms<br>Fuzzy Matching: ${fuzzyTime} ms`;

    const patternCount = patternRes ? patternRes.comparisonCount : 0;
    const regexCount = regexRes ? regexRes.comparisonCount : 0;
    const fuzzyCount = fuzzyRes ? fuzzyRes.comparisonCount : 0;
    if (matchEl) matchEl.innerHTML =
        `Exact Matching: ${patternCount} keywords<br>RegEx Matching: ${regexCount} keywords<br>Fuzzy Matching: ${fuzzyCount} keywords`;

    if (keywordsChart) {
        if (statistic.topKeywords && statistic.topKeywords.length > 0) {
            const labels = statistic.topKeywords.map(k => k.keyword);
            const dataVals = statistic.topKeywords.map(k => k.count);
            keywordsChart.data.labels = labels;
            if (keywordsChart.data.datasets && keywordsChart.data.datasets[0]) {
                keywordsChart.data.datasets[0].data = dataVals;
            }
        } else {
            keywordsChart.data.labels = [];
            if (keywordsChart.data.datasets && keywordsChart.data.datasets[0]) {
                keywordsChart.data.datasets[0].data = [];
            }
        }
        keywordsChart.update();
    }
}

function normalizeStatistic(raw: any): ScanStatistic {
    const statistic = raw as ScanStatistic;
    if (statistic && !(statistic.methodResults instanceof Map)) {
        statistic.methodResults = new Map(Object.entries(statistic.methodResults || {}));
    }
    return statistic;
}