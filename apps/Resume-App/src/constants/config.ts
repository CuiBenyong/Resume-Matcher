// 环境配置
const ENV_CONFIG = {
  development: {
    baseURL: 'http://localhost:8000',
    debug: true
  },
  production: {
    baseURL: 'https://your-api-domain.com',
    debug: false
  }
}

// 方案1: 手动设置环境（推荐用于小程序）
const CURRENT_ENV = 'development' // 手动切换：'development' | 'production'

// 方案2: 基于小程序账号类型判断（适用于微信小程序）
// const CURRENT_ENV = __wxConfig.envVersion === 'develop' ? 'development' : 'production'

// 方案3: 基于域名判断（适用于H5应用）
// const CURRENT_ENV = location.hostname.includes('localhost') ? 'development' : 'production'

// API 配置
export const API_CONFIG = {
  baseURL: ENV_CONFIG[CURRENT_ENV].baseURL,
  debug: ENV_CONFIG[CURRENT_ENV].debug
}

export const API_BASE_URL = API_CONFIG.baseURL

// 文件上传配置
export const UPLOAD_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['pdf', 'doc', 'docx', 'txt'],
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
}

// 应用配置
export const APP_CONFIG = {
  name: 'Resume Matcher',
  version: '1.0.0',
  author: 'Resume Matcher Team'
}

// 存储键名
export const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  RECENT_RESUMES: 'recentResumes',
  RECENT_JOBS: 'recentJobs',
  APP_SETTINGS: 'appSettings'
}

// 页面路径
export const PAGES = {
  INDEX: '/pages/index/index',
  UPLOAD_RESUME: '/pages/upload-resume/index',
  UPLOAD_JOB: '/pages/upload-job/index',
  GENERATE_RESUME: '/pages/generate-resume/index',
  PREVIEW_RESUME: '/pages/preview-resume/index',
  HISTORY: '/pages/history/index',
  RESUME_ANALYSIS: '/pages/resume-analysis/index',
  JOB_ANALYSIS: '/pages/job-analysis/index'
}

// 主题颜色
export const COLORS = {
  primary: '#1976d2',
  secondary: '#ff6b6b',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  text: {
    primary: '#333333',
    secondary: '#666666',
    disabled: '#999999'
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff'
  }
}

// 新增环境检测工具
export const ENV_UTILS = {
  isDevelopment: () => CURRENT_ENV === 'development',
  isProduction: () => CURRENT_ENV === 'production',
  getCurrentEnv: () => CURRENT_ENV
}
