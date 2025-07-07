#!/bin/bash

# Resume Matcher - 项目状态检查脚本
# 检查项目依赖、配置和服务状态

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        return 0  # 端口被占用
    else
        return 1  # 端口空闲
    fi
}

# 检查系统要求
check_system_requirements() {
    print_info "检查系统要求..."
    
    local issues=0
    
    if command_exists node; then
        local node_version=$(node --version)
        print_success "Node.js: $node_version"
    else
        print_error "Node.js 未安装"
        issues=$((issues + 1))
    fi
    
    if command_exists npm; then
        local npm_version=$(npm --version)
        print_success "npm: v$npm_version"
    else
        print_error "npm 未安装"
        issues=$((issues + 1))
    fi
    
    if command_exists python3; then
        local python_version=$(python3 --version)
        print_success "Python: $python_version"
    else
        print_error "Python 3 未安装"
        issues=$((issues + 1))
    fi
    
    if command_exists git; then
        local git_version=$(git --version)
        print_success "Git: $git_version"
    else
        print_warning "Git 未安装 (可选)"
    fi
    
    return $issues
}

# 检查项目结构
check_project_structure() {
    print_info "检查项目结构..."
    
    local issues=0
    
    if [ -f "package.json" ]; then
        print_success "根 package.json 存在"
    else
        print_error "根 package.json 不存在"
        issues=$((issues + 1))
    fi
    
    if [ -d "apps/frontend" ]; then
        print_success "前端目录存在"
        if [ -f "apps/frontend/package.json" ]; then
            print_success "前端 package.json 存在"
        else
            print_error "前端 package.json 不存在"
            issues=$((issues + 1))
        fi
        
        if [ -d "apps/frontend/node_modules" ]; then
            print_success "前端依赖已安装"
        else
            print_warning "前端依赖未安装"
        fi
    else
        print_error "前端目录不存在"
        issues=$((issues + 1))
    fi
    
    if [ -d "apps/backend" ]; then
        print_success "后端目录存在"
        if [ -f "apps/backend/requirements.txt" ] || [ -f "apps/backend/pyproject.toml" ]; then
            print_success "后端依赖文件存在"
        else
            print_error "后端依赖文件不存在"
            issues=$((issues + 1))
        fi
        
        if [ -d "apps/backend/.venv" ]; then
            print_success "Python 虚拟环境已创建"
        else
            print_warning "Python 虚拟环境未创建"
        fi
    else
        print_error "后端目录不存在"
        issues=$((issues + 1))
    fi
    
    return $issues
}

# 检查配置文件
check_configuration() {
    print_info "检查配置文件..."
    
    local issues=0
    
    if [ -f "apps/frontend/.env.local" ]; then
        print_success "前端环境配置存在"
    else
        print_warning "前端环境配置不存在 (.env.local)"
        print_info "  创建文件: apps/frontend/.env.local"
        print_info "  参考: CONFIG.md 文档"
    fi
    
    if [ -f "apps/backend/.env" ]; then
        print_success "后端环境配置存在"
    else
        print_warning "后端环境配置不存在 (.env)"
        print_info "  创建文件: apps/backend/.env"
        print_info "  参考: CONFIG.md 文档"
    fi
    
    return $issues
}

# 检查服务状态
check_services() {
    print_info "检查服务状态..."
    
    if check_port 3000; then
        print_success "前端服务正在运行 (端口 3000)"
    else
        print_info "前端服务未运行 (端口 3000 空闲)"
    fi
    
    if check_port 8000; then
        print_success "后端服务正在运行 (端口 8000)"
    else
        print_info "后端服务未运行 (端口 8000 空闲)"
    fi
}

# 检查网络连接
check_network() {
    print_info "检查网络连接..."
    
    if curl -s --head http://localhost:3000 >/dev/null 2>&1; then
        print_success "前端服务可访问 (http://localhost:3000)"
    else
        print_info "前端服务不可访问"
    fi
    
    if curl -s --head http://localhost:8000 >/dev/null 2>&1; then
        print_success "后端服务可访问 (http://localhost:8000)"
    else
        print_info "后端服务不可访问"
    fi
    
    if curl -s --head http://localhost:8000/docs >/dev/null 2>&1; then
        print_success "API 文档可访问 (http://localhost:8000/docs)"
    else
        print_info "API 文档不可访问"
    fi
}

# 检查最近的日志
check_logs() {
    print_info "检查最近的日志..."
    
    if [ -f "apps/backend/app.log" ]; then
        local log_lines=$(tail -5 apps/backend/app.log 2>/dev/null || echo "")
        if [ -n "$log_lines" ]; then
            print_success "后端日志文件存在"
            print_info "最近的日志:"
            echo "$log_lines" | while read line; do
                echo "  $line"
            done
        fi
    else
        print_info "后端日志文件不存在"
    fi
}

# 生成诊断报告
generate_report() {
    print_info "生成诊断报告..."
    
    cat > diagnosis-report.txt << EOF
Resume Matcher 诊断报告
生成时间: $(date)

系统信息:
- 操作系统: $(uname -s)
- 架构: $(uname -m)
- 当前用户: $(whoami)
- 工作目录: $(pwd)

工具版本:
- Node.js: $(node --version 2>/dev/null || echo "未安装")
- npm: v$(npm --version 2>/dev/null || echo "未安装")
- Python: $(python3 --version 2>/dev/null || echo "未安装")
- Git: $(git --version 2>/dev/null || echo "未安装")

端口状态:
- 3000: $(if check_port 3000; then echo "被占用"; else echo "空闲"; fi)
- 8000: $(if check_port 8000; then echo "被占用"; else echo "空闲"; fi)

项目文件:
- package.json: $(if [ -f "package.json" ]; then echo "存在"; else echo "不存在"; fi)
- apps/frontend/: $(if [ -d "apps/frontend" ]; then echo "存在"; else echo "不存在"; fi)
- apps/backend/: $(if [ -d "apps/backend" ]; then echo "存在"; else echo "不存在"; fi)
- 前端依赖: $(if [ -d "apps/frontend/node_modules" ]; then echo "已安装"; else echo "未安装"; fi)
- 后端虚拟环境: $(if [ -d "apps/backend/.venv" ]; then echo "已创建"; else echo "未创建"; fi)

配置文件:
- 前端 .env.local: $(if [ -f "apps/frontend/.env.local" ]; then echo "存在"; else echo "不存在"; fi)
- 后端 .env: $(if [ -f "apps/backend/.env" ]; then echo "存在"; else echo "不存在"; fi)
EOF
    
    print_success "诊断报告已保存到: diagnosis-report.txt"
}

# 主函数
main() {
    print_info "Resume Matcher 项目状态检查"
    print_info "=============================="
    
    # 检查是否在项目根目录
    if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
        print_error "请在 Resume Matcher 项目根目录下运行此脚本"
        exit 1
    fi
    
    local total_issues=0
    
    check_system_requirements
    total_issues=$((total_issues + $?))
    echo
    
    check_project_structure
    total_issues=$((total_issues + $?))
    echo
    
    check_configuration
    echo
    
    check_services
    echo
    
    check_network
    echo
    
    check_logs
    echo
    
    # 总结
    print_info "状态检查完成"
    print_info "=============="
    
    if [ $total_issues -eq 0 ]; then
        print_success "✅ 项目状态良好，没有发现严重问题"
    elif [ $total_issues -le 2 ]; then
        print_warning "⚠️  发现 $total_issues 个问题，项目基本可用"
    else
        print_error "❌ 发现 $total_issues 个问题，建议修复后再使用"
    fi
    
    print_info ""
    print_info "如需帮助："
    print_info "- 查看开发指南: less DEVELOPMENT.md"
    print_info "- 查看配置指南: less CONFIG.md"
    print_info "- 运行安装脚本: ./install-and-start.sh"
    print_info "- 生成详细报告: $0 --report"
}

# 处理命令行参数
case "${1:-}" in
    --report)
        generate_report
        ;;
    --help|-h)
        echo "Resume Matcher 项目状态检查脚本"
        echo ""
        echo "用法:"
        echo "  $0          执行状态检查"
        echo "  $0 --report 生成诊断报告"
        echo "  $0 --help   显示此帮助信息"
        ;;
    *)
        main
        ;;
esac
