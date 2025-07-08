import { Component } from 'react'
import { View, Text, Button, Input, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { resumeService } from '../../services/resumeService'
import { jobService } from '../../services/jobService'
import './index.scss'

interface GenerateResumeProps {}

interface GenerateResumeState {
  resumeList: any[]
  jobList: any[]
  selectedResumeIndex: number
  selectedJobIndex: number
  targetPosition: string
  targetCompany: string
  generating: boolean
  generatedResume: any
}

export default class GenerateResume extends Component<GenerateResumeProps, GenerateResumeState> {
  constructor(props: GenerateResumeProps) {
    super(props)
    this.state = {
      resumeList: [],
      jobList: [],
      selectedResumeIndex: 0,
      selectedJobIndex: 0,
      targetPosition: '',
      targetCompany: '',
      generating: false,
      generatedResume: null
    }
  }

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '生成简历'
    })
    this.loadData()
  }

  // 加载简历和职位数据
  loadData = async () => {
    try {
      const [resumes, jobs] = await Promise.all([
        resumeService.getUserResumes(),
        jobService.getUserJobs()
      ])
      
      this.setState({
        resumeList: resumes,
        jobList: jobs
      })
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  onResumePickerChange = (e) => {
    this.setState({
      selectedResumeIndex: parseInt(e.detail.value)
    })
  }

  onJobPickerChange = (e) => {
    this.setState({
      selectedJobIndex: parseInt(e.detail.value)
    })
  }

  onTargetPositionChange = (e) => {
    this.setState({ targetPosition: e.detail.value })
  }

  onTargetCompanyChange = (e) => {
    this.setState({ targetCompany: e.detail.value })
  }

  // 生成简历
  generateResume = async () => {
    const { 
      resumeList, 
      jobList, 
      selectedResumeIndex, 
      selectedJobIndex, 
      targetPosition,
      targetCompany 
    } = this.state

    if (!targetPosition.trim()) {
      Taro.showToast({
        title: '请输入目标职位',
        icon: 'none'
      })
      return
    }

    this.setState({ generating: true })

    try {
      const request = {
        originalResumeId: resumeList[selectedResumeIndex]?.id,
        jobDescriptionId: jobList[selectedJobIndex]?.id,
        targetPosition: targetPosition.trim(),
        targetCompany: targetCompany.trim()
      }

      const result = await resumeService.generateResume(request)
      this.setState({ generatedResume: result })
      
      Taro.showToast({
        title: '生成成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('生成失败:', error)
      Taro.showToast({
        title: '生成失败',
        icon: 'none'
      })
    } finally {
      this.setState({ generating: false })
    }
  }

  // 预览生成的简历
  previewResume = () => {
    const { generatedResume } = this.state
    if (generatedResume) {
      Taro.navigateTo({
        url: `/pages/preview-resume/index?id=${generatedResume.id}`
      })
    }
  }

  // 重新生成
  regenerate = () => {
    this.setState({ generatedResume: null })
  }

  // 上传新简历
  uploadNewResume = () => {
    Taro.navigateTo({
      url: '/pages/upload-resume/index'
    })
  }

  // 添加新职位
  addNewJob = () => {
    Taro.navigateTo({
      url: '/pages/upload-job/index'
    })
  }

  render() {
    const {
      resumeList,
      jobList,
      selectedResumeIndex,
      selectedJobIndex,
      targetPosition,
      targetCompany,
      generating,
      generatedResume
    } = this.state

    const resumeNames = resumeList.map(resume => 
      resume.contact?.name || `简历 ${resume.id.slice(-6)}`
    )
    const jobNames = jobList.map(job => 
      job.title || `职位 ${job.id.slice(-6)}`
    )

    return (
      <View className='generate-resume'>
        {!generatedResume ? (
          <View className='form-section'>
            <Text className='page-title'>AI 简历生成</Text>
            <Text className='page-desc'>基于您的简历和目标职位，生成优化后的简历</Text>

            <View className='form-group'>
              <Text className='label'>选择简历模板</Text>
              {resumeList.length > 0 ? (
                <Picker
                  mode='selector'
                  range={resumeNames}
                  value={selectedResumeIndex}
                  onChange={this.onResumePickerChange}
                >
                  <View className='picker'>
                    <Text>{resumeNames[selectedResumeIndex] || '请选择简历'}</Text>
                    <Text className='arrow'>›</Text>
                  </View>
                </Picker>
              ) : (
                <View className='empty-state'>
                  <Text className='empty-text'>暂无简历</Text>
                  <Button className='upload-btn' onClick={this.uploadNewResume}>
                    上传简历
                  </Button>
                </View>
              )}
            </View>

            <View className='form-group'>
              <Text className='label'>参考职位（可选）</Text>
              {jobList.length > 0 ? (
                <Picker
                  mode='selector'
                  range={jobNames}
                  value={selectedJobIndex}
                  onChange={this.onJobPickerChange}
                >
                  <View className='picker'>
                    <Text>{jobNames[selectedJobIndex] || '请选择职位'}</Text>
                    <Text className='arrow'>›</Text>
                  </View>
                </Picker>
              ) : (
                <View className='empty-state'>
                  <Text className='empty-text'>暂无职位</Text>
                  <Button className='add-btn' onClick={this.addNewJob}>
                    添加职位
                  </Button>
                </View>
              )}
            </View>

            <View className='form-group'>
              <Text className='label'>目标职位 *</Text>
              <Input
                className='input'
                value={targetPosition}
                onInput={this.onTargetPositionChange}
                placeholder='如：高级前端开发工程师'
              />
            </View>

            <View className='form-group'>
              <Text className='label'>目标公司（可选）</Text>
              <Input
                className='input'
                value={targetCompany}
                onInput={this.onTargetCompanyChange}
                placeholder='如：字节跳动'
              />
            </View>

            <Button 
              className='generate-btn'
              onClick={this.generateResume}
              disabled={generating || !targetPosition.trim() || resumeList.length === 0}
            >
              {generating ? '生成中...' : '生成简历'}
            </Button>
          </View>
        ) : (
          <View className='result-section'>
            <View className='success-header'>
              <Text className='success-icon'>✅</Text>
              <Text className='success-title'>简历生成成功！</Text>
              <Text className='success-desc'>AI 已为您优化简历内容</Text>
            </View>

            <View className='result-stats'>
              <View className='stat-item'>
                <Text className='stat-value'>{generatedResume.matchScore}%</Text>
                <Text className='stat-label'>匹配度</Text>
              </View>
              <View className='stat-item'>
                <Text className='stat-value'>{generatedResume.improvements?.length || 0}</Text>
                <Text className='stat-label'>优化点</Text>
              </View>
              <View className='stat-item'>
                <Text className='stat-value'>{generatedResume.suggestions?.length || 0}</Text>
                <Text className='stat-label'>建议</Text>
              </View>
            </View>

            <View className='action-buttons'>
              <Button className='preview-btn' onClick={this.previewResume}>
                预览简历
              </Button>
              <Button className='regenerate-btn' onClick={this.regenerate}>
                重新生成
              </Button>
            </View>
          </View>
        )}
      </View>
    )
  }
}
