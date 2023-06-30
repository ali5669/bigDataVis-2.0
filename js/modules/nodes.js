import { nodeSizeScale, nodeColorScale, attrColorScale, forceSimulation, setActiveNode} from "../graph.js";
import { cluster_flag } from "./cluster_generate_container.js";
import { color_mode, credibility_flag } from "./color_mode_container.js";
import { attrColorInterpolate } from "./scale.js";
import { updateTable } from './node_search_container.js';
// import { stop_flag } from "./stop_mode_container.js";

export var get_nodes = function(g, nodes){
    //绘制顶点
    var gs = g.selectAll(".circleText")
        .data(nodes)
        .enter()
        .filter(d=>cluster_flag || d.node_type != "hidden_node")
        .append("g")
        .attr("transform",function(d,i){
            var cirX = d.x;
            var cirY = d.y;
            return "translate("+cirX+","+cirY+")";
        })
        .call(d3.drag()  //drag是鼠标拖拽事件，start是鼠标左键按下时的事件。drag是拖住事件。ended是鼠标结束点击事件。
            .on("start",started)   //started，drag，end是自定义的三个函数
            .on("drag",dragged)
            .on("end",ended)
        );

    //绘制节点
    gs.append("circle")
        .filter(d=>d.node_type != "hidden_node")
        .attr("r", d=>{//每个顶点的大小
            // if(d.node_type == "hidden_node"){
            //     return 100;
            // }
            return nodeSizeScale(d.degree)
        })   
        .attr("fill",function(d,i){//颜色
            // if(d.node_type == "hidden_node"){
            //     return "rgba(255, 133, 81, 0.2)";
            // }
            if(color_mode == "node_type"){
                return nodeColorScale(d.node_type);  
            }
            // var i = attrColorScale(d.attr_value)
            // console.log(i);
            if(credibility_flag){
                return attrColorInterpolate(attrColorScale(d.credibility_value)) + "";
            }
            return attrColorInterpolate(attrColorScale(d.attr_value)) + "";
        })

    //顶点上的文字
    gs.append("text")
        .filter(d=>d.node_type != "hidden_node")
        .attr("x",-10)
        .attr("y",-20)
        .attr("dy",10)
        .text(function(d)
        {
            return d.id;
        })
        .style("opacity", "0.8");

    gs.filter(d=>d.node_type == "hidden_node")
        .style("pointer-events", "none");


    var connectNode = [];
    gs.on('mouseenter', (d) => {
        d3.select("#left").selectAll("line")
            .filter(dline=>{
                if(dline.source.id == d.id) connectNode.push(dline.target.id);
                else if(dline.target.id == d.id) connectNode.push(dline.source.id);
                return dline.source.id == d.id || dline.target.id == d.id
            })
            .transition()
            .duration(100)
            .style("stroke-opacity", "0.8")
        connectNode.push(d.id);
        gs.selectAll("circle")
            .filter(dnode=>!connectNode.includes(dnode.id))
            .transition()
            .duration(100)
            .style("opacity", "0.2")
        gs.selectAll("text")
            .filter(dnode=>!connectNode.includes(dnode.id))
            .transition()
            .duration(100)
            .style("opacity", "0")
    })
        .on('mouseleave', (d) => {
            d3.select("#left").selectAll("line")
                .filter(dline=>dline.source.id == d.id || dline.target.id == d.id)
                .transition()
                .duration(100)
                .style("stroke-opacity", "0.2")
            gs.selectAll("circle")
                .filter(dnode=>!connectNode.includes(dnode.id))
                .transition()
                .duration(100)
                .style("opacity", "1")
            gs.selectAll("text")
                .filter(dnode=>!connectNode.includes(dnode.id))
                .transition()
                .duration(100)
                .style("opacity", "0.8")
            connectNode = new Array();
        });

    return gs;
}
//选中
function started(d)
{
    if(!d3.event.active)//当现在没有动画，
    {
        forceSimulation.alphaTarget(0.9).restart();
    }

    d.fx = d.x;
    d.fy = d.y;

    setActiveNode(d);

    updateTable();
}
//拖拽
function dragged(d)
{
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}
//松开
function ended(d)
{
    if(!d3.event.active)
    {
        // if(stop_flag){
        //     forceSimulation.alphaTarget(0).stop(); 
        // }else{
        //     forceSimulation.alphaTarget(0);
        // }
        forceSimulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
}