// timeline.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// ── Dimensions ────────────────────────────────────────────────────────────────
const width        = 928;
const height       = 500;
const marginTop    = 20;
const marginRight  = 30;
const marginBottom = 30;
const marginLeft   = 50;

// ── Load & parse CSV ──────────────────────────────────────────────────────────
const raw = await d3.csv("data/all_continents.csv", d => ({
  continent: d.continent,
  name:      d.country_name,
  year:      +d.year,
  value:     d.v2x_polyarchy === "NA" || d.v2x_polyarchy === "" ? null : +d.v2x_polyarchy,
}));

const data = raw.filter(d => d.name && !isNaN(d.year));

// ── Group by country ──────────────────────────────────────────────────────────
const grouped = d3.group(data, d => d.name);

// ── Scales ────────────────────────────────────────────────────────────────────
const xScale = d3.scaleLinear()
  .domain(d3.extent(data, d => d.year))
  .range([marginLeft, width - marginRight]);

const yScale = d3.scaleLinear()
  .domain([0, 1]).nice()
  .range([height - marginBottom, marginTop]);

// ── SVG ───────────────────────────────────────────────────────────────────────
const svg = d3.create("svg")
  .attr("width",   width)
  .attr("height",  height)
  .attr("viewBox", [0, 0, width, height])
  .attr("style",   "max-width:100%; height:auto; overflow:visible; font:10px sans-serif;");

// ── X axis ────────────────────────────────────────────────────────────────────
svg.append("g")
  .attr("transform", `translate(0,${height - marginBottom})`)
  .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(10).tickSizeOuter(0));

// ── Y axis ────────────────────────────────────────────────────────────────────
svg.append("g")
  .attr("transform", `translate(${marginLeft},0)`)
  .call(d3.axisLeft(yScale))
  .call(g => g.select(".domain").remove())
  .call(g => g.selectAll(".tick line").clone()
    .attr("x2", width - marginLeft - marginRight)
    .attr("stroke-opacity", 0.1))
  .call(g => g.append("text")
    .attr("x", -marginLeft)
    .attr("y", 10)
    .attr("fill", "currentColor")
    .attr("text-anchor", "start")
    .text("↑ Electoral Democracy Index (v2x_polyarchy)"));

// ── Line generator ────────────────────────────────────────────────────────────
const lineGen = d3.line()
  .defined(d => d.value != null)
  .x(d => xScale(d.year))
  .y(d => yScale(d.value));

// ── Draw lines (grey by default) ──────────────────────────────────────────────
const paths = svg.append("g")
  .attr("fill",            "none")
  .attr("stroke",          "#ddd")
  .attr("stroke-width",    1.2)
  .attr("stroke-linejoin", "round")
  .attr("stroke-linecap",  "round")
  .selectAll("path")
  .data(grouped)
  .join("path")
    .attr("d", ([, values]) =>
      lineGen(values.sort((a, b) => a.year - b.year))
    );

// ── Average line ──────────────────────────────────────────────────────────────
const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);

const averageData = years.map(year => {
  const values = data.filter(d => d.year === year && d.value != null).map(d => d.value);
  return { year, value: values.length ? d3.mean(values) : null };
});

const averageLine = d3.line()
  .defined(d => d.value != null)
  .x(d => xScale(d.year))
  .y(d => yScale(d.value));

const averagePath = svg.append("path")
  .datum(averageData)
  .attr("fill",         "none")
  .attr("stroke",       "black")
  .attr("stroke-width", 2)
  .attr("d",            averageLine);

// ── Tooltip dot + label ───────────────────────────────────────────────────────
const dot = svg.append("g").attr("display", "none");
dot.append("circle").attr("r", 3).attr("fill", "black");
dot.append("text")
  .attr("text-anchor", "middle")
  .attr("y", -10)
  .attr("font-size", "12px")
  .attr("font-weight", "bold")
  .attr("fill", "black");

// ── Pre-compute pixel positions for nearest-point lookup ──────────────────────
const pixelPoints = data
  .filter(d => d.value != null)
  .map(d => ({
    px:    xScale(d.year),
    py:    yScale(d.value),
    name:  d.name,
    year:  d.year,
    value: d.value,
  }));

// ── Pointer interaction ───────────────────────────────────────────────────────
svg
  .on("pointerenter", () => {
    averagePath.attr("display", "none");
    dot.attr("display", null);
  })
  .on("pointermove", event => {
    const [xm, ym] = d3.pointer(event);
    const closest = pixelPoints.reduce((best, p) => {
      const dist = Math.hypot(p.px - xm, p.py - ym);
      return dist < best.dist ? { ...p, dist } : best;
    }, { dist: Infinity });

    paths
      .style("stroke",       ([k]) => k === closest.name ? "black" : "#ddd")
      .style("stroke-width", ([k]) => k === closest.name ? 2.5 : 1)
      .filter(([k]) => k === closest.name)
      .raise();

    dot.attr("transform", `translate(${closest.px},${closest.py})`);
    dot.select("text").text(`${closest.name} (${closest.year}): ${closest.value.toFixed(3)}`);
  })
  .on("pointerleave", () => {
    paths
      .style("stroke",       "#ddd")
      .style("stroke-width", 1.2);
    averagePath.attr("display", null).raise();
    dot.attr("display", "none");
  })
  .on("touchstart", e => e.preventDefault());

// ── Append to #timeline-container ────────────────────────────────────────────
document.getElementById("timeline-container").appendChild(svg.node());