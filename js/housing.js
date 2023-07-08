
var data, margin, svg, x, y;

async function drawAxis() {
    return await drawAxis2(false)
}

async function drawAxis2(sort) {

    data = await d3.csv("https://dasshims.github.io/State_time_series_edited", function (data) {
        return data;
    });

    if (sort) {
        data = data.sort(function (a, b) {
            console.log("sortin")
            return d3.descending(+a.ZHVI_SingleFamilyResidence, +b.ZHVI_SingleFamilyResidence);
        })
    }

    // set the dimensions and margins of the graph
    margin = { top: 30, right: 30, bottom: 70, left: 60 },
        width = 960 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    //append the svg object to the body of the page
    svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    x = d3.scaleBand()
        .range([0, width])
        .domain(data.map(function (d) { return d.RegionName; }))
        .padding(0.2);


    y = d3.scaleLinear()
        .domain([0, 800000])
        .range([height, 0]);

    svg.append("g")
        .attr("id", "y-axis")
        .call(d3.axisLeft(y))
        .attr("stroke", "#E04836")
        .attr("stroke-width", "1")
        .attr("opacity", ".8");

    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .attr("stroke", "#E04836")
        .attr("stroke-width", "1")
        .attr("opacity", ".8");
}

window.onload = drawAxis();

async function drawChart(year) {
    return await drawChart2(year, false)
}

async function drawChart2(year, sort) {

    data = await d3.csv("https://dasshims.github.io/State_time_series_edited", function (data) {
        return data;
    });

    console.log("Rendering Year " + year)

    data = await data.filter(function (d) {
        return d.Date == year + "-12-31" && d.RegionName != "United States"
    })

    if (sort) {
        data = data.sort(function (a, b) {
            console.log("sortin")
            return d3.descending(+a.ZHVI_SingleFamilyResidence, +b.ZHVI_SingleFamilyResidence);
        })
    }

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

    var bars = svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("id", "rect")
        .attr("x", function (d) { return x(d.RegionName); })
        .attr("width", x.bandwidth())
        .style("margin-top", "20px")
        .attr("height", function (d) { return height - y(0); }) // always equal to 0
        .attr("y", function (d) { return y(0); })
        .attr("fill", function (d) { return color(d.ZHVI_SingleFamilyResidence) });

    bars.transition()
        .duration(1000)
        .attr("height", function (d) { return height - y(d.ZHVI_SingleFamilyResidence); })
        .attr("y", function (d) { return y(d.ZHVI_SingleFamilyResidence); })
        .delay(function (d, i) { return (i * 10) });

    bars.on("mousemove", function (d) {
        d3.select(this).transition()
            .duration('50')
            .attr('opacity', '.60');
        tooltip.html("<br><strong> " + d.RegionName + "</strong> has population <strong>" + loadPopulation(d.RegionName, year).Total_Population + "</strong>"
            +" in the year <strong>" +year+"</string></br>"+
            + "<br> With Male population of <strong>" + loadPopulation(d.RegionName, year).Male_Population + "</strong>"
            + " And female population of <strong>" + loadPopulation(d.RegionName, year).Female_Population + "</strong></br>")
            .style('top', d3.event.pageY - 12 + 'px')
            .style('left', d3.event.pageX + 25 + 'px')
            .style("opacity", 1);
        return tooltip.style("visibility", "visible");
    });

    bars.on("mouseout", function () {
        d3.select(this).transition()
            .duration('50')
            .attr('opacity', '1');
        return tooltip.style("visibility", "hidden");
    });

    bars.exit().remove();

}

function getYearFromDropDown() {
    select = document.querySelector('#date-dropdown');
    return select.value;
}

function addYear() {
    const currentYear = getYearFromDropDown();
    let prevYear = 2017
    if (currentYear < 2017) {
        prevYear = +currentYear + 1;
    } else {
        window.alert("We have data only till 2017");
    }
    let selectElement = document.getElementById('date-dropdown')
    selectElement.value = prevYear
    drawChart(selectElement.value)
}

function subtractYear() {
    const currentYear = getYearFromDropDown();
    let prevYear = 2000
    if (currentYear > 2000) {
        prevYear = +currentYear - 1;
    } else {
        window.alert("We dont have data only before 1996");
    }
    let selectElement = document.getElementById('date-dropdown')
    selectElement.value = prevYear
    drawChart(selectElement.value)
}

async function animateChart() {
    let currentYear = 2000;
    let maxYear = 2017;
    while (currentYear <= maxYear) {
        let selectElement = document.getElementById('date-dropdown')
        selectElement.value = currentYear
        await drawChart(currentYear);
        await sleep(3000)
        currentYear += 1;
    }
}

async function loadPopulation(RegionName, popYear) {
    var pop_data = await d3.csv("https://dasshims.github.io/us_population.csv", function (data) {
        return data;
    });

    pop_data = await pop_data.filter(function (d) {
        return d.Description == RegionName && d.Year == popYear;
    })

    console.log(pop_data);

    return pop_data;
}

async function sortChart() {
    svg.selectAll("*").remove();
    drawAxis2(true)
    drawChart2(document.getElementById('date-dropdown').value, true)
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
