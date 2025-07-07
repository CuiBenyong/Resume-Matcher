/**
 * 简历生成 API 客户端
 */

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface Education {
  school: string;
  degree: string;
  major: string;
  start_date: string;
  end_date: string;
  gpa?: string;
  achievements?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
  achievements?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string;
  start_date: string;
  end_date: string;
  role: string;
  achievements?: string;
  github_url?: string;
}

export interface Skill {
  category: string;
  skills: string;
  proficiency: string;
}

export interface Certificate {
  name: string;
  issuer: string;
  date: string;
  expiry_date?: string;
  credential_id?: string;
}

export interface ResumeGenerationRequest {
  personal_info: PersonalInfo;
  education: Education[];
  work_experience: WorkExperience[];
  projects: Project[];
  skills: Skill[];
  certificates: Certificate[];
  target_position?: string;
  additional_info?: string;
}

export interface ResumeGenerationResponse {
  resume_id: string;
  markdown_content: string;
  pdf_url?: string;
  status: string;
  message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ResumeGeneratorAPI {
  private static baseUrl = `${API_BASE_URL}/api/v1/resume-generator`;

  static async generateResume(data: ResumeGenerationRequest): Promise<ResumeGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async previewResume(resumeId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/preview/${resumeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}
