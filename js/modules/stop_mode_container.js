var stop_flag = false;
var stop_mode_container = d3.select("#right").append("div");
stop_mode_container.append("input")
    .attr("type", "checkbox")
    .on("change", function(){
        stop_flag = !stop_flag;
        if(stop_flag){
            forceSimulation.stop();
        }else{
            forceSimulation.restart();
        }
        console.log(stop_flag);
    })
stop_mode_container.append("label")
    .text("停止布局计算");

export {stop_flag};