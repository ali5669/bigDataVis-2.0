import torch
from torch_geometric.data import Data, Dataset
import json

DATA_PATH = "./data/data_cleaned.json"
node_type_list = ['null', 'company', 'organization', 'person', 'location', 'political_organization', 'vessel', 'movement', 'event']
edge_type_list = ["ownership", "partnership", "family_relationship", "membership"]

class PygDatasetSingle():

    def __init__(self):

        self.nodes, self.edges = self.read_data(DATA_PATH)

        self.idx2node_type = node_type_list
        self.node_type2idx = {}
        for idx, node_type in enumerate(self.idx2node_type):
            self.node_type2idx[node_type] = idx

        self.idx2edge_type = edge_type_list
        self.edge_type2idx = {}
        for idx, edge_type in enumerate(self.idx2edge_type):
            self.edge_type2idx[edge_type] = idx

        self.idx2node_id = [node['id'] for node in self.nodes]
        self.node_id2idx = {}
        for idx, node_id in enumerate(self.idx2node_id):
            self.node_id2idx[node_id] = idx

        node_feats = []
        for node in self.nodes:
            node_type_one_hot = [0] * len(self.idx2node_type)
            node_type = node['node_type'] if node['node_type'] != None else 'null'
            node_type_one_hot[self.node_type2idx[node_type]] = 1
            node_feats.append(node_type_one_hot)
        node_feats = torch.Tensor(node_feats)

        edge_index = []
        edge_feats = []
        for edge in self.edges:
            edge_type_one_hot = [0] * len(self.idx2edge_type)
            for edge_type in edge['edge_type']:
                edge_type_one_hot[self.edge_type2idx[edge_type]] = 1
            edge_feats.append(edge_type_one_hot)
            edge_index.append([self.node_id2idx[edge['source']], self.node_id2idx[edge['target']]])
        edge_feats = torch.Tensor(edge_feats)
        edge_index = torch.Tensor(edge_index).long().transpose(0, 1)

        print(node_feats.shape, edge_index.shape, edge_feats.shape)

        self.data = Data(x=node_feats, edge_index=edge_index, edge_attr=edge_feats)
        

    def read_data(self, data_path):

        with open(data_path, 'r', encoding='utf-8') as data_file:
            data = json.load(data_file)

        return data['nodes'], data['edges']


if __name__ == '__main__':

    dataset = PygDatasetSingle()

    print(len(dataset.nodes), len(dataset.edges))
    print(dataset.data)