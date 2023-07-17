//var data_link = 'data/State_zhvi_uc_sfrcondo_tier.csv'
var data_link = 'https://dasshims.github.io/State_zhvi_uc_sfrcondo_tier.csv'

async function drawLineChart(region_name) {
    console.log("Inside drawLineChart. RegionName :" + region_name)

    margin = { top: 30, right: 60, bottom: 100, left: 70 },
        width = 960 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#side_chart")
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

    //var data = await d3.csv("https://dasshims.github.io/State_zhvi_uc_sfrcondo_tier.csv", function (d) {
    var data = await d3.csv(data_link, function (d) {
        return { date: d3.timeParse("%Y-%m-%d")(d.year), value: d.price, RegionName: d.RegionName, year: d.year }
    });

    data = await data.filter(function (d) {
        return d.RegionName == region_name && JSON.stringify(d.year).substring(6, 11) == '12-31'
    })

    data = data = data.sort(function (a, b) {
        return d3.ascending(a.date, b.date);
    })

    const x = d3.scaleTime()
        .domain(d3.extent(data, function (d) { return d.date; }))
        .range([0, width + 10]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .attr("stroke-width", "2")
        .style("text-anchor", "centre")
        .attr("stroke", "dark grey")
        .attr("opacity", ".8")
        .attr('font-family', 'Courier New');

    const y = d3.scaleLinear()
        .domain([0, 900000])
        .range([height, 10]);
    svg.append("g")
        .call(d3.axisLeft(y))
        .attr("stroke-width", "2")
        .style("text-anchor", "end")
        .attr("stroke", "dark grey")
        .attr("opacity", ".8")
        .attr('font-family', 'Courier New');

    // Todo
    // svg.append('text')
    //     .attr('x', (height / 2) - margin)
    //     .attr('y', margin / 2.4)
    //     .attr('transform', 'rotate(-90)')
    //     .attr('text-anchor', 'middle')
    //     .text('Avg price in $ ->)')

    // svg.append('text')
    //     .attr('x', width / 2 + margin)
    //     .attr('y', 40)
    //     .attr('text-anchor', 'middle')
    //     .text('Year ->')

    var paths = svg.append("path")
        .datum(data)
        .attr("id", "line-chart")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("transform", "translate(0,0)")
        .attr("d", d3.line()
            .x(function (d) { return x(d.date) })
            .y(function (d) { return y(d.value) })
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
        .attr("cx", function (d) { return x(d.date); })
        .attr("cy", height);

    dots.transition()
        .duration(3000)
        .attr("cx", function (d) { return x(d.date); })
        .attr("cy", function (d) { return y(d.value); })
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
        .attr("x", function (d) { return x(d.date) + 5; })
        .attr("y", function (d) { return y(d.value) - 5; })
        .text(function (d, i) {
            const curr_year = d.date.getFullYear()
            if (curr_year == 2008) {
                return '2008 Housing crisis'
            } else if (curr_year == 2020) {
                return 'Covid Housing crisis '
            } else if (curr_year == 2022) {
                return region_name
            } else {
                return '';
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

    // d3.select("#side_chart")
    // .select("g")
    // .remove()

    //Add annotations
    var labels = [{
        data: { date: "2008-12-31", close: 109653.4952000697 },
        dy: 37,
        dx: -142
    }, {
        data: { date: "2020-12-31", close: 109653.4952000697 },
        dy: -137,
        dx: 0,
        note: { align: "middle" }
    }, {
        data: { date: "2016-12-31", close: 109653.4952000697 },
        dy: 37,
        dx: 42
    }].map(function (l) {
        l.note = Object.assign({}, l.note, {
            title: "Close: " + l.data.close,
            label: "" + l.data.date
        });
        l.subject = { radius: 3 };

        return l;
    });

    console.log(labels)
    var parseTime = d3.timeParse("%d-%b-%y");
    var timeFormat = d3.timeFormat("%d-%b-%y");

    // window.makeAnnotations = d3.annotation()
    //     .annotations(labels)
    //     .type(d3.annotationCalloutCircle)
    //     .accessors({
    //         y: function x(d) {
    //             const close = typeof d.close == 'undefined' ? 0 : d.close
    //             return x(close);
    //         },
    //         x: function x(d) {
    //             //const date = typeof d.date == 'undefined' ? 0 : d.date
    //             return x(parseTime('2008-12-31')); //date));
    //         }
    //     })
    // .accessorsInverse({
    //     date: function date(d) {
    //         return timeFormat(x.invert(d.x));
    //     },
    //     close: function close(d) {
    //         return y.invert(d.y);
    //     }
    // }).on('subjectover', function (annotation) {
    //     console.log("subjectover "+annotation)
    //     annotation.type.a.selectAll("g.annotation-connector, g.annotation-note").classed("hidden", false);
    // }).on('subjectout', function (annotation) {
    //     console.log("subjectout "+annotation)
    //     annotation.type.a.selectAll("g.annotation-connector, g.annotation-note").classed("hidden", true);
    // });

    // svg.append("g")
    //     .attr("class", "annotation-test")
    //     .call(makeAnnotations);

    // svg.selectAll("g.annotation-connector, g.annotation-note").classed("hidden", true);


}


async function clearLines() {
    d3.selectAll('svg').selectAll("#path").remove();
    d3.selectAll('svg').selectAll("#annotations").remove();
    // d3.selectAll('svg').selectAll("#nat-avg-txt").remove();
    // d3.selectAll('svg').selectAll("#year-text").remove();
}