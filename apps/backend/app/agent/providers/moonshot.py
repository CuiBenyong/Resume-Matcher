import os
import logging
import json

from typing import Any, Dict
from fastapi.concurrency import run_in_threadpool

try:
    import httpx
except ImportError:
    raise ImportError("httpx is required for MoonshotProvider. Install it with: pip install httpx")

from ..exceptions import ProviderError
from .base import Provider, EmbeddingProvider

logger = logging.getLogger(__name__)


class MoonshotProvider(Provider):
    def __init__(self, api_key: str | None = None, model: str = "moonshot-v1-8k"):
        api_key = api_key or os.getenv("MOONSHOT_API_KEY")
        if not api_key:
            raise ProviderError("Moonshot API key is missing")
        self.api_key = api_key
        self.model = model
        self.instructions = ""
        self.base_url = "https://api.moonshot.cn/v1"

    def _generate_sync(self, prompt: str, options: Dict[str, Any]) -> str:
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            messages = []
            if self.instructions:
                messages.append({"role": "system", "content": self.instructions})
            messages.append({"role": "user", "content": prompt})
            
            # 使用最基本的参数构建请求
            data = {
                "model": self.model,
                "messages": messages
            }
            
            # 仅添加明确支持的参数
            if "temperature" in options and 0 <= options["temperature"] <= 2:
                data["temperature"] = options["temperature"]
            if "max_tokens" in options and options["max_tokens"] > 0:
                data["max_tokens"] = min(options["max_tokens"], 4096)  # 限制最大值
            
            logger.info(f"Moonshot API request: {json.dumps(data, ensure_ascii=False)}")
            
            with httpx.Client() as client:
                response = client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=data,
                    timeout=60.0
                )
                
                logger.info(f"Moonshot API response status: {response.status_code}")
                
                if response.status_code != 200:
                    error_text = response.text
                    logger.error(f"Moonshot API error response: {error_text}")
                    raise ProviderError(f"Moonshot API returned {response.status_code}: {error_text}")
                
                result = response.json()
                logger.info(f"Moonshot API response: {json.dumps(result, ensure_ascii=False)}")
                
                if "choices" in result and len(result["choices"]) > 0:
                    return result["choices"][0]["message"]["content"]
                else:
                    raise ProviderError("No response choices returned from Moonshot API")
                    
        except httpx.HTTPError as e:
            logger.error(f"Moonshot HTTP error: {e}")
            raise ProviderError(f"Moonshot - HTTP error: {e}") from e
        except Exception as e:
            logger.error(f"Moonshot error: {e}")
            raise ProviderError(f"Moonshot - error generating response: {e}") from e

    async def __call__(self, prompt: str, **generation_args: Any) -> str:
        opts = {
            "temperature": generation_args.get("temperature", 0.7),
            "top_p": generation_args.get("top_p", 0.9),
            "max_tokens": generation_args.get("max_length", 3000),  # 降低默认值
        }
        # 移除不支持的参数
        opts = {k: v for k, v in opts.items() if v is not None}
        return await run_in_threadpool(self._generate_sync, prompt, opts)


class MoonshotEmbeddingProvider(EmbeddingProvider):
    def __init__(
        self,
        api_key: str | None = None,
        embedding_model: str = "moonshot-embedding-v1",
    ):
        api_key = api_key or os.getenv("MOONSHOT_API_KEY")
        if not api_key:
            raise ProviderError("Moonshot API key is missing")
        self.api_key = api_key
        self._model = embedding_model
        self.base_url = "https://api.moonshot.cn/v1"

    def _embed_sync(self, text: str) -> list[float]:
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # 符合 Moonshot 嵌入 API 格式
            data = {
                "model": self._model,
                "input": text
            }
            
            with httpx.Client() as client:
                response = client.post(
                    f"{self.base_url}/embeddings",
                    headers=headers,
                    json=data,
                    timeout=60.0
                )
                response.raise_for_status()
                result = response.json()
                
                if "data" in result and len(result["data"]) > 0:
                    return result["data"][0]["embedding"]
                else:
                    raise ProviderError("No embedding data returned from Moonshot API")
                    
        except httpx.HTTPError as e:
            raise ProviderError(f"Moonshot - HTTP error during embedding: {e}") from e
        except Exception as e:
            raise ProviderError(f"Moonshot - error generating embedding: {e}") from e

    async def embed(self, text: str) -> list[float]:
        return await run_in_threadpool(self._embed_sync, text)
