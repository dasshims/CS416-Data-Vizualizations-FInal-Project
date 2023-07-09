
var data, margin, svg, x, y;
var data_link = 'https://dasshims.github.io/State_time_series_edited'
//var data_link = 'https://dasshims.github.io/State_zhvi_uc_sfrcondo_tier.csv'

async function drawAxis() {
    return await drawAxis2(false)
}

async function drawAxis2(sort) {

    data = await d3.csv(data_link, function (data) {
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
        .attr("stroke", "dark grey")
        .attr("stroke-width", "2")
        .attr("opacity", ".8");

    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .attr("stroke", "dark grey")
        .attr("stroke-width", "2")
        .attr("opacity", ".8");
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
        d3.select(this)
            .transition()
            .duration('50')
            .attr('opacity', '.60');
        tooltip.html("<br><strong> " + d.RegionName + "</strong> click to open wiki!!</br>")
            .style('top', d3.event.pageY - 12 + 'px')
            .style('left', d3.event.pageX + 25 + 'px')
            .style("opacity", 0);
        return tooltip.style("visibility", "visible");
    });

    bars.on("mouseout", function () {
        d3.select(this).transition()
            .duration('50')
            .attr('opacity', '1');
        return tooltip.style("visibility", "hidden");
    });

    bars.on('click', function (d) {
        console.log('open tab')
        window.open('http://en.wikipedia.org/wiki/' + d.RegionName, '_blank');
    });

    bars.exit().remove();

}

function getYearFromDropDown() {
    select = document.querySelector('#date-dropdown');
    return select.value;
}

function addYear() {
    svg.selectAll("rect").remove();
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
    setEvents(prevYear)
}

function subtractYear() {
    svg.selectAll("rect").remove();
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
    setEvents(prevYear)
}

async function animateChart() {
    let currentYear = 2000;
    let maxYear = 2017;
    while (currentYear <= maxYear) {
        let selectElement = document.getElementById('date-dropdown')
        selectElement.value = currentYear
        d3.selectAll("svg").select("rect").remove();
        await drawChart(currentYear);
        await setEvents(currentYear)
        await sleep(2000)
        currentYear += 1;
    }
}

async function setEvents(year){
    const events = {
        2000: "Year 2000: Bursting of the Dot.com (or Technology) Bubble",
        2001: "Year 2001: September 11 Terrorist Attacks. \nEnron, the Emergence of Corporate Fraud, and Corporate Governance",
        2002: "Year 2001: Stock Market Crash, post 9/11",
        2003: "Year 2003: War on Terror and Iraq War",
        2004: "Year 2004: Real GDP grew 4.4 percent in 2004, the strongest since 1999.",
        2005: "Year 2005: China and India Grow as World Financial Powers \nHurricanes Katrina and Rita        ",
        2006: "Year 2006: Bursting of the Dot.com (or Technology) Bubble",
        2007: "Year 2007: Sub-Prime Housing Crisis and the Housing Bubble",
        2008: "Year 2008: Bernard Madoff and the Biggest Ponzi Scheme in History        ",
        2009: "Year 2009: The Global Recession and the Collapse of Wall Street",
        2010: "Year 2001: September 11 Terrorist Attacks        ",
        2011: "Year 2001: Enron, the Emergence of Corporate Fraud, and Corporate Governance",
        2012: "Year 2012: Crisis in Venezuela. \n2012–2013 Cypriot financial crisis      ",
        //2013: "Year 2001: September 11 Terrorist Attacks        ",
        2014: "Year 2014: Russian financial crisis",
        2015: "Year 2015: Chinese stock market crash",
        2016: "Year 2016: Brexit Vote",
        2017: "Year 2007: Enron, the Emergence of Corporate Fraud, and Corporate Governance",
    }

    var event_el = document.getElementById('events');
        setTimeout(() => {
            event_el.innerHTML = "<strong>" + events[year] + "</strong>"
            console.log("animating tedxt")
            event_el.classList.add('animate-text')
          }, 10);
        event_el.innerText = ""
        event_el.classList.remove('animate-text')
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
    svg.selectAll("*").remove();
    drawAxis2(true)
    drawChart2(document.getElementById('date-dropdown').value, true)
}

async function populateYear() {
    let dateDropdown = document.getElementById('date-dropdown');
    let currentYear = 2017;
    let earliestYear = 2000;
    while (currentYear >= earliestYear) {
        let dateOption = document.createElement('option');
        dateOption.text = currentYear;
        dateOption.value = currentYear;
        dateDropdown.add(dateOption);
        currentYear -= 1;
    }
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
