import { resetGraph, renderGraph, data, datas, setActiveNode, setData, updateGraph } from '../graph.js';
import { render_sub_graph } from '../modules_sub_graph/sub_graph.js';
import { resetForce } from './force_container.js';
import { resetColorModeContainer } from './color_mode_container.js';

//聚类模式
export var cluster_flag = false;

//聚类方法下拉单
var cluster_method_container = d3.select("#right").append("div");

var cluster_method = "Normal";
cluster_method_container.append("select")
    .on("change", function(){
        cluster_method = d3.select(this).property("value");
        setActiveNode(null);
        resetColorModeContainer();
        if(cluster_method != "Normal"){
            var data_out = render_sub_graph(data, null, cluster_method);
            setData(data_out);
            cluster_flag = true;
            resetForce(0);
        }else{
            cluster_flag = false;
            resetForce(1);
        }
        updateGraph();
        renderGraph();
        console.log(cluster_method);
    })

function resetClusterMethodContainer () {
    cluster_method = "Normal";
    cluster_method_container.select("select")
        .property("value", "Normal");
    resetForce(1);
}

cluster_method_container.select("select").append("option")
    .attr("value", "Normal").text("Normal");
cluster_method_container.select("select").append("option")
    .attr("value", "Louvain").text("Louvain");
cluster_method_container.select("select").append("option")
    .attr("value", "Spectral").text("Spectral");
cluster_method_container.select("select").append("option")
    .attr("value", "Newman_Girvan").text("Newman_Girvan");
cluster_method_container.select("select").append("option")
    .attr("value", "Country").text("Country");

export { resetClusterMethodContainer };