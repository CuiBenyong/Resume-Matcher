"""
Moonshot API 调试和测试脚本
"""
import asyncio
import json
import os
import sys
import traceback
from pathlib import Path

# 添加项目路径
sys.path.append(str(Path(__file__).parent))

try:
    from app.agent.providers.moonshot import MoonshotProvider, MoonshotEmbeddingProvider
except ImportError as e:
    print(f"导入错误: {e}")
    print("请确保在正确的目录运行此脚本")
    sys.exit(1)


async def test_chat_completion():
    """测试聊天完成 API"""
    print("=== 测试 Moonshot Chat Completion ===")
    
    api_key = os.getenv("MOONSHOT_API_KEY")
    if not api_key:
        print("⚠️  警告: 未设置 MOONSHOT_API_KEY 环境变量")
        api_key = input("请输入您的 Moonshot API Key (或按 Enter 跳过): ").strip()
        if not api_key:
            print("跳过聊天测试")
            return
    
    try:
        provider = MoonshotProvider(api_key=api_key, model="moonshot-v1-8k")
        print(f"✅ 提供者初始化成功，模型: {provider.model}")
        
        # 设置简单的系统指令
        provider.instructions = "你是一个有用的助手，请用中文回复。"
        
        # 测试简单的提示
        prompt = "请简单介绍一下Python编程语言"
        print(f"📝 测试提示: {prompt}")
        
        # 调用 API
        response = await provider(
            prompt=prompt,
            temperature=0.7,
            max_length=100  # 较短的回复用于测试
        )
        
        print(f"✅ API 调用成功!")
        print(f"📤 回复: {response}")
        
    except Exception as e:
        print(f"❌ 聊天测试失败: {e}")
        print("详细错误信息:")
        traceback.print_exc()


async def test_embedding():
    """测试嵌入 API"""
    print("\n=== 测试 Moonshot Embedding ===")
    
    api_key = os.getenv("MOONSHOT_API_KEY")
    if not api_key:
        print("⚠️  警告: 未设置 MOONSHOT_API_KEY 环境变量")
        api_key = input("请输入您的 Moonshot API Key (或按 Enter 跳过): ").strip()
        if not api_key:
            print("跳过嵌入测试")
            return
    
    try:
        provider = MoonshotEmbeddingProvider(
            api_key=api_key,
            embedding_model="moonshot-embedding-v1"
        )
        print(f"✅ 嵌入提供者初始化成功，模型: {provider._model}")
        
        # 测试文本
        text = "Python是一种高级编程语言"
        print(f"📝 测试文本: {text}")
        
        # 调用嵌入 API
        embedding = await provider.embed(text)
        
        print(f"✅ 嵌入 API 调用成功!")
        print(f"📊 嵌入向量维度: {len(embedding)}")
        print(f"📊 前5个值: {embedding[:5]}")
        
    except Exception as e:
        print(f"❌ 嵌入测试失败: {e}")
        print("详细错误信息:")
        traceback.print_exc()


def test_manual_api_call():
    """手动测试 API 调用格式"""
    print("\n=== 手动测试 API 调用格式 ===")
    
    api_key = os.getenv("MOONSHOT_API_KEY")
    if not api_key:
        print("⚠️  需要 MOONSHOT_API_KEY 环境变量")
        return
    
    import httpx
    
    # 测试聊天完成 API
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "moonshot-v1-8k",
        "messages": [
            {"role": "user", "content": "你好"}
        ],
        "temperature": 0.7,
        "stream": False
    }
    
    print("📤 请求数据:")
    print(json.dumps(data, indent=2, ensure_ascii=False))
    
    try:
        with httpx.Client() as client:
            response = client.post(
                "https://api.moonshot.cn/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30.0
            )
            
            print(f"📥 HTTP 状态码: {response.status_code}")
            print(f"📥 响应头: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ API 调用成功!")
                print(f"📤 完整响应:")
                print(json.dumps(result, indent=2, ensure_ascii=False))
            else:
                print(f"❌ API 调用失败")
                print(f"📥 错误响应: {response.text}")
                
    except Exception as e:
        print(f"❌ 手动 API 调用失败: {e}")
        traceback.print_exc()


async def main():
    """主测试函数"""
    print("🚀 Moonshot API 调试工具")
    print("=" * 50)
    
    # 检查环境
    api_key = os.getenv("MOONSHOT_API_KEY")
    if api_key:
        print(f"✅ 检测到 API Key: {api_key[:8]}...")
    else:
        print("⚠️  未检测到 MOONSHOT_API_KEY 环境变量")
    
    # 运行测试
    await test_chat_completion()
    await test_embedding()
    test_manual_api_call()
    
    print("\n🏁 测试完成!")
    print("\n💡 如果遇到问题:")
    print("1. 确保 API Key 正确")
    print("2. 检查网络连接")
    print("3. 确认 Moonshot API 配额")
    print("4. 查看详细错误日志")


if __name__ == "__main__":
    asyncio.run(main())
