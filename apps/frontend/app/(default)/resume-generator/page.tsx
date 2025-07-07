'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ResumeGeneratorAPI, 
  type ResumeGenerationRequest,
  type PersonalInfo,
  type Education,
  type WorkExperience,
  type Project,
  type Skill,
  type Certificate
} from '@/lib/api/resume-generator';
import { PlusCircle, Trash2, User, GraduationCap, Briefcase, FolderOpen, Award, FileText } from 'lucide-react';

export default function ResumeGeneratorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 表单数据状态
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '138-0000-0000',
    location: '北京市朝阳区',
    linkedin: 'https://linkedin.com/in/zhangsan',
    github: 'https://github.com/zhangsan',
    website: 'https://zhangsan.dev'
  });

  const [education, setEducation] = useState<Education[]>([{
    school: '清华大学',
    degree: '本科',
    major: '计算机科学与技术',
    start_date: '2017-09',
    end_date: '2021-06',
    gpa: '3.8',
    achievements: '获得优秀毕业生奖，参与多项科研项目，发表论文2篇。在校期间担任计算机协会主席，组织了多次技术分享会。参与ACM程序设计竞赛，获得省级二等奖。完成了关于机器学习算法优化的毕业论文，获得导师高度评价。'
  }, {
    school: '北京市第一中学',
    degree: '高中',
    major: '理科',
    start_date: '2014-09',
    end_date: '2017-06',
    gpa: '优秀',
    achievements: '高考成绩全校第一，数学和物理满分。担任班长和学生会副主席，具备优秀的组织协调能力。'
  }]);
  
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([{
    company: 'ABC科技有限公司',
    position: '高级前端工程师',
    start_date: '2021-07',
    end_date: '至今',
    description: '负责公司主要产品的前端开发和技术架构设计，带领5人团队完成多个重要项目。主导了公司前端技术栈的升级改造，从传统jQuery架构迁移到现代React生态系统。',
    achievements: '• 优化系统性能，页面加载速度提升40%，用户体验显著改善\n• 主导重构项目，减少代码量30%，提高了代码的可维护性和可扩展性\n• 建立前端开发规范和代码审查流程，提高团队开发效率25%\n• 设计并实现了组件库系统，被公司多个产品线复用\n• 负责新员工培训和技术分享，帮助团队成员快速成长'
  }, {
    company: 'XYZ互联网公司',
    position: '前端开发工程师',
    start_date: '2020-03',
    end_date: '2021-06',
    description: '参与公司核心产品的前端开发，负责用户界面设计和交互实现。深度参与产品需求分析和技术方案制定，与产品经理和设计师密切合作。',
    achievements: '• 完成用户中心模块重构，提升用户体验和系统稳定性\n• 参与移动端H5页面开发，确保多端一致性和响应式设计\n• 协助团队建立代码审查流程和持续集成部署\n• 开发了多个可复用的Vue组件，提高了开发效率'
  }, {
    company: 'DEF创业公司',
    position: '全栈开发实习生',
    start_date: '2019-06',
    end_date: '2020-02',
    description: '在创业团队中承担全栈开发工作，参与产品从0到1的完整开发过程。学习并掌握了前后端开发的完整技能栈。',
    achievements: '• 独立完成了公司官网和管理后台的开发\n• 参与后端API设计和数据库设计\n• 学习并应用了敏捷开发方法论\n• 快速适应创业公司的快节奏工作环境'
  }]);
  
  const [projects, setProjects] = useState<Project[]>([{
    name: '企业级数据可视化平台',
    description: '基于React和D3.js开发的企业级数据可视化平台，支持多种图表类型和实时数据更新。该平台可以处理大规模数据集，提供交互式的数据探索功能，支持自定义仪表板配置。',
    technologies: 'React, TypeScript, D3.js, Ant Design, Node.js, MongoDB, Redis, WebSocket',
    start_date: '2022-03',
    end_date: '2022-12',
    role: '前端技术负责人',
    achievements: '• 设计并实现了灵活的图表配置系统，支持拖拽式操作\n• 实现了实时数据同步功能，支持百万级数据处理\n• 项目获得公司年度最佳技术创新奖\n• 系统上线后，客户数据分析效率提升60%\n• 建立了完善的单元测试和端到端测试体系',
    github_url: 'https://github.com/zhangsan/data-visualization-platform'
  }, {
    name: '微服务架构电商平台',
    description: '采用微服务架构设计的大型电商平台，包含用户服务、商品服务、订单服务、支付服务等多个微服务模块。前端采用微前端架构，支持团队独立开发和部署。',
    technologies: 'Vue.js, Element Plus, Single-SPA, Spring Boot, MySQL, Redis, Docker, Kubernetes',
    start_date: '2021-09',
    end_date: '2022-02',
    role: '全栈开发工程师',
    achievements: '• 负责用户中心和商品管理模块的前后端开发\n• 实现了分布式事务处理和服务容错机制\n• 系统支持日均10万+订单处理\n• 建立了完善的监控和日志系统\n• 项目按时交付，获得客户高度认可',
    github_url: 'https://github.com/zhangsan/microservice-ecommerce'
  }, {
    name: 'AI智能客服系统',
    description: '基于自然语言处理技术的智能客服系统，集成了多种AI模型，支持文本对话、语音识别、情感分析等功能。系统可以自动回答常见问题，并在需要时转接人工客服。',
    technologies: 'React, Python, TensorFlow, Flask, PostgreSQL, Elasticsearch, Docker',
    start_date: '2021-01',
    end_date: '2021-08',
    role: '前端开发工程师',
    achievements: '• 开发了直观易用的对话界面和管理后台\n• 集成多种AI服务接口，提供统一的用户体验\n• 系统准确率达到85%，大幅减少人工客服工作量\n• 支持多语言和多渠道接入\n• 获得客户满意度评分4.8/5.0',
    github_url: 'https://github.com/zhangsan/ai-customer-service'
  }]);
  
  const [skills, setSkills] = useState<Skill[]>([{
    category: '前端技术',
    skills: 'JavaScript, TypeScript, React, Vue.js, HTML5, CSS3, Sass, Webpack, Vite',
    proficiency: '精通'
  }, {
    category: '后端技术',
    skills: 'Node.js, Express, Python, Django, MySQL, MongoDB, Redis',
    proficiency: '熟练'
  }, {
    category: '开发工具',
    skills: 'Git, Docker, Jenkins, VS Code, Figma, Postman',
    proficiency: '熟练'
  }]);
  
  const [certificates, setCertificates] = useState<Certificate[]>([{
    name: 'AWS Certified Developer',
    issuer: 'Amazon Web Services',
    date: '2022-08',
    expiry_date: '2025-08',
    credential_id: 'AWS-CDA-123456'
  }]);
  
  const [targetPosition, setTargetPosition] = useState('高级前端工程师');
  const [additionalInfo, setAdditionalInfo] = useState('热爱技术，关注前端新技术发展趋势。具备良好的团队协作能力和项目管理经验。希望在技术领域持续成长，为公司创造更大价值。');

  // 添加教育经历
  const addEducation = () => {
    setEducation([...education, {
      school: '北京大学',
      degree: '硕士',
      major: '软件工程',
      start_date: '2021-09',
      end_date: '2024-06',
      gpa: '3.9',
      achievements: '获得国家奖学金，担任学生会技术部部长'
    }]);
  };

  // 添加工作经历
  const addWorkExperience = () => {
    setWorkExperience([...workExperience, {
      company: 'XYZ互联网公司',
      position: '前端开发工程师',
      start_date: '2020-03',
      end_date: '2021-06',
      description: '参与公司核心产品的前端开发，负责用户界面设计和交互实现',
      achievements: '• 完成用户中心模块重构，提升用户体验\n• 参与移动端适配，确保多端一致性\n• 协助团队建立代码审查流程'
    }]);
  };

  // 添加项目经历
  const addProject = () => {
    setProjects([...projects, {
      name: '在线教育管理系统',
      description: '基于微服务架构的在线教育平台，包含课程管理、用户管理、支付系统等模块',
      technologies: 'Vue.js, Element UI, Spring Boot, MySQL, Redis, Docker',
      start_date: '2021-01',
      end_date: '2021-06',
      role: '全栈开发工程师',
      achievements: '• 实现了完整的用户权限管理系统\n• 集成第三方支付接口\n• 系统支持1000+并发用户',
      github_url: 'https://github.com/zhangsan/education-platform'
    }]);
  };

  // 添加技能
  const addSkill = () => {
    setSkills([...skills, {
      category: '云服务',
      skills: 'AWS, 阿里云, Docker, Kubernetes, Nginx',
      proficiency: '中级'
    }]);
  };

  // 添加证书
  const addCertificate = () => {
    setCertificates([...certificates, {
      name: 'PMP项目管理专业人士',
      issuer: 'PMI项目管理协会',
      date: '2023-03',
      expiry_date: '2026-03',
      credential_id: 'PMP-789012'
    }]);
  };

  // 删除函数
  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const removeWorkExperience = (index: number) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
  };

  const removeProject = (index: number) => {
    if (projects.length > 1) {
      setProjects(projects.filter((_, i) => i !== index));
    }
  };

  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      setSkills(skills.filter((_, i) => i !== index));
    }
  };

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  // 表单验证
  const validateForm = (): string | null => {
    if (!personalInfo.name.trim()) return '请填写姓名';
    if (!personalInfo.email.trim()) return '请填写邮箱';
    if (!personalInfo.phone.trim()) return '请填写电话';
    
    if (projects.length === 0 || !projects[0].name.trim()) {
      return '请至少添加一个项目经历';
    }
    
    if (skills.length === 0 || !skills[0].category.trim()) {
      return '请至少添加一个技能';
    }
    
    return null;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestData: ResumeGenerationRequest = {
        personal_info: personalInfo,
        education: education.filter(edu => edu.school.trim()),
        work_experience: workExperience.filter(work => work.company.trim()),
        projects: projects.filter(project => project.name.trim()),
        skills: skills.filter(skill => skill.category.trim()),
        certificates: certificates.filter(cert => cert.name.trim()),
        target_position: targetPosition.trim() || undefined,
        additional_info: additionalInfo.trim() || undefined
      };

      const response = await ResumeGeneratorAPI.generateResume(requestData);
      
      // 跳转到结果页面
      router.push(`/resume-generator/result?id=${response.resume_id}&content=${encodeURIComponent(response.markdown_content)}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成简历失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 重置为示例数据
  const fillSampleData = () => {
    setPersonalInfo({
      name: '李四',
      email: 'lisi@example.com',
      phone: '139-1234-5678',
      location: '上海市浦东新区',
      linkedin: 'https://linkedin.com/in/lisi',
      github: 'https://github.com/lisi',
      website: 'https://lisi.portfolio.com'
    });

    setEducation([{
      school: '复旦大学',
      degree: '本科',
      major: '软件工程',
      start_date: '2018-09',
      end_date: '2022-06',
      gpa: '3.7',
      achievements: '获得校级奖学金2次，参与ACM程序设计竞赛获得省级二等奖'
    }]);

    setWorkExperience([{
      company: '腾讯科技有限公司',
      position: '前端开发工程师',
      start_date: '2022-07',
      end_date: '至今',
      description: '负责微信小程序和Web端产品的前端开发，参与用户增长相关项目',
      achievements: '• 主导小程序重构项目，性能提升50%\n• 开发通用组件库，被团队广泛使用\n• 参与用户增长实验，DAU提升15%'
    }]);

    setProjects([{
      name: '智能客服系统前端',
      description: '基于Vue.js开发的智能客服系统前端，支持多媒体消息、机器人对话等功能',
      technologies: 'Vue.js, TypeScript, Element Plus, WebSocket, Echarts',
      start_date: '2023-01',
      end_date: '2023-08',
      role: '前端负责人',
      achievements: '• 实现了实时通讯功能，支持文字、图片、文件传输\n• 集成AI对话接口，提升客服效率30%\n• 系统日活用户达到5000+',
      github_url: 'https://github.com/lisi/smart-customer-service'
    }]);

    setSkills([{
      category: '前端框架',
      skills: 'Vue.js, React, Angular, Nuxt.js, Next.js',
      proficiency: '精通'
    }, {
      category: '编程语言',
      skills: 'JavaScript, TypeScript, Python, Java, Go',
      proficiency: '熟练'
    }, {
      category: '工程化工具',
      skills: 'Webpack, Vite, ESLint, Prettier, Jest, Cypress',
      proficiency: '熟练'
    }]);

    setCertificates([{
      name: '前端开发工程师认证',
      issuer: '阿里云',
      date: '2023-05',
      expiry_date: '2026-05',
      credential_id: 'ACA-FE-123456'
    }]);

    setTargetPosition('资深前端工程师');
    setAdditionalInfo('具有3年以上前端开发经验，熟悉主流前端技术栈。具备良好的代码规范意识和团队协作能力。关注用户体验和产品细节，能够独立完成复杂前端项目的设计和开发。');
  };

  // 清空所有数据
  const clearAllData = () => {
    setPersonalInfo({
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: ''
    });
    setEducation([]);
    setWorkExperience([]);
    setProjects([{
      name: '',
      description: '',
      technologies: '',
      start_date: '',
      end_date: '',
      role: '',
      achievements: '',
      github_url: ''
    }]);
    setSkills([{
      category: '',
      skills: '',
      proficiency: '中级'
    }]);
    setCertificates([]);
    setTargetPosition('');
    setAdditionalInfo('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI 简历生成器
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            输入您的信息，让AI为您生成专业的简历
          </p>
          
          {/* 示例数据控制按钮 */}
          <div className="flex justify-center gap-4 mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={fillSampleData}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              填充示例数据
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={clearAllData}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              清空所有数据
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 个人信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                个人信息
              </CardTitle>
              <CardDescription>
                请填写您的基本联系信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">姓名 *</Label>
                  <Input
                    id="name"
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                    placeholder="张三"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">邮箱 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                    placeholder="zhangsan@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">电话 *</Label>
                  <Input
                    id="phone"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                    placeholder="138-0000-0000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">所在地</Label>
                  <Input
                    id="location"
                    value={personalInfo.location}
                    onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                    placeholder="北京市"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={personalInfo.linkedin}
                    onChange={(e) => setPersonalInfo({...personalInfo, linkedin: e.target.value})}
                    placeholder="https://linkedin.com/in/zhangsan"
                  />
                </div>
                <div>
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={personalInfo.github}
                    onChange={(e) => setPersonalInfo({...personalInfo, github: e.target.value})}
                    placeholder="https://github.com/zhangsan"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="website">个人网站</Label>
                <Input
                  id="website"
                  value={personalInfo.website}
                  onChange={(e) => setPersonalInfo({...personalInfo, website: e.target.value})}
                  placeholder="https://zhangsan.com"
                />
              </div>
              <div>
                <Label htmlFor="target_position">目标职位</Label>
                <Input
                  id="target_position"
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(e.target.value)}
                  placeholder="前端开发工程师"
                />
              </div>
            </CardContent>
          </Card>

          {/* 教育经历 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                教育经历
              </CardTitle>
              <CardDescription>
                添加您的教育背景（可选）
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="border rounded-lg p-4 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeEducation(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>学校名称</Label>
                      <Input
                        value={edu.school}
                        onChange={(e) => {
                          const newEducation = [...education];
                          newEducation[index].school = e.target.value;
                          setEducation(newEducation);
                        }}
                        placeholder="清华大学"
                      />
                    </div>
                    <div>
                      <Label>学位</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => {
                          const newEducation = [...education];
                          newEducation[index].degree = e.target.value;
                          setEducation(newEducation);
                        }}
                        placeholder="本科"
                      />
                    </div>
                    <div>
                      <Label>专业</Label>
                      <Input
                        value={edu.major}
                        onChange={(e) => {
                          const newEducation = [...education];
                          newEducation[index].major = e.target.value;
                          setEducation(newEducation);
                        }}
                        placeholder="计算机科学与技术"
                      />
                    </div>
                    <div>
                      <Label>GPA</Label>
                      <Input
                        value={edu.gpa}
                        onChange={(e) => {
                          const newEducation = [...education];
                          newEducation[index].gpa = e.target.value;
                          setEducation(newEducation);
                        }}
                        placeholder="3.8/4.0"
                      />
                    </div>
                    <div>
                      <Label>开始时间</Label>
                      <Input
                        value={edu.start_date}
                        onChange={(e) => {
                          const newEducation = [...education];
                          newEducation[index].start_date = e.target.value;
                          setEducation(newEducation);
                        }}
                        placeholder="2020年9月"
                      />
                    </div>
                    <div>
                      <Label>结束时间</Label>
                      <Input
                        value={edu.end_date}
                        onChange={(e) => {
                          const newEducation = [...education];
                          newEducation[index].end_date = e.target.value;
                          setEducation(newEducation);
                        }}
                        placeholder="2024年6月"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>成就/荣誉</Label>
                    <Textarea
                      value={edu.achievements}
                      onChange={(e) => {
                        const newEducation = [...education];
                        newEducation[index].achievements = e.target.value;
                        setEducation(newEducation);
                      }}
                      placeholder="优秀毕业生、奖学金获得者等"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addEducation}
                className="w-full"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                添加教育经历
              </Button>
            </CardContent>
          </Card>

          {/* 工作经历 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                工作经历
              </CardTitle>
              <CardDescription>
                添加您的工作或实习经历（可选）
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workExperience.map((work, index) => (
                <div key={index} className="border rounded-lg p-4 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeWorkExperience(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>公司名称</Label>
                      <Input
                        value={work.company}
                        onChange={(e) => {
                          const newWork = [...workExperience];
                          newWork[index].company = e.target.value;
                          setWorkExperience(newWork);
                        }}
                        placeholder="阿里巴巴"
                      />
                    </div>
                    <div>
                      <Label>职位</Label>
                      <Input
                        value={work.position}
                        onChange={(e) => {
                          const newWork = [...workExperience];
                          newWork[index].position = e.target.value;
                          setWorkExperience(newWork);
                        }}
                        placeholder="前端开发工程师"
                      />
                    </div>
                    <div>
                      <Label>开始时间</Label>
                      <Input
                        value={work.start_date}
                        onChange={(e) => {
                          const newWork = [...workExperience];
                          newWork[index].start_date = e.target.value;
                          setWorkExperience(newWork);
                        }}
                        placeholder="2024年7月"
                      />
                    </div>
                    <div>
                      <Label>结束时间</Label>
                      <Input
                        value={work.end_date}
                        onChange={(e) => {
                          const newWork = [...workExperience];
                          newWork[index].end_date = e.target.value;
                          setWorkExperience(newWork);
                        }}
                        placeholder="至今"
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label>工作描述</Label>
                      <Textarea
                        value={work.description}
                        onChange={(e) => {
                          const newWork = [...workExperience];
                          newWork[index].description = e.target.value;
                          setWorkExperience(newWork);
                        }}
                        placeholder="负责前端页面开发和维护..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>主要成就</Label>
                      <Textarea
                        value={work.achievements}
                        onChange={(e) => {
                          const newWork = [...workExperience];
                          newWork[index].achievements = e.target.value;
                          setWorkExperience(newWork);
                        }}
                        placeholder="提升页面性能30%、优化用户体验等"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addWorkExperience}
                className="w-full"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                添加工作经历
              </Button>
            </CardContent>
          </Card>

          {/* 项目经历 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                项目经历 *
              </CardTitle>
              <CardDescription>
                添加您的项目经历，至少需要一个项目
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.map((project, index) => (
                <div key={index} className="border rounded-lg p-4 relative">
                  {projects.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeProject(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>项目名称</Label>
                      <Input
                        value={project.name}
                        onChange={(e) => {
                          const newProjects = [...projects];
                          newProjects[index].name = e.target.value;
                          setProjects(newProjects);
                        }}
                        placeholder="电商网站"
                        required
                      />
                    </div>
                    <div>
                      <Label>担任角色</Label>
                      <Input
                        value={project.role}
                        onChange={(e) => {
                          const newProjects = [...projects];
                          newProjects[index].role = e.target.value;
                          setProjects(newProjects);
                        }}
                        placeholder="前端负责人"
                      />
                    </div>
                    <div>
                      <Label>开始时间</Label>
                      <Input
                        value={project.start_date}
                        onChange={(e) => {
                          const newProjects = [...projects];
                          newProjects[index].start_date = e.target.value;
                          setProjects(newProjects);
                        }}
                        placeholder="2024年1月"
                      />
                    </div>
                    <div>
                      <Label>结束时间</Label>
                      <Input
                        value={project.end_date}
                        onChange={(e) => {
                          const newProjects = [...projects];
                          newProjects[index].end_date = e.target.value;
                          setProjects(newProjects);
                        }}
                        placeholder="2024年6月"
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label>项目描述</Label>
                      <Textarea
                        value={project.description}
                        onChange={(e) => {
                          const newProjects = [...projects];
                          newProjects[index].description = e.target.value;
                          setProjects(newProjects);
                        }}
                        placeholder="一个基于React的电商网站..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>使用技术</Label>
                      <Input
                        value={project.technologies}
                        onChange={(e) => {
                          const newProjects = [...projects];
                          newProjects[index].technologies = e.target.value;
                          setProjects(newProjects);
                        }}
                        placeholder="React, TypeScript, Node.js, MongoDB"
                      />
                    </div>
                    <div>
                      <Label>项目成果</Label>
                      <Textarea
                        value={project.achievements}
                        onChange={(e) => {
                          const newProjects = [...projects];
                          newProjects[index].achievements = e.target.value;
                          setProjects(newProjects);
                        }}
                        placeholder="成功上线，日活用户1000+"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>项目链接</Label>
                      <Input
                        value={project.github_url}
                        onChange={(e) => {
                          const newProjects = [...projects];
                          newProjects[index].github_url = e.target.value;
                          setProjects(newProjects);
                        }}
                        placeholder="https://github.com/zhangsan/ecommerce"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addProject}
                className="w-full"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                添加项目经历
              </Button>
            </CardContent>
          </Card>

          {/* 技能 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                技能 *
              </CardTitle>
              <CardDescription>
                添加您的技能和掌握程度，至少需要一个技能
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {skills.map((skill, index) => (
                <div key={index} className="border rounded-lg p-4 relative">
                  {skills.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeSkill(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>技能类别</Label>
                      <Input
                        value={skill.category}
                        onChange={(e) => {
                          const newSkills = [...skills];
                          newSkills[index].category = e.target.value;
                          setSkills(newSkills);
                        }}
                        placeholder="编程语言"
                        required
                      />
                    </div>
                    <div>
                      <Label>具体技能</Label>
                      <Input
                        value={skill.skills}
                        onChange={(e) => {
                          const newSkills = [...skills];
                          newSkills[index].skills = e.target.value;
                          setSkills(newSkills);
                        }}
                        placeholder="JavaScript, Python, Java"
                      />
                    </div>
                    <div>
                      <Label>掌握程度</Label>
                      <Select
                        value={skill.proficiency}
                        onChange={(e) => {
                          const newSkills = [...skills];
                          newSkills[index].proficiency = e.target.value;
                          setSkills(newSkills);
                        }}
                      >
                        <option value="初级">初级</option>
                        <option value="中级">中级</option>
                        <option value="高级">高级</option>
                        <option value="专家">专家</option>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addSkill}
                className="w-full"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                添加技能
              </Button>
            </CardContent>
          </Card>

          {/* 证书 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                证书
              </CardTitle>
              <CardDescription>
                添加您获得的证书（可选）
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {certificates.map((cert, index) => (
                <div key={index} className="border rounded-lg p-4 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeCertificate(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>证书名称</Label>
                      <Input
                        value={cert.name}
                        onChange={(e) => {
                          const newCerts = [...certificates];
                          newCerts[index].name = e.target.value;
                          setCertificates(newCerts);
                        }}
                        placeholder="AWS云从业者认证"
                      />
                    </div>
                    <div>
                      <Label>颁发机构</Label>
                      <Input
                        value={cert.issuer}
                        onChange={(e) => {
                          const newCerts = [...certificates];
                          newCerts[index].issuer = e.target.value;
                          setCertificates(newCerts);
                        }}
                        placeholder="亚马逊云服务"
                      />
                    </div>
                    <div>
                      <Label>获得时间</Label>
                      <Input
                        value={cert.date}
                        onChange={(e) => {
                          const newCerts = [...certificates];
                          newCerts[index].date = e.target.value;
                          setCertificates(newCerts);
                        }}
                        placeholder="2024年5月"
                      />
                    </div>
                    <div>
                      <Label>过期时间</Label>
                      <Input
                        value={cert.expiry_date}
                        onChange={(e) => {
                          const newCerts = [...certificates];
                          newCerts[index].expiry_date = e.target.value;
                          setCertificates(newCerts);
                        }}
                        placeholder="2027年5月"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>证书编号</Label>
                    <Input
                      value={cert.credential_id}
                      onChange={(e) => {
                        const newCerts = [...certificates];
                        newCerts[index].credential_id = e.target.value;
                        setCertificates(newCerts);
                      }}
                      placeholder="CCP-12345678"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addCertificate}
                className="w-full"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                添加证书
              </Button>
            </CardContent>
          </Card>

          {/* 其他信息 */}
          <Card>
            <CardHeader>
              <CardTitle>其他信息</CardTitle>
              <CardDescription>
                补充任何其他相关信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="兴趣爱好、志愿经历、语言能力等..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* 错误信息 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex justify-center pb-8">
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full md:w-auto px-8"
            >
              {isLoading ? '正在生成简历...' : '生成简历'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
