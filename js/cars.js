async function load() {
    const data = await d3.csv("https://flunky.github.io/cars2017.csv");

    var xlog = d3.scaleLog()
        .domain([10, 150])
        .range([0, 200]);

    var ylog = d3.scaleLog()
        .domain([10, 150])
        .range([200, 0]);

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background", "White")
        .style("boarder", "black")
        .text("a simple tooltip");

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(50,50)")
        .selectAll("p")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return xlog(d.AverageCityMPG); })
        .attr("cy", function (d) { return ylog(d.AverageHighwayMPG); })
        .attr("r", function (d) { return +d.EngineCylinders + 2; })
        .attr("fill", "cyan")
        .on("mouseover", function (d) {
            tooltip.text("MPG :" + d.AverageCityMPG + "\nMake :" + d.Make + "\nCylinders :" + d.EngineCylinders);
            tooltip.style("left", d3.select(this).attr("cx") + "px")
            tooltip.style("top", d3.select(this).attr("cy") + "px")
            return tooltip.style("visibility", "visible");
        })
        .on("mouseout", function () {//d3.select(this).style("fill", "cyan");
            return tooltip.style("visibility", "hidden");
        });

    var y = d3.scaleLog().domain([10, 150]).range([200, 0]);
    var y_axis = d3
        .axisLeft(y)
        .tickValues([10, 20, 50, 100])
        .tickFormat(d3.format('~s'));;

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(50,50)")
        .attr("fill", "none")
        .attr("font-size", "10")
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "end")
        .call(y_axis);

    var x = d3.scaleLog().domain([10, 150]).range([0, 200]);
    var x_axis = d3
        .axisBottom(x)
        .tickValues([10, 20, 50, 100])
        .tickFormat(d3.format('~s'));

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(50,250)")
        .attr("fill", "none")
        .attr("font-size", "10")
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "middle")
        .call(x_axis);

}
