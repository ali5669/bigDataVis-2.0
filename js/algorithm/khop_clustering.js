export function get_khop_cluster (graph, node_id, k) {
    
    const nodes = graph.nodes();
    let khop_nodes = new Array();
    let idx_visited = 0;
    khop_nodes.push(node_id);

    for (let i = 0; i < k; i ++) {
        var n_visit = khop_nodes.length;
        for (let j = idx_visited; j < n_visit; j ++) {
            graph.forEachNeighbor(khop_nodes[j], function (node) {
                // console.log(node);
                if (khop_nodes.indexOf(node) == -1) {
                    khop_nodes.push(node);
                }
            })
            idx_visited ++;
        }
    }
    // console.log(khop_nodes);

    var khop_labels = {};
    for (let i = 0; i < nodes.length; i ++) {
        if (khop_nodes.indexOf(nodes[i]) != -1) {
            khop_labels[nodes[i]] = 1;
        }
        else {
            khop_labels[nodes[i]] = 0;
        }
    }
    return khop_labels;
}