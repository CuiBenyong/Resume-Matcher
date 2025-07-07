#!/bin/bash

# Resume Matcher - 快速安装与启动脚本
# 该脚本会自动安装依赖并启动前后端服务

set -e  # 如果任何命令失败，立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${2}[Resume Matcher] ${1}${NC}"
}

print_success() {
    print_message "$1" "$GREEN"
}

print_info() {
    print_message "$1" "$BLUE"
}

print_warning() {
    print_message "$1" "$YELLOW"
}

print_error() {
    print_message "$1" "$RED"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查必要的工具
check_requirements() {
    print_info "检查系统要求..."
    
    if ! command_exists node; then
        print_error "Node.js 未安装。请访问 https://nodejs.org/ 安装 Node.js"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm 未安装。请安装 Node.js (包含 npm)"
        exit 1
    fi
    
    if ! command_exists python3; then
        print_error "Python 3 未安装。请访问 https://python.org/ 安装 Python 3"
        exit 1
    fi
    
    print_success "系统要求检查通过"
}

# 安装前端依赖
install_frontend_deps() {
    print_info "安装前端依赖..."
    cd apps/frontend
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "前端依赖安装完成"
    else
        print_info "前端依赖已存在，跳过安装"
    fi
    
    cd ../..
}

# 安装后端依赖
install_backend_deps() {
    print_info "安装后端依赖..."
    cd apps/backend
    
    # 检查是否使用虚拟环境
    if [ ! -d ".venv" ]; then
        print_info "创建 Python 虚拟环境..."
        python3 -m venv .venv
    fi
    
    print_info "激活虚拟环境并安装依赖..."
    source .venv/bin/activate
    
    # 检查是否使用 uv 或 pip
    if [ -f "uv.lock" ] && command_exists uv; then
        print_info "使用 uv 安装依赖..."
        uv sync
    elif [ -f "requirements.txt" ]; then
        print_info "使用 pip 安装依赖..."
        pip install -r requirements.txt
    else
        print_warning "未找到依赖文件，跳过后端依赖安装"
    fi
    
    print_success "后端依赖安装完成"
    cd ../..
}

# 启动开发服务器
start_services() {
    print_info "启动开发服务器..."
    
    # 创建一个临时目录来存储 PID 文件
    mkdir -p .tmp
    
    # 启动后端服务器
    print_info "启动后端服务器..."
    cd apps/backend
    source .venv/bin/activate
    
    # 检查后端是否有启动脚本
    if [ -f "app/main.py" ]; then
        python app/main.py &
        BACKEND_PID=$!
        echo $BACKEND_PID > ../../.tmp/backend.pid
        print_success "后端服务器已启动 (PID: $BACKEND_PID)"
    else
        print_warning "未找到后端启动文件，跳过后端启动"
    fi
    
    cd ../..
    
    # 等待一下让后端启动
    sleep 2
    
    # 启动前端服务器
    print_info "启动前端服务器..."
    cd apps/frontend
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../../.tmp/frontend.pid
    print_success "前端服务器已启动 (PID: $FRONTEND_PID)"
    
    cd ../..
    
    # 显示服务信息
    print_success "所有服务已启动！"
    print_info "前端: http://localhost:3000"
    print_info "后端: http://localhost:8000 (如果已配置)"
    print_info ""
    print_info "按 Ctrl+C 停止所有服务"
    
    # 创建停止脚本
    cat > stop-services.sh << 'EOF'
#!/bin/bash
if [ -f .tmp/frontend.pid ]; then
    kill $(cat .tmp/frontend.pid) 2>/dev/null || true
    rm .tmp/frontend.pid
    echo "前端服务器已停止"
fi

if [ -f .tmp/backend.pid ]; then
    kill $(cat .tmp/backend.pid) 2>/dev/null || true
    rm .tmp/backend.pid
    echo "后端服务器已停止"
fi

rmdir .tmp 2>/dev/null || true
echo "所有服务已停止"
EOF
    chmod +x stop-services.sh
    
    # 设置信号处理程序来清理进程
    cleanup() {
        print_info "正在停止服务..."
        ./stop-services.sh
        exit 0
    }
    
    trap cleanup SIGINT SIGTERM
    
    # 等待用户中断
    wait
}

# 主函数
main() {
    print_info "Resume Matcher 快速安装与启动脚本"
    print_info "====================================="
    
    # 检查是否在项目根目录
    if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
        print_error "请在 Resume Matcher 项目根目录下运行此脚本"
        exit 1
    fi
    
    check_requirements
    install_frontend_deps
    install_backend_deps
    start_services
}

# 处理命令行参数
case "${1:-}" in
    --install-only)
        print_info "仅安装依赖模式"
        check_requirements
        install_frontend_deps
        install_backend_deps
        print_success "依赖安装完成！"
        ;;
    --start-only)
        print_info "仅启动服务模式"
        start_services
        ;;
    --help|-h)
        echo "Resume Matcher 快速安装与启动脚本"
        echo ""
        echo "用法:"
        echo "  $0                安装依赖并启动服务"
        echo "  $0 --install-only 仅安装依赖"
        echo "  $0 --start-only   仅启动服务"
        echo "  $0 --help        显示此帮助信息"
        echo ""
        echo "服务地址:"
        echo "  前端: http://localhost:3000"
        echo "  后端: http://localhost:8000"
        ;;
    *)
        main
        ;;
esac
