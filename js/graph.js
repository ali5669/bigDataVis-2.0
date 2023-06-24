
var margin = {top:60,bottom:60,left:60,right:60}
var svg = d3.select("#graph")    //获取画布
var width = svg.attr("width")  //画布的宽
var height = svg.attr("height")   //画布的高


var ownership_force = 1;
var partnership_force = 1;
var family_relationship_force = 1;
var membership_force = 1;

let links;
let linksText;
let gs;
let forceSimulation;

// 力调整滑块
d3.select("#right").append("p")
    .text("ownership_force");

d3.select("#right").append("input")
    .attr("type", "range")
    .attr("min", 0.0)
    .attr("max", 5.0)
    .attr("step", 0.01)
    .attr("value", ownership_force)
    .on("mouseup", function() { ownership_force = this.value; render();});

d3.select("#right").append("p")
    .text("partnership_force");

d3.select("#right").append("input")
    .attr("type", "range")
    .attr("min", 0.0)
    .attr("max", 5.0)
    .attr("step", 0.01)
    .attr("value", partnership_force)
    .on("mouseup", function() { partnership_force = this.value; render();});

d3.select("#right").append("p")
    .text("family_relationship_force");

d3.select("#right").append("input")
    .attr("type", "range")
    .attr("min", 0.0)
    .attr("max", 5.0)
    .attr("step", 0.01)
    .attr("value", family_relationship_force)
    .on("mouseup", function() { family_relationship_force = this.value; render();});

d3.select("#right").append("p")
    .text("membership_force");

d3.select("#right").append("input")
    .attr("type", "range")
    .attr("min", 0.0)
    .attr("max", 5.0)
    .attr("step", 0.01)
    .attr("value", membership_force)
    .on("mouseup", function() { membership_force = this.value; render();});


// 图像切换下拉单
d3.select("#right").append("p")
    .text("图像选择:");
var fileName = "979893388";

d3.select("#right").append("select")
    .on("change", function(){
        fileName = d3.select(this).property("value");
        console.log(fileName);
        render();
    })

function addOption2ComboBox(d){
    d3.select("#right").select("select")
        .append("option")
            .attr("value", d)
            .text(d)
}

addOption2ComboBox("979893388");
addOption2ComboBox("data");
addOption2ComboBox("8327");
addOption2ComboBox("Mar de la Vida OJSC");

// 绘制
var render = function(){
    svg.selectAll("*").remove();//直接jquery的remove()就行
    var g = svg.append("g")
        .attr("class", "container")
        .attr("transform","translate("+margin.top+","+margin.left+")");
    
    d3.json("./data/" + fileName +"_cleaned.json").then(data=>{
        //结点数据
        var nodes = data.nodes;
        //边数据，id是nodes数组中的元素下标
        var edges = data.edges;
        //国家数据
        var country = data.country_list;
        //节点类型数据
        var nodeType = data.node_type_list;
        //边类型数据
        var edgeType = data.edge_type_list;

        //设置一个color的颜色比例尺，为了让不同的顶点呈现不同的颜色
        var colorScale = d3.scaleOrdinal()
            .domain(d3.range(nodes.length))
            .range(d3.schemeCategory10);
        
        //新建一个力导向图，固定语句
        forceSimulation = d3.forceSimulation()
            .force("link",d3.forceLink().id(d=>d.id).strength(link=>{
                var forceStd = 1/Math.min(link.source.degree, link.target.degree);
                switch(link.edge_type){
                    case 'ownership': return ownership_force * forceStd;
                    case 'partnership': return partnership_force * forceStd;
                    case 'family_relationship': return family_relationship_force * forceStd;
                    case 'membership': return membership_force * forceStd;
                    default: return forceStd;
                }
            }))
            .force("charge",d3.forceManyBody())
            .force("center",d3.forceCenter(width/2, height/2));

        //初始化力导向图，也就是传入数据
        //生成节点数据
        forceSimulation.nodes(nodes).on("tick",ticked);//on()方法用于绑定时间监听器，tick事件是力导向布局每隔一段时间就会做的事

        //生成边数据
        forceSimulation.force("link")
            .links(edges)
            .distance(function(d)
            {   //每一边显示出来的长度
                return Math.ceil((Math.random()+2)*100);
            })    	

        //设置图形的中心位置	
        forceSimulation.force("center").x(width/3).y(height/3);	

        //有了节点和边的数据后，我们开始绘制
        //绘制边。要先绘制边，之后绘制顶点
        links = g.append("g")
            .selectAll("line")   //选择所有"line"元素
            .data(edges)   //将edges绑定上
            .enter()
            .append("line")
            .attr("stroke",function(d,i)
            {
                return colorScale(i);  //这里决定了边的颜色
            })
            .attr("stroke-width",1);   //边的粗细
        
        console.log(links);
        console.log(forceSimulation);

        //为边添加文字
        linksText = g.append("g")
            .selectAll("text")
            .data(edges)   
            .enter()
            .append("text")
            .text(function(d)
            {
                return "";  //这里返回的内容决定了每条边上显示的文字
            })

        //绘制顶点
        gs = g.selectAll(".circleText")
            .data(nodes)
            .enter()
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
            .attr("r",10)   //每个顶点的大小
            .attr("fill",function(d,i)
            {
                return d3.rgb(d.name);  //颜色
            })

        //顶点上的文字
        gs.append("text")
            .attr("x",-10)
            .attr("y",-20)
            .attr("dy",10)
            .text(function(d)
            {
                return d.id;
            })
        
        //有向图的边是用带箭头的线来表示。如果是无向图，不需要这段代码
        var marker=	svg.append("marker")
                        .attr("id", "resolved")
                        .attr("markerUnits","userSpaceOnUse")
                        .attr("viewBox", "0 -5 10 10")//坐标系的区域
                        .attr("refX",26)//箭头在线上的位置，数值越小越靠近顶点
                        .attr("refY", 0)
                        .attr("markerWidth", 6)//箭头的大小（长度）
                        .attr("markerHeight", 6)  //没用
                        .attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
                        .attr("stroke-width",2)//箭头宽度
                        .append("path")
                        .attr("d", "M0,-5L10,0L0,5")//箭头的路径
                        .attr('fill','#000000');//箭头颜色

    });

    svg.call(d3.zoom()
        .scaleExtent([0.1,3])
        .on("zoom", zoomed));
    function zoomed() {
        d3.selectAll(".container").attr("transform", d3.event.transform);
    }
}
render();


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
}

function started(d)
{
    if(!d3.event.active)
    {
        forceSimulation.alphaTarget(0.8).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d)
{
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function ended(d)
{
    if(!d3.event.active)
    {
        forceSimulation.alphaTarget(0);
        
    }
    d.fx = null;
    d.fy = null;
}
