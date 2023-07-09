import { render_piechart } from "./modules_statistics/piechart.js";
import { render_barchart } from "./modules_statistics/barchart.js";
import { render_chordchart } from "./modules_statistics/chordchart.js";
import { render_violinchart } from "./modules_statistics/violinchart.js";
import { render_sub_graph } from './modules_sub_graph/sub_graph.js';
import { activeNode, nodeColorScale, linkColorScale } from "./graph.js"

const piechartSizes = {
    width:500,
    height:400,
    pad:20
}
const violinchartSizes = {
    width:250,
    height:400,
    pad:20
}

const cartogramDuration = 1000;

const margin = { top: 25, right: 25, bottom: 10, left: 25 };

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .attr("opacity", 0.0);

function clear_cartograms () {

    d3.select("#bottom-0")
        .selectAll("g")
        .remove();
    d3.select("#bottom-1")
        .selectAll("g")
        .remove();
}

export function render_cartograms (data_graph) {

    clear_cartograms();

    const data_graph_1hop = render_sub_graph(data_graph, activeNode.id, "1-Hop");
    
    const country_count = data_graph.country_list;
    const node_type_list = data_graph.node_type_list;
    const edge_type_list = data_graph.edge_type_list;

    const country_count_1hop = data_graph_1hop.country_list;
    const node_type_list_1hop = data_graph_1hop.node_type_list;
    const edge_type_list_1hop = data_graph_1hop.edge_type_list;

    const idx2country = Object.keys(country_count);
    var country2idx = {};
    idx2country.forEach(function(d, i) {
        country2idx[d] = i;
    });

    const n_country = Object.keys(country_count).length;
    var flow_matrix = [...Array(n_country)].map(x => Array(n_country).fill(0));

    data_graph.edges.forEach(function(d) {
        flow_matrix[country2idx[d.source.country]][country2idx[d.target.country]] += 1;
    });

    render_piechart(country_count_1hop, null, 0);
    render_piechart(node_type_list_1hop, nodeColorScale, 1);
    render_piechart(edge_type_list_1hop, linkColorScale, 2);

    render_violinchart(activeNode, ["degree"], 0);
    render_violinchart(activeNode, ["weightedDegree"], 1);
    render_violinchart(activeNode, ["inDegree"], 2);
    render_violinchart(activeNode, ["outDegree"], 3);
    render_violinchart(activeNode, ["vesselOwnership"], 4);
    render_violinchart(activeNode, ["partners"], 5);
    render_violinchart(activeNode, ["relatives"], 6);
    render_violinchart(activeNode, ["eventInvolved"], 7);
}

export {
    piechartSizes,
    violinchartSizes,
    cartogramDuration,
    margin,
    tooltip
}