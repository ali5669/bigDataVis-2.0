export function vessel_ownership_assign (graph) {
    graph.forEachNode(function (node) {
        if (!graph.hasNodeAttribute(node, "vesselOwnership")) {
            graph.setNodeAttribute(node, "vesselOwnership", 0);
        }
        if (graph.getNodeAttribute(node, "node_type") == "vessel") {
            let vessel_owners = graph.filterDirectedNeighbors(node, function (neighbor, attributes) {
                // console.log(node, neighbor, attributes);
                if (graph.hasDirectedEdge(neighbor, node)) {
                    // console.log(graph.getDirectedEdgeAttribute(neighbor, node, "edge_type"));
                    if (graph.getDirectedEdgeAttribute(neighbor, node, "edge_type") == "ownership") {
                        return true;
                    }
                }
                return false;
            })
            console.log("Vessel Name:", node, "Owners:", vessel_owners);
            vessel_owners.forEach(function (owner) {
                if (!graph.hasNodeAttribute(owner, "vesselOwnership")) {
                    graph.setNodeAttribute(owner, "vesselOwnership", 1 / vessel_owners.length);
                }
                else{
                    graph.updateNodeAttribute(owner, "vesselOwnership", d => d + 1 / vessel_owners.length);
                }
            })
        }
    })
}