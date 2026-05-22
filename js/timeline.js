import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { feature, mesh } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

// ── Line chart: all countries over time ───────────────────────────────────────

const width2      = 928;
const height2     = 600;
const marginTop2  = 20;
const marginRight2  = 20;
const marginBottom2 = 30;
const marginLeft2   = 40;

// ── Parse data into flat array [{name, year, value}, ...] ─────────────────────
const points_flat = [];
for (const [year, countryMap] of dataByYear) {
  for (const [name, value] of countryMap) {
    points_flat.push({ name, year, value });
  }
}

// ── Scales ────────────────────────────────────────────────────────────────────
const xScale = d3.scaleLinear()
  .domain(d3.extent(points_flat, d => d.year))
  .range([marginLeft2, width2 - marginRight2]);

const yScale = d3.scaleLinear()
  .domain([0, 1]).nice()
  .range([height2 - marginBottom2, marginTop2]);

// ── SVG ───────────────────────────────────────────────────────────────────────
const svg2 = d3.create("svg")
  .attr("width",   width2)
  .attr("height",  height2)
  .attr("viewBox", [0, 0, width2, height2])
  .attr("style",   "max-width: 100%; height: auto; overflow: visible; font: 10px sans-serif;");

// ── Axes ──────────────────────────────────────────────────────────────────────
// X axis
svg2.append("g")
  .attr("transform", `translate(0,${height2 - marginBottom2})`)
  .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(10).tickSizeOuter(0));

// Y axis
svg2.append("g")
  .attr("transform", `translate(${marginLeft2},0)`)
  .call(d3.axisLeft(yScale))
  .call(g => g.select(".domain").remove())
  .call(g => g.selectAll(".tick line").clone()
    .attr("x2", width2 - marginLeft2 - marginRight2)
    .attr("stroke-opacity", 0.1))
  .call(g => g.append("text")
    .attr("x", -marginLeft2)
    .attr("y", 10)
    .attr("fill", "currentColor")
    .attr("text-anchor", "start")
    .text("↑ Electoral Democracy Index (v2x_polyarchy)"));

// ── Line generator ────────────────────────────────────────────────────────────
const lineGen = d3.line()
  .defined(d => d.value != null)          // breaks line on missing data (gaps)
  .x(d => xScale(d.year))
  .y(d => yScale(d.value));

// ── Group by country ──────────────────────────────────────────────────────────
const grouped = d3.group(points_flat, d => d.name);

// ── Draw one path per country ─────────────────────────────────────────────────
const paths = svg2.append("g")
  .attr("fill",             "none")
  .attr("stroke",           "steelblue")
  .attr("stroke-width",     1.2)
  .attr("stroke-linejoin",  "round")
  .attr("stroke-linecap",   "round")
  .selectAll("path")
  .data(grouped)
  .join("path")
    .style("mix-blend-mode", "multiply")
    .attr("d", ([, values]) => lineGen(values.sort((a, b) => a.year - b.year)));

// ── Interactive dot + label ───────────────────────────────────────────────────
const dot = svg2.append("g").attr("display", "none");

dot.append("circle").attr("r", 3).attr("fill", "steelblue");

dot.append("text")
  .attr("text-anchor", "middle")
  .attr("y", -10)
  .attr("font-size", "12px")
  .attr("font-weight", "bold")
  .attr("fill", "#333");

// ── Flat pixel-space points for nearest-point lookup ─────────────────────────
const pixelPoints = points_flat.map(d => [xScale(d.year), yScale(d.value), d.name]);

// ── Pointer events ────────────────────────────────────────────────────────────
svg2
  .on("pointerenter", () => {
    paths.style("mix-blend-mode", null).style("stroke", "#ddd");
    dot.attr("display", null);
  })
  .on("pointermove", (event) => {
    const [xm, ym] = d3.pointer(event);
    const i = d3.leastIndex(pixelPoints, ([px, py]) => Math.hypot(px - xm, py - ym));
    const [px, py, name] = pixelPoints[i];

    // Highlight the hovered country's line
    paths
      .style("stroke", ([k]) => k === name ? "steelblue" : "#ddd")
      .style("stroke-width", ([k]) => k === name ? 2.5 : 1)
      .filter(([k]) => k === name)
      .raise();

    // Move dot and label
    dot.attr("transform", `translate(${px},${py})`);
    dot.select("text").text(`${name} (${points_flat[i].year}): ${points_flat[i].value.toFixed(3)}`);
  })
  .on("pointerleave", () => {
    paths
      .style("mix-blend-mode", "multiply")
      .style("stroke", "steelblue")
      .style("stroke-width", 1.2);
    dot.attr("display", "none");
  })
  .on("touchstart", event => event.preventDefault());

// ── Mount ─────────────────────────────────────────────────────────────────────
document.getElementById("chart-container").appendChild(svg2.node());