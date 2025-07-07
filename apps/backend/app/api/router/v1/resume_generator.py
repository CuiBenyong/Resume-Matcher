"""
简历生成 API 路由
"""
import logging
from typing import Dict, Any, Optional
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Depends, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.core import get_db_session
from app.agent.manager import AgentManager
from app.services import ResumeService

logger = logging.getLogger(__name__)
resume_generator_router = APIRouter()


class PersonalInfo(BaseModel):
    """个人信息"""
    name: str = Field(..., description="姓名", min_length=1, max_length=100)
    email: str = Field(..., description="邮箱", max_length=100)
    phone: str = Field(..., description="电话", max_length=50)
    location: Optional[str] = Field(None, description="所在地", max_length=100)
    linkedin: Optional[str] = Field(None, description="LinkedIn链接", max_length=200)
    github: Optional[str] = Field(None, description="GitHub链接", max_length=200)
    website: Optional[str] = Field(None, description="个人网站", max_length=200)


class Education(BaseModel):
    """教育经历"""
    school: str = Field(..., description="学校名称", max_length=100)
    degree: str = Field(..., description="学位", max_length=100)
    major: str = Field(..., description="专业", max_length=100)
    start_date: str = Field(..., description="开始时间", max_length=20)
    end_date: str = Field(..., description="结束时间", max_length=20)
    gpa: Optional[str] = Field(None, description="GPA", max_length=10)
    achievements: Optional[str] = Field(None, description="成就/荣誉", max_length=500)


class WorkExperience(BaseModel):
    """工作经历"""
    company: str = Field(..., description="公司名称", max_length=100)
    position: str = Field(..., description="职位", max_length=100)
    start_date: str = Field(..., description="开始时间", max_length=20)
    end_date: str = Field(..., description="结束时间", max_length=20)
    description: str = Field(..., description="工作描述", max_length=1000)
    achievements: Optional[str] = Field(None, description="工作成就", max_length=500)


class Project(BaseModel):
    """项目经历"""
    name: str = Field(..., description="项目名称", max_length=100)
    description: str = Field(..., description="项目描述", max_length=500)
    technologies: str = Field(..., description="使用技术", max_length=200)
    start_date: str = Field(..., description="开始时间", max_length=20)
    end_date: str = Field(..., description="结束时间", max_length=20)
    role: str = Field(..., description="担任角色", max_length=100)
    achievements: Optional[str] = Field(None, description="项目成果", max_length=500)
    github_url: Optional[str] = Field(None, description="项目链接", max_length=200)


class Skill(BaseModel):
    """技能"""
    category: str = Field(..., description="技能类别", max_length=50)
    skills: str = Field(..., description="具体技能", max_length=200)
    proficiency: str = Field(..., description="掌握程度", max_length=20)  # 初级/中级/高级/专家


class Certificate(BaseModel):
    """证书"""
    name: str = Field(..., description="证书名称", max_length=100)
    issuer: str = Field(..., description="颁发机构", max_length=100)
    date: str = Field(..., description="获得时间", max_length=20)
    expiry_date: Optional[str] = Field(None, description="过期时间", max_length=20)
    credential_id: Optional[str] = Field(None, description="证书编号", max_length=100)


class ResumeGenerationRequest(BaseModel):
    """简历生成请求"""
    personal_info: PersonalInfo
    education: list[Education] = Field(default_factory=list, description="教育经历")
    work_experience: list[WorkExperience] = Field(default_factory=list, description="工作经历")
    projects: list[Project] = Field(..., description="项目经历", min_length=1)
    skills: list[Skill] = Field(..., description="技能", min_length=1)
    certificates: list[Certificate] = Field(default_factory=list, description="证书")
    target_position: Optional[str] = Field(None, description="目标职位", max_length=100)
    additional_info: Optional[str] = Field(None, description="其他信息", max_length=500)


class ResumeGenerationResponse(BaseModel):
    """简历生成响应"""
    resume_id: str
    markdown_content: str
    pdf_url: Optional[str] = None
    status: str = "success"
    message: str = "简历生成成功"


@resume_generator_router.post(
    "/generate",
    response_model=ResumeGenerationResponse,
    summary="根据用户信息生成简历"
)
async def generate_resume(
    request: Request,
    resume_data: ResumeGenerationRequest,
    db: AsyncSession = Depends(get_db_session),
):
    """
    根据用户提供的信息，使用AI生成专业简历
    
    Args:
        resume_data: 用户简历信息
        
    Returns:
        生成的简历内容（Markdown格式）和相关信息
    """
    request_id = getattr(request.state, "request_id", str(uuid4()))
    
    try:
        logger.info(f"Request {request_id}: Starting resume generation")
        
        # 构建AI提示词
        prompt = _build_resume_prompt(resume_data)
        
        # 使用AI生成简历
        agent_manager = AgentManager(strategy="md")  # 使用markdown策略
        
        ai_response = await agent_manager.run(
            prompt=prompt,
            temperature=0.7,
            max_length=3000
        )
        
        # 保存简历到数据库
        resume_service = ResumeService(db)
        resume_id = str(uuid4())
        
        # 这里可以保存到数据库（可选）
        # await resume_service.save_generated_resume(resume_id, ai_response, resume_data)
        
        logger.info(f"Request {request_id}: Resume generated successfully")
        
        return ResumeGenerationResponse(
            resume_id=resume_id,
            markdown_content=ai_response,
            status="success",
            message="简历生成成功"
        )
        
    except Exception as e:
        logger.error(f"Request {request_id}: Resume generation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"简历生成失败: {str(e)}"
        )


def _build_resume_prompt(resume_data: ResumeGenerationRequest) -> str:
    """构建AI提示词"""
    
    prompt = f"""请根据以下用户信息生成一份专业的简历，要求：
1. 突出用户的技能和项目经历亮点
2. 让HR能够快速了解用户情况
3. 使用Markdown格式
4. 内容真实，可适当美化但不能过分偏离实际情况
5. 结构清晰，排版美观

用户信息：

## 个人信息
- 姓名：{resume_data.personal_info.name}
- 邮箱：{resume_data.personal_info.email}
- 电话：{resume_data.personal_info.phone}"""

    if resume_data.personal_info.location:
        prompt += f"\n- 所在地：{resume_data.personal_info.location}"
    if resume_data.personal_info.linkedin:
        prompt += f"\n- LinkedIn：{resume_data.personal_info.linkedin}"
    if resume_data.personal_info.github:
        prompt += f"\n- GitHub：{resume_data.personal_info.github}"
    if resume_data.personal_info.website:
        prompt += f"\n- 个人网站：{resume_data.personal_info.website}"

    if resume_data.target_position:
        prompt += f"\n\n## 目标职位\n{resume_data.target_position}"

    # 技能信息
    if resume_data.skills:
        prompt += "\n\n## 技能\n"
        for skill in resume_data.skills:
            prompt += f"- {skill.category}：{skill.skills}（{skill.proficiency}）\n"

    # 教育经历
    if resume_data.education:
        prompt += "\n\n## 教育经历\n"
        for edu in resume_data.education:
            prompt += f"""
### {edu.school} - {edu.degree}
- 专业：{edu.major}
- 时间：{edu.start_date} - {edu.end_date}"""
            if edu.gpa:
                prompt += f"\n- GPA：{edu.gpa}"
            if edu.achievements:
                prompt += f"\n- 成就：{edu.achievements}"
            prompt += "\n"

    # 工作经历
    if resume_data.work_experience:
        prompt += "\n\n## 工作经历\n"
        for work in resume_data.work_experience:
            prompt += f"""
### {work.company} - {work.position}
- 时间：{work.start_date} - {work.end_date}
- 工作描述：{work.description}"""
            if work.achievements:
                prompt += f"\n- 主要成就：{work.achievements}"
            prompt += "\n"

    # 项目经历
    if resume_data.projects:
        prompt += "\n\n## 项目经历\n"
        for project in resume_data.projects:
            prompt += f"""
### {project.name}
- 项目描述：{project.description}
- 使用技术：{project.technologies}
- 担任角色：{project.role}
- 项目时间：{project.start_date} - {project.end_date}"""
            if project.achievements:
                prompt += f"\n- 项目成果：{project.achievements}"
            if project.github_url:
                prompt += f"\n- 项目链接：{project.github_url}"
            prompt += "\n"

    # 证书
    if resume_data.certificates:
        prompt += "\n\n## 证书\n"
        for cert in resume_data.certificates:
            prompt += f"- {cert.name} - {cert.issuer}（{cert.date}）\n"

    if resume_data.additional_info:
        prompt += f"\n\n## 其他信息\n{resume_data.additional_info}"

    prompt += "\n\n请基于以上信息生成一份专业的简历，用Markdown格式输出。"
    
    return prompt


@resume_generator_router.get(
    "/preview/{resume_id}",
    summary="预览生成的简历"
)
async def preview_resume(
    resume_id: str,
    db: AsyncSession = Depends(get_db_session),
):
    """预览指定ID的简历"""
    # 这里可以从数据库获取保存的简历
    # 目前先返回示例响应
    return JSONResponse(
        content={
            "resume_id": resume_id,
            "status": "success",
            "message": "简历预览功能待实现"
        }
    )
