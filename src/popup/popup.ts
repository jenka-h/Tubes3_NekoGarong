// This will be use for overall statistics.
import "../style.css";
import Chart from 'chart.js/auto';
import type { ChartConfiguration } from "chart.js";
import { ElementMatchResult } from '../types/types';

const style = getComputedStyle(document.documentElement);
const gridColor = style.getPropertyValue("--social-bg").trim();
const accentBg = style.getPropertyValue("--accent-bg").trim();
const accentBorder = style.getPropertyValue("--accent-border").trim();
const status = document.getElementById("status");
const selectAlgorithm = document.getElementById("algorithm") as HTMLSelectElement | null;;
const canvas = document.getElementById("keywords-chart") as HTMLCanvasElement | null;
const scanButton = document.getElementById("scan-button");
const clearButton = document.getElementById("clear-button");

let elementMatches: ElementMatchResult[] = [];

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

const config:ChartConfiguration<"bar", number[], string> = {
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
        }
    }
};

if (canvas) {
    new Chart(canvas, config);
}

if (selectAlgorithm) {
    // idk maybe run the algorithm
}

if (scanButton && selectAlgorithm) {
    scanButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (!activeTab?.id) return;

            chrome.tabs.sendMessage(activeTab.id, {
                type: "scan",
                algorithm: selectAlgorithm.value
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.warn(chrome.runtime.lastError.message);
                    return;
                }

                if (!response) return;

                console.log("Response:", response.success);
                elementMatches = response.result;
                console.log("Response:", elementMatches);
            });
        });
    });
}

if (clearButton) {
    clearButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (!activeTab?.id) return;

            chrome.tabs.sendMessage(activeTab.id, { type: "clear" }, (response) => {
                console.log("Response:", response);
            });
        });
    });
}