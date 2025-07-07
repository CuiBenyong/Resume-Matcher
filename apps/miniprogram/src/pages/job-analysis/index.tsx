import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import { jobService } from '../../services/jobService';
import './index.scss';

interface JobAnalysisResult {
  id: string;
  requirements: {
    required_skills: string[];
    preferred_skills: string[];
    experience_level: string;
    education: string;
    keywords: string[];
  };
  salary_range?: {
    min: number;
    max: number;
    currency: string;
  };
  company_info?: {
    name: string;
    industry: string;
    size: string;
  };
  job_highlights: string[];
  difficulty_level: number;
  match_suggestions: string[];
}

const JobAnalysis: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<JobAnalysisResult | null>(null);
  const jobId = router.params.jobId;

  useEffect(() => {
    if (jobId) {
      loadAnalysis();
    }
  }, [jobId]);

  const loadAnalysis = async () => {
    if (!jobId) return;
    
    setLoading(true);
    try {
      const result = await jobService.getJobAnalysis(jobId);
      setAnalysis(result);
    } catch (error) {
      console.error('加载职位分析失败:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToMatch = () => {
    Taro.navigateTo({
      url: `/pages/generate-resume/index?jobId=${jobId}`
    });
  };

  const getDifficultyText = (level: number) => {
    const levels = ['初级', '中级', '高级', '专家级', '资深'];
    return levels[Math.min(level - 1, levels.length - 1)] || '未知';
  };

  const getDifficultyColor = (level: number) => {
    const colors = ['#52c41a', '#faad14', '#fa8c16', '#f5222d', '#722ed1'];
    return colors[Math.min(level - 1, colors.length - 1)] || '#666';
  };

  if (loading) {
    return (
      <View className="job-analysis loading">
        <Text>分析中...</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View className="job-analysis error">
        <Text>暂无分析数据</Text>
        <Button onClick={loadAnalysis}>重新加载</Button>
      </View>
    );
  }

  return (
    <ScrollView className="job-analysis" scrollY>
      <View className="header">
        <Text className="title">职位分析报告</Text>
        {analysis.company_info && (
          <View className="company-info">
            <Text className="company-name">{analysis.company_info.name}</Text>
            <Text className="company-detail">
              {analysis.company_info.industry} · {analysis.company_info.size}
            </Text>
          </View>
        )}
      </View>

      <View className="content">
        <View className="section">
          <Text className="section-title">🎯 职位亮点</Text>
          <View className="highlights">
            {analysis.job_highlights.map((highlight, index) => (
              <View key={index} className="highlight-item">
                <Text>✨ {highlight}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="section">
          <Text className="section-title">📋 技能要求</Text>
          <View className="skills-section">
            <View className="skill-group">
              <Text className="skill-group-title">必需技能</Text>
              <View className="tags">
                {analysis.requirements.required_skills.map((skill, index) => (
                  <View key={index} className="tag required">
                    <Text>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            {analysis.requirements.preferred_skills.length > 0 && (
              <View className="skill-group">
                <Text className="skill-group-title">优先技能</Text>
                <View className="tags">
                  {analysis.requirements.preferred_skills.map((skill, index) => (
                    <View key={index} className="tag preferred">
                      <Text>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        <View className="section">
          <Text className="section-title">📊 基本要求</Text>
          <View className="requirements-grid">
            <View className="requirement-item">
              <Text className="req-label">经验要求</Text>
              <Text className="req-value">{analysis.requirements.experience_level}</Text>
            </View>
            <View className="requirement-item">
              <Text className="req-label">学历要求</Text>
              <Text className="req-value">{analysis.requirements.education}</Text>
            </View>
            <View className="requirement-item">
              <Text className="req-label">难度等级</Text>
              <Text 
                className="req-value difficulty"
                style={{ color: getDifficultyColor(analysis.difficulty_level) }}
              >
                {getDifficultyText(analysis.difficulty_level)}
              </Text>
            </View>
            {analysis.salary_range && (
              <View className="requirement-item">
                <Text className="req-label">薪资范围</Text>
                <Text className="req-value">
                  {analysis.salary_range.min}K-{analysis.salary_range.max}K
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="section">
          <Text className="section-title">💡 匹配建议</Text>
          <View className="suggestions">
            {analysis.match_suggestions.map((suggestion, index) => (
              <View key={index} className="suggestion-item">
                <Text>• {suggestion}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="section">
          <Text className="section-title">🔑 关键词</Text>
          <View className="keywords">
            {analysis.requirements.keywords.map((keyword, index) => (
              <View key={index} className="keyword-tag">
                <Text>{keyword}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className="actions">
        <Button className="btn primary" onClick={navigateToMatch}>
          匹配简历
        </Button>
      </View>
    </ScrollView>
  );
};

export default JobAnalysis;
