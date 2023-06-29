import {nodeSizeScale, data} from '../graph.js';
import { cluster_flag } from './cluster_mode_container.js';
var enclosingCircles;

export var get_cluster_circle = function(g){

    enclosingCircles = new Array();
    if (cluster_flag) {
        for (let cluster_name in data.cluster_list) {
            var enclosingCircle = g.append("circle")
                .attr("id", "cluster" + cluster_name)
                .attr("stroke", "red")
                .attr("fill", "none");
            enclosingCircles[cluster_name] = enclosingCircle;
        }

        console.log(enclosingCircles);
    }
}

export var update_cluster_circles = function(){
    for(let cluster_name in enclosingCircles){
        var circleAttr = d3.packEnclose(
            data.nodes
                .filter(function(d){
                    return d.cluster == cluster_name && d.node_type != "hidden_node";
                })
                .map(d=>({
                    x:d.x, y:d.y, r:nodeSizeScale(d.degree)
                }))
        );
        enclosingCircles[cluster_name]
            .attr("cx", circleAttr.x).attr("cy", circleAttr.y).attr("r", circleAttr.r);
    }
}