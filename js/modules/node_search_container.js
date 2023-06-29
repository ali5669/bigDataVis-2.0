import {data, activeNode, setActiveNode, zoom} from '../graph.js';
//中间节点监视器
var search_node_id;
var node_search_container = d3.select("#center").append("div");
var node_search_input = node_search_container.append("input")
    .attr("type", "text")
    .attr("placeholder", "输入节点ID")
    .on("input", function(){
        search_node_id = this.value;
    });

var node_search_btn = node_search_container.append("button")
    .attr("id", "node_search_btn")
    .text("标记节点")
    .on("click", function(){
        data.nodes.forEach(node => {
            if(node.id == search_node_id){
                setActiveNode(node);
                // TODO: 将svg视口变换到节点位置
                var nodePosition = d3.zoomIdentity.translate(node.x, node.y);
                d3.selectAll(".container")
                    .transition()
                    .duration(750)
                    .call(zoom, nodePosition);
                updateTable();
            }
        });
    });


var node_monitor_container = d3.select("#center").append("div");
var keyData = ["node_type", "id", "country", "degree", "x", "y"]

var table = node_monitor_container.append("table")
    .attr("class", "mytable")
//表头
var thead = table.append("thead");
var headerRow = thead.append("tr");
headerRow.append("th").text("节点属性");
headerRow.append("th").text("值");

var tbody = table.append("tbody");

function updateTable(){
    var rows = tbody.selectAll("tr")
        .data(keyData)
    
    rows.exit().remove();

    var newRows = rows.enter().append("tr");
    //属性列
    newRows.append("td")
        .text(d=>d);
    //值列
    newRows.append("td")
        .text(d=>activeNode[d]);
    //更新第二列的值
    rows.select("td:last-child")
        .text(d=>activeNode[d]);
}

export {updateTable};