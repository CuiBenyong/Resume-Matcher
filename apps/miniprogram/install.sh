#!/bin/bash

# Resume Matcher 小程序项目安装脚本
echo "🚀 开始安装 Resume Matcher 小程序项目..."

# 检查 Node.js 版本
node_version=$(node -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ 请先安装 Node.js (版本 >= 16)"
    exit 1
fi

echo "✅ Node.js 版本: $node_version"

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在 miniprogram 目录下运行此脚本"
    exit 1
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败，尝试使用 yarn..."
    yarn install
    
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败，请检查网络连接"
        exit 1
    fi
fi

echo "✅ 依赖安装完成"

# 检查是否全局安装了 Taro CLI
taro_version=$(taro -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "📱 安装 Taro CLI..."
    npm install -g @tarojs/cli
    
    if [ $? -ne 0 ]; then
        echo "⚠️  全局安装 Taro CLI 失败，将使用本地版本"
    else
        echo "✅ Taro CLI 安装完成"
    fi
fi

echo ""
echo "🎉 项目安装完成！"
echo ""
echo "📋 可用命令:"
echo "  npm run dev:weapp     - 启动微信小程序开发模式"
echo "  npm run build:weapp   - 构建微信小程序"
echo "  npm run dev:h5        - 启动 H5 开发模式"
echo "  npm run build:h5      - 构建 H5 版本"
echo ""
echo "📝 接下来的步骤:"
echo "  1. 确保后端服务已启动 (FastAPI 在 8000 端口)"
echo "  2. 运行 'npm run dev:weapp' 启动小程序开发"
echo "  3. 使用微信开发者工具打开 dist 目录"
echo ""
echo "🔧 如果遇到问题:"
echo "  - 检查 Node.js 版本是否 >= 16"
echo "  - 确保后端 API 服务正常运行"
echo "  - 查看 README.md 获取详细说明"
echo ""
