# Moonshot AI Provider

这个文件实现了基于Moonshot AI的提供者，与OpenAI提供者保持相同的接口和功能。

## 功能特性

1. **MoonshotProvider** - 用于文本生成
2. **MoonshotEmbeddingProvider** - 用于文本嵌入向量生成

## 配置

### 环境变量
- `MOONSHOT_API_KEY`: Moonshot AI的API密钥

### 使用方法

```python
# 文本生成
from app.agent.providers.moonshot import MoonshotProvider

provider = MoonshotProvider(
    api_key="your-api-key",  # 可选，会从环境变量读取
    model="moonshot-v1-8k"   # 默认模型
)

response = await provider("请帮我写一篇关于AI的文章", temperature=0.7)

# 文本嵌入
from app.agent.providers.moonshot import MoonshotEmbeddingProvider

embedding_provider = MoonshotEmbeddingProvider(
    api_key="your-api-key",           # 可选，会从环境变量读取
    embedding_model="moonshot-embedding-v1"  # 默认模型
)

embedding = await embedding_provider.embed("需要生成嵌入向量的文本")
```

## 支持的模型

### 文本生成模型
- `moonshot-v1-8k` (默认)
- `moonshot-v1-32k`
- `moonshot-v1-128k`

### 嵌入模型
- `moonshot-embedding-v1` (默认)

## API参数

### 文本生成参数
- `temperature`: 控制随机性 (0-1)
- `top_p`: 控制生成的多样性 (0-1)
- `max_length`: 最大生成长度
- `top_k`: 控制候选词数量

### 依赖项
- `httpx`: HTTP客户端库
- `fastapi`: 异步支持
- `typing`: 类型注解

## 错误处理

所有错误都会被包装为 `ProviderError` 异常，包含详细的错误信息。

## 注意事项

1. 确保设置了 `MOONSHOT_API_KEY` 环境变量
2. 网络请求有60秒超时限制
3. 所有操作都支持异步执行
