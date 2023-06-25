var graph;
var hidden_nodes;
var hidden_edges;

var get_country_list = function (data_graph) {

    var country_list = {};
    data_graph.nodes.forEach(function (d) {
        if (country_list[d.country]) country_list[d.country] += 1;
        else country_list[d.country] = 1;
    });
    return country_list;
}

var get_node_type_list = function (data_graph) {

    var node_type_list = {};
    data_graph.nodes.forEach(function (d) {
        if (node_type_list[d.node_type]) node_type_list[d.node_type] += 1;
        else node_type_list[d.node_type] = 1;
    });
    return node_type_list;
}

var get_edge_type_list = function (data_graph) {

    var edge_type_list = {};
    data_graph.edges.forEach(function (dedge) {
        dedge.edge_type.forEach(function (d) {
            if (edge_type_list[d]) edge_type_list[d] += 1;
            else edge_type_list[d] = 1;
        });
    });
    return edge_type_list;
}

var get_louvain_cluster = function (graph) {

    var communities = graphologyLibrary.communitiesLouvain(graph);
    return communities;
}

export function render_sub_graph (data_graph, node_id) {
    
    graph = new graphology.Graph();
    data_graph.nodes.forEach(function (d) {
        if (!graph.hasNode(d.id) && d.id.indexOf("@") == -1) graph.addNode(d.id);
    });
    data_graph.edges.forEach(function (d) {
        if (d.source.id.indexOf("@") == -1) graph.addEdge(d.source.id, d.target.id);
    });
    console.log(graph);
    console.log("n_node:", graph.order);
    console.log("n_edge:", graph.size);

    var data_out = {
        country_list:{},
        edge_type_list:{},
        node_type_list:{},
        edges:[],
        nodes:[]
    };
    
    var cluster_res = get_louvain_cluster(graph);
    console.log("Cluster Result:", cluster_res);

    var cluster_labels = Object.entries(cluster_res).map(d => d[1]);
    var cluster_labels_count = {};
    cluster_labels.forEach(function (d) {
        if (cluster_labels_count[d]) cluster_labels_count[d] += 1;
        else cluster_labels_count[d] = 1;
    });
    var n_clusters = Math.max.apply(null, cluster_labels) + 1;

    if (node_id == null) {
        data_graph.edges.forEach(function (d) {
            if (d.edge_type != "hidden_edge") {
                var edge_new = {
                    source:d.source.id,
                    target:d.target.id,
                    edge_type:d.edge_type,
                    weight:d.weight
                };
                data_out.edges.push(edge_new);
            }
        });
        data_graph.nodes.forEach(function (d) {
            d["cluster"] = "@Cluster" + cluster_res[d.id];
            if (d.node_type != "hidden_node") {
                var hidden_edge = {
                    source:d["cluster"],
                    target:d.id,
                    edge_type:["hidden_edge"],
                    weight:1
                };
                data_out.nodes.push(d);
                data_out.edges.push(hidden_edge);
            }
        });
        data_out.country_list = get_country_list(data_out);
        for (var i = 0; i < n_clusters; i ++) {
            var hidden_node = {
                id:"@Cluster" + i,
                degree:cluster_labels_count[i],
                node_type:"hidden_node",
                country:null
            };
            data_out.nodes.push(hidden_node);
        }
        data_out.node_type_list = get_node_type_list(data_out);
        data_out.edge_type_list = get_edge_type_list(data_out);
    }
    else{
        var node_label = cluster_res[node_id];
        data_graph.edges.forEach(function (d) {
            if (d.edge_type != "hidden_edge" && cluster_res[d.source.id] == node_label && cluster_res[d.target.id] == node_label) {
                var edge_new = {
                    source:d.source.id,
                    target:d.target.id,
                    edge_type:d.edge_type,
                    weight:d.weight
                };
                data_out.edges.push(edge_new);
            }
        });
        data_graph.nodes.forEach(function (d) {
            if (d.node_type != "hidden_node" && cluster_res[d.id] == node_label) {
                data_out.nodes.push(d);
                // console.log(d.country, d.country==null)
                if (d.country != null) {
                    var hidden_edge = {
                        source:"@" + d.country,
                        target:d.id,
                        edge_type:["hidden_edge"],
                        weight:1
                    };
                    data_out.edges.push(hidden_edge);
                }
            }
        });
        data_out.country_list = get_country_list(data_out);
        for (var key in data_out.country_list) {
            if (key != "null") {
                var hidden_node = {
                    id:"@" + key,
                    degree:data_out.country_list[key],
                    node_type:"hidden_node",
                    country:null
                };
                data_out.nodes.push(hidden_node);
            }
        }
        data_out.node_type_list = get_node_type_list(data_out);
        data_out.edge_type_list = get_edge_type_list(data_out);
    }
    return data_out;
};