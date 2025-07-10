import { Component } from 'react'
import { View, Text, ScrollView, Button, RichText } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { resumeService } from '../../services/resumeService'
import { API_BASE_URL } from '../../constants/config'
import './index.scss'

interface PreviewResumeProps {}

interface PreviewResumeState {
  resume: any
  loading: boolean
  resumeId: string
}

export default class PreviewResume extends Component<PreviewResumeProps, PreviewResumeState> {
  constructor(props: PreviewResumeProps) {
    super(props)
    this.state = {
      resume: null,
      loading: true,
      resumeId: ''
    }
  }

  componentDidMount() {
    // 从路由参数获取简历ID
    const router = Taro.getCurrentInstance().router
    const resumeId = router?.params?.id
    
    if (resumeId) {
      this.setState({ resumeId })
      this.loadResume(resumeId)
    } else {
      Taro.showToast({
        title: '参数错误',
        icon: 'none'
      })
      Taro.navigateBack()
    }
  }

  // 加载简历数据
  loadResume = async (id: string) => {
    this.setState({ loading: true })
    
    try {
      const resume = await resumeService.getGeneratedResume(id)
      this.setState({ resume })
      
      Taro.setNavigationBarTitle({
        title: '简历预览'
      })
    } catch (error) {
      console.error('加载简历失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  // 分享简历
  shareResume = () => {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  }

  // 下载简历（在小程序中可能需要调用后端API生成PDF）
  downloadResume = async () => {
    const { resumeId } = this.state
    
    try {
      Taro.showLoading({ title: '生成中...' })
      
      // 调用后端API生成PDF
      const response = await Taro.request({
        url: `${API_BASE_URL}/api/v1/resume-generator/${resumeId}/pdf`,
        method: 'GET',
        responseType: 'arraybuffer'
      })
      
      if (response.statusCode === 200) {
        // 保存文件到本地
        const fs = Taro.getFileSystemManager()
        const filePath = `${Taro.env.USER_DATA_PATH}/resume_${resumeId}.pdf`
        
        fs.writeFileSync(filePath, response.data)
        
        Taro.hideLoading()
        Taro.showToast({
          title: '下载成功',
          icon: 'success'
        })
        
        // 打开文件
        Taro.openDocument({
          filePath,
          fileType: 'pdf'
        })
      }
    } catch (error) {
      console.error('下载失败:', error)
      Taro.hideLoading()
      Taro.showToast({
        title: '下载失败',
        icon: 'none'
      })
    }
  }

  // 编辑简历
  editResume = () => {
    const { resumeId } = this.state
    Taro.navigateTo({
      url: `/pages/edit-resume/index?id=${resumeId}`
    })
  }

  // 重新生成
  regenerate = () => {
    Taro.navigateTo({
      url: '/pages/generate-resume/index'
    })
  }

  render() {
    const { resume, loading } = this.state

    if (loading) {
      return (
        <View className='preview-resume loading'>
          <Text>加载中...</Text>
        </View>
      )
    }

    if (!resume) {
      return (
        <View className='preview-resume error'>
          <Text>简历不存在</Text>
          <Button onClick={() => Taro.navigateBack()}>返回</Button>
        </View>
      )
    }

    return (
      <View className='preview-resume'>
        <ScrollView className='resume-content' scrollY>
          {/* 简历头部信息 */}
          <View className='resume-header'>
            <View className='score-badge'>
              <Text className='score'>{resume.matchScore}%</Text>
              <Text className='score-label'>匹配度</Text>
            </View>
            <Text className='created-time'>
              生成时间: {new Date(resume.createdAt).toLocaleString()}
            </Text>
          </View>

          {/* 简历正文 */}
          <View className='resume-body'>
            <RichText nodes={resume.content} />
          </View>

          {/* 优化建议 */}
          {resume.improvements && resume.improvements.length > 0 && (
            <View className='improvements-section'>
              <Text className='section-title'>AI 优化要点</Text>
              <View className='improvements-list'>
                {resume.improvements.map((improvement, index) => (
                  <View key={index} className='improvement-item'>
                    <Text className='improvement-icon'>✨</Text>
                    <Text className='improvement-text'>{improvement}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 建议 */}
          {resume.suggestions && resume.suggestions.length > 0 && (
            <View className='suggestions-section'>
              <Text className='section-title'>进一步建议</Text>
              <View className='suggestions-list'>
                {resume.suggestions.map((suggestion, index) => (
                  <View key={index} className='suggestion-item'>
                    <Text className='suggestion-icon'>💡</Text>
                    <Text className='suggestion-text'>{suggestion}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* 底部操作栏 */}
        <View className='action-bar'>
          <Button className='action-btn secondary' onClick={this.regenerate}>
            重新生成
          </Button>
          <Button className='action-btn secondary' onClick={this.downloadResume}>
            下载PDF
          </Button>
          <Button className='action-btn primary' onClick={this.shareResume}>
            分享
          </Button>
        </View>
      </View>
    )
  }
}
