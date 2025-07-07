# Resume Matcher 开发指南

## 目录
- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [开发环境设置](#开发环境设置)
- [快速开始](#快速开始)
- [开发流程](#开发流程)
- [API 文档](#api-文档)
- [测试](#测试)
- [部署](#部署)
- [贡献指南](#贡献指南)
- [故障排除](#故障排除)

## 项目概述

Resume Matcher 是一个智能简历优化工具，通过分析职位描述来帮助用户优化简历，提高面试机会。该项目采用前后端分离架构，使用现代化的技术栈构建。

### 核心功能
- 📄 简历上传与解析
- 🔍 职位描述分析
- 🤖 AI 驱动的简历优化建议
- 📊 匹配度评分
- 📈 可视化分析报告
- 🎨 自定义简历模板

## 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + CSS Modules
- **状态管理**: React Context + Hooks
- **UI 组件**: 自定义组件库
- **构建工具**: Turbo (Monorepo)

### 后端
- **框架**: FastAPI (Python)
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: SQLAlchemy
- **AI/ML**: 
  - OpenAI GPT API
  - Moonshot AI API
  - 自然语言处理库
- **文件处理**: 
  - PDF 解析 (PyPDF2, pdfplumber)
  - DOCX 解析 (python-docx)

### 开发工具
- **包管理**: npm (前端) + uv/pip (后端)
- **代码格式化**: Prettier (前端) + Black (后端)
- **代码检查**: ESLint (前端) + Ruff (后端)
- **版本控制**: Git + GitHub
- **CI/CD**: GitHub Actions

## 项目结构

```
Resume-Matcher/
├── apps/
│   ├── frontend/                 # Next.js 前端应用
│   │   ├── app/                  # App Router 页面
│   │   │   ├── (default)/        # 默认布局组
│   │   │   │   ├── (onboarding)/ # 入门流程页面
│   │   │   │   │   ├── resume/   # 简历上传页面
│   │   │   │   │   └── jobs/     # 职位描述页面
│   │   │   │   ├── dashboard/    # 仪表板页面
│   │   │   │   └── page.tsx      # 首页
│   │   │   ├── api/              # API 路由
│   │   │   └── layout.tsx        # 根布局
│   │   ├── components/           # React 组件
│   │   │   ├── common/           # 通用组件
│   │   │   ├── dashboard/        # 仪表板组件
│   │   │   ├── home/             # 首页组件
│   │   │   ├── jd-upload/        # 职位描述上传组件
│   │   │   ├── resume/           # 简历相关组件
│   │   │   └── ui/               # 基础 UI 组件
│   │   ├── hooks/                # 自定义 Hooks
│   │   ├── lib/                  # 工具库
│   │   │   └── api/              # API 客户端
│   │   ├── public/               # 静态资源
│   │   └── package.json
│   └── backend/                  # FastAPI 后端应用
│       ├── app/                  # 应用代码
│       │   ├── agent/            # AI 代理
│       │   │   ├── manager.py    # 代理管理器
│       │   │   ├── providers/    # AI 提供商适配器
│       │   │   └── strategies/   # 分析策略
│       │   ├── api/              # API 路由
│       │   │   ├── middleware.py # 中间件
│       │   │   └── router/       # 路由模块
│       │   ├── core/             # 核心配置
│       │   │   ├── config.py     # 应用配置
│       │   │   ├── database.py   # 数据库配置
│       │   │   └── exceptions.py # 异常处理
│       │   ├── models/           # 数据模型
│       │   │   ├── user.py       # 用户模型
│       │   │   ├── resume.py     # 简历模型
│       │   │   └── job.py        # 职位模型
│       │   ├── prompt/           # AI 提示模板
│       │   │   ├── structured_resume.py
│       │   │   ├── structured_job.py
│       │   │   └── resume_improvement.py
│       │   ├── schemas/          # 数据模式
│       │   │   ├── pydantic/     # Pydantic 模型
│       │   │   └── json/         # JSON Schema
│       │   ├── services/         # 业务逻辑服务
│       │   │   ├── resume_service.py
│       │   │   ├── job_service.py
│       │   │   └── score_improvement_service.py
│       │   └── main.py           # 应用入口
│       ├── requirements.txt      # Python 依赖
│       ├── pyproject.toml        # 项目配置
│       └── uv.lock               # 依赖锁文件
├── assets/                       # 项目资源
├── docs/                         # 文档 (如果存在)
├── package.json                  # 根包配置
├── install-and-start.sh          # 快速启动脚本 (Unix)
├── install-and-start.bat         # 快速启动脚本 (Windows)
└── README.md                     # 项目说明
```

## 开发环境设置

### 系统要求
- **Node.js**: 18.x 或更高版本
- **Python**: 3.9+ 
- **Git**: 最新版本
- **操作系统**: macOS, Linux, Windows

### 推荐工具
- **IDE**: VS Code (推荐插件: ES7+ React/Redux/React-Native snippets, Python, Tailwind CSS IntelliSense)
- **终端**: iTerm2 (macOS), Windows Terminal (Windows)
- **API 测试**: Postman 或 Insomnia
- **数据库管理**: DB Browser for SQLite

## 快速开始

### 方法一：使用自动化脚本 (推荐)

#### Unix/Linux/macOS:
```bash
# 1. 克隆项目
git clone https://github.com/your-username/Resume-Matcher.git
cd Resume-Matcher

# 2. 赋予执行权限并运行安装脚本
chmod +x install-and-start.sh
./install-and-start.sh
```

#### Windows:
```cmd
REM 1. 克隆项目
git clone https://github.com/your-username/Resume-Matcher.git
cd Resume-Matcher

REM 2. 运行安装脚本
install-and-start.bat
```

### 方法二：手动安装

#### 1. 安装前端依赖
```bash
cd apps/frontend
npm install
cd ../..
```

#### 2. 设置后端环境
```bash
cd apps/backend

# 创建虚拟环境
python -m venv .venv

# 激活虚拟环境
# macOS/Linux:
source .venv/bin/activate
# Windows:
# .venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
# 或者使用 uv (如果已安装):
# uv sync

cd ../..
```

#### 3. 配置环境变量
```bash
# 复制环境变量模板
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local

# 编辑配置文件，添加必要的 API 密钥
```

#### 4. 启动开发服务器

**终端 1 - 后端:**
```bash
cd apps/backend
source .venv/bin/activate  # Windows: .venv\Scripts\activate
python app/main.py
```

**终端 2 - 前端:**
```bash
cd apps/frontend
npm run dev
```

### 访问应用
- 前端: http://localhost:3000
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/docs

## 开发流程

### 1. 分支策略
```bash
# 主分支
main          # 生产环境代码
develop       # 开发分支

# 功能分支
feature/功能名 # 新功能开发
bugfix/问题名  # Bug 修复
hotfix/问题名  # 紧急修复
```

### 2. 提交规范
使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范:

```bash
# 功能新增
git commit -m "feat: 添加简历解析功能"

# Bug 修复
git commit -m "fix: 修复文件上传问题"

# 文档更新
git commit -m "docs: 更新开发指南"

# 代码重构
git commit -m "refactor: 重构用户认证逻辑"

# 性能优化
git commit -m "perf: 优化简历匹配算法"

# 测试相关
git commit -m "test: 添加单元测试"
```

### 3. 代码审查流程
1. 创建功能分支
2. 完成开发并自测
3. 提交 Pull Request
4. 代码审查
5. 合并到 develop 分支

### 4. 开发工作流
```bash
# 1. 从最新的 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/新功能名

# 2. 开发和提交
git add .
git commit -m "feat: 实现新功能"

# 3. 推送并创建 PR
git push origin feature/新功能名
```

## API 文档

### 基础 URL
- 开发环境: `http://localhost:8000/api/v1`
- 生产环境: `https://your-domain.com/api/v1`

### 认证
API 使用 JWT 令牌进行身份验证：
```http
Authorization: Bearer <your-jwt-token>
```

### 核心端点

#### 用户管理
```http
POST /auth/register      # 用户注册
POST /auth/login         # 用户登录
GET  /auth/me           # 获取当前用户信息
```

#### 简历管理
```http
POST   /resumes/upload           # 上传简历
GET    /resumes/{resume_id}      # 获取简历详情
PUT    /resumes/{resume_id}      # 更新简历
DELETE /resumes/{resume_id}      # 删除简历
GET    /resumes/{resume_id}/preview # 预览简历
```

#### 职位管理
```http
POST /jobs/analyze              # 分析职位描述
GET  /jobs/{job_id}            # 获取职位详情
POST /jobs/{job_id}/match      # 计算匹配度
```

#### 分析服务
```http
POST /analysis/improve         # 获取改进建议
POST /analysis/score          # 计算匹配分数
GET  /analysis/{analysis_id}  # 获取分析结果
```

### 请求示例

#### 上传简历
```bash
curl -X POST "http://localhost:8000/api/v1/resumes/upload" \
  -H "Authorization: Bearer <token>" \
  -F "file=@resume.pdf"
```

#### 分析职位描述
```bash
curl -X POST "http://localhost:8000/api/v1/jobs/analyze" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "description": "Software Engineer position...",
    "title": "Senior Software Engineer",
    "company": "Tech Company"
  }'
```

## 测试

### 前端测试
```bash
cd apps/frontend

# 运行单元测试
npm run test

# 运行端到端测试
npm run test:e2e

# 生成测试覆盖率报告
npm run test:coverage
```

### 后端测试
```bash
cd apps/backend
source .venv/bin/activate

# 运行所有测试
pytest

# 运行特定测试文件
pytest tests/test_resume_service.py

# 生成覆盖率报告
pytest --cov=app tests/
```

### 测试文件结构
```
apps/frontend/
├── __tests__/           # 测试文件
│   ├── components/      # 组件测试
│   ├── pages/          # 页面测试
│   └── utils/          # 工具函数测试

apps/backend/
├── tests/              # 测试文件
│   ├── test_api/       # API 测试
│   ├── test_services/  # 服务测试
│   └── test_models/    # 模型测试
```

## 部署

### 开发环境部署 (Docker)
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 生产环境部署

#### 前端部署 (Vercel)
```bash
# 1. 构建生产版本
cd apps/frontend
npm run build

# 2. 使用 Vercel CLI 部署
npx vercel --prod
```

#### 后端部署 (Railway/Heroku)
```bash
# 1. 准备生产环境
cd apps/backend

# 2. 设置环境变量
# DATABASE_URL=postgresql://...
# OPENAI_API_KEY=sk-...
# MOONSHOT_API_KEY=sk-...

# 3. 部署到平台
```

### 环境变量配置

#### 前端 (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### 后端 (.env)
```env
# 数据库
DATABASE_URL=sqlite:///./app.db

# AI API 密钥
OPENAI_API_KEY=sk-your-openai-key
MOONSHOT_API_KEY=sk-your-moonshot-key

# 应用配置
SECRET_KEY=your-secret-key
DEBUG=true
CORS_ORIGINS=["http://localhost:3000"]
```

## 贡献指南

### 如何贡献
1. Fork 项目到自己的 GitHub
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: 添加某个功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范

#### 前端代码规范
- 使用 TypeScript 严格模式
- 遵循 React Hooks 最佳实践
- 组件使用 PascalCase 命名
- 文件名使用 kebab-case
- 使用 Prettier 格式化代码

#### 后端代码规范
- 遵循 PEP 8 Python 代码规范
- 使用类型注解 (Type Hints)
- 函数和变量使用 snake_case
- 类名使用 PascalCase
- 使用 Black 格式化代码

### 提交前检查清单
- [ ] 代码已通过 linting 检查
- [ ] 所有测试都通过
- [ ] 添加了必要的测试用例
- [ ] 更新了相关文档
- [ ] 提交信息遵循规范

## 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 查找占用端口的进程
lsof -i :3000  # 或 :8000

# 终止进程
kill -9 <PID>
```

#### 2. Python 虚拟环境问题
```bash
# 删除并重新创建虚拟环境
rm -rf .venv
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

#### 3. Node.js 依赖问题
```bash
# 清理缓存并重新安装
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 4. 数据库连接问题
```bash
# 检查数据库文件权限
ls -la app.db

# 重新初始化数据库
python -c "from app.core.database import create_tables; create_tables()"
```

#### 5. API 调用失败
- 检查 API 密钥是否正确配置
- 确认网络连接正常
- 查看后端日志输出
- 验证请求格式是否正确

### 日志调试

#### 前端调试
```javascript
// 在浏览器控制台中查看网络请求
// 使用 React DevTools 检查组件状态
// 检查控制台错误信息
```

#### 后端调试
```python
# 在 main.py 中启用详细日志
import logging
logging.basicConfig(level=logging.DEBUG)

# 使用 FastAPI 的自动 API 文档
# 访问 http://localhost:8000/docs
```

### 性能优化建议

#### 前端优化
- 使用 React.memo 优化组件渲染
- 实现虚拟滚动处理大列表
- 使用代码分割减小包体积
- 优化图片和静态资源

#### 后端优化
- 实现数据库查询优化
- 使用缓存减少 API 调用
- 异步处理耗时操作
- 实现请求限流

### 获取帮助
- 📚 查看 [项目文档](./README.md)
- 🐛 提交 [Issue](https://github.com/your-username/Resume-Matcher/issues)
- 💬 加入 [Discord 社区](https://discord.gg/your-discord)
- 📧 发送邮件到 support@example.com

---

## 更新日志

### v1.0.0 (2024-01-XX)
- ✨ 初始版本发布
- 🎯 基础简历匹配功能
- 🔧 前后端分离架构
- 📱 响应式 UI 设计

---

**感谢您对 Resume Matcher 项目的贡献！** 🎉
