import {resetGraph, renderGraph} from '../graph.js';

//聚类模式
var cluster_flag = false;
var country_mode_container = d3.select("#right").append("div");
country_mode_container.append("input")
    .attr("type", "checkbox")
    .on("change", function(){
        cluster_flag = !cluster_flag;
        console.log(cluster_flag);
        resetGraph();
        renderGraph();
    })
country_mode_container.append("label")
    .text("聚类模式");

export { cluster_flag };