import {render_cartograms} from "./statistics.js"
import {render_sub_graph} from "./sub_graph.js"
import {get_attr_value} from "./node_attr_value.js"

var margin = {top:60,bottom:60,left:60,right:60}
var svg = d3.select("#graph")    //获取画布
var width = svg.attr("width")  //画布的宽
var height = svg.attr("height")   //画布的高

var activeNode;
var activeCircle;

var ownership_force = 1;
var partnership_force = 1;
var family_relationship_force = 1;
var membership_force = 1;
var country_force = 1;

var curGraph;

var country_flag = false;

let links;
let linksText;
let gs;
let forceSimulation;

let graph_names;

var data;
var datas = new Array();

let nodeSizeScale;
let attrColorScale

// 力调整滑块
var force_container = d3.select("#right").append("div");
force_container.append("p")
    .text("ownership_force");
    
force_container.append("input")
    .attr("type", "range")
    .attr("min", 0.0)
    .attr("max", 2.0)
    .attr("step", 0.01)
    .attr("value", ownership_force)
    .on("mouseup", function() { ownership_force = this.value; updateGraph(); renderGraph();});

force_container.append("p")
    .text("partnership_force");

force_container.append("input")
    .attr("type", "range")
    .attr("min", 0.0)
    .attr("max", 2.0)
    .attr("step", 0.01)
    .attr("value", partnership_force)
    .on("mouseup", function() { partnership_force = this.value; updateGraph(); renderGraph();});

force_container.append("p")
    .text("family_relationship_force");

force_container.append("input")
    .attr("type", "range")
    .attr("min", 0.0)
    .attr("max", 2.0)
    .attr("step", 0.01)
    .attr("value", family_relationship_force)
    .on("mouseup", function() { family_relationship_force = this.value; updateGraph(); renderGraph();});

force_container.append("p")
    .text("membership_force");

force_container.append("input")
    .attr("type", "range")
    .attr("min", 0.0)
    .attr("max", 2.0)
    .attr("step", 0.01)
    .attr("value", membership_force)
    .on("mouseup", function() { membership_force = this.value; updateGraph(); renderGraph();});


// 图像切换下拉单

var graph_change_container = d3.select("#right").append("div");
graph_change_container.append("p")
    .text("图像选择:");
var fileName = "979893388";

graph_change_container.append("select")
    .on("change", function(){
        fileName = d3.select(this).property("value");
        console.log(fileName);
        updateGraph();
        render(fileName);
    })

function addOption2ComboBox(d){
    graph_change_container.select("select")
        .append("option")
            .attr("value", d)
            .text(d)
    }
function updateComboBox(){
    graph_names = new Array();
    for(var key in datas){
        graph_names.push(key)
    }
    graph_change_container.selectAll("option").remove();
    graph_names.forEach(graph_name => {
        addOption2ComboBox(graph_name);
    });
}

addOption2ComboBox("8327_cleaned");
addOption2ComboBox("Mar de la Vida OJSC_cleaned");
addOption2ComboBox("data_cleaned");

var stop_flag = false;
var stop_mode_container = d3.select("#right").append("div");
stop_mode_container.append("input")
    .attr("type", "checkbox")
    .on("change", function(){
        stop_flag = !stop_flag;
        if(stop_flag){
            forceSimulation.stop();
        }else{
            forceSimulation.restart();
        }
        console.log(stop_flag);
    })
stop_mode_container.append("label")
    .text("停止布局计算");

//聚类模式
var country_mode_container = d3.select("#right").append("div");
country_mode_container.append("input")
    .attr("type", "checkbox")
    .on("change", function(){
        country_flag = !country_flag;
        console.log(country_flag);
        resetGraph();
        renderGraph();
    })
country_mode_container.append("label")
    .text("聚类模式");


//生成聚类按钮
var cluster_mode_container = d3.select("#right").append("div");
cluster_mode_container.append("input")
    .attr("type", "button")
    .attr("value", "生成聚类")
    .on("click", function(){
        var data_out = render_sub_graph(data, null, cluster_method);
        datas[fileName + "_cluster(" + cluster_method + ")"] = data_out;
        updateComboBox();
        activeNode = null;
    })

//聚类算法下拉单
var cluster_method = "Louvain";
cluster_mode_container.append("select")
    .on("change", function(){
        cluster_method = d3.select(this).property("value");
        console.log(cluster_method);
    })

cluster_mode_container.select("select").append("option")
    .attr("value", "Louvain").text("Louvain");
cluster_mode_container.select("select").append("option")
    .attr("value", "Spectral").text("Spectral");
cluster_mode_container.select("select").append("option")
    .attr("value", "Newman_Girvan").text("Newman_Girvan"); 

//中间节点监视器
var search_node_id;
var node_search_container = d3.select("#center").append("div");
var node_search_input = node_search_container.append("input")
    .attr("type", "text")
    .attr("placeholder", "输入节点ID")
    .on("input", function(){
        search_node_id = this.value
    });
var node_search_btn = node_search_container.append("button")
    .attr("id", "node_search_btn")
    .text("标记节点")
    .on("click", function(){
        data.nodes.forEach(node => {
            if(node.id == search_node_id){
                activeNode = node;
                updateTable();
            }
        });
    });


var node_monitor_container = d3.select("#center").append("div");
var keyData = ["node_type", "id", "country", "degree", "x", "y"]

var table = node_monitor_container.append("table")
    .attr("class", "mytable")
//表头
var thead = table.append("thead");
var headerRow = thead.append("tr");
headerRow.append("th").text("节点属性");
headerRow.append("th").text("值");

var tbody = table.append("tbody");

function updateTable(){
    var rows = tbody.selectAll("tr")
    .data(keyData)
    
    rows.exit().remove();

    var newRows = rows.enter().append("tr");
    //属性列
    newRows.append("td")
        .text(d=>d);
    //值列
    newRows.append("td")
        .text(d=>activeNode[d]);
    //更新第二列的值
    rows.select("td:last-child")
        .text(d=>activeNode[d]);
}

//生成子图按钮
var sub_graph_container = d3.select("#right").append("div");
sub_graph_container.append("input")
    .attr("type", "button")
    .attr("value", "生成子图")
    .on("click", function(){
        var data_out = render_sub_graph(data, activeNode.id, sub_method);
        // console.log(data_out);
        datas[fileName + "_sub_" + activeNode.id + "(" + sub_method + ")"] = data_out;
        updateComboBox();
    })
// 子图下拉单
var sub_method = "Louvain";
sub_graph_container.append("select")
    .on("change", function(){
        sub_method = d3.select(this).property("value");
        console.log(sub_method);
    });
sub_graph_container.select("select").append("option")
    .attr("value", "Louvain").text("Louvain");
sub_graph_container.select("select").append("option")
    .attr("value", "Spectral").text("Spectral");
sub_graph_container.select("select").append("option")
    .attr("value", "Newman_Girvan").text("Newman_Girvan"); 

//颜色模式
var color_mode_container = d3.select("#right").append("div");
var color_mode = "node_type";
var credibility_flag = false;
color_mode_container.append("select")
    .on("change", function(){
        color_mode = d3.select(this).property("value");
        if(color_mode == "Credibility_ShortestPath"){
            credibility_flag = true;
        }else{
            credibility_flag = false;
        }
        console.log(color_mode);
        data = get_attr_value(data, color_mode);
        console.log(data);
        resetGraph();
        renderGraph();
        // TODO:
        // 在color—mode改变时，
        // 对所有节点selectAll，
        // 更改其attr的fill

    })
color_mode_container.select("select").append("option")
    .attr("value", "node_type").text("节点类型");
color_mode_container.select("select").append("option")
    .attr("value", "Weighted_Degree").text("Weighted_Degree");
// color_mode_container.select("select").append("option")
//     .attr("value", "Eccentricity").text("Eccentricity");
color_mode_container.select("select").append("option")
    .attr("value", "Credibility_ShortestPath").text("Credibility_ShortestPath");
color_mode_container.select("select").append("option")
    .attr("value", "Betweenness_Centrality").text("Betweenness_Centrality");
color_mode_container.select("select").append("option")
    .attr("value", "Closeness_Centrality").text("Closeness_Centrality");
color_mode_container.select("select").append("option")
    .attr("value", "Degree_Centrality").text("Degree_Centrality");
color_mode_container.select("select").append("option")
    .attr("value", "Eigenvector_Centrality").text("Eigenvector_Centrality");
color_mode_container.select("select").append("option")
    .attr("value", "HITS_Authority").text("HITS_Authority");
color_mode_container.select("select").append("option")
    .attr("value", "HITS_Hub").text("HITS_Hub");
color_mode_container.select("select").append("option")
    .attr("value", "PageRank").text("PageRank");

// 重置图
var resetGraph = function(){
    svg.selectAll("*").remove();
    data.nodes.forEach(function(d){
        d.x = width/2;
        d.y = height/2;
    })
}

// 刷新图
var updateGraph = function(){
    svg.selectAll("*").remove();
}

// 绘制图
var renderGraph = function(){
    var g = svg.append("g")
        .attr("class", "container")
        .attr("transform","translate("+margin.top+","+margin.left+")");
    //结点数据
    var nodes = data.nodes;
    //边数据，id是nodes数组中的元素下标
    var edges = data.edges;
    //国家数据
    var country = data.country_list;
    //节点类型数据
    var nodeType = data.node_type_list;
    //边类型数据
    var edgeType = data.edge_type_list;

    //设置一个color的颜色比例尺，为了让不同的顶点呈现不同的颜色
    const nodeColorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(Object.keys(nodeType));

    const linkColorScale = d3.scaleOrdinal()
        .domain(Object.keys(edgeType))
        .range(['orange', 'aqua', 'purple', 'blue']);
    
    // 绘制颜色比例尺
    const nodeColorLegend = svg.selectAll("#nodeColorLegend")
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
    
    const linkColorLegend = svg.selectAll("#linkColorLegend")
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

    // // 创建一个用于绘制比例尺的轴
    // var colorAxisScale = d3.scaleLinear()
    //     .domain(attr_domin)
    //     .range([0, 100]); // 比例尺的宽度
    // var axis = d3.axisBottom(colorAxisScale)
    //     .ticks(5) // 指定刻度数量
    //     .tickFormat(d3.format('.1f')); // 格式化刻度的显示格式
    // // 绘制比例尺轴线
    // svg.append('g')
    //     .attr('class', 'axis')
    //     .attr('transform', 'translate(10, 200)')
    //     .call(axis);
    // // 绘制比例尺的颜色条
    // var attrColorGradient = svg.append("defs")
    //     .append('linearGradient')
    //     .attr('id', 'attr-color-gradient')
    //     .attr('x1', '0%')
    //     .attr('y1', '0%')
    //     .attr('x2', '100%')
    //     .attr('y2', '0%');
    // attrColorGradient.append('stop')
    //     .attr('offset', '0%')
    //     .attr('stop-color', color_range[0]);
    // attrColorGradient.append('stop')
    //     .attr('offset', '100%')
    //     .attr('stop-color', color_range[1]);
    // svg.append('rect')
    //     .attr('x', 10)
    //     .attr('y', 210)
    //     .attr('width', 100)
    //     .attr('height', 20)
    //     .style('fill', 'url(#attr-color-gradient)');

    //大小比例尺
    var max = Math.max.apply(Math, nodes.map(obj=>obj.degree));
    var min = Math.min.apply(Math, nodes.map(obj=>obj.degree));
    nodeSizeScale = d3.scaleLinear()
        .domain([min, max])
        .range([5, 50])

    const forceScale = d3.scaleLinear()
        .domain([0, 5])
        .range([0, 1])

    // node.attr_value节点颜色比例尺
    var max = Math.max.apply(Math, nodes.map(obj=>obj.attr_value).filter(item=>item != undefined));
    var min = Math.min.apply(Math, nodes.map(obj=>obj.attr_value).filter(item=>item != undefined));
    if(credibility_flag){
        max = Math.max.apply(Math, nodes.map(obj=>obj.credibility_value).filter(item=>item != undefined));
        min = Math.min.apply(Math, nodes.map(obj=>obj.credibility_value).filter(item=>item != undefined));
    }
    console.log(max);
    console.log(min);
    attrColorScale = d3.scaleLinear()
        .domain([min, max])
        .range([0, 1]);
    const attrColorInterpolate = d3.interpolateRgb("blue", "red");

    //新建一个力导向图，固定语句
    forceSimulation = d3.forceSimulation()
    .force("link",d3.forceLink().id(d=>d.id).strength(link=>{
        var forceStd = 1/Math.min(link.source.degree, link.target.degree);
        var linkForce = 0;
        link.edge_type.forEach(element => {
            switch(element){
                case 'ownership': 
                    linkForce += ownership_force * forceStd;
                    break;
                case 'partnership': 
                    linkForce += partnership_force * forceStd;
                    break;
                case 'family_relationship':
                    linkForce += family_relationship_force * forceStd;
                    break;
                case 'membership': 
                    linkForce += membership_force * forceStd;
                    break;
                default: 
                    if(country_flag){
                        linkForce += country_force * forceStd;
                    }
                    break;
            }
        });
        return forceScale(linkForce);
    }))
    .force("charge",d3.forceManyBody())
    // .force("collide",d3.forceCollide(d=>d.r * 2))
    .force("center",d3.forceCenter(width/2, height/2));

    //初始化力导向图，也就是传入数据
    //生成节点数据
    forceSimulation.nodes(nodes).on("tick",ticked);//on()方法用于绑定时间监听器，tick事件是力导向布局每隔一段时间就会做的事

    //生成边数据
    forceSimulation.force("link")
        .links(edges)
        .distance(function(d)
        {   //每一边显示出来的长度
            // d.source.
            if(country_flag){
                return 0;
            }
            var len = nodeSizeScale(d.source.degree) + nodeSizeScale(d.target.degree);
            len = len + 50;

            // return Math.ceil((Math.random()+2)*100);
            return Math.ceil(len);
        })    	

    //设置图形的中心位置	
    forceSimulation.force("center").x(width/3).y(height/3);	

    //有了节点和边的数据后，我们开始绘制
    //绘制边。要先绘制边，之后绘制顶点
    
    var num = 0;
    links = g.append("g")
        .selectAll("line")   //选择所有"line"元素
        .data(edges)   //将edges绑定上
        .enter()
        .filter(d=>country_flag || d.source.id.indexOf("@") == -1)
        .append("line")
        .attr("stroke",function(d,i)
        {
            num++;
            var gradient = svg.append("defs")
                .append("linearGradient")
                .attr("id", "edge-gradient" + num);
            var step = (d.edge_type.length - 1);
            var cnt = 0;
            if(d.edge_type.length === 1){
                step = 100;
                cnt = 1;
            }
            d.edge_type.forEach(element => {
                var color = linkColorScale(element); 
                gradient.append("stop")
                    .attr("offset", step * cnt + "%")
                    .attr("stop-color", color + "");
                cnt++;
            });
            
            return "url(#edge-gradient" + num + ")";  //这里决定了边的颜色
        })
        .attr("stroke-opacity", 0.2)
        .attr("stroke-width",function(d,i){
            return d.weight * 2;
        });   //边的粗细
    
    //为边添加文字
    linksText = g.append("g")
        .selectAll("text")
        .data(edges)   
        .enter()
        .append("text")
        .text(function(d)
        {
            return "";  //这里返回的内容决定了每条边上显示的文字
        })

    //绘制顶点
    gs = g.selectAll(".circleText")
        .data(nodes)
        .enter()
        .filter(d=>country_flag || d.id.indexOf("@") == -1)
        .append("g")
        .attr("transform",function(d,i){
            var cirX = d.x;
            var cirY = d.y;
            return "translate("+cirX+","+cirY+")";
        })
        .call(d3.drag()  //drag是鼠标拖拽事件，start是鼠标左键按下时的事件。drag是拖住事件。ended是鼠标结束点击事件。
            .on("start",started)   //started，drag，end是自定义的三个函数
            .on("drag",dragged)
            .on("end",ended)
        );	

    //绘制节点
    gs.append("circle")
        .attr("r", d=>{//每个顶点的大小
            if(d.node_type == "hidden_node"){
                return 100;
            }
            return nodeSizeScale(d.degree)
        })   
        .attr("fill",function(d,i){//颜色
            if(d.node_type == "hidden_node"){
                return "rgba(255, 133, 81, 0.2)";
            }
            if(color_mode == "node_type"){
                return nodeColorScale(d.node_type);  
            }
            // var i = attrColorScale(d.attr_value)
            // console.log(i);
            if(credibility_flag){
                console.log(d.id, d.credibility_value);
                return attrColorInterpolate(attrColorScale(d.credibility_value)) + "";
            }
            return attrColorInterpolate(attrColorScale(d.attr_value)) + "";
        })

    //顶点上的文字
    gs.append("text")
        .attr("x",-10)
        .attr("y",-20)
        .attr("dy",10)
        .text(function(d)
        {
            return d.id;
        })
        .style("opacity", "0.8");

    gs.filter(d=>d.node_type == "hidden_node")
        .style("pointer-events", "none");

    var connectNode = [];
    gs.on('mouseenter', (d) => {
        d3.select("#left").selectAll("line")
            .filter(dline=>{
                // console.log(dline);
                
                if(dline.source.id == d.id) connectNode.push(dline.target.id);
                else if(dline.target.id == d.id) connectNode.push(dline.source.id);
                return dline.source.id == d.id || dline.target.id == d.id
            })
            .transition()
            .duration(100)
            .style("stroke-opacity", "0.8")
        connectNode.push(d.id);
        // console.log(connectNode);
        d3.select("#left").selectAll("circle")
            .filter(dnode=>!connectNode.includes(dnode.id))
            .transition()
            .duration(100)
            .style("opacity", "0.2")
        gs.selectAll("text")
            .filter(dnode=>!connectNode.includes(dnode.id))
            .transition()
            .duration(100)
            .style("opacity", "0")
        
    })
    .on('mouseleave', (d) => {
        d3.select("#left").selectAll("line")
            .filter(dline=>dline.source.id == d.id || dline.target.id == d.id)
            .transition()
            .duration(100)
            .style("stroke-opacity", "0.2")
        gs.selectAll("circle")
            .filter(dnode=>!connectNode.includes(dnode.id))
            .transition()
            .duration(100)
            .style("opacity", "1")
        gs.selectAll("text")
            .filter(dnode=>!connectNode.includes(dnode.id))
            .transition()
            .duration(100)
            .style("opacity", "0.8")
        connectNode = new Array();
    });

    //有向图的边是用带箭头的线来表示。如果是无向图，不需要这段代码
    var marker=	svg.append("marker")
        .attr("id", "resolved")
        .attr("markerUnits","userSpaceOnUse")
        .attr("viewBox", "0 -5 10 10")//坐标系的区域
        .attr("refX",26)//箭头在线上的位置，数值越小越靠近顶点
        .attr("refY", 0)
        .attr("markerWidth", 6)//箭头的大小（长度）
        .attr("markerHeight", 6)  //没用
        .attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
        .attr("stroke-width",2)//箭头宽度
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")//箭头的路径
        .attr('fill','#000000');//箭头颜色

    // if(!country_flag){
    //     hiddenCountryNode();
    // }else{
    //     visibleCountryNode();
    // }
}

// // 将国家节点隐藏
// var hiddenCountryNode = function(){
//     gs.selectAll("circle")
//         .filter(function(d){
//             return d.id.indexOf("@") != -1
//         })
//         .style("opacity", 0);
//     gs.selectAll("text")
//         .filter(function(d){
//             return d.id.indexOf("@") != -1
//         })
//         .style("opacity", 0);
//     d3.select("#left").selectAll("line")
//         .filter(function(d){
//             return d.source.id.indexOf("@") != -1 || d.target.id.indexOf("@") != -1;
//         })
//         .style("opacity", 0);
// }

// // 将国家节点可视
// var visibleCountryNode = function(){
//     gs.selectAll("circle")
//         .filter(function(d){
//             return d.id.indexOf("@") != -1
//         })
//         .style("opacity", 0.3);
//     d3.select("#left").selectAll("line")
//         .filter(function(d){
//             return d.source.id.indexOf("@") != -1 || d.target.id.indexOf("@") != -1;
//         })
//         .style("opacity", 0);
// }

// 绘制
var render = function(fileName){
    if(!datas[fileName]){
        d3.json("./data/" + fileName + ".json").then(graph=>{
            datas[fileName] = graph;
            data = graph;
            renderGraph();
            render_cartograms(data);
            

            addOption2ComboBox(fileName);
        })
    }else{
        data = datas[fileName];
        renderGraph();
        render_cartograms(data);
    }
    console.log(datas);

    svg.call(d3.zoom()
        .scaleExtent([0.1,3])
        .on("zoom", zoomed));
    function zoomed() {
        d3.selectAll(".container").attr("transform", d3.event.transform);
    }
}
render("979893388_cleaned");
addData("8327_cleaned");
addData("Mar de la Vida OJSC_cleaned");
addData("data_cleaned");

function addData(fileName){
    if(!datas[fileName]){
        d3.json("./data/" + fileName + ".json").then(graph=>{
            datas[fileName] = graph;
        })
    }
}

var maxDistance;

function ticked()
{
    links
        .attr("x1",function(d){return d.source.x;})
        .attr("y1",function(d){return d.source.y;})
        .attr("x2",function(d){return d.target.x;})
        .attr("y2",function(d){return d.target.y;})
        .attr("marker-end", "url(#resolved)");

    linksText
        .attr("x",function(d)
        {
            return (d.source.x+d.target.x)/2;

        })
        .attr("y",function(d)
        {
            return (d.source.y+d.target.y)/2;
        });

    gs.attr("transform",function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    // TODO:
    // maxDistance = {};
    // nodes.forEach
    // gs.selectAll("circle")
    //     .filter(d=>d.edge_type == "hidden_node")
    //     .attr("r", function(d){

    //     })
}

function started(d)
{
    if(!d3.event.active)
    {
        if(!stop_flag){
            forceSimulation.alphaTarget(0.9).restart();
        }
    }
    d.fx = d.x;
    d.fy = d.y;

    activeNode = d;

    updateTable();
}

function dragged(d)
{
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function ended(d)
{
    if(!d3.event.active)
    {
        forceSimulation.alphaTarget(0);
        
    }
    d.fx = null;
    d.fy = null;
}
