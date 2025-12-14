import torch
import torch.nn as nn
import numpy as np

# --- 1. Define U-Net Architecture (Must match training exactly) ---
class SimpleUNet(nn.Module):
    def __init__(self, in_channels=3, out_channels=1):
        super(SimpleUNet, self).__init__()
        def double_conv(in_c, out_c):
            return nn.Sequential(
                nn.Conv2d(in_c, out_c, kernel_size=3, padding=1),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_c, out_c, kernel_size=3, padding=1),
                nn.ReLU(inplace=True)
            )
        self.d1 = double_conv(in_channels, 64)
        self.pool = nn.MaxPool2d(2)
        self.d2 = double_conv(64, 128)
        self.d3 = double_conv(128, 256)
        self.d4 = double_conv(256, 512)
        self.bottleneck = double_conv(512, 1024)
        self.up1 = nn.ConvTranspose2d(1024, 512, kernel_size=2, stride=2)
        self.u1 = double_conv(1024, 512)
        self.up2 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
        self.u2 = double_conv(512, 256)
        self.up3 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.u3 = double_conv(256, 128)
        self.up4 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.u4 = double_conv(128, 64)
        self.final = nn.Conv2d(64, out_channels, kernel_size=1)
        
    def forward(self, x):
        p1 = self.d1(x)
        x = self.pool(p1)
        p2 = self.d2(x)
        x = self.pool(p2)
        p3 = self.d3(x)
        x = self.pool(p3)
        p4 = self.d4(x)
        x = self.pool(p4)
        x = self.bottleneck(x)
        x = self.up1(x)
        x = torch.cat((p4, x), dim=1)
        x = self.u1(x)
        x = self.up2(x)
        x = torch.cat((p3, x), dim=1)
        x = self.u2(x)
        x = self.up3(x)
        x = torch.cat((p2, x), dim=1)
        x = self.u3(x)
        x = self.up4(x)
        x = torch.cat((p1, x), dim=1)
        x = self.u4(x)
        return self.final(x)

# --- 2. Define LSTM Architecture ---
class DroughtLSTM(nn.Module):
    def __init__(self, input_size=1, hidden_size=32, output_size=1):
        super(DroughtLSTM, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])

# --- 3. Mock Data Generator (For Demo Speed) ---
# In a real app, this would query your D:/606Data drive.
# For the website demo, we simulate the tensor input to ensure the frontend works.
def get_wildfire_input(lat, lon):
    # Simulate a 3-channel tensor (T4, FRP, T5)
    # Random noise + some "hot spots" based on lat/lon to make it look real
    data = np.random.rand(3, 224, 224).astype(np.float32)
    return torch.from_numpy(data).unsqueeze(0) # Add batch dim

def get_drought_input(lat, lon):
    # Simulate 3 days of history
    data = np.random.rand(1, 3, 1).astype(np.float32)
    return torch.from_numpy(data)