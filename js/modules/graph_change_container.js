import {updateGraph, render, datas} from '../graph.js';
var fileName = "979893388";
var graph_names;
// 图像切换下拉单
var graph_change_container = d3.select("#right").append("div");
graph_change_container.append("p")
    .text("图像选择:");

graph_change_container.append("select")
    .on("change", function(){
        fileName = d3.select(this).property("value");
        console.log(fileName);
        updateGraph();
        render(fileName);
    })

function addOption2ComboBox(d){
    graph_change_container.select("select")
        .append("option")
            .attr("value", d)
            .text(d)
}

function updateComboBox(){
    graph_names = new Array();
    for(var key in datas){
        graph_names.push(key)
    }
    graph_change_container.selectAll("option").remove();
    graph_names.forEach(graph_name => {
        addOption2ComboBox(graph_name);
    });
}
//TODO:死代码，改成读取data目录下所有数据
addOption2ComboBox("8327_cleaned");
addOption2ComboBox("Mar de la Vida OJSC_cleaned");
addOption2ComboBox("data_cleaned");

export {fileName, graph_names, addOption2ComboBox, updateComboBox};