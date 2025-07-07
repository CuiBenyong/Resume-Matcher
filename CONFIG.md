# 项目配置指南

## 环境变量配置

### 前端环境变量 (.env.local)

在 `apps/frontend` 目录下创建 `.env.local` 文件：

```bash
# API 配置
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 功能开关
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true

# 外部服务
NEXT_PUBLIC_GITHUB_REPO=srbhr/Resume-Matcher
```

### 后端环境变量 (.env)

在 `apps/backend` 目录下创建 `.env` 文件：

```bash
# 数据库配置
DATABASE_URL=sqlite:///./app.db
# 生产环境使用 PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/resume_matcher

# AI 服务配置
OPENAI_API_KEY=sk-your-openai-key-here
MOONSHOT_API_KEY=sk-your-moonshot-key-here

# 应用配置
SECRET_KEY=your-super-secret-key-here
DEBUG=true
ENVIRONMENT=development

# CORS 配置
CORS_ORIGINS=["http://localhost:3000"]

# 文件上传配置
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=["pdf", "doc", "docx"]

# 日志配置
LOG_LEVEL=INFO
```

## API 密钥获取

### OpenAI API 密钥

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 创建账户或登录
3. 前往 "API Keys" 页面
4. 点击 "Create new secret key"
5. 复制生成的密钥到 `.env` 文件

### Moonshot AI API 密钥

1. 访问 [Moonshot AI](https://platform.moonshot.cn/)
2. 注册账户并登录
3. 前往 API 密钥管理页面
4. 创建新的 API 密钥
5. 复制密钥到 `.env` 文件

## 数据库配置

### 开发环境 (SQLite)

默认使用 SQLite，无需额外配置。数据库文件会自动创建在 `apps/backend/app.db`。

### 生产环境 (PostgreSQL)

1. 安装 PostgreSQL
2. 创建数据库：
   ```sql
   CREATE DATABASE resume_matcher;
   CREATE USER resume_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE resume_matcher TO resume_user;
   ```
3. 更新 `.env` 中的 `DATABASE_URL`

## Docker 配置

### 使用 Docker Compose

```bash
# 构建并启动所有服务
docker-compose up --build

# 后台运行
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 环境变量文件

创建 `docker-compose.override.yml` 用于本地开发：

```yaml
version: '3.8'
services:
  backend:
    environment:
      - DEBUG=true
      - LOG_LEVEL=DEBUG
    volumes:
      - ./apps/backend:/app
  
  frontend:
    environment:
      - NEXT_PUBLIC_ENABLE_DEBUG=true
    volumes:
      - ./apps/frontend:/app
```

## VS Code 配置

### 推荐插件

在 `.vscode/extensions.json` 中配置：

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.black-formatter",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json"
  ]
}
```

### 工作区设置

在 `.vscode/settings.json` 中配置：

```json
{
  "python.defaultInterpreterPath": "./apps/backend/.venv/bin/python",
  "python.terminal.activateEnvironment": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter",
    "editor.formatOnSave": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 调试配置

在 `.vscode/launch.json` 中配置：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/apps/backend/app/main.py",
      "console": "integratedTerminal",
      "justMyCode": true,
      "cwd": "${workspaceFolder}/apps/backend"
    },
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/frontend/node_modules/next/dist/bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/apps/frontend",
      "runtimeArgs": ["--inspect"]
    }
  ]
}
```

## 性能优化

### 前端优化

1. **代码分割**：
   ```typescript
   // 使用动态导入
   const LazyComponent = dynamic(() => import('./LazyComponent'), {
     loading: () => <div>Loading...</div>
   });
   ```

2. **图片优化**：
   ```typescript
   import Image from 'next/image';
   
   <Image
     src="/path/to/image.jpg"
     alt="Description"
     width={800}
     height={600}
     priority // 对重要图片使用
   />
   ```

3. **缓存策略**：
   ```typescript
   // 在 next.config.js 中配置
   const nextConfig = {
     images: {
       domains: ['example.com'],
     },
     headers: async () => [
       {
         source: '/api/:path*',
         headers: [
           {
             key: 'Cache-Control',
             value: 'public, max-age=3600'
           }
         ]
       }
     ]
   };
   ```

### 后端优化

1. **数据库优化**：
   ```python
   # 使用索引
   class Resume(Base):
       __tablename__ = "resumes"
       id = Column(Integer, primary_key=True, index=True)
       user_id = Column(Integer, ForeignKey("users.id"), index=True)
   
   # 使用查询优化
   def get_resumes_with_jobs(db: Session, user_id: int):
       return db.query(Resume).options(
           joinedload(Resume.jobs)
       ).filter(Resume.user_id == user_id).all()
   ```

2. **缓存策略**：
   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=128)
   def expensive_function(param: str) -> str:
       # 耗时计算
       return result
   ```

3. **异步处理**：
   ```python
   import asyncio
   from fastapi import BackgroundTasks
   
   @app.post("/process-resume/")
   async def process_resume(
       background_tasks: BackgroundTasks,
       resume_id: int
   ):
       background_tasks.add_task(process_resume_async, resume_id)
       return {"message": "Processing started"}
   ```

## 故障排除

### 常见问题

1. **端口占用**：
   ```bash
   # 查找占用端口的进程
   lsof -i :3000
   lsof -i :8000
   
   # 终止进程
   kill -9 <PID>
   ```

2. **Python 依赖冲突**：
   ```bash
   # 重新创建虚拟环境
   rm -rf .venv
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Node.js 版本问题**：
   ```bash
   # 使用 nvm 管理 Node.js 版本
   nvm install 18
   nvm use 18
   ```

4. **数据库连接问题**：
   ```bash
   # 检查数据库文件权限
   ls -la apps/backend/app.db
   
   # 重新初始化数据库
   cd apps/backend
   python -c "from app.core.database import create_tables; create_tables()"
   ```

### 日志调试

1. **前端日志**：
   ```typescript
   // 开发环境启用详细日志
   if (process.env.NODE_ENV === 'development') {
     console.log('Debug info:', data);
   }
   ```

2. **后端日志**：
   ```python
   import logging
   
   # 配置日志级别
   logging.basicConfig(
       level=logging.DEBUG if settings.DEBUG else logging.INFO,
       format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
   )
   
   logger = logging.getLogger(__name__)
   logger.debug("Debug message")
   ```

## 安全配置

### 生产环境安全检查清单

- [ ] 使用强密码和复杂的 SECRET_KEY
- [ ] 启用 HTTPS
- [ ] 配置正确的 CORS 源
- [ ] 设置适当的文件上传限制
- [ ] 启用速率限制
- [ ] 定期更新依赖包
- [ ] 配置安全头
- [ ] 使用环境变量管理敏感信息

### 安全中间件配置

```python
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["example.com", "*.example.com"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```
