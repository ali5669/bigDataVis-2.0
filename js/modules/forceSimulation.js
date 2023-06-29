import {ownership_force, partnership_force, family_relationship_force, membership_force, cluster_force} from './force_container.js';
import {cluster_flag} from './cluster_mode_container.js';
import {forceScale} from './scale.js';
import {nodeSizeScale, width, height, links, linksText, gs} from '../graph.js';
import { update_cluster_circles } from './cluster_circle.js';

export var gen_force_simulation = function(nodes, edges){
    //新建一个力导向图，固定语句
    var forceSimulation = d3.forceSimulation()
        .force("link",d3.forceLink().id(d=>d.id).strength(link=>{
            var forceStd = 1/Math.min(link.source.degree, link.target.degree);
            var linkForce = 0;
            link.edge_type.forEach(element => {
                switch(element){
                    case 'ownership': 
                        linkForce += ownership_force * forceStd;
                        break;
                    case 'partnership': 
                        linkForce += partnership_force * forceStd;
                        break;
                    case 'family_relationship':
                        linkForce += family_relationship_force * forceStd;
                        break;
                    case 'membership': 
                        linkForce += membership_force * forceStd;
                        break;
                    default: 
                        if(cluster_flag){
                            linkForce += cluster_force * forceStd;
                        }
                        break;
                }
            });
            return forceScale(linkForce);
        }))
        .force("charge",d3.forceManyBody())
        // .force("collide",d3.forceCollide(d=>d.r * 2))
        .force("center",d3.forceCenter(width/2, height/2));

    //初始化力导向图，也就是传入数据
    //生成节点数据
    forceSimulation.nodes(nodes).on("tick",ticked);//on()方法用于绑定时间监听器，tick事件是力导向布局每隔一段时间就会做的事

    //生成边数据
    forceSimulation.force("link")
        .links(edges)
        .distance(function(d){//每一边显示出来的长度
            // d.source.
            if(cluster_flag){
                return 0;
            }
            var len = nodeSizeScale(d.source.degree) + nodeSizeScale(d.target.degree);
            len = len + 50;

            // return Math.ceil((Math.random()+2)*100);
            return Math.ceil(len);
        })    	

    //设置图形的中心位置	
    forceSimulation.force("center").x(width/3).y(height/3);	

    return forceSimulation;
}


function ticked()
{
    links
        .attr("x1",function(d){return d.source.x;})
        .attr("y1",function(d){return d.source.y;})
        .attr("x2",function(d){return d.target.x;})
        .attr("y2",function(d){return d.target.y;})
        .attr("marker-end", "url(#resolved)");

    linksText
        .attr("x",function(d)
        {
            return (d.source.x+d.target.x)/2;

        })
        .attr("y",function(d)
        {
            return (d.source.y+d.target.y)/2;
        });

    gs.attr("transform",function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    // TODO: 给cluster——circle绑定更新语句
    update_cluster_circles();
}