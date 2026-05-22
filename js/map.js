import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { feature, mesh } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";


// ── Legend ────────────────────────────────────────────────────────────────────

function ramp(color, n = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = n;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = color(i / (n - 1));
    ctx.fillRect(i, 0, 1, 1);
  }
  return canvas;
}

function Legend(color, { title, tickSize = 6, width = 320, tickFormat, tickValues } = {}) {
  const marginTop = 18, marginRight = 0, marginLeft = 0;
  const marginBottom = 16 + tickSize;
  const height = 44 + tickSize;

  const svg = d3.create("svg")
    .attr("width", width).attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible").style("display", "block");

  // Gradient image
  svg.append("image")
    .attr("x", marginLeft).attr("y", marginTop)
    .attr("width", width - marginLeft - marginRight)
    .attr("height", height - marginTop - marginBottom)
    .attr("preserveAspectRatio", "none")
    .attr("href", ramp(color.interpolator
      ? color.interpolator()
      : d3.scaleSequential([0, 1], d3.interpolateRgbBasis(color.range()))).toDataURL());

  // Axis
  const xScale = d3.scaleLinear().domain(color.domain()).range([marginLeft, width - marginRight]);

  svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(xScale).tickSize(tickSize).tickValues(tickValues))
    .call(g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick text")
      .text(d => typeof tickFormat === "function" ? tickFormat(d) : d))
    .call(g => g.append("text")
      .attr("x", width / 2).attr("y", marginTop + marginBottom - height - 6)
      .attr("fill", "currentColor").attr("text-anchor", "middle")
      .attr("font-weight", "bold").text(title));

  return svg.node();
}


// ── Country name aliases ──────────────────────────────────────────────────────
// Maps your CSV country_name values → TopoJSON names
const rename = new Map([
  ["Bosnia and Herzegovina",           "Bosnia and Herz."],
  ["Central African Republic",         "Central African Rep."],
  ["Democratic Republic of the Congo", "Dem. Rep. Congo"],
  ["Dominican Republic",               "Dominican Rep."],
  ["Equatorial Guinea",                "Eq. Guinea"],
  ["Eswatini",                         "eSwatini"],
  ["Ivory Coast",                      "Côte d'Ivoire"],
  ["Laos",                             "Laos"],
  ["North Korea",                      "North Korea"],
  ["North Macedonia",                  "Macedonia"],
  ["Republic of the Congo",            "Congo"],
  ["Sao Tome and Principe",            "São Tomé and Principe"],
  ["Solomon Islands",                  "Solomon Is."],
  ["South Korea",                      "South Korea"],
  ["South Sudan",                      "S. Sudan"],
  ["United States of America",         "United States of America"],
  ["Tanzania",                         "Tanzania"],
  ["Russia",                           "Russia"],
  ["Venezuela",                        "Venezuela"],
  ["Vietnam",                          "Vietnam"],
  ["Czechia",                    "Czechia"],
  ["Türkiye",                    "Turkey"],
  ["Burma/Myanmar",                "Myanmar"],
  ["Republic of Vietnam",            "Vietnam"],
  ["Greenland",                    "Denmark"],
  ["The Gambia",                    "Gambia"],
  ["Puerto Rico",                    "United States of America"],
  ["W. Sahara",                    "Western Sahara"],
  


]);


// ── Data ──────────────────────────────────────────────────────────────────────

const raw = (await d3.csv("data/all_continents.csv")).map(d => ({
  name:  rename.get(d.country_name) || d.country_name,  // ← column is country_name
  year:  +d.year,
  value: +d.v2x_polyarchy                               // ← column is v2x_polyarchy
}));

// Index by year → Map(country → value) for fast lookups
const dataByYear = new Map();
for (const [year, rows] of d3.group(raw, d => d.year)) {
  dataByYear.set(year, new Map(rows.map(d => [d.name, d.value])));
}


// ── World topology ────────────────────────────────────────────────────────────

const world       = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
const countries   = feature(world, world.objects.countries);
const countrymesh = mesh(world, world.objects.countries, (a, b) => a !== b);


// ── Map setup ─────────────────────────────────────────────────────────────────

const width     = 928;
const marginTop = 70;
const height    = width / 2 + marginTop;

const projection = d3.geoEqualEarth()
  .fitExtent([[2, marginTop + 2], [width - 2, height]], {type: "Sphere"});
const path = d3.geoPath(projection);

// 0 = autocracy (black), 1 = democracy (white)
const color = d3.scaleSequential([0, 1], d3.interpolateRgb("black", "white"));


// ── SVG ───────────────────────────────────────────────────────────────────────

const svg = d3.create("svg")
  .attr("width", width).attr("height", height)
  .attr("viewBox", [0, 0, width, height])
  .attr("style", "max-width: 100%; height: auto;");

// ── No-data pattern (black diagonal stripes over white) ───────────────────────
const defs = svg.append("defs");

const pattern = defs.append("pattern")
  .attr("id",                "stripes")
  .attr("width",             3)          // ← was 1
  .attr("height",            3)          // ← was 1
  .attr("patternUnits",      "userSpaceOnUse")
  .attr("patternTransform",  "rotate(45)");

// White background — needs explicit width and height
pattern.append("rect")
  .attr("width",  3)                     // ← was missing
  .attr("height", 3)                     // ← was missing
  .attr("fill",   "#ffffff");

// Black stripe — needs x position at 0
pattern.append("rect")
  .attr("x",      0)                     // ← was missing
  .attr("y",      0)                     // ← was missing
  .attr("width",  1)                     // stripe thickness
  .attr("height", 6)
  .attr("fill",   "black");

// Legend — centered in the SVG
svg.append("g")
  .attr("transform", `translate(${(width - 260) / 2},0)`)
  .append(() => Legend(color, {
    title: "Democracy index",
    width: 260,
    tickValues: [0, 0.25, 0.5, 0.75, 1],
    tickFormat: d => d === 0 ? "Autocracy" : d === 1 ? "Democracy" : d,
  }));

// Globe background
svg.append("path")
  .datum({type: "Sphere"})
  .attr("fill", "white").attr("stroke", "currentColor").attr("d", path);

// Country fills — kept in variable so update() can recolor them
const countryPaths = svg.append("g")
  .selectAll("path")
  .data(countries.features)
  .join("path")
  .attr("d", path);

// Country borders
svg.append("path")
  .datum(countrymesh)
  .attr("fill", "none").attr("stroke", "white").attr("d", path);

document.getElementById("container").appendChild(svg.node());


// ── Update ────────────────────────────────────────────────────────────────────

function update(year) {
  const valuemap = dataByYear.get(year) ?? new Map();
  countryPaths
    .attr("fill", d => {
      const val = valuemap.get(d.properties.name);
      return val != null ? color(val) : "url(#stripes)";
    })
    .select("title").remove();
  countryPaths.append("title")
    .text(d => {
      const val = valuemap.get(d.properties.name);
      return `${d.properties.name}\n${val ?? "N/A"}`;
    });
}


// ── Slider ────────────────────────────────────────────────────────────────────

const slider  = document.getElementById("year-slider");
const tooltip = document.getElementById("year-tooltip");

function updateTooltipPosition() {
  const pct = (+slider.value - +slider.min) / (+slider.max - +slider.min);
  const offset = pct * (slider.offsetWidth - 16) + 8;
  tooltip.style.left = `${offset}px`;
  tooltip.textContent = slider.value;
}

slider.addEventListener("input", () => {
  update(+slider.value);
  updateTooltipPosition();
});

update(1900);
updateTooltipPosition();
window.addEventListener("resize", updateTooltipPosition);