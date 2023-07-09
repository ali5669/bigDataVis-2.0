var graph;

export function get_nodes_statistics (data_graph) {

    graph = new graphology.Graph();

    data_graph.nodes.forEach(function (d) {
        if (!graph.hasNode(d.id) && d.node_type != "hidden_node") graph.addNode(d.id, {
            node_type:d.node_type
        });
    });
    data_graph.edges.forEach(function (d) {
        if (typeof d.source == "object") {
            if (d.source.node_type != "hidden_node") {
                graph.addEdge(d.source.id, d.target.id, {
                    edge_type:d.edge_type,
                    weight:d.weight
                });
            }
        }
        else {
            if (d.source.indexOf("@") == -1) {
                graph.addEdge(d.source, d.target, {
                    edge_type:d.edge_type,
                    weight:d.weight
                });
            }
        }
    });

    var nodes_statistics = new Array();
    data_graph.nodes.forEach(function (node) {
        var node_statistics = {
            id:node.id,
            node_type:node.node_type,
            degree:0,
            inDegree:0,
            outDegree:0,
            weightedDegree:0,
            partners:0,
            relatives:0,
            vesselOwnership:0,
            eventInvolved:0
        };
        node = node.id;
        node_statistics.weightedDegree = graphologyLibrary.metrics.node.weightedDegree(graph, node);
        graph.forEachNeighbor(node, function(neighbor) {

            node_statistics.degree ++;

            if (graph.edge(node, neighbor)) {
                var edge_neighbor = graph.edge(node, neighbor);
                node_statistics.outDegree ++;
            }
            else {
                var edge_neighbor = graph.edge(neighbor, node);
                node_statistics.inDegree ++;
            }

            const neighbor_node_type = graph.getNodeAttribute(neighbor, "node_type");

            if (neighbor_node_type == "event") node_statistics.eventInvolved ++;

            graph.getEdgeAttribute(edge_neighbor, "edge_type").forEach(function (edge_type) {
                if (edge_type == "partnership") node_statistics.partners ++;
                else if (edge_type == "family_relationship") node_statistics.relatives ++;
                else if (edge_type == "ownership") {
                    if (node_statistics.node_type != "vessel" && neighbor_node_type == "vessel") {
                        node_statistics.vesselOwnership ++;
                    }
                }
            });
        });

        nodes_statistics[node] = node_statistics;
        // nodes_statistics.push(node_statistics);
    });

    return nodes_statistics;
}