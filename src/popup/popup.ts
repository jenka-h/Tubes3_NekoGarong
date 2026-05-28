// This will be use for overall statistics.
import "../style.css";
import Chart from 'chart.js/auto';
import type { ChartConfiguration } from "chart.js";

const style = getComputedStyle(document.documentElement);
// const accent = style.getPropertyValue("--accent").trim();
const accentBg = style.getPropertyValue("--accent-bg").trim();
const accentBorder = style.getPropertyValue("--accent-border").trim();
const status = document.getElementById("status");
const selectAlgorithm = document.getElementsByName("algorithm")
const canvas = document.getElementById("keywords-chart") as HTMLCanvasElement | null;

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
        }
    }
};

if (canvas) {
    new Chart(canvas, config);
}

if (selectAlgorithm) {
    // idk maybe run the algorithm
}