// Define a D3 projection
var projection = d3.geoOrthographic()
    .rotate([0, 0])
    .translate([width / 2, height / 2])
    .clipAngle(90);

// Define path from projection
var path = d3.geoPath()
    .projection(projection);

// Create tooltip for country mouseovers
var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip");

// Create country selector dropdown
var countryList = d3.select("body").append("select").attr("name", "countries");

// Create SVG container
var svg = d3.select("body").append("svg");
svg
  .attr("width", width)
  .attr("height", height);
var g = svg.append("g");

// Add water
g.append("path")
  .datum({type: "Sphere"})
  .attr("class", "water")
  .attr("d", path);
