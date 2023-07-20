var data, margin, svg, lx, ly, region_name;
var data_link = 'https://dasshims.github.io/State_zhvi_uc_sfrcondo_tier.csv'

region_name = (new URL(document.location)).searchParams.get("state");

async function drawAxisForLineChart(region_name) {
    console.log("Inside drawAxisForLineChart. RegionName :" + region_name)

    margin = { top: 30, right: 100, bottom: 100, left: 70 },
        width = 960 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    data = await d3.csv(data_link, function (d) {
        return { date: d3.timeParse("%Y-%m-%d")(d.year), value: d.price, RegionName: d.RegionName, year: d.year }
    });

    data = await data.filter(function (d) {
        return d.RegionName == region_name && JSON.stringify(d.year).substring(6, 11) == '12-31'
    })

    data = data = data.sort(function (a, b) {
        return d3.ascending(a.date, b.date);
    })

    console.log(data)

    svg = d3.select("#side_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right + 100)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    svg.append('text')
        .attr('x', 200)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Courier New')
        .style('font-size', 20)
        .style("color", "#333333")
        .text('Price chart over the years');

    lx = d3.scaleTime()
        .domain(d3.extent(data, function (d) { return d.date; }))
        .range([0, width + 10]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(lx))
        .attr("stroke-width", "1")
        .style("text-anchor", "centre")
        .attr("stroke", "#006e1f")
        .attr("opacity", ".8")
        .attr('font-family', 'Courier New');

    ly = d3.scaleLinear()
        .domain([0, 900000])
        .range([height, 10]);
    svg.append("g")
        .call(d3.axisLeft(ly))
        .attr("stroke-width", "1")
        .style("text-anchor", "end")
        .attr("stroke", "#1f00aa")
        .attr("opacity", ".8")
        .attr('font-family', 'Courier New');

    svg.append('g')
        .attr("opacity", ".1")
        .call(d3.axisLeft()
            .scale(ly)
            .tickSize(-width, 0, 0)
            .tickFormat(''))
        .attr("stroke-dasharray", "3,3");


    addLegendsForLineChart()
}


window.onload = drawAxisForLineChart(region_name); console.log(svg); drawLineChart(region_name)

async function drawLineChart(region_name) {
    console.log("Inside drawLineChart. RegionName :" + region_name)

    if (region_name == 'ALL') {
        drawAllStates()
    }

    var data = await d3.csv(data_link, function (d) {
        return { date: d3.timeParse("%Y-%m-%d")(d.year), value: d.price, RegionName: d.RegionName, year: d.year }
    });

    data = await data.filter(function (d) {
        return d.RegionName == region_name && JSON.stringify(d.year).substring(6, 11) == '12-31'
    })

    data = data = data.sort(function (a, b) {
        return d3.ascending(a.date, b.date);
    })

    lx = d3.scaleTime()
        .domain(d3.extent(data, function (d) { return d.date; }))
        .range([0, width + 10]);

    ly = d3.scaleLinear()
        .domain([0, 900000])
        .range([height, 10]);

    var paths = svg.append("path")
        .datum(data)
        .attr("id", "line-chart")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("transform", "translate(0,0)")
        .attr("d", d3.line()
            .x(function (d) { return lx(d.date) })
            .y(function (d) { return ly(d.value) })
        )
        .attr("stroke-width", "2")
        .attr("opacity", ".8");;

    const length = paths.node().getTotalLength();

    paths.attr("stroke-dasharray", length + " " + length)
        .attr("stroke-dashoffset", length)
        .transition()
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .duration(3000)
        .style("stroke", "steelblue");

    var dots = svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("id", "line-chart-dots")
        .attr("cx", function (d) { return lx(d.date); })
        .attr("cy", height);

    dots.transition()
        .duration(3000)
        .attr("cx", function (d) { return lx(d.date); })
        .attr("cy", function (d) { return ly(d.value); })
        .attr("r", 2)
        .attr("transform", "translate(0,0)")
        .style("fill", "#CC0000")
        .delay(function (d, i) { return (i * 20) });

    await new Promise(r => setTimeout(r, 3000));

    svg.append('g')
        .classed('labels-group', true)
        .selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .classed('label', true)
        .attr("id", "annotations")
        .attr("x", function (d) { return lx(d.date) + 5; })
        .attr("y", function (d) {
            if (d.date.getFullYear() == 2022) {
                console.log("data value for " + ly(d.value) + " " + ly(d.value));
            }
            return ly(d.value) - 5;
        })
        .text(function (d, i) {
            const curr_year = d.date.getFullYear()
            // if (curr_year == 2008) {
            //     return '2008 Housing crisis'
            // } else if (curr_year == 2020) {
            //     return 'Covid Housing crisis '
            // } else 
            if (curr_year == 2022) {
                return region_name
            }
        })
        .attr("transform", "translate(0,0)")


    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "0")
        .style("visibility", "hidden")
        .style("boarder", "black")
        .text("a simple tooltip");

    paths.on("mouseover", function (d, i) {
        d3.select(this)
            .transition()
            .duration('50')
            .attr('opacity', '.60');
        tooltip.html("<br><strong> " + d[0].price + "</strong></br>")
            .style('top', d3.event.pageY + 12 + 'px')
            .style('left', d3.event.pageX + 25 + 'px')
            .style("opacity", .8);
        return tooltip.style("visibility", "visible");
    });

    paths.on("mouseout", function () {
        d3.select(this).transition()
            .duration('50')
            .attr('opacity', 1);
        return tooltip.style("visibility", "hidden");
    });

    //Add annotations
    const type = d3.annotationLabel

    const annotations = [{
        note: {
            label: "Housing market slows down after Sub-Prime Housing Crisis",
            bgPadding: 20,
            title: "2008"
        },
        //can use x, y directly instead of data
        data: { date: "2008-12-31", close: 185.02 },
        className: "show-bg",
        // x: 100,
        y: 50,
        dy: 100,
        dx: 100
        // dy: 137,
        // dx: 162
    }]

    const parseTime = d3.timeParse("%Y-%m-%d")
    const timeFormat = d3.timeFormat("%d-%b-%y")

    const makeAnnotations = d3.annotation()
        .editMode(true)
        .notePadding(15)
        .type(type)
        .accessors({
            x: function (d) { console.log(lx(parseTime('2008-12-31'))); return lx(parseTime('2008-12-31')) },
            y: 50 // function(d) { console.log(d.price); console.log(y(d.price)); return y(d.price)}
        })
        .annotations(annotations)

    // svg
    //     .append("g")
    //     .call(makeAnnotations)

    // const makeAnnotations = d3.annotation()
    //     .editMode(true)
    //     //also can set and override in the note.padding property
    //     //of the annotation object
    //     .notePadding(15)
    //     .type(type)
    //     //accessors & accessorsInverse not needed
    //     //if using x, y in annotations JSON
    //     .accessors({
    //         x: d => x(parseTime(d.date)),
    //         y: d => y(d.close)
    //     })
    //     .accessorsInverse({
    //         date: d => timeFormat(x.invert(d.x)),
    //         close: d => y.invert(d.y)
    //     })
    //     .annotations(annotations)

    //     .append("g")
    //     .attr("class", "annotation-group")
    //     .call(makeAnnotations)
}

async function clearLineChart() {
    d3.selectAll('svg').selectAll("#line-chart").remove();
    d3.selectAll('svg').selectAll("#line-chart-dots").remove();
    d3.selectAll('svg').selectAll("#annotations").remove();
    // d3.selectAll('svg').selectAll("#nat-avg-txt").remove();
    // d3.selectAll('svg').selectAll("#year-text").remove();
}

async function addButtonAndText(svg) {

    svg.append('text')
        .attr('x', 200)
        .attr('y', -10)
        .attr('id', 'year-text')
        .attr('text-anchor', 'middle')
        .style('font-family', 'Courier New')
        .style('font-size', 20)
        .style("color", "#333333")
        .text('Price chart over the years');

    console.log(document.getElementById("populate-state-button").svg)
    document.getElementById("populate-state-button").svg

}

async function addLegendsForLineChart() {
    const innerHtml = "<br><strong> Legends:  </strong>"
        + "<p style='color: #006e1f'> <strong>Years from 2000 to 2022 -> x-axis"
        + "<p style='color: #1f00aa'>price in US Dollars plotted -> y-axis"
        + "<p style='color: f51f1f'>Each red dot represents a year mark </p>"
        + "<br> Data Source: <a href='https://www.zillow.com/research/data/'>Zillow Research</a>"
    d3.select("#line_chart_body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "0")
        .style("visibility", "visible")
        .html(innerHtml)
        .style("right", width + margin.right)
        .style("top", height + 250)
        .style('font-family', 'Courier New')
        .style('text-align', 'right')
        .style('font-size', 15)
        .style("opacity", .8);
}

function getStateFromDropDown() {
    let selectElement = document.getElementById('state-dropdown')
    return selectElement.value;
}

async function drawAllStates() {

    const states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']

    states.forEach(async state => {
        clearLineChart();
        await drawLineChart(state);
    })

}