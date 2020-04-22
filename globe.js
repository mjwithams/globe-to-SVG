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

// Queue import of datasources
queue()
    .defer(d3.json, "countries-paths.json")
    .defer(d3.csv, "countries-selector.csv")
    .await(ready);

// Main function
function ready(error, world, countryData) {

    var countryById = {},
    countries = topojson.feature(world, world.objects.countries).features;

    //Add countries to selector
    countryList.append("option"); // blank
    countryData.forEach(function(d) {
      countryById[d.ADM0_A3] = d.ADMIN;
      option = countryList.append("option");
      option.text(d.ADMIN);
      option.property("value", d.ADM0_A3);
    });

    //Draw countries on the globe
    var world = g.selectAll("path.land")
        .data(countries)
        .enter().append("path")
        .attr("class", "land")
        .attr("d", path)

        //Drag event
        .call(d3.drag()
            .subject(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
            .on("drag", function() {
                var rotate = projection.rotate();
                projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
                g.selectAll("path.land").attr("d", path);
                g.selectAll(".focused").classed("focused", focused = false);
         }))

        //Mouse events
        .on("click", function (d) {
            var rotate = projection.rotate(),
                p = d3.geoCentroid(d);
            g.selectAll(".focused").classed("focused", focused = false);
            //Globe rotating
            d3.transition()
                .duration(750)
                .tween("rotate", function() {
                    var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
                    return function(t) {
                        projection.rotate(r(t));
                        g.selectAll("path").attr("d", path)
                        .classed("focused", function(n, i) { return n == d ? focused = n : false; });
                    };
                })
            }
        )
        .on("mouseover", function(d) {
            countryTooltip.text(d.properties.ADMIN)
            .style("left", (d3.event.pageX + 7) + "px")
            .style("top", (d3.event.pageY - 15) + "px")
            .style("display", "block")
            .style("opacity", 1);
        })
        .on("mouseout", function(d) {
            countryTooltip.style("opacity", 0)
            .style("display", "none");
        })
        .on("mousemove", function(d) {
            countryTooltip.style("left", (d3.event.pageX + 7) + "px")
            .style("top", (d3.event.pageY - 15) + "px");
        });

    //Country focus on option select
    d3.select("select").on("change", function() {

      var rotate = projection.rotate(),
      focusedCountry = country(countries, this),
      p = d3.geoCentroid(focusedCountry);
      g.selectAll(".focused").classed("focused", focused = false);
        
        // Rotate globe
        d3.transition()
            .duration(1500)
            .tween("rotate", function() {
                var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
                return function(t) {
                  projection.rotate(r(t));
                  g.selectAll("path").attr("d", path)
                  .classed("focused", function(d, i) { return d == focusedCountry ? focused = d : false; });
                };
            });    
    });

    function country(cnt, sel) { 
      for(var i = 0, l = cnt.length; i < l; i++) {
        if(cnt[i].properties.ADM0_A3 == sel.value) {return cnt[i];}
      }
    };
};
