import { Component } from 'react'
import { View, Text, Button, Textarea, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { jobService } from '../../services/jobService'
import './index.scss'

interface UploadJobProps {}

interface UploadJobState {
  jobTitle: string
  companyName: string
  jobDescription: string
  analyzing: boolean
  analysisResult: any
}

export default class UploadJob extends Component<UploadJobProps, UploadJobState> {
  constructor(props: UploadJobProps) {
    super(props)
    this.state = {
      jobTitle: '',
      companyName: '',
      jobDescription: '',
      analyzing: false,
      analysisResult: null
    }
  }

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '职位分析'
    })
  }

  onJobTitleChange = (e) => {
    this.setState({ jobTitle: e.detail.value })
  }

  onCompanyNameChange = (e) => {
    this.setState({ companyName: e.detail.value })
  }

  onJobDescriptionChange = (e) => {
    this.setState({ jobDescription: e.detail.value })
  }

  // 分析职位描述
  analyzeJob = async () => {
    const { jobTitle, companyName, jobDescription } = this.state
    
    if (!jobDescription.trim()) {
      Taro.showToast({
        title: '请输入职位描述',
        icon: 'none'
      })
      return
    }

    this.setState({ analyzing: true })

    try {
      const result = await jobService.analyzeJobDescription(
        jobDescription,
        jobTitle,
        companyName
      )
      this.setState({ analysisResult: result })
      Taro.showToast({
        title: '分析完成',
        icon: 'success'
      })
    } catch (error) {
      console.error('分析失败:', error)
      Taro.showToast({
        title: '分析失败',
        icon: 'none'
      })
    } finally {
      this.setState({ analyzing: false })
    }
  }

  // 保存职位
  saveJob = async () => {
    const { jobTitle, companyName, jobDescription, analysisResult } = this.state

    if (!jobDescription.trim()) {
      Taro.showToast({
        title: '请输入职位描述',
        icon: 'none'
      })
      return
    }

    try {
      await jobService.saveJobDescription({
        title: jobTitle,
        company: companyName,
        description: jobDescription,
        requirements: analysisResult?.requiredExperience || [],
        skills: analysisResult?.keySkills || []
      })
      
      Taro.showToast({
        title: '保存成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('保存失败:', error)
      Taro.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  }

  // 查看详细分析
  viewDetailedAnalysis = () => {
    const { analysisResult } = this.state
    if (analysisResult) {
      Taro.navigateTo({
        url: `/pages/job-analysis/index?data=${encodeURIComponent(JSON.stringify(analysisResult))}`
      })
    }
  }

  // 与简历匹配
  matchWithResume = () => {
    Taro.navigateTo({
      url: '/pages/resume-job-match/index'
    })
  }

  render() {
    const { jobTitle, companyName, jobDescription, analyzing, analysisResult } = this.state

    return (
      <View className='upload-job'>
        <View className='form-section'>
          <View className='input-group'>
            <Text className='label'>职位名称（可选）</Text>
            <Input
              className='input'
              value={jobTitle}
              onInput={this.onJobTitleChange}
              placeholder='如：前端开发工程师'
            />
          </View>

          <View className='input-group'>
            <Text className='label'>公司名称（可选）</Text>
            <Input
              className='input'
              value={companyName}
              onInput={this.onCompanyNameChange}
              placeholder='如：阿里巴巴'
            />
          </View>

          <View className='input-group'>
            <Text className='label'>职位描述 *</Text>
            <Textarea
              className='textarea'
              value={jobDescription}
              onInput={this.onJobDescriptionChange}
              placeholder='请输入完整的职位描述，包括工作职责、任职要求等...'
              maxlength={5000}
            />
            <View className='char-count'>
              <Text>{jobDescription.length}/5000</Text>
            </View>
          </View>

          <Button 
            className='analyze-btn'
            onClick={this.analyzeJob}
            disabled={!jobDescription.trim() || analyzing}
          >
            {analyzing ? '分析中...' : '分析职位'}
          </Button>
        </View>

        {analysisResult && (
          <View className='result-section'>
            <Text className='section-title'>分析结果</Text>
            
            <View className='result-card'>
              <View className='result-item'>
                <Text className='item-label'>核心技能</Text>
                <View className='skills-list'>
                  {analysisResult.keySkills?.slice(0, 6).map((skill, index) => (
                    <Text key={index} className='skill-tag'>{skill}</Text>
                  ))}
                  {analysisResult.keySkills?.length > 6 && (
                    <Text className='more-count'>+{analysisResult.keySkills.length - 6}</Text>
                  )}
                </View>
              </View>

              <View className='result-item'>
                <Text className='item-label'>经验要求</Text>
                <Text className='item-value'>
                  {analysisResult.requiredExperience?.slice(0, 2).join('、') || '未明确'}
                </Text>
              </View>

              <View className='result-item'>
                <Text className='item-label'>难度评估</Text>
                <Text className={`difficulty ${analysisResult.difficulty}`}>
                  {getDifficultyText(analysisResult.difficulty)}
                </Text>
              </View>
            </View>

            <View className='action-buttons'>
              <Button className='detail-btn' onClick={this.viewDetailedAnalysis}>
                查看详细分析
              </Button>
              <Button className='save-btn' onClick={this.saveJob}>
                保存职位
              </Button>
              <Button className='match-btn' onClick={this.matchWithResume}>
                与简历匹配
              </Button>
            </View>
          </View>
        )}
      </View>
    )
  }
}

function getDifficultyText(difficulty: string): string {
  const difficultyMap = {
    'entry': '入门级',
    'mid': '中级',
    'senior': '高级',
    'expert': '专家级'
  }
  return difficultyMap[difficulty] || '未知'
}
