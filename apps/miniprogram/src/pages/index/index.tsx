import { Component } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface IndexProps {}

interface IndexState {
  userInfo: any
}

export default class Index extends Component<IndexProps, IndexState> {
  constructor(props: IndexProps) {
    super(props)
    this.state = {
      userInfo: null
    }
  }

  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  // 导航到上传简历页面
  navigateToUploadResume = () => {
    Taro.navigateTo({
      url: '/pages/upload-resume/index'
    })
  }

  // 导航到上传职位描述页面
  navigateToUploadJob = () => {
    Taro.navigateTo({
      url: '/pages/upload-job/index'
    })
  }

  // 导航到生成简历页面
  navigateToGenerateResume = () => {
    Taro.navigateTo({
      url: '/pages/generate-resume/index'
    })
  }

  // 导航到历史记录页面
  navigateToHistory = () => {
    Taro.switchTab({
      url: '/pages/history/index'
    })
  }

  render() {
    return (
      <View className='index'>
        <View className='header'>
          <Text className='title'>Resume Matcher</Text>
          <Text className='subtitle'>AI驱动的智能简历生成工具</Text>
        </View>

        <View className='features'>
          <View className='feature-card' onClick={this.navigateToUploadResume}>
            <View className='feature-icon'>📄</View>
            <Text className='feature-title'>上传简历</Text>
            <Text className='feature-desc'>上传您的现有简历，我们将分析其内容</Text>
          </View>

          <View className='feature-card' onClick={this.navigateToUploadJob}>
            <View className='feature-icon'>💼</View>
            <Text className='feature-title'>职位分析</Text>
            <Text className='feature-desc'>输入目标职位描述，获取匹配度分析</Text>
          </View>

          <View className='feature-card' onClick={this.navigateToGenerateResume}>
            <View className='feature-icon'>✨</View>
            <Text className='feature-title'>生成简历</Text>
            <Text className='feature-desc'>基于AI智能生成优化后的简历</Text>
          </View>

          <View className='feature-card' onClick={this.navigateToHistory}>
            <View className='feature-icon'>📊</View>
            <Text className='feature-title'>历史记录</Text>
            <Text className='feature-desc'>查看之前的简历生成历史</Text>
          </View>
        </View>

        <View className='quick-actions'>
          <Button className='primary-btn' onClick={this.navigateToGenerateResume}>
            开始生成简历
          </Button>
        </View>
      </View>
    )
  }
}
