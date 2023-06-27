export var get_marker = function(svg){
    svg.append("marker")
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
}