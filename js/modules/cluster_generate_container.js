import {updateComboBox, fileName} from './graph_change_container.js';
import {activeNode, data, datas, setActiveNode} from '../graph.js';
import {render_sub_graph} from '../modules_clustering/sub_graph.js';

//生成聚类按钮
var cluster_genarate_container = d3.select("#right").append("div");
cluster_genarate_container.append("input")
    .attr("type", "button")
    .attr("value", "生成聚类")
    .on("click", function(){
        var data_out = render_sub_graph(data, null, cluster_method);
        datas[fileName + "_cluster(" + cluster_method + ")"] = data_out;
        updateComboBox();
        setActiveNode(null);
    })

//聚类算法下拉单
var cluster_method = "Louvain";
cluster_genarate_container.append("select")
    .on("change", function(){
        cluster_method = d3.select(this).property("value");
        console.log(cluster_method);
    })

cluster_genarate_container.select("select").append("option")
    .attr("value", "Louvain").text("Louvain");
cluster_genarate_container.select("select").append("option")
    .attr("value", "Spectral").text("Spectral");
cluster_genarate_container.select("select").append("option")
    .attr("value", "Newman_Girvan").text("Newman_Girvan");
cluster_genarate_container.select("select").append("option")
    .attr("value", "Country").text("Country"); 