var data, margin, svg, bx, by;
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

    margin = { top: 30, right: 0, bottom: 100, left: 70 },
        width = 960 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    svg = d3.select("#main_chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 40)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    bx = d3.scaleBand()
        .range([0, width])
        .domain(data.map(function (d) { return d.RegionName; }))
        .padding(0.2);


    by = d3.scaleLinear()
        .domain([0, 900000])
        .range([height, 0]);

    svg.append("g")
        .attr("id", "y-axis")
        .call(d3.axisLeft(by))
        .attr("stroke", "#1f00aa")
        .attr("stroke-width", "1")
        .attr("opacity", ".8")
        .attr('font-family', 'Courier New');

    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(bx))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .attr("stroke", "#006e1f")
        .attr("stroke-width", "1")
        .attr("opacity", ".8")
        .attr('font-family', 'Courier New');

    svg.append('g')
        .attr("opacity", ".1")
        .call(d3.axisLeft()
            .scale(by)
            .tickSize(-width, 0, 0)
            .tickFormat(''))
        .attr("stroke-dasharray", "3,3");

    addLegendsForBarChart();
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
        .attr("x", function (d) { return bx(d.RegionName); })
        .attr("width", bx.bandwidth())
        .style("margin-top", "20px")
        .attr("height", function (d) { return height - by(0); })
        .attr("y", function (d) { return by(0); })
        .attr("fill", function (d) { return color(d.price) });

    bars.transition()
        .duration(1000)
        .attr("height", function (d) { return height - by(d.price); })
        .attr("y", function (d) { return by(d.price); })
        .delay(function (d, i) { return (i * 20) });

    bars.append("text")
        .text(function (d) {
            return d.price;
        })
        .attr("x", function (d) {
            return bx(d.RegionName);
        })
        .attr("y", function (d) {
            return by(d.price) - 5;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("fill", "black")
        .attr("text-anchor", "middle");

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
        window.open('./line_chart.html?state='+ d.RegionName);
        //window.open('http://en.wikipedia.org/wiki/' + d.RegionName, '_blank');
    });

    // National Average
    const avg = d3.sum(data, d => d.price) / 50;
    const nat_avg_path = svg.append("path")
        .datum(data)
        .attr("id", "nat-avg")
        .attr("fill", "none")
        .attr("stroke", "#f51f1f")
        .attr("transform", "translate(0,0)")
        .attr("d", d3.line()
            .x(function (d) { return bx(d.RegionName); })
            .y(by(height))
        )
        .attr("stroke-width", ".5")
        .attr("opacity", "0");

    nat_avg_path.transition()
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .duration(1000)
        .attr("d", d3.line()
            .x(function (d) { return bx(d.RegionName); })
            .y(by(avg))
        )
        .attr("stroke-width", "1.5")
        .attr("opacity", ".5");

    // After drawing the bars, set events
    setEvents(year);
    

    // Adding annotations
    // var max = d3.max(data, function(d) { return d.price; });
    // console.log("max "+max)
    // const type = d3.annotationLabel
    // const annotations = [
    //     {
    //       note: {
    //         label: "Here is the annotation label",
    //         title: "Annotation title"
    //       },
    //       connector: {
    //         end: "arrow",        // none, or arrow or dot
    //         type: "curve",       // Line or curve
    //         points: 3,           // Number of break in the curve
    //         lineType : "horizontal"
    //       },
    //       color: ["grey"],
    //       x: 0,
    //       y: 0,
    //       dy: 70,
    //       dx: 70
    //     }
    //   ]

    // console.log("x val "+x('California'))
    // console.log("y val "+y(max))
    // const makeAnnotations = d3.annotation()
    //     .editMode(true)
    //     .type(type)
    //     .accessors({
    //         x: 150, //d => x('California'),
    //         y: 240 // => y(max)
    //     })
    //     .annotations(annotations)
    // d3.select("svg")
    //     .append("g")
    //     .attr("id", "annotations")
    //     .attr("transform", "translate(0,0)")
    //     .call(makeAnnotations)
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
        d3.selectAll('svg').selectAll('rect').remove();
        await drawChart(currentYear);
        await sleep(3000)
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
        2012: "Year 2012: Crisis in Venezuela. \n2012–2013 Cypriot financial crisis.\nFacebook IPO",
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
    event_el.innerHTML += '<br>' + events[year] + '</br> <br> </br>'
    event_el.scrollTop = event_el.scrollHeight;
    event_el.style.fontSize = 14;
    event_el.style.fontWeight = 400;
    event_el.style.fontFamily = 'Courier New';
    event_el.style.color = 'black';


    // d3.select('svg')
    // .append('text')
    //     .attr('x', 300)
    //     .attr('y', 12)
    //     .attr("class", "box")
    //     .attr("id", "year-text")
    //     .attr('text-anchor', 'left')
    //     .style('font-family', 'Courier New')
    //     .style('font-size', 16)
    //     .style('font-weight', 200)
    //     .style('overflow-wrap', 'break-word')
    //     .style("color", "#333333")
    //     .text(events[year]);
}

async function loadPopulation(RegionName, popYear) {
    var pop_data = await d3.csv("https://dasshims.github.io/us_population.csv", function (data) {
        return data;
    });

    pop_data = await pop_data.filter(function (d) {
        return d.Description == RegionName && d.Year == popYear;
    })
    return pop_data[0];
}

async function sortChart() {
    clearBars()
    drawAxis2(true)
    drawChart2(document.getElementById('date-dropdown').value, true)
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

async function clearBars() {
    d3.selectAll('svg').selectAll("rect").remove();
    d3.selectAll('svg').selectAll("#nat-avg").remove();
    d3.selectAll('svg').selectAll("#nat-avg-txt").remove();
    d3.selectAll('svg').selectAll("#year-text").remove();
    d3.selectAll('svg').selectAll("#annotations").remove();
}

// async function addAnnotations() {
    
// }


async function addLegendsForBarChart(){
    const innerHtml = "<br><strong> Legends:  </strong>"
    + "<p style='color: #006e1f'> <strong>all US states plotted -> x-axis"
    + "<p style='color: #1f00aa'>price in US Dollars plotted -> y-axis"
    + "<p style='color: steelblue'>Each bar represents a US State"
    + "<p style='color: f51f1f'> The red line represents National Average for that year</strong></p>"
    + "<br> Click on the bars to dril down on Each state"
    + "<br> Data Source: <a href='https://www.zillow.com/research/data/'>Zillow Research</a>"
    
    d3.select("#main_chart_body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "0")
        .style("visibility", "visible")
        .html(innerHtml)
            .style("right", width - 600)
            .style("top", height + 250)
            .style('font-family', 'Courier New')
            .style('text-align', 'right')
            .style('font-size', 15)
            .style("opacity", .8);
}