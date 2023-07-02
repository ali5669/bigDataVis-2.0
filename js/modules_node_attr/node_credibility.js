import { credibility_key } from "./node_attr_value.js";
const reliable_node_ids = ["FishEye International"]

export function credibility_assign (graph) {

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