async function drawChart(year) {

    d3.selectAll("svg > *").remove();

    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 30, bottom: 70, left: 60 },
        width = 960 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    //append the svg object to the body of the page
    var svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var data = await d3.csv("https://dasshims.github.io/State_time_series.csv", function (data) {
        return {
            Date: data.Date,
            RegionName: data.RegionName,
            MedianListingPrice_AllHomes: data.MedianListingPrice_AllHomes
        };
    });

    //const year = await getYearFromDropDown();
    console.log("Rendering Year " + year)

    data = await data.filter(function (d) { console.log("filtering"); return d.Date == year + "-12-31" })

    var x = d3.scaleBand()
        .range([0, width])
        .domain(data.map(function (d) { return d.RegionName; }))
        .padding(0.2);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 700000])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background", "White")
        .style("boarder", "black")
        .text("a simple tooltip");

    const color = d3.scaleSequential()
        .domain([0, 700000])
        .interpolator(d3.interpolateBlues);

    // Bars
    var bars = svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d.RegionName); })
        .attr("y", height - margin.bottom)
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(d.MedianListingPrice_AllHomes); })
        .attr("fill", function(d) { return color(d.MedianListingPrice_AllHomes)});

    bars.transition()
        .duration(2000)
        .attr("y", function (d) { return y(d.MedianListingPrice_AllHomes); });

    bars.on("mouseover", function (d) {
        d3.select(this).transition()
            .duration('50')
            .attr('opacity', '.60');
        tooltip.text(d.RegionName + " : $" + d.MedianListingPrice_AllHomes);
        tooltip.style("left", d3.select(this).attr("x") + "px")
        tooltip.style("top", d3.select(this).attr("y") + "px")
        return tooltip.style("visibility", "visible");
    });

    bars.on("mouseout", function () {
        d3.select(this).transition()
            .duration('50')
            .attr('opacity', '1');
        return tooltip.style("visibility", "hidden");
    });

}

function getYearFromDropDown() {
    select = document.querySelector('#date-dropdown');
    return select.value;
}

function addYear() {
    console.log(getYearFromDropDown())
    const prevYear = getYearFromDropDown() + 1;
    let selectElement = document.getElementById('date-dropdown')
    selectElement.value = prevYear
    drawChart(selectElement.value)
}

function subtractYear() {
    console.log(getYearFromDropDown())
    const prevYear = getYearFromDropDown() - 1;
    let selectElement = document.getElementById('date-dropdown')
    selectElement.value = prevYear
    drawChart(selectElement.value)
}