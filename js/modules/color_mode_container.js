import {data, setData, resetGraph, renderGraph, updateGraph} from '../graph.js';
import {get_attr_value} from '../modules_node_attr/node_attr_value.js';

//颜色模式
var color_mode_container = d3.select("#right").append("div");
var color_mode = "node_type";
var credibility_flag = false;

color_mode_container.append("p").text("Node Color Mode:")
color_mode_container.append("select")
    .on("change", function(){
        color_mode = d3.select(this).property("value");
        if(color_mode == "Credibility_ShortestPath"){
            credibility_flag = true;
        }else{
            credibility_flag = false;
        }
        if(color_mode != "node_type"){
            var data_out = get_attr_value(data, color_mode);
            setData(data_out);
        }
        updateGraph();
        renderGraph();
        // TODO:
        // 在color—mode改变时，
        // 对所有节点selectAll，
        // 更改其attr的fill

    })

function resetColorModeContainer () {
    color_mode = "node_type";
    color_mode_container.select("select")
        .property("value", "node_type");
}

color_mode_container.select("select").append("option")
    .attr("value", "node_type").text("Node Type");
color_mode_container.select("select").append("option")
    .attr("value", "Weighted_Degree").text("Weighted Degree");
// color_mode_container.select("select").append("option")
//     .attr("value", "Eccentricity").text("Eccentricity");
color_mode_container.select("select").append("option")
    .attr("value", "Credibility_ShortestPath").text("Credibility ShortestPath");
color_mode_container.select("select").append("option")
    .attr("value", "Betweenness_Centrality").text("Betweenness Centrality");
color_mode_container.select("select").append("option")
    .attr("value", "Closeness_Centrality").text("Closeness Centrality");
color_mode_container.select("select").append("option")
    .attr("value", "Degree_Centrality").text("Degree Centrality");
color_mode_container.select("select").append("option")
    .attr("value", "Eigenvector_Centrality").text("Eigenvector Centrality");
color_mode_container.select("select").append("option")
    .attr("value", "HITS_Authority").text("HITS Authority");
color_mode_container.select("select").append("option")
    .attr("value", "HITS_Hub").text("HITS Hub");
color_mode_container.select("select").append("option")
    .attr("value", "PageRank").text("PageRank");
color_mode_container.select("select").append("option")
    .attr("value", "Vessel_Ownership").text("Vessel Ownership");

export {color_mode, credibility_flag, resetColorModeContainer};