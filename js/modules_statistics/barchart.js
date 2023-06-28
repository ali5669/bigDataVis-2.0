import { cartogramSizes } from "../statistics.js";
import { cartogramDuration } from "../statistics.js";
import { tooltip } from "../statistics.js";

export function render_barchart (data_dict, position) {

    delete data_dict[null];
    // 设置SVG容器的宽度和高度
    var containerWidth = cartogramSizes.width - 60;
    var containerHeight = cartogramSizes.height - 20;
    var offset = position * cartogramSizes.width;

    // 创建颜色比例尺
    var colorScale = d3.scaleOrdinal()
        .range(d3.schemeTableau10);

    // 创建容器SVG元素
    var container = d3.select("#vis").append("g")
        .attr("width", containerWidth)
        .attr("height", containerHeight + 20)
        .attr("transform", "translate(" + offset + "," + 0 + ")");

    // 创建坐标轴的<g>元素
    var axisG = container.append("g")
        .attr("transform", "translate(50, 50)");

    // 创建柱状图的<g>元素
    var chartG = container.append("g")
        .attr("transform", "translate(50, 50)");

    // 计算坐标轴和柱状图的宽度和高度
    var axisWidth = containerWidth - 50;
    var axisHeight = containerHeight - 50;

    // 创建比例尺
    var xScale = d3.scaleBand()
        .domain(Object.keys(data_dict))
        .range([0, axisWidth])
        .padding(0.2);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(Object.values(data_dict))])
        .range([axisHeight, 0]);

    // 创建坐标轴
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    axisG.append("g")
        .attr("transform", "translate(0," + axisHeight + ")")
        .call(xAxis);

    axisG.append("g")
        .call(yAxis);

    // 创建柱状图
    var bars = chartG.selectAll("rect")
        .data(Object.entries(data_dict))
        .enter()
        .append("rect")
        .attr("x", d => xScale(d[0]))
        .attr("y", axisHeight)
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .transition()
        .duration(cartogramDuration)
        .attr("height", d => axisHeight - yScale(d[1]))
        .attr("y", d => yScale(d[1]))
        .attr("fill", d => colorScale(d[0]));

}