import { violinchartSizes } from "../statistics.js";
import { cartogramDuration } from "../statistics.js";
import { tooltip } from "../statistics.js";
import { margin } from "../statistics.js";
import { data_nodes_statistics } from "../graph.js";

export function render_violinchart (active_node, attr_names, position) {

    const node_type = active_node.node_type;
    var data_dict = {};
    attr_names.forEach(function (attr_name) {
        data_dict[attr_name] = new Array();
    });
    var active_node_statistics;
    for (let key in data_nodes_statistics) {
        attr_names.forEach(function (attr_name) {
            if (data_nodes_statistics[key].node_type == node_type) {
                data_dict[attr_name].push(data_nodes_statistics[key][attr_name]);
            }
        })
        if (key == active_node.id) active_node_statistics = data_nodes_statistics[key];
    }
    console.log(data_dict, active_node_statistics);

    // SVG容器尺寸
    const width = violinchartSizes.width;
    const height = violinchartSizes.height;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const offset = violinchartSizes.width * position + violinchartSizes.pad

    // 创建SVG容器
    var svg = d3.select("#vis-violin")
        .append("g")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", `translate(${offset}, 0)`)
        
    svg.append("g")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("id", "ViolinChart_" + position)
        .attr("transform", `translate(${margin.left}, ${margin.top})`)

    // 创建比例尺
    const xScale = d3.scaleBand()
        .domain(attr_names)
        .range([0, chartWidth])
        .padding(0.05)

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data_dict[attr_names[0]])])
        .range([chartHeight, margin.top]);

    var histogram = d3.histogram()
        .domain(yScale.domain())
        .thresholds(yScale.ticks(d3.max(data_dict[attr_names[0]])))
        .value(d => d)

    var sumstat = new Array();
    for (let key in data_dict) {
        sumstat.push({
            key:key,
            value:histogram(data_dict[key])
        });
    }
    console.log(sumstat);

    var maxNum = 0
    sumstat.forEach(function (d) {
        let lengths = d.value.map(function(a){return a.length;})
        let longuest = d3.max(lengths)
        if (longuest > maxNum) { maxNum = longuest }
    });
    
    var xNum = d3.scaleLinear()
        .range([0, xScale.bandwidth()])
        .domain([-maxNum,maxNum])

    // 渲染小提琴图
    var violin_g = svg.selectAll("violins")
        .data(sumstat)
        .enter()
        .append("g")
            .attr("transform", d => `translate(${xScale(d.key) + margin.left}, 0)`)

    violin_g
        .append("path")
            .datum(d => d.value)
            .style("stroke", "none")
            .style("fill", "#69b3a2")
            .attr("d", d3.area()
                .x0(xNum(0))
                .x1(xNum(0))
                .y(d => yScale(d.x0))
                .curve(d3.curveCatmullRom)
            )
            .transition()
            .duration(cartogramDuration)
            .attr("d", d3.area()
                .x0(d => xNum(-d.length))
                .x1(d => xNum(d.length))
                .y(d => yScale(d.x0))
                .curve(d3.curveCatmullRom)
            )
    violin_g
        .append("circle")
            // .datum(d => d.value)
            .attr("cx", xNum(0))
            .attr("cy", d => yScale(active_node_statistics[d.key]))
            .attr("r", 3)
            .style("fill", "red");

    svg
        .append("g")
            .attr("transform", `translate(${margin.left}, ${chartHeight})`)
            .call(d3.axisBottom(xScale));

    svg
        .append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale));

    violin_g.on('mouseenter', (d) => {
        update_mouse_animetion(d);
    })
    .on('mousemove', (d) => {
        update_mouse_animetion(d);
    })
    .on('mouseleave', (d) => {
        remove_mouse_animetion(d);
    });

    function update_mouse_animetion (dpath) {
        const y_current = yScale.invert(d3.event.offsetY);
        var x0_current, x1_current, length_current;
        violin_g.selectAll("path")
            .transition()
            .duration(100)
            .attr("d", d3.area()
                .x0(d => {
                    if (d.x0 <= y_current && d.x1 >= y_current) {
                        x0_current = d.x0;
                        x1_current = d.x1;
                        length_current = d.length;
                        return xNum(-d.length) - 20;
                    }
                    else return xNum(-d.length);
                })
                .x1(d => {
                    if (d.x0 <= y_current && d.x1 >= y_current) return xNum(d.length) + 20;
                    else return xNum(d.length);
                })
                .y(d => yScale(d.x0))
                .curve(d3.curveCatmullRom)
            )
        tooltip.html('Attribute:' + dpath.key + "<br/>" + "Range:" + `${x0_current}-${x1_current}` + "<br/>" + 'Amount:' + length_current)
            .style("left", (d3.event.pageX + 40)+"px")
            .style("top", (d3.event.pageY - 40)+"px")
            .style("opacity", 1.0);
    }

    function remove_mouse_animetion () {
        violin_g.selectAll("path")
            .transition()
            .duration(100)
            .attr("d", d3.area()
                .x0(d => xNum(-d.length))
                .x1(d => xNum(d.length))
                .y(d => yScale(d.x0))
                .curve(d3.curveCatmullRom)
            )
        tooltip
            .style('opacity', 0);
    }
}