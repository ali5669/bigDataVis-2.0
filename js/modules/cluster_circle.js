import {nodeSizeScale, data} from '../graph.js';
var enclosingCircles = new Array();
export var get_cluster_circle = function(g){
    data.clusters.forEach(d => {
        var enclosingCircle = g.append("circle")
            .attr("id", "cluster" + d)
            .attr("stroke", "red")
            .attr("fill", "none");
        enclosingCircles[d] = enclosingCircle;
    });

    console.log(enclosingCircles);
}

export var update_cluster_circles = function(){
    for(let key in enclosingCircles){
        var circleAttr = d3.packEnclose(
            data.nodes
                .filter(function(d){
                    return d.cluster = key && d.node_type != "hidden_node";
                })
                .map(d=>({
                    x:d.x, y:d.y, r:nodeSizeScale(d.degree)
                }))
        );
        enclosingCircles[key]
            .attr("cx", circleAttr.x).attr("cy", circleAttr.y).attr("r", circleAttr.r);
    }
}