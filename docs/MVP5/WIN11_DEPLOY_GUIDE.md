# NeuTTS-Air Windows 11 Docker 部署手册 (推荐)

本文档指导您在 Windows 11 环境下，使用 Docker 部署 `neuphonic/neutts-air` 声音克隆服务。使用 Docker 可以避免复杂的 Python 依赖问题，并确保环境一致性。

## ⚠️ 硬件要求
*   **显卡**: NVIDIA GeForce RTX 3060 或更高 (建议显存 >= 6GB)。
*   **内存**: 16GB 或更高。
*   **硬盘**: 至少 20GB 可用空间 (Docker 镜像和模型文件占用)。

---

## 第一步：环境准备

### 1. 启用 WSL2 (Windows Subsystem for Linux 2)
Docker Desktop 在 Windows 上运行时通常依赖 WSL2。
1.  **打开 PowerShell (管理员身份)**，运行：
    ```powershell
    dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
    dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
    ```
2.  重启电脑。
3.  下载并安装 WSL2 Linux 内核更新包：[WSL2 Linux kernel update package for x64 machines](https://wslstore.blob.core.windows.net/wslremote/wsl_update_x64.msi)
4.  **打开 PowerShell (管理员身份)**，运行：
    ```powershell
    wsl --set-default-version 2
    ```

### 2. 安装 NVIDIA 驱动 (主机系统)
确保您的 NVIDIA 显卡驱动已更新到最新版本，且支持您当前安装的 CUDA 版本 (通常 Docker 镜像会自带 CUDA Runtime，但主机驱动必须兼容)。
*   下载地址: [NVIDIA Driver Downloads](https://www.nvidia.com/Download/index.aspx)

### 3. 安装 Docker Desktop
*   下载地址: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
*   安装并启动 Docker Desktop。
*   **重要**: 在 Docker Desktop 设置中，确保 **"Use the WSL 2 based engine"** 已勾选，并在 "Resources > WSL Integration" 中启用您的 WSL2 发行版。

### 4. 安装 NVIDIA Container Toolkit (WSL2 内)
这是让 Docker 容器能够访问宿主机 GPU 的关键。虽然 Docker Desktop 越来越智能，但手动安装确保万无一失。

**打开您的 WSL2 (例如 Ubuntu)**，然后按照以下步骤安装：

*(以下命令假设您的 WSL2 发行版是 Ubuntu 20.04/22.04)*

1.  **添加 NVIDIA GPG 密钥**：
    ```bash
    curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
    curl -s -L https://nvidia.github.io/libnvidia-container/ubuntu22.04/libnvidia-container.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
        sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
    sudo apt-get update
    ```
    *注意：如果您的 Ubuntu 版本不同，请将 `ubuntu22.04` 替换为 `ubuntu20.04` 等。

2.  **安装 NVIDIA Container Toolkit**：
    ```bash
    sudo apt-get install -y nvidia-container-toolkit
    sudo nvidia-ctk runtime configure --runtime=docker
    sudo systemctl restart docker
    ```
    *注意：在 WSL2 中，`systemctl restart docker` 可能不工作。如果遇到问题，请尝试重启 Docker Desktop 或重启 WSL2 虚拟机 (`wsl --shutdown` 然后重新启动 WSL2)。*

### 5. 安装 Git 和 FFmpeg (WSL2 内，可选但推荐)
虽然容器内会自带，但在 WSL2 环境下拥有这些工具也很方便。
```bash
sudo apt update
sudo apt install git ffmpeg -y
```

---

## 第二步：克隆代码与 Dockerfile 准备

### 1. 克隆项目
在 Windows 文件系统中的项目根目录 (`D:\develop\workspace\GeminiWorkspace\storybook-V3`)，打开 PowerShell (或 CMD) 并切换到 `tts-service` 目录。

```powershell
cd D:\develop\workspace\GeminiWorkspace\storybook-V3\tts-service

# 确保 neutts-air 仓库已克隆到 tts-service/neutts-air
# 如果没有，执行：
git clone https://github.com/neuphonic/neutts-air.git
```

### 2. Dockerfile 和 requirements.txt 检查
确保 `tts-service/Dockerfile` 和 `tts-service/requirements.txt` 文件存在且内容正确。我们之前已为您生成了这些文件，应无需修改。

**`tts-service/requirements.txt` (示例，请根据实际情况调整)：**
```
fastapi==0.109.0
uvicorn==0.27.0
python-multipart==0.0.6
torch
torchaudio
transformers
scipy
soundfile
# neutts-air 会从克隆的目录引用
```

**`tts-service/Dockerfile` (示例，已为您生成)：**
```dockerfile
# 使用官方 PyTorch 镜像 (带 CUDA 支持)
FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime

WORKDIR /app

# 安装系统依赖 (包括 espeak-ng, libsndfile1, ffmpeg)
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    ffmpeg \
    git \
    espeak-ng \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖定义
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 克隆 neutts-air 仓库到容器内
RUN git clone https://github.com/neuphonic/neutts-air.git /app/neutts-air

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```
*注意：`Dockerfile` 中的 `RUN git clone ...` 是为了确保容器内有 `neutts-air` 代码。*

---

## 第三步：构建 Docker 镜像

在 `tts-service` 目录下，打开 PowerShell (或 CMD) 执行：

```powershell
docker build -t my-tts-service .
```

构建过程可能需要一些时间，因为它会下载 PyTorch 镜像和安装所有依赖。

---

## 第四步：运行 Docker 容器

为了让 TTS 服务能够访问您本地的 `stories` 目录 (用于读取参考音频和保存生成的音频)，我们需要进行**卷挂载 (Volume Mount)**。

假设您的项目根目录是 `D:\develop\workspace\GeminiWorkspace\storybook-V3`。

在 `tts-service` 目录下，打开 PowerShell (或 CMD) 执行：

```powershell
docker run -d \
  --name tts-service \
  --gpus all \
  -p 8000:8000 \
  -v D:\develop\workspace\GeminiWorkspace\storybook-V3\stories:/app/data/stories \
  my-tts-service
```

*   `--gpus all`: 允许容器访问所有可用的 GPU。
*   `-p 8000:8000`: 将容器的 8000 端口映射到宿主机的 8000 端口。
*   `-v D:\develop\workspace\GeminiWorkspace\storybook-V3\stories:/app/data/stories`: 
    *   将宿主机上项目的 `stories` 目录 (`D:\develop\workspace\GeminiWorkspace\storybook-V3\stories`) 挂载到容器内部的 `/app/data/stories` 路径。
    *   **重要**: 您 `main.py` 中引用的 `reference_audio_path` 应该是基于 `/app/data/stories` 的相对路径，或者 N8N 传递的 `voicePath` 应该是这个路径下。例如，如果 `voicePath` 是 `voices/123/sample.wav`，则容器会去 `/app/data/stories/voices/123/sample.wav` 查找。

---

## 第五步：验证服务

### 1. 检查容器状态
```powershell
docker ps
```
确保 `tts-service` 容器正在运行。

### 2. 查看容器日志
```powershell
docker logs tts-service
```
查看启动日志，确认模型是否加载成功，是否有新的错误信息。

### 3. 测试 API
打开浏览器访问: [http://localhost:8000/docs](http://localhost:8000/docs)

1.  找到 `POST /tts` 接口。
2.  点击 "Try it out"。
3.  输入 JSON (请确保 `reference_audio_path` 对应到您在 `stories` 目录下放置的 WAV 文件)：
    ```json
    {
      "text": "你好，这是一段测试语音。",
      "reference_audio_path": "/app/data/stories/voices/your_user_id/your_sample.wav", 
      "language": "zh"
    }
    ```
    *注意：`reference_audio_path` 是容器内的路径，必须与卷挂载的规则对应。*
4.  点击 "Execute"。
5.  如果成功，你应该能看到下载链接或听到声音。

---

## 常见 Docker 命令

```powershell
docker stop tts-service       # 停止容器
docker rm tts-service         # 删除容器 (停止后才能删)
docker rmi my-tts-service     # 删除镜像
docker logs -f tts-service    # 实时查看日志
```