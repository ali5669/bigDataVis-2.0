import {resetGraph, renderGraph, data, datas, setActiveNode, setData} from '../graph.js';
import {render_sub_graph} from '../modules_clustering/sub_graph.js';
import { setForce } from './force_container.js';

//聚类模式
export var cluster_flag = false;

//生成聚类按钮
var cluster_genarate_container = d3.select("#right").append("div");

//聚类算法下拉单
var cluster_method = "Normal";
cluster_genarate_container.append("select")
    .on("change", function(){
        cluster_method = d3.select(this).property("value");
        setActiveNode(null);
        if(cluster_method != "Normal"){
            var data_out = render_sub_graph(data, null, cluster_method);
            setData(data_out);
            cluster_flag = true;
            setForce(0);
        }else{
            cluster_flag = false;
            setForce(1);
        }
        
        resetGraph();
        renderGraph();
        console.log(cluster_method);
    })

cluster_genarate_container.select("select").append("option")
    .attr("value", "Normal").text("Normal");
cluster_genarate_container.select("select").append("option")
    .attr("value", "Louvain").text("Louvain");
cluster_genarate_container.select("select").append("option")
    .attr("value", "Spectral").text("Spectral");
cluster_genarate_container.select("select").append("option")
    .attr("value", "Newman_Girvan").text("Newman_Girvan");
cluster_genarate_container.select("select").append("option")
    .attr("value", "Country").text("Country"); 