var data, margin, svg, x, y;
var data_link = 'https://dasshims.github.io/State_zhvi_uc_sfrcondo_tier.csv'
//var data_link = 'data/State_zhvi_uc_sfrcondo_tier.csv'

async function drawAxis() {
    return await drawAxis2(false)
}

async function drawAxis2(sort) {

    data = await d3.csv(data_link, function (data) {
        return data;
    });

    if (sort) {
        data = data.sort(function (a, b) {
            return d3.descending(+a.price, +b.price);
        })
    }

    // set the dimensions and margins of the graph
    margin = { top: 30, right: 60, bottom: 100, left: 70 },
        width = 960 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    //append the svg object to the body of the page
    svg = d3.select("#main_chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 40)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    x = d3.scaleBand()
        .range([0, width])
        .domain(data.map(function (d) { return d.RegionName; }))
        .padding(0.2);


    y = d3.scaleLinear()
        .domain([0, 900000])
        .range([height, 0]);

    svg.append("g")
        .attr("id", "y-axis")
        .call(d3.axisLeft(y))
        .attr("stroke", "dark grey")
        .attr("stroke-width", "2")
        .attr("opacity", ".8")
        .attr('font-family', 'Courier New');

    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .attr("stroke", "dark grey")
        .attr("stroke-width", "2")
        .attr("opacity", ".8")
        .attr('font-family', 'Courier New');

    svg.append('g')
        .attr('class', 'grid')
        .attr("opacity", ".1")
        .call(d3.axisLeft()
            .scale(y)
            .tickSize(-width, 0, 0)
            .tickFormat(''))
        .attr("stroke-dasharray", "3,3");
}

window.onload = drawAxis();

async function drawChart(year) {
    return await drawChart2(year, false)
}

async function drawChart2(year, sort) {
    data = await d3.csv(data_link, function (data) {
        return data;
    });

    console.log("Rendering Year " + year)

    data = await data.filter(function (d) {
        return d.year == year + "-12-31" && d.RegionName != "United States"
    })

    if (sort) {
        data = data.sort(function (a, b) {
            return d3.descending(+a.price, +b.price);
        })
    }

    svg.append('text')
        .attr('x', 50)
        .attr('y', -18)
        .attr("id", "year-text")
        .attr('text-anchor', 'middle')
        .style('font-family', 'Courier New')
        .style('font-size', 18)
        .style('font-weight', 400)
        .style("color", "#333333")
        .text('Year ' + getYearFromDropDown());

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "0")
        .style("visibility", "hidden")
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
        .attr("height", function (d) { return height - y(0); })
        .attr("y", function (d) { return y(0); })
        .attr("fill", function (d) { return color(d.price) });

    bars.transition()
        .duration(1000)
        .attr("height", function (d) { return height - y(d.price); })
        .attr("y", function (d) { return y(d.price); })
        .delay(function (d, i) { return (i * 20) });

    //Not working - todo
    bars
        .append('text')
        .attr('class', 'value')
        .attr("x", 100) //function (d) { return x(d.RegionName); })
        .attr("y", 100) //function (d) { return y(d.price) + 30; })
        .attr('text-anchor', 'middle')
        .text("sometext")

    bars.on("mouseover", function (d) {
        d3.select(this)
            .transition()
            .duration('50')
            .attr('opacity', '.60');
        tooltip.html("<br><strong> " + d.RegionName + ": $" + Math.trunc(d.price) + "</strong></br>")
            .style("left", d3.select(this).attr("x") + "px")
            .style("top", (d3.select(this).attr("y")) + "px")
            .style("opacity", .8);
        return tooltip.style("visibility", "visible");
    });

    bars.on("mouseout", function () {
        d3.select(this).transition()
            .duration('50')
            .attr('opacity', '1');
        return tooltip.style("visibility", "hidden");
    });

    bars.on('click', function (d) {
        // var popup = document.getElementById("side_chart");
        // popup.classList.toggle("show");
        // window.open('./side_chart.html', d.RegionName);
        window.scroll(0 , height);
        drawLineChart(d.RegionName);
        //window.open('http://en.wikipedia.org/wiki/' + d.RegionName, '_blank');
    });

    // National Average
    const avg = d3.sum(data, d => d.price) / 52;
    const nat_avg_path = svg.append("path")
        .datum(data)
        .attr("id", "nat-avg")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("transform", "translate(0,0)")
        .attr("d", d3.line()
            .x(function (d) { return x(d.RegionName); })
            .y(y(height))
        )
        .attr("stroke-width", ".5")
        .attr("opacity", "0");

    nat_avg_path.transition()
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .duration(1000)
        .attr("d", d3.line()
            .x(function (d) { return x(d.RegionName); })
            .y(y(avg))
        )
        .attr("stroke-width", "1.5")
        .attr("opacity", ".5");

    // await new Promise(r => setTimeout(r, 1000));
    // svg.append('g')
    //     .classed('labels-group', true)
    //     .selectAll('text')
    //     .data(data)
    //     .enter()
    //     .append('text')
    //     .filter(function (d, i) { return i === (data.length - 1) })
    //     .classed('label', true)
    //     .attr("id", "nat-avg-txt")
    //     .attr("x", function (d) { return +x(d.RegionName) + 15; })
    //     .attr("y", function (d) { return y(avg) + 3; })
    //     .text(function(d) {return "National avg "+d.year})

    // After drawing the bars, set events
    setEvents(year);
}

function getYearFromDropDown() {
    select = document.querySelector('#date-dropdown');
    return select.value;
}

function addYear() {
    clearBars();
    const currentYear = getYearFromDropDown();
    let prevYear = 2022
    if (currentYear < 2022) {
        prevYear = +currentYear + 1;
    } else {
        window.alert("We have data only till 2022");
    }
    let selectElement = document.getElementById('date-dropdown')
    selectElement.value = prevYear
    drawChart(selectElement.value)
    //setEvents(prevYear)
}

function subtractYear() {
    clearBars();
    const currentYear = getYearFromDropDown();
    let prevYear = 2000
    if (currentYear > 2000) {
        prevYear = +currentYear - 1;
    } else {
        window.alert("We dont have data only before 2000");
    }
    let selectElement = document.getElementById('date-dropdown')
    selectElement.value = prevYear
    drawChart(selectElement.value)
}

async function animateChart() {
    let currentYear = 2000;
    let maxYear = 2022;
    while (currentYear <= maxYear) {
        let selectElement = document.getElementById('date-dropdown')
        selectElement.value = currentYear
        d3.selectAll('svg').selectAll("#year-text").remove();
        d3.selectAll('svg').selectAll("#nat-avg").remove();
        d3.selectAll('svg').selectAll("#nat-avg-txt").remove();
        await drawChart(currentYear);
        await sleep(2000)
        currentYear += 1;
    }
}

async function setEvents(year) {
    const events = {
        2000: "Year 2000: Bursting of the Dot.com (or Technology) Bubble",
        2001: "Year 2001: September 11 Terrorist Attacks. \nEnron, the Emergence of Corporate Fraud, and Corporate Governance",
        2002: "Year 2002: Stock Market Crash, post 9/11",
        2003: "Year 2003: War on Terror and Iraq War",
        2004: "Year 2004: Real GDP grew 4.4 percent in 2004, the strongest since 1999.",
        2005: "Year 2005: China and India Grow as World Financial Powers \nHurricanes Katrina and Rita        ",
        2006: "Year 2006: Bursting of the Dot.com (or Technology) Bubble",
        2007: "Year 2007: Sub-Prime Housing Crisis and the Housing Bubble bursts",
        2008: "Year 2008: The Federal Reserve rescues some of the nation’s largest investment firms, including Bear Stearns and AIG, but allows Lehman Brothers to collapse.",
        2009: "Year 2009: The Global Recession and the Collapse of Wall Street",
        2010: "Year 2010: Congress passes the Financial Regulations Bill, aimed at preventing the risky behavior and regulatory failures that brought the economy to the brink of collapse and cost millions of Americans their jobs and savings. | Congress passes the Health Care Reform Bill, aimed at providing affordable, quality health care for all Americans.",
        2011: "Year 2011: Congress votes for and the president signs a bill authorizing an increase in the U.S. debt. ",
        2012: "Year 2012: Crisis in Venezuela. \n2012–2013 Cypriot financial crisis.\nFacebook’s IPO",
        2013: "Year 2013: September 11 Terrorist Attacks        ",
        2014: "Year 2014: Russian financial crisis",
        2015: "Year 2015: Chinese stock market crash",
        2016: "Year 2016: Brexit Vote.\nOil prices collapse        ",
        2017: "Year 2017: Price of bitcoin skyrocketed from under $800 in late 2016 to an all-time high of $19,783 in December 2017",
        2018: "Year 2018: Russian financial crisis",
        2019: "Year 2019: Chinese stock market crash",
        2020: "Year 2020: Covid hit",
        2021: "Year 2021: Vaccinations picked up and economy start to recover",
        2022: "Year 2022: Inflation and Interest Rates slows down economy"
    }

    var event_el = document.getElementById('events');
    event_el.style.overflow = 'auto';
    event_el.scrollTop = event_el.scrollHeight;
    event_el.innerHTML += '<br>' + events[year] + '</br>'
    event_el.scrollTop = event_el.scrollHeight;
    event_el.style.fontSize= 14;
    event_el.style.fontWeight= 400;
    event_el.style.fontFamily = 'Courier New';
    event_el.style.color = 'black';
}

async function loadPopulation(RegionName, popYear) {
    var pop_data = await d3.csv("https://dasshims.github.io/us_population.csv", function (data) {
        return data;
    });

    pop_data = await pop_data.filter(function (d) {
        return d.Description == RegionName && d.Year == popYear;
    })

    console.log(RegionName);
    console.log(popYear);
    console.log(pop_data.size);
    console.log(typeof pop_data);

    return pop_data[0];
}

async function sortChart() {
    clearBars()
    drawAxis2(true)
    drawChart2(document.getElementById('date-dropdown').value, true)
}

// async function populateYear() {
//     let dateDropdown = document.getElementById('date-dropdown');
//     let currentYear = 2022;
//     let earliestYear = 2000;
//     while (currentYear >= earliestYear) {
//         let dateOption = document.createElement('option');
//         dateOption.text = currentYear;
//         dateOption.value = currentYear;
//         dateDropdown.add(dateOption);
//         currentYear -= 1;
//     }
// }

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

async function clearBars() {
    d3.selectAll('svg').selectAll("rect").remove();
    d3.selectAll('svg').selectAll("#nat-avg").remove();
    d3.selectAll('svg').selectAll("#nat-avg-txt").remove();
    d3.selectAll('svg').selectAll("#year-text").remove();
}

function myFunction() {
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
}