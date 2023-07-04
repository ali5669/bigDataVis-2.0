export function get_louvain_cluster (graph) {

    var communities = graphologyLibrary.communitiesLouvain(graph);
    return communities;
}