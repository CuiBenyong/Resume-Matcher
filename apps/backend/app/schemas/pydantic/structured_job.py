import enum

from typing import Optional, List
from pydantic import BaseModel, Field


class EmploymentTypeEnum(str, enum.Enum):
    """Case-insensitive Enum for employment types."""

    FULL_TIME = "全职"
    PART_TIME = "兼职"
    CONTRACT = "合同工"
    INTERNSHIP = "实习"
    TEMPORARY = "临时工"
    NOT_SPECIFIED = "未指定"

    @classmethod
    def _missing_(cls, value: object):
        """Handles case-insensitive lookup for both Chinese and English."""
        if isinstance(value, str):
            value_lower = value.lower()
            # 中英文映射
            mapping = {
                "全职": cls.FULL_TIME,
                "兼职": cls.PART_TIME,
                "合同工": cls.CONTRACT,
                "实习": cls.INTERNSHIP,
                "临时工": cls.TEMPORARY,
                "未指定": cls.NOT_SPECIFIED,
                # 英文兼容
                "full-time": cls.FULL_TIME,
                "part-time": cls.PART_TIME,
                "contract": cls.CONTRACT,
                "internship": cls.INTERNSHIP,
                "temporary": cls.TEMPORARY,
                "not specified": cls.NOT_SPECIFIED,
            }
            if value_lower in mapping:
                return mapping[value_lower]

        raise ValueError(
            "employment type must be one of: 全职, 兼职, 合同工, 实习, 临时工, 未指定 (case insensitive)"
        )


class RemoteStatusEnum(str, enum.Enum):
    """Case-insensitive Enum for remote work status."""

    FULLY_REMOTE = "完全远程"
    HYBRID = "混合办公"
    ON_SITE = "现场办公"
    REMOTE = "远程"
    NOT_SPECIFIED = "未指定"

    @classmethod
    def _missing_(cls, value: object):
        """Handles case-insensitive lookup for both Chinese and English."""
        if isinstance(value, str):
            value_lower = value.lower()
            # 中英文映射
            mapping = {
                "完全远程": cls.FULLY_REMOTE,
                "混合办公": cls.HYBRID,
                "现场办公": cls.ON_SITE,
                "远程": cls.REMOTE,
                "未指定": cls.NOT_SPECIFIED,
                # 英文兼容
                "fully remote": cls.FULLY_REMOTE,
                "hybrid": cls.HYBRID,
                "on-site": cls.ON_SITE,
                "remote": cls.REMOTE,
                "not specified": cls.NOT_SPECIFIED,
            }
            if value_lower in mapping:
                return mapping[value_lower]

        raise ValueError(
            "remote_status must be one of: 完全远程, 混合办公, 现场办公, 远程, 未指定 (case insensitive)"
        )


class CompanyProfile(BaseModel):
    company_name: str = Field(..., alias="companyName", description="公司名称")
    industry: Optional[str] = Field(None, description="行业")
    website: Optional[str] = Field(None, description="公司网站")
    description: Optional[str] = Field(None, description="公司描述")


class Location(BaseModel):
    city: Optional[str] = Field(None, description="城市")
    state: Optional[str] = Field(None, description="省份/州")
    country: Optional[str] = Field(None, description="国家")
    remote_status: RemoteStatusEnum = Field(..., alias="remoteStatus", description="远程工作状态")


class Qualifications(BaseModel):
    required: List[str] = Field(..., description="必需资格")
    preferred: Optional[List[str]] = Field(None, description="优选资格")


class CompensationAndBenefits(BaseModel):
    salary_range: Optional[str] = Field(None, alias="salaryRange", description="薪资范围")
    benefits: Optional[List[str]] = Field(None, description="福利待遇")


class ApplicationInfo(BaseModel):
    how_to_apply: Optional[str] = Field(None, alias="howToApply", description="申请方式")
    apply_link: Optional[str] = Field(None, alias="applyLink", description="申请链接")
    contact_email: Optional[str] = Field(None, alias="contactEmail", description="联系邮箱")


class StructuredJobModel(BaseModel):
    job_title: str = Field(..., alias="jobTitle", description="职位标题")
    company_profile: CompanyProfile = Field(..., alias="companyProfile", description="公司信息")
    location: Location = Field(..., description="工作地点")
    date_posted: str = Field(..., alias="datePosted", description="发布日期")
    employment_type: EmploymentTypeEnum = Field(..., alias="employmentType", description="雇佣类型")
    job_summary: str = Field(..., alias="jobSummary", description="职位概要")
    key_responsibilities: List[str] = Field(..., alias="keyResponsibilities", description="主要职责")
    qualifications: Qualifications = Field(..., description="任职资格")
    compensation_and_benefits: Optional[CompensationAndBenefits] = Field(
        None, alias="compensationAndBenefits", description="薪酬福利"
    )
    application_info: Optional[ApplicationInfo] = Field(None, alias="applicationInfo", description="申请信息")
    extracted_keywords: List[str] = Field(..., alias="extractedKeywords", description="提取的关键词")

    class ConfigDict:
        validate_by_name = True
        str_strip_whitespace = True
