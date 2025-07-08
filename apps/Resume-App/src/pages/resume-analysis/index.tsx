import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import { resumeService } from '../../services/resumeService';
import './index.scss';

interface AnalysisResult {
  id: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  skills: string[];
  experience_years: number;
  keywords: string[];
}

const ResumeAnalysis: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const resumeId = router.params.resumeId;

  useEffect(() => {
    if (resumeId) {
      loadAnalysis();
    }
  }, [resumeId]);

  const loadAnalysis = async () => {
    if (!resumeId) return;
    
    setLoading(true);
    try {
      const result = await resumeService.getResumeAnalysis(resumeId);
      setAnalysis(result);
    } catch (error) {
      console.error('加载简历分析失败:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToGenerate = () => {
    Taro.navigateTo({
      url: `/pages/generate-resume/index?resumeId=${resumeId}`
    });
  };

  const navigateToEdit = () => {
    Taro.navigateTo({
      url: `/pages/edit-resume/index?resumeId=${resumeId}`
    });
  };

  if (loading) {
    return (
      <View className="analysis loading">
        <Text>分析中...</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View className="analysis error">
        <Text>暂无分析数据</Text>
        <Button onClick={loadAnalysis}>重新加载</Button>
      </View>
    );
  }

  return (
    <ScrollView className="analysis" scrollY>
      <View className="header">
        <Text className="title">简历分析报告</Text>
        <View className="score-card">
          <View className="score-circle">
            <Text className="score-number">{analysis.score}</Text>
            <Text className="score-label">分</Text>
          </View>
        </View>
      </View>

      <View className="content">
        <View className="section">
          <Text className="section-title">💪 优势亮点</Text>
          <View className="item-list">
            {analysis.strengths.map((strength, index) => (
              <View key={index} className="item positive">
                <Text>• {strength}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="section">
          <Text className="section-title">⚠️ 需要改进</Text>
          <View className="item-list">
            {analysis.weaknesses.map((weakness, index) => (
              <View key={index} className="item warning">
                <Text>• {weakness}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="section">
          <Text className="section-title">💡 优化建议</Text>
          <View className="item-list">
            {analysis.suggestions.map((suggestion, index) => (
              <View key={index} className="item suggestion">
                <Text>• {suggestion}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="section">
          <Text className="section-title">🔧 技能标签</Text>
          <View className="tags">
            {analysis.skills.map((skill, index) => (
              <View key={index} className="tag">
                <Text>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="section">
          <Text className="section-title">📊 基本信息</Text>
          <View className="info-grid">
            <View className="info-item">
              <Text className="info-label">工作经验</Text>
              <Text className="info-value">{analysis.experience_years} 年</Text>
            </View>
            <View className="info-item">
              <Text className="info-label">关键词数量</Text>
              <Text className="info-value">{analysis.keywords.length} 个</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="actions">
        <Button className="btn secondary" onClick={navigateToEdit}>
          编辑简历
        </Button>
        <Button className="btn primary" onClick={navigateToGenerate}>
          AI优化
        </Button>
      </View>
    </ScrollView>
  );
};

export default ResumeAnalysis;
