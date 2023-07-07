import json

def get_neighbor(node, edges):
    neighborNodes = []
    for edge in edges:
        if edge['source'] == node['id']:
            neighborNodes.append(edge['target'])
        elif edge['target'] == node['id']:    
            neighborNodes.append(edge['source'])
    return set(neighborNodes)

def get_degree(node, edges):
    return get_neighbor(node, edges).__len__()

# file_name = '8327'
# file_name = '979893388'
# file_name = 'Mar de la Vida OJSC'
file_name = 'data'
# file_name = 'FishEye International'
with open(f'./data/{file_name}.json', 'r', encoding='utf-8') as data_file:

    data_cleaned = {
        'nodes':[],
        'edges':[],
        'node_type_list':{},
        'edge_type_list':{},
        'country_list':{}
    }
    edges = {}
    data = json.load(data_file)
    country_list = []
    for node in data['nodes']:
        if 'node_type' not in node.keys():
            if 'type' not in node.keys():
                node['node_type'] = None
            else:
                node['node_type'] = node['type']
                del node['type']
        if 'country' not in node.keys():
            node['country'] = None
        else:
            node['country'] = node['country'].replace(' ', '_')

        data_cleaned['node_type_list'][node['node_type']] = data_cleaned['node_type_list'].get(node['node_type'], 0) + 1
        data_cleaned['country_list'][node['country']] = data_cleaned['country_list'].get(node['country'], 0) + 1

        node['degree'] = get_degree(node, data['edges'])
        data_cleaned['nodes'].append(node)

    for edge in data['edges']:
        edge['source'] = edge['source']
        edge['target'] = edge['target']
        if 'edge_type' not in edge.keys():
            if 'type' not in edge.keys():
                edge_type = None
                edge['edge_type'] = []
            else:
                edge_type = edge['type']
                edge['edge_type'] = [edge['type']]
                del edge['type']
        else:
            edge_type = edge['edge_type']
            edge['edge_type'] = [edge_type]
        
        data_cleaned['edge_type_list'][edge_type] = data_cleaned['edge_type_list'].get(edge_type, 0) + 1
        edge_id = (edge['source'], edge['target'])
        if edge_id not in edges.keys():
            edges[edge_id] = edge
        else:
            if edge['edge_type'][0] not in edges[edge_id]['edge_type']:
                edges[edge_id]['edge_type'] += edge['edge_type']
            edges[edge_id]['weight'] += edge['weight']
    data_cleaned['edges'] += edges.values()

    # hidden_country_nodes = []
    # for country in data_cleaned['country_list'].keys():
    #     if country is not None:
    #         hidden_country_node = {
    #             'node_type':'hidden_node',
    #             'id':'@' + country,
    #             'country':None,
    #             'degree':data_cleaned['country_list'][country]
    #         }
    #         hidden_country_nodes.append(hidden_country_node)

    # for node in data['nodes']:
    #     if node['country'] is not None:
    #         hidden_country_edge = {
    #             'edge_type':['hidden_edge'],
    #             'source':'@' + node['country'],
    #             'target':node['id'],
    #             'weight':1
    #         }
    #         data_cleaned['edges'].append(hidden_country_edge)
    # data_cleaned['nodes'] += hidden_country_nodes


with open(f'./data/{file_name}_cleaned.json', 'w', encoding='utf-8') as data_cleaned_file:

    data_cleaned_file.write(json.dumps(data_cleaned, ensure_ascii=False))