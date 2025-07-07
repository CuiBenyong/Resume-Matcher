import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, Input, Textarea } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import { resumeService } from '../../services/resumeService';
import './index.scss';

interface ResumeData {
  id?: string;
  personal_info: {
    name: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
  };
  education: Array<{
    id?: string;
    school: string;
    degree: string;
    major: string;
    start_date: string;
    end_date: string;
    gpa?: string;
  }>;
  experience: Array<{
    id?: string;
    company: string;
    position: string;
    start_date: string;
    end_date: string;
    description: string;
  }>;
  skills: string[];
  projects?: Array<{
    id?: string;
    name: string;
    description: string;
    technologies: string[];
    start_date: string;
    end_date: string;
  }>;
}

const EditResume: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personal_info: {
      name: '',
      email: '',
      phone: '',
      address: '',
      summary: ''
    },
    education: [],
    experience: [],
    skills: [],
    projects: []
  });
  
  const resumeId = router.params.resumeId;

  useEffect(() => {
    if (resumeId) {
      loadResumeData();
    }
  }, [resumeId]);

  const loadResumeData = async () => {
    if (!resumeId) return;
    
    setLoading(true);
    try {
      const data = await resumeService.getResumeDetail(resumeId);
      setResumeData(data);
    } catch (error) {
      console.error('加载简历数据失败:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePersonalInfo = (field: keyof ResumeData['personal_info'], value: string) => {
    setResumeData(prev => ({
      ...prev,
      personal_info: {
        ...prev.personal_info,
        [field]: value
      }
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          school: '',
          degree: '',
          major: '',
          start_date: '',
          end_date: '',
          gpa: ''
        }
      ]
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: '',
          position: '',
          start_date: '',
          end_date: '',
          description: ''
        }
      ]
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    Taro.showModal({
      title: '添加技能',
      editable: true,
      placeholderText: '请输入技能名称',
      success: (res) => {
        if (res.confirm && res.content) {
          setResumeData(prev => ({
            ...prev,
            skills: [...prev.skills, res.content.trim()]
          }));
        }
      }
    });
  };

  const removeSkill = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const saveResume = async () => {
    setSaving(true);
    try {
      if (resumeId) {
        await resumeService.updateResume(resumeId, resumeData);
      } else {
        await resumeService.createResume(resumeData);
      }
      
      Taro.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('保存简历失败:', error);
      Taro.showToast({
        title: '保存失败',
        icon: 'none'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="edit-resume loading">
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="edit-resume" scrollY>
      <View className="content">
        {/* 个人信息 */}
        <View className="section">
          <Text className="section-title">👤 个人信息</Text>
          <View className="form-group">
            <Text className="label">姓名</Text>
            <Input
              className="input"
              value={resumeData.personal_info.name}
              placeholder="请输入姓名"
              onInput={(e) => updatePersonalInfo('name', e.detail.value)}
            />
          </View>
          <View className="form-group">
            <Text className="label">邮箱</Text>
            <Input
              className="input"
              value={resumeData.personal_info.email}
              placeholder="请输入邮箱"
              onInput={(e) => updatePersonalInfo('email', e.detail.value)}
            />
          </View>
          <View className="form-group">
            <Text className="label">电话</Text>
            <Input
              className="input"
              value={resumeData.personal_info.phone}
              placeholder="请输入电话"
              onInput={(e) => updatePersonalInfo('phone', e.detail.value)}
            />
          </View>
          <View className="form-group">
            <Text className="label">地址</Text>
            <Input
              className="input"
              value={resumeData.personal_info.address}
              placeholder="请输入地址"
              onInput={(e) => updatePersonalInfo('address', e.detail.value)}
            />
          </View>
          <View className="form-group">
            <Text className="label">个人简介</Text>
            <Textarea
              className="textarea"
              value={resumeData.personal_info.summary}
              placeholder="请输入个人简介"
              onInput={(e) => updatePersonalInfo('summary', e.detail.value)}
            />
          </View>
        </View>

        {/* 教育经历 */}
        <View className="section">
          <View className="section-header">
            <Text className="section-title">🎓 教育经历</Text>
            <Button className="add-btn" onClick={addEducation}>+</Button>
          </View>
          {resumeData.education.map((edu, index) => (
            <View key={index} className="item-card">
              <View className="item-header">
                <Text className="item-title">教育经历 {index + 1}</Text>
                <Button className="remove-btn" onClick={() => removeEducation(index)}>×</Button>
              </View>
              <View className="form-group">
                <Text className="label">学校</Text>
                <Input
                  className="input"
                  value={edu.school}
                  placeholder="请输入学校名称"
                  onInput={(e) => updateEducation(index, 'school', e.detail.value)}
                />
              </View>
              <View className="form-group">
                <Text className="label">学位</Text>
                <Input
                  className="input"
                  value={edu.degree}
                  placeholder="请输入学位"
                  onInput={(e) => updateEducation(index, 'degree', e.detail.value)}
                />
              </View>
              <View className="form-group">
                <Text className="label">专业</Text>
                <Input
                  className="input"
                  value={edu.major}
                  placeholder="请输入专业"
                  onInput={(e) => updateEducation(index, 'major', e.detail.value)}
                />
              </View>
              <View className="form-row">
                <View className="form-group half">
                  <Text className="label">开始时间</Text>
                  <Input
                    className="input"
                    value={edu.start_date}
                    placeholder="YYYY-MM"
                    onInput={(e) => updateEducation(index, 'start_date', e.detail.value)}
                  />
                </View>
                <View className="form-group half">
                  <Text className="label">结束时间</Text>
                  <Input
                    className="input"
                    value={edu.end_date}
                    placeholder="YYYY-MM"
                    onInput={(e) => updateEducation(index, 'end_date', e.detail.value)}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 工作经历 */}
        <View className="section">
          <View className="section-header">
            <Text className="section-title">💼 工作经历</Text>
            <Button className="add-btn" onClick={addExperience}>+</Button>
          </View>
          {resumeData.experience.map((exp, index) => (
            <View key={index} className="item-card">
              <View className="item-header">
                <Text className="item-title">工作经历 {index + 1}</Text>
                <Button className="remove-btn" onClick={() => removeExperience(index)}>×</Button>
              </View>
              <View className="form-group">
                <Text className="label">公司</Text>
                <Input
                  className="input"
                  value={exp.company}
                  placeholder="请输入公司名称"
                  onInput={(e) => updateExperience(index, 'company', e.detail.value)}
                />
              </View>
              <View className="form-group">
                <Text className="label">职位</Text>
                <Input
                  className="input"
                  value={exp.position}
                  placeholder="请输入职位"
                  onInput={(e) => updateExperience(index, 'position', e.detail.value)}
                />
              </View>
              <View className="form-row">
                <View className="form-group half">
                  <Text className="label">开始时间</Text>
                  <Input
                    className="input"
                    value={exp.start_date}
                    placeholder="YYYY-MM"
                    onInput={(e) => updateExperience(index, 'start_date', e.detail.value)}
                  />
                </View>
                <View className="form-group half">
                  <Text className="label">结束时间</Text>
                  <Input
                    className="input"
                    value={exp.end_date}
                    placeholder="YYYY-MM"
                    onInput={(e) => updateExperience(index, 'end_date', e.detail.value)}
                  />
                </View>
              </View>
              <View className="form-group">
                <Text className="label">工作描述</Text>
                <Textarea
                  className="textarea"
                  value={exp.description}
                  placeholder="请输入工作描述"
                  onInput={(e) => updateExperience(index, 'description', e.detail.value)}
                />
              </View>
            </View>
          ))}
        </View>

        {/* 技能 */}
        <View className="section">
          <View className="section-header">
            <Text className="section-title">🔧 技能</Text>
            <Button className="add-btn" onClick={addSkill}>+</Button>
          </View>
          <View className="skills-list">
            {resumeData.skills.map((skill, index) => (
              <View key={index} className="skill-item">
                <Text className="skill-text">{skill}</Text>
                <Button className="remove-skill-btn" onClick={() => removeSkill(index)}>×</Button>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className="actions">
        <Button 
          className="btn primary" 
          onClick={saveResume}
          loading={saving}
        >
          {saving ? '保存中...' : '保存简历'}
        </Button>
      </View>
    </ScrollView>
  );
};

export default EditResume;
