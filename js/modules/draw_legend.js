export var draw_legend = function(svg, nodeType, edgeType, nodeColorScale, linkColorScale){
    var legend_container = svg.append("g").attr("id", "legendContainer");
    // 绘制颜色比例尺
    const nodeColorLegend = legend_container.selectAll("#nodeColorLegend")
        .data(Object.keys(nodeType))
        .enter()
        .append("g")
        .attr("id", "nodeColorLegend")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    nodeColorLegend.append("rect")
        .attr("x", 10)
        .attr("y", 5)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", d => nodeColorScale(d));

    nodeColorLegend.append("text")
        .attr("x", 25)
        .attr("y", 10)
        .text(d => d);

    const linkColorLegend = legend_container.selectAll("#linkColorLegend")
        .data(Object.keys(edgeType))
        .enter()
        .append("g")
        .attr("id", "linkColorLegend")
        .attr("transform", (d, i) => `translate(200, ${i * 20})`);

    linkColorLegend.append("rect")
        .attr("x", 10)
        .attr("y", 5)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", d => linkColorScale(d));

    linkColorLegend.append("text")
        .attr("x", 25)
        .attr("y", 10)
        .text(d => d);
}

