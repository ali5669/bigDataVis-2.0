import torch
import torch.nn as nn
from torch_geometric.nn import GATConv, GraphConv, TopKPooling, SAGEConv
from pyg_dataset import PygDatasetSingle

class GraphAutoencoder(nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super(GraphAutoencoder, self).__init__()

        # 编码器
        self.conv1 = GATConv(in_channels, hidden_channels)
        self.conv2 = GraphConv(hidden_channels, hidden_channels)

        # 解码器
        self.lin1 = nn.Linear(hidden_channels, hidden_channels)
        self.lin2 = nn.Linear(hidden_channels, out_channels)

    def forward(self, x, edge_index, edge_attr, batch):

        x = self.conv1(x, edge_index, edge_attr)
        x = torch.relu(x)
        x = self.conv2(x, edge_index)
        x = torch.relu(x)

        x = self.lin1(x)
        x = torch.relu(x)
        x = self.lin2(x)
        return x

dataset = PygDatasetSingle()
data = dataset.data

in_channels = 9
hidden_channels = 3
out_channels = in_channels
n_epochs = 5000

# 创建模型实例
model = GraphAutoencoder(in_channels, hidden_channels, out_channels)

optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
criterion = nn.MSELoss()

# 迭代训练
for epoch in range(n_epochs):
    # 正向传播
    output = model(data.x, data.edge_index, data.edge_attr, data.batch)
    loss = criterion(output, data.x)  # 重构损失
    
    # 反向传播和参数更新
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
    
    # 打印训练进度
    if (epoch + 1) % 10 == 0:
        print(f"Epoch: {epoch + 1}, Loss: {loss.item()}")

