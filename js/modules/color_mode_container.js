import {data, setData, resetGraph, renderGraph} from '../graph.js';
import {get_attr_value} from '../modules_node_attr/node_attr_value.js';

//颜色模式
var color_mode_container = d3.select("#right").append("div");
var color_mode = "node_type";
var credibility_flag = false;

color_mode_container.append("p").text("节点颜色模式:")
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

export {color_mode, credibility_flag};