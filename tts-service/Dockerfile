# 使用官方 PyTorch 镜像 (带 CUDA 支持)
FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime

WORKDIR /app

# 防止交互式提示，设置时区
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 设置 Hugging Face 镜像站 (加速模型下载)
ENV HF_ENDPOINT=https://hf-mirror.com

# 设置 Hugging Face 模型缓存目录 (映射到宿主机)
ENV HF_HOME=/app/hf_cache

# 安装系统依赖 (espeak-ng, libsndfile1, ffmpeg)
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    ffmpeg \
    git \
    espeak-ng \
    && rm -rf /var/lib/apt/lists/*

# 复制 tts-service 自己的 requirements.txt
COPY requirements.txt .

# 安装 tts-service 的 Python 依赖 (使用阿里云镜像加速)
RUN pip install --no-cache-dir -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/

# 克隆 neutts-air 仓库到容器内 (包含子模块)
RUN git clone --recursive https://github.com/neuphonic/neutts-air.git /app/neutts-air

# 安装 neutts-air 自身的 Python 依赖 (使用阿里云镜像加速)
# 这会安装 torch==2.8.0, transformers==4.56.1 等，以及 resemble-perth
RUN pip install --no-cache-dir -r /app/neutts-air/requirements.txt -i https://mirrors.aliyun.com/pypi/simple/

# 复制 main.py 到容器内
COPY main.py .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]