import { apiService } from './apiService'

export interface JobDescription {
  id: string
  title: string
  company: string
  description: string
  requirements: string[]
  skills: string[]
  location?: string
  salary?: string
  type?: string // full-time, part-time, contract, etc.
  createdAt: string
}

export interface JobAnalysis {
  id: string
  jobDescriptionId: string
  keySkills: string[]
  requiredExperience: string[]
  educationRequirements: string[]
  matchingKeywords: string[]
  suggestions: string[]
  difficulty: 'entry' | 'mid' | 'senior' | 'expert'
}

class JobService {
  // 分析职位描述
  async analyzeJobDescription(description: string, title?: string, company?: string): Promise<JobAnalysis> {
    return apiService.post('/api/v1/jobs/analyze', {
      description,
      title,
      company
    })
  }

  // 保存职位描述
  async saveJobDescription(jobData: Omit<JobDescription, 'id' | 'createdAt'>): Promise<JobDescription> {
    return apiService.post('/api/v1/jobs', jobData)
  }

  // 获取职位详情
  async getJobById(id: string): Promise<JobDescription> {
    return apiService.get(`/api/v1/jobs/${id}`)
  }

  // 获取用户保存的职位列表
  async getUserJobs(): Promise<JobDescription[]> {
    return apiService.get('/api/v1/jobs')
  }

  // 删除职位
  async deleteJob(id: string): Promise<void> {
    return apiService.delete(`/api/v1/jobs/${id}`)
  }

  // 更新职位
  async updateJob(id: string, data: Partial<JobDescription>): Promise<JobDescription> {
    return apiService.put(`/api/v1/jobs/${id}`, data)
  }

  // 获取职位分析结果
  async getJobAnalysis(id: string): Promise<any> {
    return apiService.get(`/api/v1/jobs/${id}/analysis`)
  }

  // 比较简历与职位的匹配度
  async compareResumeWithJob(resumeId: string, jobId: string): Promise<{
    matchScore: number
    matchedSkills: string[]
    missingSkills: string[]
    suggestions: string[]
    strengths: string[]
    improvements: string[]
  }> {
    return apiService.post('/api/v1/jobs/compare', {
      resumeId,
      jobId
    })
  }
}

export const jobService = new JobService()
