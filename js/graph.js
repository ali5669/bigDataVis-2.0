import { render_cartograms } from "./statistics.js"
import { addOption2ComboBox } from "./modules/graph_change_container.js"
import "./modules/node_type_filter_container.js"
import "./modules/cluster_method_container.js"
import "./modules/sub_graph_container.js"
// import "./modules/stop_mode_container.js"
import { get_node_color_scale, get_link_color_scale, get_node_size_scale, get_attr_color_scale} from './modules/scale.js';
import { draw_legend } from "./modules/draw_legend.js";
import { gen_force_simulation } from "./modules/forceSimulation.js";
import { get_links, get_links_text } from "./modules/links.js";
import { get_nodes } from "./modules/nodes.js";
import { get_marker } from "./modules/marker.js";
import { get_cluster_circle } from "./modules/cluster_circle.js"
import { get_nodes_statistics } from "./modules_node_attr/nodes_statistics.js"

var margin = {top:60,bottom:60,left:60,right:60}
var svg = d3.select("#graph")    //获取画布
var g = svg.append("g")
        .attr("class", "container")
        .attr("transform","translate("+margin.top+","+margin.left+")");
var legendContainer = svg.select("#legendContainer");
var width = svg.attr("width")  //画布的宽
var height = svg.attr("height")   //画布的高

var activeNode;

var forceSimulation;
var links;
var linksText;
var gs;

var nodeColorScale;
var linkColorScale;
var nodeSizeScale;
var attrColorScale;

var data;
var datas = new Array();
var data_nodes_statistics = {};

var zoom;

//设置data
var setData = function(newData){
    data = newData;
}
//设置选中节点
var setActiveNode = function(newNode){
    activeNode = newNode;
}

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
    g.selectAll("*").remove();
    svg.select("#legendContainer").remove();
    svg.selectAll("marker").remove();
    svg.selectAll("defs").remove();
}

// 绘制图
var renderGraph = function(){
    console.log(data);
    //节点和边
    var nodes = data.nodes;
    var edges = data.edges;
    //国家数据
    // var country = data.country_list;
    //节点类型数据
    // var nodeType = data.node_type_list;
    var nodeType = {
        organization:0,
        company:1,
        null:2,
        location:3,
        person:4,
        movement:5,
        event:6,
        vessel:7,
        political_organization:8
    }
    //边类型数据
    // var edgeType = data.edge_type_list;
    var edgeType = {
        ownership:0,
        family_relationship:1,
        membership:2,
        partnership:3
    }
    //根据数据生成各种比例尺
    nodeColorScale = get_node_color_scale(nodeType);
    linkColorScale = get_link_color_scale(edgeType);
    nodeSizeScale = get_node_size_scale(nodes);
    attrColorScale = get_attr_color_scale(nodes);
    //绘制比例尺图例
    draw_legend(svg, nodeType, edgeType, nodeColorScale, linkColorScale);
    //力导图模型
    forceSimulation = gen_force_simulation(nodes, edges);
    //边
    links = get_links(edges, svg, g);
    //边上的文字
    linksText = get_links_text(g, edges);
    //节点
    gs = get_nodes(g, nodes, forceSimulation);
    //聚类圆圈
    get_cluster_circle(g);
    //箭头
    get_marker(svg);
    
}

// 绘制
var render = function(fileName){
    if(!datas[fileName]){
        d3.json("./data/" + fileName + ".json").then(graph=>{
            datas[fileName] = graph;
            data = graph;
            renderGraph();
            // render_cartograms(data);
            addOption2ComboBox(fileName);
        })
    }else{
        data = datas[fileName];
        renderGraph();
        // render_cartograms(data);
    }
    console.log(datas);

    zoom = svg.call(d3.zoom()
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
            if(fileName == "data_cleaned"){
                data_nodes_statistics = get_nodes_statistics(datas[fileName]);
                console.log("data_nodes_statistics", data_nodes_statistics);
            }
        })
    }
}

export {
    width, height, activeNode, forceSimulation, links, linksText, gs, nodeColorScale, 
    linkColorScale, nodeSizeScale, attrColorScale, data, datas, data_nodes_statistics,
    setData, setActiveNode, resetGraph, updateGraph, renderGraph, render, zoom
};