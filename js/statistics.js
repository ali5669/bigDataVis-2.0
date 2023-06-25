var cartogramSizes = {
    width:400,
    height:400,
    pad:20
}
var duration = 1000;
var data_graph;

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .attr("opacity", 0.0);

var render_piechart = function(data_dict, position) {

    var textArcThres = 0.5;
    var outerRadius = Math.min(cartogramSizes.width, cartogramSizes.height) / 2 - cartogramSizes.pad
    var innerRadius = 0;
    var pie = d3.pie()
        .value(function(d) { return d.value; });

    // 创建弧生成器
    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    // 创建颜色比例尺
    var colorScale = d3.scaleOrdinal()
        .range(d3.schemeTableau10);

    var offset = position * cartogramSizes.width;
    // 创建SVG容器
    var svg = d3.select("#vis")
        .append("g")
        .attr("transform", "translate(" + ((cartogramSizes.width / 2) + offset) + "," + cartogramSizes.height / 2 + ")");

    var pie_data = pie(d3.entries(data_dict))
    pie_data.forEach(function(d) {
        d.duration = duration * ((d.endAngle - d.startAngle) / (Math.PI * 2));
        d.delaytime = duration * ((d.startAngle) / (Math.PI * 2));
    })
    // console.log(pie_data)

    // 绘制饼图
    var arcs = svg.selectAll("arc")
        .data(pie_data)
        .enter()
        .append("g");

    arcs.append("path")
        .attr("fill", d => colorScale(d.data.key))
        .attr("id", d => d.data.key + "_" + position + "_piechart_path")
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
            d3.select("#" + d.data.key + "_" + position + "_piechart_path")
                .transition()
                .duration(100)
                .attr("d", d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius + 20)
                );
            tooltip.html('Country:' + d.data.key + "<br/>" + 'Amount:' + d.data.value)
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
            d3.select("#" + d.data.key + "_" + position + "_piechart_path")
                .transition()
                .duration(100)
                .attr("d", arc);
            tooltip
                .style('opacity', 0);
        });

}

var render_barchart = function(data_dict, position) {

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
        .duration(duration)
        .attr("height", d => axisHeight - yScale(d[1]))
        .attr("y", d => yScale(d[1]))
        .attr("fill", d => colorScale(d[0]));

}

var render_chordchart = function (matrix, names, position) {

    var svg = d3.select("#vis");

    // 设置弦图的尺寸和位置
    var width = cartogramSizes.width;
    var height = cartogramSizes.height;
    var outerRadius = Math.min(cartogramSizes.width, cartogramSizes.height) / 2 - cartogramSizes.pad
    var innerRadius = outerRadius - 10;
    var offset = position * cartogramSizes.width;

    // 创建弦图生成器
    var chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending);

    // 将数据传递给弦图生成器
    var chords = chord(matrix);
    // 设置动画时间
    chords.forEach(function(d) {
        d.duration = duration * (Math.max(d.source.endAngle, d.target.endAngle) - Math.min(d.source.startAngle, d.target.startAngle)) / (Math.PI * 2)
        d.delaytime = duration * ((Math.min(d.source.startAngle, d.target.startAngle)) / (Math.PI * 2));
    });
    chords.groups.forEach(function(d) {
        d.duration = duration * ((d.endAngle - d.startAngle) / (Math.PI * 2));
        d.delaytime = duration * ((d.startAngle) / (Math.PI * 2));
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
        .attr("width", cartogramSizes.width)
        .attr("height", cartogramSizes.height)
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
            d3.select("#" + names[d.index] + "_" + position + "_chordchart_gpath")
                .transition()
                .duration(100)
                .attr("d", d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius + 20)
                );
            chords.forEach(function (d_r) {
                if(d_r.source.index == d.index || d_r.target.index == d.index){
                    d3.select("#" + names[d_r.source.index] + "_" + names[d_r.target.index] + "_" + position + "_chordchart_rpath")
                        .transition()
                        .duration(100)
                        .style("opacity", 1);
                }
            });
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
            d3.select("#" + names[d.index] + "_" + position + "_chordchart_gpath")
                .transition()
                .duration(100)
                .attr("d", arc);
            chords.forEach(function (d_r) {
                if(d_r.source.index == d.index || d_r.target.index == d.index){
                    d3.select("#" + names[d_r.source.index] + "_" + names[d_r.target.index] + "_" + position + "_chordchart_rpath")
                        .transition()
                        .duration(100)
                        .style("opacity", 0.3);
                }
            });
            tooltip
                .style('opacity', 0);
        });

    var ribbon = g.append("g")
        .attr("class", "ribbons")
        .selectAll("path")
        .data(function (chords) {
            return chords;
        })
        .enter()
        .append("path")
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
    
}

export function render_cartograms (data_graph) {

    d3.select("#bottom")
        .selectAll("g")
        .remove();
        
    d3.select("#vis")
        .attr("width", 2000)
        .attr("height", 400);

    var country_count = data_graph.country_list;
    var node_type_list = data_graph.node_type_list;
    var edge_type_list = data_graph.edge_type_list;

    var idx2country = Object.keys(country_count);
    var country2idx = {};
    idx2country.forEach(function(d, i) {
        country2idx[d] = i;
    });

    var n_country = Object.keys(country_count).length;
    var flow_matrix = [...Array(n_country)].map(x => Array(n_country).fill(0));

    data_graph.edges.forEach(function(d) {
        flow_matrix[country2idx[d.source.country]][country2idx[d.target.country]] += 1;
    });

    render_piechart(country_count, 0);
    render_chordchart(flow_matrix, idx2country, 1);
    // render_barchart(country_count, 2);
    render_piechart(node_type_list, 2);
    render_piechart(edge_type_list, 3);

}