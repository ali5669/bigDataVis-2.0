function get_country_list (data_graph) {

    var country_list = {};
    data_graph.nodes.forEach(function (d) {
        if (country_list[d.country]) country_list[d.country] += 1;
        else country_list[d.country] = 1;
    });
    return country_list;
}

function get_node_type_list (data_graph) {

    var node_type_list = {};
    data_graph.nodes.forEach(function (d) {
        if (node_type_list[d.node_type]) node_type_list[d.node_type] += 1;
        else node_type_list[d.node_type] = 1;
    });
    return node_type_list;
}

function get_edge_type_list (data_graph) {

    var edge_type_list = {};
    data_graph.edges.forEach(function (dedge) {
        dedge.edge_type.forEach(function (d) {
            if (edge_type_list[d]) edge_type_list[d] += 1;
            else edge_type_list[d] = 1;
        });
    });
    return edge_type_list;
}

export { get_country_list, get_node_type_list, get_edge_type_list };