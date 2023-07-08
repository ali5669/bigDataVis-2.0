import { piechartSizes } from "../statistics.js";
import { cartogramDuration } from "../statistics.js";
import { tooltip } from "../statistics.js";

export function render_chordchart (matrix, names, position) {

    var svg = d3.select("#vis");

    // 设置弦图的尺寸和位置
    var width = piechartSizes.width;
    var height = piechartSizes.height;
    var outerRadius = Math.min(piechartSizes.width, piechartSizes.height) / 2 - piechartSizes.pad
    var innerRadius = outerRadius - 10;
    var offset = position * piechartSizes.width;

    // 创建弦图生成器
    var chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending);

    // 将数据传递给弦图生成器
    var chords = chord(matrix);
    // 设置动画时间
    chords.forEach(function(d) {
        d.duration = cartogramDuration * (Math.max(d.source.endAngle, d.target.endAngle) - Math.min(d.source.startAngle, d.target.startAngle)) / (Math.PI * 2)
        d.delaytime = cartogramDuration * ((Math.min(d.source.startAngle, d.target.startAngle)) / (Math.PI * 2));
    });
    chords.groups.forEach(function(d) {
        d.duration = cartogramDuration * ((d.endAngle - d.startAngle) / (Math.PI * 2));
        d.delaytime = cartogramDuration * ((d.startAngle) / (Math.PI * 2));
    });
    // console.log(chords);

    // 创建弧生成器
    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    // 创建带生成器
    var gen_ribbon = d3.ribbon()
        .radius(innerRadius)

    // 创建颜色比例尺
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // 绘制弦图
    var g = svg.append("g")
        .attr("id", "ChordChart_" + position)
        .attr("width", piechartSizes.width)
        .attr("height", piechartSizes.height)
        .attr("transform", "translate(" + ((width / 2) + offset) + "," + height / 2 + ")")
        .datum(chords);

    var group = g.append("g")
        .attr("class", "groups")
        .selectAll("g")
        .data(function (chords) {
            return chords.groups;
        })
        .enter()
        .append("g");

    group.append("path")
        .attr("id", d => names[d.index] + "_" + position + "_chordchart_gpath")
        .style("fill", function (d) {
            return color(d.index);
        })
        .style("stroke", function (d) {
            return d3.rgb(color(d.index));
        })
        .transition()
        .duration(d => d.duration)
        .delay(d => d.delaytime)
        .attrTween('d', function (d) {
            var i = d3.interpolate(d.startAngle, d.endAngle);
            return function (t) {
                d.endAngle = i(t);
                return arc(d);
            }
        });

    group.on('mouseenter', (d) => {
            d3.select("#vis").select("#ChordChart_" + position).select(".groups").selectAll("path")
                .filter(function (dpath) {
                    return d.index == dpath.index;
                })
                .transition()
                .duration(100)
                .attr("d", d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius + 20)
                );
            
            d3.select("#vis").select("#ChordChart_" + position).select(".ribbons").selectAll("path")
                .filter(function (dpath) {
                    return dpath.source.index == d.index || dpath.target.index == d.index
                })
                .transition()
                .duration(100)
                .style("opacity", 1);
            
            tooltip.html('Country:' + names[d.index] + "<br/>" + 'Amount:' + d.value)
                .style("left", (d3.event.pageX)+"px")
                .style("top", (d3.event.pageY+20)+"px")
                .style("opacity", 1.0);
        })
        .on('mousemove', (d) => {
            tooltip
                .style('left', `${event.pageX + 40}px`)
                .style('top', `${event.pageY - 40}px`)
                .style('position', 'absolute');
        
        })
        .on('mouseleave', (d) => {
            d3.select("#vis").select("#ChordChart_" + position).select(".groups").selectAll("path")
                .filter(function (dpath) {
                    return d.index == dpath.index;
                })
                .transition()
                .duration(100)
                .attr("d", arc);

            d3.select("#vis").select("#ChordChart_" + position).select(".ribbons").selectAll("path")
                .filter(function (dpath) {
                    return dpath.source.index == d.index || dpath.target.index == d.index
                })
                .transition()
                .duration(100)
                .style("opacity", 0.3);
            
            tooltip
                .style('opacity', 0);
        });

    var ribbon = g.append("g")
        .attr("class", "ribbons")
        .selectAll("g")
        .data(function (chords) {
            return chords;
        })
        .enter()
        .append("g");

    ribbon.append("path")
        .attr("id", d => names[d.source.index] + "_" + names[d.target.index] + "_" + position + "_chordchart_rpath")
        .style("fill", function (d) {
            return color(d.target.index);
        })
        .style("stroke", function (d) {
            return d3.rgb(color(d.target.index));
        })
        .attr("d", d => gen_ribbon(d))
        .style("opacity", 0)
        .transition()
        .duration(d => d.duration)
        .delay(d => d.delaytime)
        .style("opacity", 0.3);

    ribbon.on('mouseenter', (d) => {
            d3.select("#vis").select("#ChordChart_" + position).select(".ribbons").selectAll("path")
                .filter(function (dpath) {
                    return dpath.source.index == d.source.index && dpath.target.index == d.target.index;
                })
                .transition()
                .duration(100)
                .style("opacity", 1);
            
            tooltip.html('Source:' + names[d.source.index] + "<br/>" + 'Target:' + names[d.target.index] + "<br/>" + 'Amount:' + d.source.value)
                .style("left", (d3.event.pageX)+"px")
                .style("top", (d3.event.pageY+20)+"px")
                .style("opacity", 1.0);
        })
        .on('mousemove', (d) => {
            tooltip
                .style('left', `${event.pageX + 40}px`)
                .style('top', `${event.pageY - 40}px`)
                .style('position', 'absolute');
        
        })
        .on('mouseleave', (d) => {
            d3.select("#vis").select("#ChordChart_" + position).select(".ribbons").selectAll("path")
                .filter(function (dpath) {
                    return dpath.source.index == d.source.index && dpath.target.index == d.target.index;
                })
                .transition()
                .duration(100)
                .style("opacity", 0.3);
            
            tooltip
                .style('opacity', 0);
        });
    
}