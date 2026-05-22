// ridgeline.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// ── Dimensions ────────────────────────────────────────────────────────────────
const width       = 928;
const marginTop   = 30;
const marginRight = 20;
const marginBottom = 30;
const marginLeft  = 160;
const overlap     = 2;  // how much ridges overlap each other

// ── Load & parse CSV ──────────────────────────────────────────────────────────
const raw = await d3.csv("data/all_continents.csv", d => ({
  continent: d.continent,
  name:      d.country_name,
  year:      +d.year,
  value:     d.v2x_polyarchy === "NA" || d.v2x_polyarchy === "" ? null : +d.v2x_polyarchy,
}));

// ── Filter Europe only ────────────────────────────────────────────────────────
const data = raw.filter(d =>
  d.continent === "Europe" &&
  d.name &&
  !isNaN(d.year) &&
  d.value != null
);

// ── Get sorted list of countries ──────────────────────────────────────────────
const countries = Array.from(new Set(data.map(d => d.name))).sort();

// ── Group by country ──────────────────────────────────────────────────────────
const grouped = d3.group(data, d => d.name);

// ── Scales ────────────────────────────────────────────────────────────────────
const xScale = d3.scaleLinear()
  .domain(d3.extent(data, d => d.year))
  .range([marginLeft, width - marginRight]);

const bandHeight = 70;
const height = marginTop + marginBottom + countries.length * bandHeight;

// y position per country (band centers)
const yBand = d3.scaleBand()
  .domain(countries)
  .range([marginTop, height - marginBottom])
  .paddingInner(0);

// local y scale for values within each band
const yLocal = d3.scaleLinear()
  .domain([0, 1])
  .range([0, -bandHeight * overlap]);

// ── SVG ───────────────────────────────────────────────────────────────────────
const svg = d3.create("svg")
  .attr("width",   width)
  .attr("height",  height)
  .attr("viewBox", [0, 0, width, height])
  .attr("style",   "max-width:100%; height:auto; font:10px sans-serif;");

// ── X axis ────────────────────────────────────────────────────────────────────
svg.append("g")
  .attr("transform", `translate(0,${height - marginBottom})`)
  .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(10).tickSizeOuter(0));

// ── Area + line generators ────────────────────────────────────────────────────
const area = d3.area()
  .defined(d => d.value != null)
  .x(d => xScale(d.year))
  .y0(0)
  .y1(d => yLocal(d.value))
  .curve(d3.curveCatmullRom);

const line = d3.line()
  .defined(d => d.value != null)
  .x(d => xScale(d.year))
  .y(d => yLocal(d.value))
  .curve(d3.curveCatmullRom);

// ── Draw one ridge per country ────────────────────────────────────────────────
const group = svg.append("g");

for (const country of countries) {
  const values = (grouped.get(country) ?? []).sort((a, b) => a.year - b.year);
  const baseline = yBand(country) + yBand.bandwidth();

  const g = group.append("g")
    .attr("transform", `translate(0,${baseline})`);

  // filled area
  g.append("path")
    .datum(values)
    .attr("fill", "black")
    .attr("fill-opacity", 0.15)
    .attr("d", area);

  // top line
  g.append("path")
    .datum(values)
    .attr("fill",         "none")
    .attr("stroke",       "black")
    .attr("stroke-width", 1.2)
    .attr("d", line);

  // baseline rule
  g.append("line")
    .attr("x1", marginLeft)
    .attr("x2", width - marginRight)
    .attr("stroke", "#ccc")
    .attr("stroke-width", 0.5);

  // country label
  g.append("text")
    .attr("x",            marginLeft - 6)
    .attr("y",            0)
    .attr("dy",           "0.35em")
    .attr("text-anchor",  "end")
    .attr("font-size",    "11px")
    .attr("fill",         "#333")
    .text(country);
}

// ── Y axis label ──────────────────────────────────────────────────────────────
svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -(height / 2))
  .attr("y", 12)
  .attr("text-anchor", "middle")
  .attr("font-size", "11px")
  .attr("fill", "#555")
  .text("Democracy Index (v2x_polyarchy)");

// ── Append to #timeline-container ────────────────────────────────────────────
document.getElementById("timeline-container").appendChild(svg.node());