import { credibility_assign } from "./node_credibility.js";
import { vessel_ownership_assign } from "./node_vessel_ownership.js";

var graph;
const credibility_key = "credibility_value";
const attr_key = "attr_value";
const multi_graph_attrs = [
    "Weighted_Degree",
    "Eccentricity",
    "Credibility_ShortestPath",
    "Betweenness_Centrality",
    "Closeness_Centrality",
    "Degree_Centrality",
    "Eigenvector_Centrality",
    "PageRank",
];
const direct_edge_attrs = [
    "Vessel_Ownership"
];

var node_attr_value_map = function (data_graph, graph, graph_attr_key, is_credibility=false) {
    data_graph.nodes.forEach(function (d) {
        if (d.node_type != "hidden_node") {
            if (!is_credibility) d[attr_key] = graph.getNodeAttribute(d.id, graph_attr_key);
            else d[credibility_key] = graph.getNodeAttribute(d.id, graph_attr_key);
        }
    });
    return data_graph;
}

export function get_attr_value (data_graph, attr_name) {
    
    var data_out;
    const is_multi_graph = multi_graph_attrs.indexOf(attr_name) != -1;
    const is_direct_edge = direct_edge_attrs.indexOf(attr_name) != -1;
    if (is_multi_graph) {
        graph = new graphology.MultiGraph();
    }
    else {
        graph = new graphology.Graph();
    }
    
    data_graph.nodes.forEach(function (d) {
        if (!graph.hasNode(d.id) && d.node_type != "hidden_node") graph.addNode(d.id, {
            node_type:d.node_type
        });
    });
    data_graph.edges.forEach(function (d) {
        if (d.source.node_type != "hidden_node") {
            if (is_multi_graph || !graph.hasEdge(d.source.id, d.target.id)) {
            // if (!graph.hasEdge(d.source.id, d.target.id)) {
                if (is_direct_edge) {
                    graph.addDirectedEdge(d.source.id, d.target.id, {
                        edge_type:d.edge_type,
                        weight:d.weight
                    });
                }
                else {
                    graph.addUndirectedEdge(d.source.id, d.target.id, {
                        edge_type:d.edge_type,
                        weight:d.weight
                    });
                }
            }
        }
    });
    
    if (attr_name == "Weighted_Degree") {
        data_graph.nodes.forEach(function (d) {
            if (d.node_type != "hidden_node") {
                d[attr_key] = graphologyLibrary.metrics.node.weightedDegree(graph, d.id);
            }
        });
        data_out = data_graph;
    }
    else if (attr_name == "Eccentricity") {
        data_graph.nodes.forEach(function (d) {
            if (d.node_type != "hidden_node") {
                d[attr_key] = graphologyLibrary.metrics.node.eccentricity(graph, d.id);
            }
        });
        data_out = data_graph;
    }
    else if (attr_name == "Credibility_ShortestPath") {
        credibility_assign(graph);
        data_out = node_attr_value_map(data_graph, graph, 'credibility', true);
    }
    else if (attr_name == "Betweenness_Centrality") {
        graphologyLibrary.metrics.centrality.betweenness.assign(graph);
        data_out = node_attr_value_map(data_graph, graph, 'betweennessCentrality');
    }
    else if (attr_name == "Closeness_Centrality") {
        graphologyLibrary.metrics.centrality.closeness.assign(graph);
        data_out = node_attr_value_map(data_graph, graph, 'closenessCentrality');
    }
    else if (attr_name == "Degree_Centrality") {
        graphologyLibrary.metrics.centrality.degree.assign(graph);
        data_out = node_attr_value_map(data_graph, graph, 'degreeCentrality');
    }
    else if (attr_name == "Eigenvector_Centrality") {
        graphologyLibrary.metrics.centrality.eigenvector.assign(graph);
        data_out = node_attr_value_map(data_graph, graph, 'eigenvectorCentrality');
    }
    else if (attr_name == "HITS_Authority") {
        graphologyLibrary.metrics.centrality.hits.assign(graph);
        data_out = node_attr_value_map(data_graph, graph, 'authority');
    }
    else if (attr_name == "HITS_Hub") {
        graphologyLibrary.metrics.centrality.hits.assign(graph);
        data_out = node_attr_value_map(data_graph, graph, 'hub');
    }
    else if (attr_name == "PageRank") {
        graphologyLibrary.metrics.centrality.pagerank.assign(graph);
        data_out = node_attr_value_map(data_graph, graph, 'pagerank');
    }
    else if (attr_name == "Vessel_Ownership") {
        vessel_ownership_assign(graph);
        data_out = node_attr_value_map(data_graph, graph, 'vesselOwnership');
    }
    else {
        console.log(method + "Not Implemented.")
    }

    return data_out;
}

export { attr_key, credibility_key };