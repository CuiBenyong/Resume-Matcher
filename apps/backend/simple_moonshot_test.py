"""
简化的 Moonshot API 测试脚本
"""
import httpx
import json


def test_moonshot_api():
    """直接测试 Moonshot API 调用"""
    print("🧪 测试 Moonshot API 调用格式")
    
    # 使用测试 API key (需要替换为真实的)
    api_key = "YOUR_MOONSHOT_API_KEY"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # 最基本的请求格式
    data = {
        "model": "moonshot-v1-8k",
        "messages": [
            {"role": "user", "content": "Hello"}
        ]
    }
    
    print("📤 发送请求:")
    print(f"URL: https://api.moonshot.cn/v1/chat/completions")
    print(f"Headers: {headers}")
    print(f"Data: {json.dumps(data, indent=2)}")
    
    try:
        with httpx.Client() as client:
            response = client.post(
                "https://api.moonshot.cn/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30.0
            )
            
            print(f"\n📥 响应状态: {response.status_code}")
            print(f"📥 响应头: {dict(response.headers)}")
            print(f"📥 响应内容: {response.text}")
            
    except Exception as e:
        print(f"❌ 请求失败: {e}")


if __name__ == "__main__":
    test_moonshot_api()
    print("\n💡 请将 YOUR_MOONSHOT_API_KEY 替换为真实的 API 密钥")
