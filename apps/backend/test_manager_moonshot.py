"""
测试集成了 Moonshot 提供者的 Manager 类
"""
import asyncio
import os
from app.agent.manager import AgentManager, EmbeddingManager


async def test_agent_manager_with_moonshot():
    """测试 AgentManager 与 Moonshot 提供者"""
    print("=== 测试 AgentManager 与 Moonshot 提供者 ===")
    
    # 创建 AgentManager 实例
    agent_manager = AgentManager(strategy="json")
    
    try:
        # 模拟设置 Moonshot API 密钥
        test_prompt = "请简要介绍Python编程语言的特点"
        
        # 测试使用 Moonshot 提供者
        print(f"测试提示词: {test_prompt}")
        
        # 如果有真实的 API 密钥，可以这样调用：
        # response = await agent_manager.run(
        #     prompt=test_prompt,
        #     moonshot_api_key="your-real-api-key",
        #     model="moonshot-v1-8k",
        #     temperature=0.7
        # )
        
        # 这里只测试提供者的选择逻辑
        provider = await agent_manager._get_provider(
            moonshot_api_key="test-key",
            model="moonshot-v1-8k"
        )
        
        print(f"✅ 成功获取 Moonshot 提供者: {type(provider).__name__}")
        print(f"   模型: {provider.model}")
        
    except Exception as e:
        print(f"❌ AgentManager 测试失败: {e}")


async def test_embedding_manager_with_moonshot():
    """测试 EmbeddingManager 与 Moonshot 嵌入提供者"""
    print("\n=== 测试 EmbeddingManager 与 Moonshot 嵌入提供者 ===")
    
    # 创建 EmbeddingManager 实例
    embedding_manager = EmbeddingManager()
    
    try:
        # 测试使用 Moonshot 嵌入提供者
        text = "Python是一种高级编程语言"
        print(f"测试文本: {text}")
        
        # 测试提供者选择逻辑
        provider = await embedding_manager._get_embedding_provider(
            moonshot_api_key="test-key",
            embedding_model="moonshot-embedding-v1"
        )
        
        print(f"✅ 成功获取 Moonshot 嵌入提供者: {type(provider).__name__}")
        print(f"   模型: {provider._model}")
        
        # 如果有真实的 API 密钥，可以这样调用：
        # embedding = await embedding_manager.embed(
        #     text=text,
        #     moonshot_api_key="your-real-api-key",
        #     embedding_model="moonshot-embedding-v1"
        # )
        
    except Exception as e:
        print(f"❌ EmbeddingManager 测试失败: {e}")


async def test_provider_priority():
    """测试提供者优先级选择"""
    print("\n=== 测试提供者优先级 ===")
    
    agent_manager = AgentManager()
    
    # 测试 1: 只有 Moonshot API 密钥
    try:
        provider = await agent_manager._get_provider(moonshot_api_key="test-moonshot-key")
        print(f"✅ 只有 Moonshot 密钥时选择: {type(provider).__name__}")
    except Exception as e:
        print(f"❌ 测试 1 失败: {e}")
    
    # 测试 2: 同时有 Moonshot 和 OpenAI 密钥（应该优先选择 Moonshot）
    try:
        provider = await agent_manager._get_provider(
            moonshot_api_key="test-moonshot-key",
            openai_api_key="test-openai-key"
        )
        print(f"✅ 同时有两个密钥时优先选择: {type(provider).__name__}")
    except Exception as e:
        print(f"❌ 测试 2 失败: {e}")
    
    # 测试 3: 只有 OpenAI API 密钥
    try:
        provider = await agent_manager._get_provider(openai_api_key="test-openai-key")
        print(f"✅ 只有 OpenAI 密钥时选择: {type(provider).__name__}")
    except Exception as e:
        print(f"❌ 测试 3 失败: {e}")


async def main():
    """主测试函数"""
    print("开始测试集成了 Moonshot 的 Manager 类...")
    print("注意: 这些测试使用模拟的 API 密钥，不会进行实际的 API 调用")
    
    await test_agent_manager_with_moonshot()
    await test_embedding_manager_with_moonshot()
    await test_provider_priority()
    
    print("\n=== 使用说明 ===")
    print("1. 设置环境变量: export MOONSHOT_API_KEY='your-real-api-key'")
    print("2. 或在调用时传递参数: moonshot_api_key='your-real-api-key'")
    print("3. 支持的 Moonshot 模型:")
    print("   - 文本生成: moonshot-v1-8k, moonshot-v1-32k, moonshot-v1-128k")
    print("   - 嵌入模型: moonshot-embedding-v1")
    print("4. 提供者优先级: Moonshot > OpenAI > Ollama")
    
    print("\n测试完成！")


if __name__ == "__main__":
    asyncio.run(main())
