import { renderGraph, updateGraph } from "../graph.js";

var node_type_flags = {
    "person": true, 
    "organization": true, 
    "company": true, 
    "political_organization": true, 
    "location": true, 
    "vessel": true, 
    "event": true, 
    "movement": true
};

var container = d3.select("#right").append("div")
    .attr("id", "node-edge-filter");
var node_type_filter_container = container.append("div")
    .attr("id", "node-filter");

for(let key in node_type_flags){
    node_type_filter_container.append("input")
        .attr("type", "checkbox")
        .property("checked", true)
        .on("change", function(){
            node_type_flags[key] = !node_type_flags[key];
            updateGraph();
            renderGraph();
        });
    node_type_filter_container.append("label")
        .text(key);
    node_type_filter_container.append("p");
}

export {node_type_flags};