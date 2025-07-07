# Resume Matcher 小程序开发指南

## 🚀 快速开始

### 环境要求
- Node.js >= 16
- npm 或 yarn
- 微信开发者工具 (开发微信小程序时)

### 安装依赖

```bash
# 进入小程序目录
cd apps/miniprogram

# 方式1: 使用安装脚本 (推荐)
chmod +x install.sh
./install.sh

# 方式2: 手动安装
npm install

# 全局安装 Taro CLI (如果未安装)
npm install -g @tarojs/cli
```

### 开发运行

```bash
# 启动微信小程序开发模式
npm run dev:weapp

# 启动 H5 开发模式
npm run dev:h5

# 启动支付宝小程序开发模式
npm run dev:alipay
```

### 构建打包

```bash
# 构建微信小程序
npm run build:weapp

# 构建 H5 版本
npm run build:h5
```

## 📁 项目结构

```
src/
├── app.tsx                 # 应用入口
├── app.config.ts          # 应用配置
├── app.scss               # 全局样式
├── pages/                 # 页面目录
│   ├── index/            # 首页
│   ├── upload-resume/    # 上传简历
│   ├── upload-job/       # 上传职位
│   ├── generate-resume/  # 生成简历
│   ├── preview-resume/   # 预览简历
│   ├── history/          # 历史记录
│   ├── resume-analysis/  # 简历分析
│   ├── job-analysis/     # 职位分析
│   └── edit-resume/      # 编辑简历
├── components/           # 组件目录
│   ├── FileUpload/      # 文件上传组件
│   └── Loading/         # 加载组件
├── services/            # API 服务
│   ├── apiService.ts    # 基础 API 服务
│   ├── resumeService.ts # 简历相关 API
│   └── jobService.ts    # 职位相关 API
└── constants/           # 常量配置
    └── config.ts        # 应用配置
```

## 🔌 后端接口依赖

小程序需要后端 FastAPI 服务提供以下接口：

### 简历相关接口
- `POST /api/v1/resumes/upload` - 上传简历文件
- `POST /api/v1/resumes/analyze-text` - 分析文本简历
- `GET /api/v1/resumes` - 获取简历列表
- `GET /api/v1/resumes/{id}` - 获取简历详情
- `GET /api/v1/resumes/{id}/analysis` - 获取简历分析
- `GET /api/v1/resumes/{id}/detail` - 获取简历详细信息
- `POST /api/v1/resumes` - 创建简历
- `PUT /api/v1/resumes/{id}` - 更新简历
- `DELETE /api/v1/resumes/{id}` - 删除简历

### 职位相关接口
- `POST /api/v1/jobs/analyze` - 分析职位描述
- `POST /api/v1/jobs` - 保存职位
- `GET /api/v1/jobs` - 获取职位列表
- `GET /api/v1/jobs/{id}` - 获取职位详情
- `GET /api/v1/jobs/{id}/analysis` - 获取职位分析

### 简历生成接口
- `POST /api/v1/resume-generator/generate` - 生成优化简历
- `GET /api/v1/resume-generator/{id}` - 获取生成的简历
- `GET /api/v1/resume-generator/history` - 获取生成历史

### 文件上传接口
- `POST /api/v1/upload` - 通用文件上传

## 🎨 页面功能说明

### 首页 (`pages/index`)
- 显示应用功能介绍
- 导航到各个功能页面
- 快速入口和统计信息

### 上传简历 (`pages/upload-resume`)
- 支持文件上传和文本输入
- 简历格式验证
- 上传进度显示
- 跳转到分析页面

### 上传职位 (`pages/upload-job`)
- 职位描述文本输入
- 职位信息表单
- 分析职位要求
- 跳转到职位分析

### 简历分析 (`pages/resume-analysis`)
- 显示简历评分
- 列出优势和改进点
- 技能标签展示
- 优化建议

### 职位分析 (`pages/job-analysis`)
- 职位要求解析
- 技能要求分类
- 难度等级评估
- 匹配建议

### 生成简历 (`pages/generate-resume`)
- AI 简历优化
- 针对性改进
- 实时生成进度
- 结果预览

### 编辑简历 (`pages/edit-resume`)
- 个人信息编辑
- 教育经历管理
- 工作经验编辑
- 技能列表管理

### 简历预览 (`pages/preview-resume`)
- 格式化简历展示
- 多种模板选择
- 导出功能
- 分享功能

### 历史记录 (`pages/history`)
- 简历管理
- 职位记录
- 生成历史
- 数据统计

## 🧩 组件说明

### FileUpload 组件
```typescript
import FileUpload from '../../components/FileUpload'

<FileUpload
  accept={['pdf', 'doc', 'docx']}
  maxSize={10}
  onSuccess={(response) => {
    // 处理上传成功
  }}
  onError={(error) => {
    // 处理上传失败
  }}
/>
```

### Loading 组件
```typescript
import Loading from '../../components/Loading'

<Loading
  text="处理中..."
  size="large"
  type="spinner"
  overlay={true}
/>
```

## ⚙️ 配置说明

### API 配置 (`constants/config.ts`)
```typescript
export const API_CONFIG = {
  baseURL: 'http://localhost:8000' // 开发环境
}
```

### 上传配置
```typescript
export const UPLOAD_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['pdf', 'doc', 'docx', 'txt']
}
```

## 🔧 开发技巧

### 调试技巧
1. 使用微信开发者工具的调试功能
2. 在 H5 模式下使用浏览器开发者工具
3. 查看网络请求和响应

### 样式开发
- 使用 SCSS 语法
- 采用 rpx 单位适配不同屏幕
- 遵循组件化样式结构

### API 调用
```typescript
import { resumeService } from '../../services/resumeService'

// 调用 API
try {
  const result = await resumeService.analyzeText(text)
  // 处理结果
} catch (error) {
  // 错误处理
}
```

## 🚀 部署指南

### 微信小程序
1. 构建项目: `npm run build:weapp`
2. 使用微信开发者工具打开 `dist` 目录
3. 上传代码到微信后台
4. 提交审核

### H5 版本
1. 构建项目: `npm run build:h5`
2. 将 `dist` 目录部署到 Web 服务器
3. 配置域名和 HTTPS

## 🔍 常见问题

### 依赖安装失败
- 检查 Node.js 版本
- 清除缓存: `npm cache clean --force`
- 使用淘宝镜像: `npm config set registry https://registry.npmmirror.com`

### 编译错误
- 检查 TypeScript 类型错误
- 确保所有依赖已正确安装
- 重启开发服务器

### API 调用失败
- 检查后端服务是否启动
- 验证 API 地址配置
- 查看网络请求状态

### 微信小程序预览问题
- 检查域名配置
- 确保已设置合法域名
- 验证文件上传配置

## 📞 技术支持

如遇到问题，请：
1. 查看控制台错误信息
2. 检查网络连接
3. 验证后端服务状态
4. 查看项目 README.md

---

**注意**: 本项目需要配合后端 FastAPI 服务使用，请确保后端服务正常运行在 `http://localhost:8000`。
