"""
测试Moonshot AI提供者的示例代码
"""
import asyncio
import os
from app.agent.providers.moonshot import MoonshotProvider, MoonshotEmbeddingProvider


async def test_moonshot_provider():
    """测试Moonshot文本生成提供者"""
    print("=== 测试 MoonshotProvider ===")
    
    # 初始化提供者（需要设置环境变量 MOONSHOT_API_KEY）
    provider = MoonshotProvider(
        model="moonshot-v1-8k"  # 使用8k上下文模型
    )
    
    # 设置系统指令
    provider.instructions = "你是一个专业的简历分析助手，请用中文回复。"
    
    try:
        # 测试文本生成
        prompt = "请简要分析一下Python编程语言的优势"
        print(f"提示词: {prompt}")
        
        response = await provider(
            prompt=prompt,
            temperature=0.7,
            max_length=500
        )
        
        print(f"响应: {response}")
        print("✅ MoonshotProvider 测试成功")
        
    except Exception as e:
        print(f"❌ MoonshotProvider 测试失败: {e}")


async def test_moonshot_embedding():
    """测试Moonshot嵌入提供者"""
    print("\n=== 测试 MoonshotEmbeddingProvider ===")
    
    # 初始化嵌入提供者
    embedding_provider = MoonshotEmbeddingProvider()
    
    try:
        # 测试文本嵌入
        text = "Python是一种高级编程语言"
        print(f"输入文本: {text}")
        
        embedding = await embedding_provider.embed(text)
        
        print(f"嵌入向量维度: {len(embedding)}")
        print(f"嵌入向量前5个值: {embedding[:5]}")
        print("✅ MoonshotEmbeddingProvider 测试成功")
        
    except Exception as e:
        print(f"❌ MoonshotEmbeddingProvider 测试失败: {e}")


async def main():
    """主测试函数"""
    print("开始测试 Moonshot AI 提供者...")
    print("注意: 需要设置环境变量 MOONSHOT_API_KEY")
    
    api_key = os.getenv("MOONSHOT_API_KEY")
    if not api_key:
        print("⚠️  警告: 未设置 MOONSHOT_API_KEY 环境变量，实际API调用将失败")
        print("请运行: export MOONSHOT_API_KEY='your-api-key'")
    
    await test_moonshot_provider()
    await test_moonshot_embedding()
    
    print("\n测试完成！")


if __name__ == "__main__":
    asyncio.run(main())
