
function jaccard(graph, node1, node2) {

    const neighbors1 = new Set(graph.neighbors(node1));
    const neighbors2 = new Set(graph.neighbors(node2));

    const intersection = new Set([...neighbors1].filter(node => neighbors2.has(node)));
    const union = new Set([...neighbors1, ...neighbors2]);

    return intersection.size / union.size;
}

var build_similarity_matrix = function (graph) {

    const nodes = graph.nodes();
    const similarityMatrix = {};

    for (let i = 0; i < nodes.length; i++) {
        const node1 = nodes[i];
        similarityMatrix[node1] = {};
        for (let j = 0; j < nodes.length; j++) {
            const node2 = nodes[j];
            // 计算节点之间的相似度
            const similarityValue = jaccard(graph, node1, node2);
            similarityMatrix[node1][node2] = similarityValue;
        }
    }

    return similarityMatrix;
}

export function get_spectral_cluster (graph) {

    const sim_matrix = build_similarity_matrix(graph)
    const nodes = Object.keys(sim_matrix);
    const data = nodes.map(node => Object.values(sim_matrix[node]));
    // console.log(data, sim_matrix, nodes);

    const kmeans_res = new ML.KMeans(data, 3);
    var kmeans_labels = {};
    for (let i = 0; i < nodes.length; i ++) {
        kmeans_labels[nodes[i]] = kmeans_res.clusters[i];
    }
    return kmeans_labels;
}