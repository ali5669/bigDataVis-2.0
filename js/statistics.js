import { render_piechart } from "./modules_statistics/piechart.js";
import { render_barchart } from "./modules_statistics/barchart.js";
import { render_chordchart } from "./modules_statistics/chordchart.js";

export const cartogramSizes = {
    width:500,
    height:400,
    pad:20
}
export const cartogramDuration = 1000;

export var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .attr("opacity", 0.0);

export function render_cartograms (data_graph) {

    d3.select("#bottom")
        .selectAll("g")
        .remove();
        
    d3.select("#vis")
        .attr("width", 3600)
        .attr("height", 400);

    var country_count = data_graph.country_list;
    var node_type_list = data_graph.node_type_list;
    var edge_type_list = data_graph.edge_type_list;

    var idx2country = Object.keys(country_count);
    var country2idx = {};
    idx2country.forEach(function(d, i) {
        country2idx[d] = i;
    });

    var n_country = Object.keys(country_count).length;
    var flow_matrix = [...Array(n_country)].map(x => Array(n_country).fill(0));

    data_graph.edges.forEach(function(d) {
        flow_matrix[country2idx[d.source.country]][country2idx[d.target.country]] += 1;
    });

    render_piechart(country_count, 0);
    render_chordchart(flow_matrix, idx2country, 1);
    // render_barchart(country_count, 2);
    render_piechart(node_type_list, 2);
    render_piechart(edge_type_list, 3);

}