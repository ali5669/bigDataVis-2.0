import { get_country_cluster } from "./country_clustering.js";
import { get_spectral_cluster } from "./spectral_clustering.js";
import { get_louvain_cluster } from "./louvain_clustering.js";
import { get_newman_girvan_cluster } from "./newman_girvan_clustering.js";
import { get_khop_cluster } from "./khop_clustering.js";
import { get_country_list, get_node_type_list, get_edge_type_list } from "./utils.js"

var graph;

export function render_sub_graph (data_graph, node_id, method) {
    
    graph = new graphology.Graph();
    data_graph.nodes.forEach(function (d) {
        if (!graph.hasNode(d.id) && d.node_type != "hidden_node") graph.addNode(d.id, {
            country:d.country
        });
    });
    data_graph.edges.forEach(function (d) {
        if (d.source.node_type != "hidden_node") graph.addDirectedEdge(d.source.id, d.target.id, {
            weight:d.weight
        });
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

    if (method == "Country") {
        var cluster_res = get_country_cluster(graph);
    }
    else if (method == "Spectral") {
        var cluster_res = get_spectral_cluster(graph);
    }
    else if (method == "Louvain") {
        var cluster_res = get_louvain_cluster(graph);
    }
    else if (method == "Newman_Girvan") {
        var cluster_res = get_newman_girvan_cluster(graph);
    }
    else if (method.slice(-4) == "-Hop") {
        var cluster_res = get_khop_cluster(graph, node_id, parseInt(method.slice(0, -4)))
    }
    else {
        console.log(method + " Not Implemented.")
        return data_out;
    }
    console.log("Cluster Result:", cluster_res);

    var cluster_labels = Object.entries(cluster_res).map(d => d[1]);
    var cluster_labels_count = {};
    cluster_labels.forEach(function (cluster_label) {
        if (cluster_label != null) {
            if (cluster_labels_count[cluster_label]) cluster_labels_count[cluster_label] += 1;
            else cluster_labels_count[cluster_label] = 1;
        }
    });

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
            
            if (d.node_type != "hidden_node") {
                if (cluster_res[d.id] == null) {
                    d["cluster"] = null;
                    // data_out.nodes.push(d);
                }
                else {
                    d["cluster"] = cluster_res[d.id];
                    var hidden_edge = {
                        source:"@Cluster_" + cluster_res[d.id],
                        target:d.id,
                        edge_type:["hidden_edge"],
                        weight:1
                    };
                    data_out.edges.push(hidden_edge);
                }
                data_out.nodes.push(d);
                // console.log(d["cluster"]);
            }
            
        });
        data_out.country_list = get_country_list(data_out);
        data_out.cluster_list = cluster_labels_count;
        for (let cluster_name in cluster_labels_count) {
            var hidden_node = {
                id:"@Cluster_" + cluster_name,
                degree:cluster_labels_count[cluster_name],
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
        var node_neighbors = new Array();
        data_graph.edges.forEach(function (d) {
            if (d.source.id == node_id && node_neighbors.indexOf(d.target.id) == -1) {
                node_neighbors.push(d.target.id);
            }
            else if (d.target.id == node_id && node_neighbors.indexOf(d.source.id) == -1) {
                node_neighbors.push(d.source.id);
            }
        });
        data_graph.edges.forEach(function (d) {
            const source_in_cluster = node_neighbors.indexOf(d.source.id) != -1 || cluster_res[d.source.id] == node_label;
            const target_in_cluster = node_neighbors.indexOf(d.target.id) != -1 || cluster_res[d.target.id] == node_label;
            if (d.edge_type != "hidden_edge" && (target_in_cluster && source_in_cluster)) {
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
            if (d.node_type != "hidden_node" && (cluster_res[d.id] == node_label || node_neighbors.indexOf(d.id) != -1)) {
                data_out.nodes.push(d);
                // console.log(d.country, d.country==null)
                // if (d.country != null) {
                //     var hidden_edge = {
                //         source:"@" + d.country,
                //         target:d.id,
                //         edge_type:["hidden_edge"],
                //         weight:1
                //     };
                //     data_out.edges.push(hidden_edge);
                // }
            }
        });
        data_out.country_list = get_country_list(data_out);
        // for (var key in data_out.country_list) {
        //     if (key != "null") {
        //         var hidden_node = {
        //             id:"@" + key,
        //             degree:data_out.country_list[key],
        //             node_type:"hidden_node",
        //             country:null
        //         };
        //         data_out.nodes.push(hidden_node);
        //     }
        // }
        data_out.node_type_list = get_node_type_list(data_out);
        data_out.edge_type_list = get_edge_type_list(data_out);
    }
    console.log("data_out", data_out);
    return data_out;
};