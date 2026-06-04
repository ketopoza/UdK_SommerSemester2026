// ridgeline.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// ── Dimensions ────────────────────────────────────────────────────────────────
const width        = 928;
const marginTop    = 30;
const marginRight  = 20;
const marginBottom = 30;
const marginLeft   = 160;
const overlap      = 2;

// ── Regional order ────────────────────────────────────────────────────────────
const regions = [
  {
    label: "Central Europe",
    countries: [
      "Switzerland", "Germany", "Austria", "Slovenia",
      "Czech Republic", "Poland", "Hungary", "Slovakia",
    ],
  },
  {
    label: "Northern Europe",
    countries: [
      "Iceland", "Norway", "Denmark", "Sweden",
      "Lithuania", "Latvia", "Estonia", "Finland",
    ],
  },
  {
    label: "Western Europe",
    countries: [
      "Ireland", "United Kingdom", "France",
      "Belgium", "Netherlands", "Luxembourg",
    ],
  },
  {
    label: "Southern Europe",
    countries: [
      "Portugal", "Spain", "Italy", "Greece",
    ],
  },
  {
    label: "Southeastern Europe",
    countries: [
      "Croatia", "Bosnia and Herzegovina", "Montenegro", "Albania",
      "Serbia", "Kosovo", "North Macedonia", "Romania", "Bulgaria", "Türkiye",
    ],
  },
  {
    label: "Eastern Europe",
    countries: [
      "Belarus", "Moldova", "Ukraine", "Russia",
    ],
  },
];

const countries = regions.flatMap(r => r.countries);

// ── Load & parse CSV ──────────────────────────────────────────────────────────
const raw = await d3.csv("data/all_continents.csv", d => ({
  continent: d.continent,
  name:      d.country_name,
  year:      +d.year,
  value:     d.v2x_polyarchy === "NA" || d.v2x_polyarchy === "" ? null : +d.v2x_polyarchy,
}));

// Keep all rows for listed countries (including nulls, needed for gap detection)
const data = raw.filter(d =>
  countries.includes(d.name) &&
  !isNaN(d.year)
);

// ── Scales ────────────────────────────────────────────────────────────────────
const xScale = d3.scaleLinear()
  .domain(d3.extent(data, d => d.year))
  .range([marginLeft, width - marginRight]);

const bandHeight   = 50;
const headerHeight = 100;
const groupGap     = 70;

const height = marginTop + marginBottom
             + countries.length * bandHeight
             + regions.length * (headerHeight + groupGap);

// ── Compute y positions ───────────────────────────────────────────────────────
const yPos    = {};
const headerY = {};
let cursor = marginTop;

for (const region of regions) {
  headerY[region.label] = cursor;
  cursor += headerHeight;
  for (const country of region.countries) {
    yPos[country] = cursor + bandHeight;
    cursor += bandHeight;
  }
  cursor += groupGap;
}

// ── SVG ───────────────────────────────────────────────────────────────────────
const svg = d3.create("svg")
  .attr("width",   width)
  .attr("height",  height)
  .attr("viewBox", [0, 0, width, height])
  .attr("style",   "max-width:100%; height:auto; font:10px sans-serif;");

// ── Generators ────────────────────────────────────────────────────────────────
const yLocal = d3.scaleLinear()
  .domain([0, 1])
  .range([0, -bandHeight * overlap]);

const area = d3.area()
  .x(d => xScale(d.year))
  .y0(0)
  .y1(d => yLocal(d.value))
  .curve(d3.curveCatmullRom);

const line = d3.line()
  .x(d => xScale(d.year))
  .y(d => yLocal(d.value))
  .curve(d3.curveCatmullRom);

// ── Helper: draw x-axis at a given y position ─────────────────────────────────
function drawXAxis(parent, y) {
  parent.append("g")
    .attr("transform", `translate(0,${y})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(10).tickSizeOuter(0));
}

// ── Draw ──────────────────────────────────────────────────────────────────────
const group = svg.append("g");

for (const region of regions) {

  // separator line
  group.append("line")
    .attr("x1",               marginLeft)
    .attr("x2",               width - marginRight)
    .attr("y1",               headerY[region.label] + 10)
    .attr("y2",               headerY[region.label] + 10)
    .attr("stroke",           "#aaa")
    .attr("stroke-width",     0.8)
    .attr("stroke-dasharray", "4,3");

  // region title
  group.append("text")
    .attr("x",           marginLeft)
    .attr("y",           headerY[region.label] + headerHeight * 0.32)
    .attr("font-size",   "13px")
    .attr("font-weight", "bold")
    .attr("fill",        "#444")
    .text(region.label);

  for (const country of region.countries) {
    const allYears = data
      .filter(d => d.name === country)
      .sort((a, b) => a.year - b.year);

    const baseline = yPos[country];

    const g = group.append("g")
      .attr("transform", `translate(0,${baseline})`);

    // Split into contiguous non-null segments
    const segments = [];
    let current = [];
    for (const d of allYears) {
      if (d.value != null) {
        current.push(d);
      } else {
        if (current.length) segments.push(current);
        current = [];
      }
    }
    if (current.length) segments.push(current);

    // Draw each segment separately — no bridging across gaps
    for (const seg of segments) {
      g.append("path")
        .datum(seg)
        .attr("fill",         "black")
        .attr("fill-opacity", 0.15)
        .attr("d",            area);

      g.append("path")
        .datum(seg)
        .attr("fill",         "none")
        .attr("stroke",       "black")
        .attr("stroke-width", 1.2)
        .attr("d",            line);
    }

    // baseline rule
    g.append("line")
      .attr("x1",           marginLeft)
      .attr("x2",           width - marginRight)
      .attr("stroke",       "#ccc")
      .attr("stroke-width", 0.5);

    // country label
    g.append("text")
      .attr("x",           marginLeft - 6)
      .attr("y",           0)
      .attr("dy",          "0.35em")
      .attr("text-anchor", "end")
      .attr("font-size",   "11px")
      .attr("fill",        "#333")
      .text(country);
  }

  // x-axis after each group's last country
  const lastCountry = region.countries[region.countries.length - 1];
  drawXAxis(group, yPos[lastCountry] +20); 
}

// ── Y axis label ──────────────────────────────────────────────────────────────
svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x",           -(height / 2))
  .attr("y",           12)
  .attr("text-anchor", "middle")
  .attr("font-size",   "11px")
  .attr("fill",        "#555")
  .text("Democracy Index (v2x_polyarchy)");

// ── Append to #ridgeline-container ────────────────────────────────────────────
document.getElementById("ridgeline-container").appendChild(svg.node());