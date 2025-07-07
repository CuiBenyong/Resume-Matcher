# Resume Matcher 小程序

基于 Taro 框架开发的智能简历生成小程序，连接后端 API 提供 AI 驱动的简历优化服务。

## 功能特性

### 🎯 核心功能
- **简历上传与分析**: 支持文件上传和文本输入两种方式
- **职位描述分析**: 智能解析职位要求和关键技能
- **AI 简历生成**: 基于简历和职位匹配度生成优化简历
- **历史记录管理**: 查看和管理生成历史

### 📱 页面结构
- **首页** (`/pages/index`): 功能入口和导航
- **上传简历** (`/pages/upload-resume`): 简历上传和分析
- **职位分析** (`/pages/upload-job`): 职位描述输入和分析  
- **简历分析** (`/pages/resume-analysis`): 简历分析结果展示
- **职位分析** (`/pages/job-analysis`): 职位分析结果展示
- **生成简历** (`/pages/generate-resume`): AI 简历生成
- **编辑简历** (`/pages/edit-resume`): 简历编辑功能
- **预览简历** (`/pages/preview-resume`): 生成结果预览
- **历史记录** (`/pages/history`): 生成历史管理

## 技术栈

- **框架**: Taro 3.6.25
- **语言**: TypeScript
- **UI**: 原生小程序组件
- **样式**: Sass/SCSS
- **状态管理**: React State (可扩展 Redux)

## 项目结构

```
src/
├── app.tsx                 # 应用入口
├── app.config.ts          # 应用配置
├── app.scss               # 全局样式
├── pages/                 # 页面目录
│   ├── index/            # 首页
│   ├── upload-resume/    # 上传简历
│   ├── upload-job/       # 职位分析
│   ├── generate-resume/  # 生成简历
│   ├── preview-resume/   # 预览简历
│   └── history/          # 历史记录
├── services/             # API 服务
│   ├── apiService.ts     # 通用 API 服务
│   ├── resumeService.ts  # 简历相关服务
│   └── jobService.ts     # 职位相关服务
├── constants/            # 常量配置
│   └── config.ts         # 应用配置
└── components/           # 公共组件 (待开发)
```

## 后端接口依赖

### 简历相关 API
- `POST /api/v1/resumes/upload` - 文件上传
- `POST /api/v1/resumes/analyze-text` - 文本分析
- `GET /api/v1/resumes` - 获取简历列表
- `GET /api/v1/resumes/:id` - 获取简历详情

### 职位相关 API
- `POST /api/v1/jobs/analyze` - 职位描述分析
- `POST /api/v1/jobs` - 保存职位
- `GET /api/v1/jobs` - 获取职位列表

### 简历生成 API
- `POST /api/v1/resume-generator/generate` - 生成简历
- `GET /api/v1/resume-generator/:id` - 获取生成结果
- `GET /api/v1/resume-generator/history` - 获取生成历史

## 开发指南

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖
```bash
cd apps/miniprogram
npm install
```

### 开发命令
```bash
# 微信小程序开发
npm run dev:weapp

# H5 开发
npm run dev:h5

# 支付宝小程序开发
npm run dev:alipay

# 字节跳动小程序开发
npm run dev:tt
```

### 构建命令
```bash
# 微信小程序构建
npm run build:weapp

# H5 构建
npm run build:h5

# 其他平台构建
npm run build:alipay  # 支付宝
npm run build:tt     # 字节跳动
npm run build:swan   # 百度
npm run build:qq     # QQ
```

## 配置说明

### API 配置
在 `src/constants/config.ts` 中配置后端 API 地址：

```typescript
export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000'  // 开发环境
  : 'https://your-api-domain.com'  // 生产环境
```

### 小程序配置
在 `src/app.config.ts` 中配置小程序基本信息和页面路由。

## 部署说明

1. **开发环境**: 
   - 启动后端服务 (默认端口 8000)
   - 运行小程序开发服务
   - 在微信开发者工具中预览

2. **生产环境**:
   - 构建小程序代码
   - 配置生产环境 API 地址
   - 上传到微信公众平台审核发布

## 注意事项

### 网络请求
- 小程序只能请求 HTTPS 接口
- 需要在微信公众平台配置服务器域名白名单
- 开发阶段可在开发者工具中勾选"不校验合法域名"

### 文件上传
- 小程序文件上传大小限制为 10MB
- 支持的文件类型需要在后端进行验证
- 使用 `Taro.uploadFile` API 上传文件

### 数据存储
- 使用 `Taro.setStorageSync/getStorageSync` 进行本地数据缓存
- 单个 key 存储上限为 1MB
- 总存储上限为 10MB

## 扩展计划

- [ ] 添加简历模板选择功能
- [ ] 实现简历在线编辑器
- [ ] 添加简历分享功能
- [ ] 支持多种文件格式导出
- [ ] 集成更多 AI 优化建议
- [ ] 添加用户登录和数据同步

## 技术支持

如有问题请联系开发团队或查看相关文档：
- [Taro 官方文档](https://docs.taro.zone/)
- [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- 项目后端 API 文档
