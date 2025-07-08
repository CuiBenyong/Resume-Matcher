import { apiService } from './apiService'

export interface ResumeAnalysis {
  id: string
  skills: string[]
  experience: Array<{
    company: string
    position: string
    duration: string
    description: string
  }>
  education: Array<{
    school: string
    degree: string
    major: string
    duration: string
  }>
  contact: {
    name?: string
    email?: string
    phone?: string
    location?: string
  }
  summary?: string
}

export interface ResumeGenerationRequest {
  originalResumeId?: string
  jobDescriptionId?: string
  targetPosition: string
  targetCompany?: string
  customRequirements?: string[]
}

export interface GeneratedResume {
  id: string
  content: string
  improvements: string[]
  matchScore: number
  suggestions: string[]
  createdAt: string
}

class ResumeService {
  // 分析文本简历
  async analyzeText(text: string): Promise<ResumeAnalysis> {
    return apiService.post('/api/v1/resumes/analyze-text', { text })
  }

  // 获取简历详情
  async getResumeById(id: string): Promise<ResumeAnalysis> {
    return apiService.get(`/api/v1/resumes/${id}`)
  }

  // 获取用户的简历列表
  async getUserResumes(): Promise<ResumeAnalysis[]> {
    return apiService.get('/api/v1/resumes')
  }

  // 生成优化后的简历
  async generateResume(request: ResumeGenerationRequest): Promise<GeneratedResume> {
    return apiService.post('/api/v1/resume-generator/generate', request)
  }

  // 获取生成的简历详情
  async getGeneratedResume(id: string): Promise<GeneratedResume> {
    return apiService.get(`/api/v1/resume-generator/${id}`)
  }

  // 获取生成历史
  async getGenerationHistory(): Promise<GeneratedResume[]> {
    return apiService.get('/api/v1/resume-generator/history')
  }

  // 删除简历
  async deleteResume(id: string): Promise<void> {
    return apiService.delete(`/api/v1/resumes/${id}`)
  }

  // 更新简历
  async updateResume(id: string, data: Partial<ResumeAnalysis>): Promise<ResumeAnalysis> {
    return apiService.put(`/api/v1/resumes/${id}`, data)
  }

  // 获取简历分析结果
  async getResumeAnalysis(id: string): Promise<any> {
    return apiService.get(`/api/v1/resumes/${id}/analysis`)
  }

  // 获取简历详细信息（用于编辑）
  async getResumeDetail(id: string): Promise<any> {
    return apiService.get(`/api/v1/resumes/${id}/detail`)
  }

  // 创建新简历
  async createResume(data: any): Promise<any> {
    return apiService.post('/api/v1/resumes', data)
  }

  // 上传简历文件
  async uploadResumeFile(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    return apiService.post('/api/v1/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export const resumeService = new ResumeService()
