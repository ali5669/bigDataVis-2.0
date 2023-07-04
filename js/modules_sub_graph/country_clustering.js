
export function get_country_cluster (graph) {

    const nodes = graph.nodes();
    var country_labels = {};

    for (let i = 0; i < nodes.length; i ++) {
        const node_country = graph.getNodeAttribute(nodes[i], "country");
        if (node_country != null) country_labels[nodes[i]] = node_country;
        else country_labels[nodes[i]] = null;
    }
    return country_labels;
}