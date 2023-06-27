// const communities = get_newman_girvan_cluster(graph);

// console.log(communities);

// Newman-Girvan算法的函数
export function get_newman_girvan_cluster (graph) {
  const communities = [];

    while (graph.size > 0) {
      const { delta, labels } = getGraphLabels(graph);
  
      if (delta === 0) {
        break; // 如果delta为0，则不再进行社区划分，退出循环
      }
  
      let maxDelta = -Infinity;
      let maxEdge;
      
      graphologyLibrary.metrics.centrality.betweenness.assign(graph);
      // 遍历所有边，找到介数（betweenness）最大的边
      graph.forEachEdge(function (edge, attr, source, target) {
        const betweenness = graph.getNodeAttribute(source, 'betweennessCentrality') + graph.getNodeAttribute(target, 'betweennessCentrality');
  
        if (betweenness > maxDelta) {
          maxDelta = betweenness;
          maxEdge = edge;
        }
      });
      // 删除介数最大的边
      if (maxEdge) {
        graph.dropEdge(maxEdge);
    
        // 根据标签信息划分社区
        const newCommunities = getCommunitiesFromLabels(labels);
    
        if (newCommunities.length >= communities.length) {
            communities.push(newCommunities);
        } else {
            break; // 如果没有新社区生成，则退出循环
        }
      }
    }
    
    const communities_final = communities[Object.keys(communities).length - 1];
    var communities_res = {};
    for (let key in communities_final) {
      console.log(key, communities_final[key]);
      communities_final[key].forEach(function (d) {
        communities_res[d] = key;
      });
    }
    return communities_res;
  }
  
  // 获取图的标签信息
  function getGraphLabels(graph) {
    const labels = graphologyLibrary.communitiesLouvain(graph);
    const delta = computeModularity(graph, labels);
  
    return { delta, labels };
  }
  
  // 根据标签信息获取社区列表
  function getCommunitiesFromLabels(labels) {
    const communities = [];

    // 存储每个标签对应的节点数组
    const labelNodesMap = {};
  
    for (const node in labels) {
      const label = labels[node];
  
      if (!labelNodesMap[label]) {
        labelNodesMap[label] = [];
      }
  
      labelNodesMap[label].push(node);
    }
  
    // 将每个标签对应的节点数组作为社区添加到社区列表
    for (const label in labelNodesMap) {
      const community = labelNodesMap[label];
      communities.push(community);
    }
  
    return communities;
  }
  
  // 计算模块度（Modularity）
  function computeModularity(graph, labels) {
    const nodes = graph.nodes();
    const n = nodes.length;
  
    let modularity = 0;
  
    for (const node1 of nodes) {
      for (const node2 of nodes) {
        const degree1 = graph.degree(node1);
        const degree2 = graph.degree(node2);
        const a = graph.hasEdge(node1, node2) ? 1 : 0;
  
        const label1 = labels[node1];
        const label2 = labels[node2];
  
        if (label1 === label2) {
          const ki = degree1 * degree2;
          const ki2 = 2 * graph.size;
  
          modularity += a - (ki / ki2);
        }
      }
    }
  
    return modularity / n;
  }