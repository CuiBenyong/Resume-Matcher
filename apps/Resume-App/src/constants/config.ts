// API 配置
export const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000' 
    : 'https://your-api-domain.com'
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
