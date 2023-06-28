import {datas, data, activeNode} from '../graph.js';
import {fileName} from './graph_change_container.js';
import {render_sub_graph} from '../algorithm/sub_graph.js';
import {updateComboBox} from './graph_change_container.js';

//生成子图按钮
var sub_graph_container = d3.select("#right").append("div");
sub_graph_container.append("input")
    .attr("type", "button")
    .attr("value", "生成子图")
    .on("click", function(){
        var data_out = render_sub_graph(data, activeNode.id, sub_method);
        // console.log(data_out);
        datas[fileName + "_sub_" + activeNode.id + "(" + sub_method + ")"] = data_out;
        updateComboBox();
    })

// 子图下拉单
var sub_method = "Louvain";
sub_graph_container.append("select")
    .on("change", function(){
        sub_method = d3.select(this).property("value");
        console.log(sub_method);
    });

sub_graph_container.select("select").append("option")
    .attr("value", "Louvain").text("Louvain");
sub_graph_container.select("select").append("option")
    .attr("value", "Spectral").text("Spectral");
sub_graph_container.select("select").append("option")
    .attr("value", "Newman_Girvan").text("Newman_Girvan"); 
sub_graph_container.select("select").append("option")
    .attr("value", "1-Hop").text("1-Hop"); 
sub_graph_container.select("select").append("option")
    .attr("value", "2-Hop").text("2-Hop"); 
sub_graph_container.select("select").append("option")
    .attr("value", "3-Hop").text("3-Hop"); 

