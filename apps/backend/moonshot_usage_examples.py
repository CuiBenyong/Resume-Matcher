"""
Moonshot AI 提供者使用示例

这个文件演示了如何在 Resume Matcher 项目中使用集成的 Moonshot AI 提供者
"""

# 基本使用示例
async def example_usage():
    from app.agent.manager import AgentManager, EmbeddingManager
    
    # === 1. 使用 AgentManager 进行文本生成 ===
    agent_manager = AgentManager(strategy="json")
    
    # 方式 1: 通过环境变量设置 API 密钥
    # export MOONSHOT_API_KEY="your-moonshot-api-key"
    response = await agent_manager.run(
        prompt="请分析这份简历的优势和改进建议",
        # moonshot_api_key 会自动从环境变量读取
        model="moonshot-v1-8k",  # 可选：指定模型
        temperature=0.7,
        max_length=1000
    )
    
    # 方式 2: 直接传递 API 密钥
    response = await agent_manager.run(
        prompt="请分析这份简历的优势和改进建议",
        moonshot_api_key="your-moonshot-api-key",
        model="moonshot-v1-32k",  # 使用更大上下文的模型
        temperature=0.5
    )
    
    # === 2. 使用 EmbeddingManager 进行文本嵌入 ===
    embedding_manager = EmbeddingManager()
    
    # 生成简历文本的嵌入向量
    resume_text = "Python开发工程师，5年经验，熟悉Django、Flask等框架..."
    embedding = await embedding_manager.embed(
        text=resume_text,
        moonshot_api_key="your-moonshot-api-key",  # 可选，也可以从环境变量读取
        embedding_model="moonshot-embedding-v1"
    )
    
    print(f"嵌入向量维度: {len(embedding)}")


# 环境变量配置示例
"""
在终端中设置环境变量：

# 设置 Moonshot API 密钥
export MOONSHOT_API_KEY="your-moonshot-api-key"

# 可选：同时设置其他提供者的密钥
export OPENAI_API_KEY="your-openai-api-key"

# 提供者优先级：
# 1. Moonshot (如果设置了 MOONSHOT_API_KEY 或传递了 moonshot_api_key)
# 2. OpenAI (如果设置了 OPENAI_API_KEY 或传递了 openai_api_key)  
# 3. Ollama (默认本地模型)
"""

# 完整的简历分析示例
async def resume_analysis_example():
    """完整的简历分析示例，使用 Moonshot AI"""
    from app.agent.manager import AgentManager
    
    agent_manager = AgentManager(strategy="json")
    
    # 模拟简历内容
    resume_content = """
    张三
    Python后端开发工程师
    
    工作经验：
    - 2019-2023: ABC公司，高级Python开发工程师
    - 负责微服务架构设计和实现
    - 使用Django、FastAPI开发RESTful API
    - 熟悉MySQL、Redis、Docker等技术
    
    技能：
    - 编程语言：Python、JavaScript、SQL
    - 框架：Django、FastAPI、Vue.js
    - 数据库：MySQL、PostgreSQL、Redis
    - 工具：Docker、Git、Linux
    """
    
    # 职位描述
    job_description = """
    招聘职位：Python高级开发工程师
    
    职位要求：
    - 5年以上Python开发经验
    - 熟悉Django/FastAPI等Web框架
    - 有微服务架构经验
    - 熟悉云原生技术（Docker、Kubernetes）
    - 良好的数据库设计能力
    - 优秀的团队协作能力
    """
    
    # 使用 Moonshot AI 进行简历匹配分析
    analysis_prompt = f"""
    请分析以下简历与职位的匹配度：
    
    简历内容：
    {resume_content}
    
    职位要求：
    {job_description}
    
    请从以下维度进行分析：
    1. 技能匹配度 (1-10分)
    2. 经验匹配度 (1-10分)  
    3. 简历优势
    4. 需要改进的地方
    5. 整体建议
    
    请以JSON格式返回分析结果。
    """
    
    try:
        result = await agent_manager.run(
            prompt=analysis_prompt,
            moonshot_api_key="your-moonshot-api-key",  # 替换为真实的API密钥
            model="moonshot-v1-32k",  # 使用大上下文模型处理长文本
            temperature=0.3,  # 较低的temperature确保结果的一致性
            max_length=2000
        )
        
        print("=== 简历分析结果 ===")
        print(result)
        
    except Exception as e:
        print(f"分析失败: {e}")


if __name__ == "__main__":
    import asyncio
    
    print("=== Moonshot AI 提供者使用示例 ===")
    print("注意: 需要设置真实的 MOONSHOT_API_KEY 才能进行实际调用")
    print()
    
    # 运行示例
    # asyncio.run(example_usage())
    # asyncio.run(resume_analysis_example())
    
    print("示例代码已准备就绪，请设置 API 密钥后运行！")
