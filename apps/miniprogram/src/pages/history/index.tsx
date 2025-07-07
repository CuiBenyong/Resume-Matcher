import { Component } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { resumeService } from '../../services/resumeService'
import './index.scss'

interface HistoryProps {}

interface HistoryState {
  generationHistory: any[]
  loading: boolean
}

export default class History extends Component<HistoryProps, HistoryState> {
  constructor(props: HistoryProps) {
    super(props)
    this.state = {
      generationHistory: [],
      loading: true
    }
  }

  componentDidMount() {
    this.loadHistory()
  }

  componentDidShow() {
    this.loadHistory()
  }

  // 加载历史记录
  loadHistory = async () => {
    this.setState({ loading: true })
    
    try {
      const history = await resumeService.getGenerationHistory()
      this.setState({ generationHistory: history })
    } catch (error) {
      console.error('加载历史记录失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  // 查看简历详情
  viewResumeDetail = (resumeId: string) => {
    Taro.navigateTo({
      url: `/pages/preview-resume/index?id=${resumeId}`
    })
  }

  // 重新生成简历
  regenerateResume = (resume: any) => {
    Taro.navigateTo({
      url: `/pages/generate-resume/index?resumeId=${resume.originalResumeId}&jobId=${resume.jobDescriptionId}`
    })
  }

  // 删除记录
  deleteRecord = async (resumeId: string) => {
    const res = await Taro.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这条记录吗？'
    })

    if (res.confirm) {
      try {
        await resumeService.deleteResume(resumeId)
        this.loadHistory() // 重新加载列表
        Taro.showToast({
          title: '删除成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('删除失败:', error)
        Taro.showToast({
          title: '删除失败',
          icon: 'none'
        })
      }
    }
  }

  // 格式化日期
  formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  }

  render() {
    const { generationHistory, loading } = this.state

    return (
      <View className='history'>
        <View className='header'>
          <Text className='title'>生成历史</Text>
          <Text className='subtitle'>查看您的简历生成记录</Text>
        </View>

        {loading ? (
          <View className='loading'>
            <Text>加载中...</Text>
          </View>
        ) : generationHistory.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-icon'>📄</Text>
            <Text className='empty-title'>暂无生成记录</Text>
            <Text className='empty-desc'>开始生成您的第一份AI简历吧</Text>
            <Button 
              className='start-btn'
              onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
            >
              开始生成
            </Button>
          </View>
        ) : (
          <ScrollView className='history-list' scrollY>
            {generationHistory.map((item, index) => (
              <View key={item.id} className='history-item'>
                <View className='item-header'>
                  <View className='item-info'>
                    <Text className='item-title'>
                      {item.targetPosition || `简历 ${item.id.slice(-6)}`}
                    </Text>
                    <Text className='item-time'>{this.formatDate(item.createdAt)}</Text>
                  </View>
                  <View className='item-score'>
                    <Text className='score-value'>{item.matchScore}%</Text>
                    <Text className='score-label'>匹配度</Text>
                  </View>
                </View>

                <View className='item-content'>
                  <View className='content-stats'>
                    <Text className='stat'>优化: {item.improvements?.length || 0}处</Text>
                    <Text className='stat'>建议: {item.suggestions?.length || 0}个</Text>
                  </View>
                  
                  {item.targetCompany && (
                    <Text className='target-company'>目标公司: {item.targetCompany}</Text>
                  )}
                </View>

                <View className='item-actions'>
                  <Button 
                    className='action-btn view-btn'
                    onClick={() => this.viewResumeDetail(item.id)}
                  >
                    查看
                  </Button>
                  <Button 
                    className='action-btn regenerate-btn'
                    onClick={() => this.regenerateResume(item)}
                  >
                    重新生成
                  </Button>
                  <Button 
                    className='action-btn delete-btn'
                    onClick={() => this.deleteRecord(item.id)}
                  >
                    删除
                  </Button>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    )
  }
}
