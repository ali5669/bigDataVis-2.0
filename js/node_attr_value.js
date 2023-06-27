var graph;
const attr_key = "attr_value";
const credibility_key = "credibility_value";
const reliable_node_ids = ["FishEye International"]

var node_attr_value_map = function (data_graph, graph, graph_attr_key, is_credibility=false) {
    data_graph.nodes.forEach(function (d) {
        if (d.node_type != "hidden_node") {
            if (!is_credibility) d[attr_key] = graph.getNodeAttribute(d.id, graph_attr_key);
            else d[credibility_key] = graph.getNodeAttribute(d.id, graph_attr_key);
        }
    });
    return data_graph;
}

var credibility_assign = function (graph) {

    if (!graph.hasAttribute(credibility_key)) {
        var has_reliable_node = false;
        reliable_node_ids.forEach(function (reliable_node_id) {
            if (graph.hasNode(reliable_node_id)) has_reliable_node = true;
        });
        if (has_reliable_node) {
            graph.forEachNode(function (node) {
                // console.log(node);
                if (reliable_node_ids.indexOf(node) != -1) {
                    graph.setNodeAttribute(node, 'credibility', 1)
                }
                else {
                    var min_dist = Infinity;
                    reliable_node_ids.forEach(function (reliable_node_id) {
                        var reliable_node_path = graphologyLibrary.shortestPath.dijkstra.bidirectional(graph, reliable_node_id, node);
                        if (reliable_node_path != null) {
                            if (reliable_node_path.length < min_dist) {
                                min_dist = reliable_node_path.length;
                            }
                        }
                    });
                    graph.setNodeAttribute(node, 'credibility', 1 / min_dist)
                }
            });
        }
        else {
            graph.forEachNode(function (node) {
                // console.log(node);
                graph.setNodeAttribute(node, 'credibility', 0)
            });
        }
    }
}

export function get_attr_value (data_graph, attr_name) {
    
    var data_out;
    graph = new graphology.MultiGraph();
    data_graph.nodes.forEach(function (d) {
        if (!graph.hasNode(d.id) && d.node_type != "hidden_node") graph.addNode(d.id);
    });
    data_graph.edges.forEach(function (d) {
        if (d.source.node_type != "hidden_node") graph.addUndirectedEdge(d.source.id, d.target.id, {
            weight:d.weight
        });
    });
    // console.log(graph);
    // console.log("n_node:", graph.order);
    // console.log("n_edge:", graph.size);
    
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
    else {
        console.log(method + "Not Implemented.")
    }

    return data_out;
}