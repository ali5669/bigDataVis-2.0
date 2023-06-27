import { credibility_flag } from "./color_mode_container.js";

var get_node_color_scale = function(nodeType) {
    var nodeColorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(Object.keys(nodeType));
    return nodeColorScale;
}

var get_link_color_scale = function(edgeType){
    var linkColorScale = d3.scaleOrdinal()
        .domain(Object.keys(edgeType))
        .range(['orange', 'aqua', 'purple', 'blue']);
    return linkColorScale;
}

var get_node_size_scale = function(nodes){
    //大小比例尺
    var max = Math.max.apply(Math, nodes.map(obj=>obj.degree));
    var min = Math.min.apply(Math, nodes.map(obj=>obj.degree));
    var nodeSizeScale = d3.scaleLinear()
        .domain([min, max])
        .range([5, 50])

    return nodeSizeScale;
}

const forceScale = d3.scaleLinear()
    .domain([0, 5])
    .range([0, 1])

var get_attr_color_scale = function(nodes){
    // node.attr_value节点颜色比例尺
    var max = Math.max.apply(Math, nodes.map(obj=>obj.attr_value).filter(item=>item != undefined));
    var min = Math.min.apply(Math, nodes.map(obj=>obj.attr_value).filter(item=>item != undefined));
    if(credibility_flag){
        max = Math.max.apply(Math, nodes.map(obj=>obj.credibility_value).filter(item=>item != undefined));
        min = Math.min.apply(Math, nodes.map(obj=>obj.credibility_value).filter(item=>item != undefined));
    }
    var attrColorScale = d3.scaleLinear()
        .domain([min, max])
        .range([0, 1]);
    return attrColorScale;
}

const attrColorInterpolate = d3.interpolateRgb("blue", "red");

export {get_node_color_scale, get_link_color_scale, get_node_size_scale, get_attr_color_scale, forceScale, attrColorInterpolate};