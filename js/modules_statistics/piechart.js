import { piechartSizes } from "../statistics.js";
import { cartogramDuration } from "../statistics.js";
import { tooltip } from "../statistics.js";

export function render_piechart (data_dict, color_scale, position) {

    var textArcThres = 0.5;
    var outerRadius = Math.min(piechartSizes.width, piechartSizes.height) / 2 - piechartSizes.pad
    var innerRadius = 0;
    var pie = d3.pie()
        .value(function(d) { return d.value; });

    // 创建弧生成器
    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var colorScale;
    if (color_scale == null) {
        // 创建颜色比例尺
        colorScale = d3.scaleOrdinal()
        .range(d3.schemeTableau10);
    }
    else colorScale = color_scale;

    var offset = position * piechartSizes.width;
    // 创建SVG容器
    var svg = d3.select("#vis-pie")
        .append("g")
        .attr("id", "PieChart_" + position)
        .attr("transform", "translate(" + ((piechartSizes.width / 2) + offset) + "," + piechartSizes.height / 2 + ")");

    var pie_data = pie(d3.entries(data_dict))
    pie_data.forEach(function(d) {
        d.duration = cartogramDuration * ((d.endAngle - d.startAngle) / (Math.PI * 2));
        d.delaytime = cartogramDuration * ((d.startAngle) / (Math.PI * 2));
    })
    // console.log(pie_data)

    // 绘制饼图
    var arcs = svg.selectAll("arc")
        .data(pie_data)
        .enter()
        .append("g");

    arcs.append("path")
        .attr("fill", d => colorScale(d.data.key))
        .transition()
        .duration(d => d.duration)
        .delay(d => d.delaytime)
        .attrTween("d", function (d) {
            var i = d3.interpolate(d.startAngle, d.endAngle);
            return function (t) {
                d.endAngle = i(t);
                return arc(d);
            }
        })

    arcs.append("text")
        .transition()
        .duration(d => d.duration)
        .delay(d => d.delaytime)
        .attr("transform", d => "translate(" + arc.centroid(d) + ")")
        .attr("text-anchor", "middle")
        .text(function(d) {
            if(d.endAngle - d.startAngle < textArcThres) return " ";
            else return d.data.key;
        });

    arcs.on('mouseenter', (d) => {
            d3.select("#vis-pie").select("#" + "PieChart_" + position).selectAll("path")
                .filter(function (dpath) {
                    return d.index == dpath.index
                })
                .transition()
                .duration(100)
                .attr("d", d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius + 20)
                );
            tooltip.html('Class:' + d.data.key + "<br/>" + 'Amount:' + d.data.value)
                .style("left", (d3.event.pageX + 40)+"px")
                .style("top", (d3.event.page - 40)+"px")
                .style("opacity", 1.0);
        })
        .on('mousemove', (d) => {
            tooltip
                .style('left', `${event.pageX + 40}px`)
                .style('top', `${event.pageY - 40}px`)
                .style('position', 'absolute');
        
        })
        .on('mouseleave', (d) => {
            d3.select("#vis-pie").select("#PieChart_" + position).selectAll("path")
                .filter(function (dpath) {
                    return d.index == dpath.index
                })
                .transition()
                .duration(100)
                .attr("d", arc);
            tooltip
                .style('opacity', 0);
        });

}