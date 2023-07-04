import { get_country_list, get_node_type_list, get_edge_type_list } from "./utils.js"

export function filter_graph (data_graph, node_types, edge_types) {
    
    var data_out = {
        country_list:{},
        edge_type_list:{},
        node_type_list:{},
        edges:[],
        nodes:[]
    };

    data_graph.nodes.forEach(function (node) {
        if (node_types.indexOf(node.node_type) != -1) data_out.nodes.push(node);
    });

    data_graph.edges.forEach(function (edge) {
        if (node_types.indexOf(edge.source.node_type) != -1 && node_types.indexOf(edge.source.node_type) != -1) {
            if (edge_types.indexOf(edge.edge_type) != -1) data_out.edges.push(edge);
        }
    });

    data_out.country_list = get_country_list(data_out);
    data_out.node_type_list = get_node_type_list(data_out);
    data_out.edge_type_list = get_edge_type_list(data_out);

    return data_out;
}