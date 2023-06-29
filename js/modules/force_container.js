import {updateGraph, renderGraph} from '../graph.js';
// 力参数
var ownership_force = 1;
var partnership_force = 1;
var family_relationship_force = 1;
var membership_force = 1;
var cluster_force = 2;

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

var resetForce = function(){
    force_container.selectAll("input")
        .property("value", 0)
        .attr("value", 0);
    ownership_force = 0;
    partnership_force = 0;
    family_relationship_force = 0;
    membership_force = 0;
}

export {ownership_force, partnership_force, family_relationship_force, membership_force, cluster_force, resetForce};