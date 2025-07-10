import { Component } from 'react'
import { View, Text, Button, Textarea, Image, Progress } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { resumeService } from '../../services/resumeService'
import { API_BASE_URL } from '../../constants/config'
import './index.scss'

interface UploadResumeProps {}

interface UploadResumeState {
  resumeText: string
  selectedFile: any
  uploading: boolean
  uploadProgress: number
  analysisResult: any
}

export default class UploadResume extends Component<UploadResumeProps, UploadResumeState> {
  constructor(props: UploadResumeProps) {
    super(props)
    this.state = {
      resumeText: '',
      selectedFile: null,
      uploading: false,
      uploadProgress: 0,
      analysisResult: null
    }
  }

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '上传简历'
    })
  }

  // 选择文件上传
  chooseFile = () => {
    Taro.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf', 'doc', 'docx', 'txt'],
      success: (res) => {
        const file = res.tempFiles[0]
        if (file.size > 5 * 1024 * 1024) { // 5MB限制
          Taro.showToast({
            title: '文件大小不能超过5MB',
            icon: 'none'
          })
          return
        }
        this.setState({ selectedFile: file })
      }
    })
  }

  // 上传简历文件
  uploadResumeFile = async () => {
    const { selectedFile } = this.state
    if (!selectedFile) {
      Taro.showToast({
        title: '请先选择文件',
        icon: 'none'
      })
      return
    }

    this.setState({ uploading: true, uploadProgress: 0 })

    try {
      const uploadTask = Taro.uploadFile({
        url: `${API_BASE_URL}/api/v1/resumes/upload`,
        filePath: selectedFile.path,
        name: 'file',
        success: (res) => {
          const data = JSON.parse(res.data)
          if (data.success) {
            this.setState({ analysisResult: data.data })
            Taro.showToast({
              title: '上传成功',
              icon: 'success'
            })
          } else {
            throw new Error(data.message || '上传失败')
          }
        },
        fail: (err) => {
          console.error('上传失败:', err)
          Taro.showToast({
            title: '上传失败',
            icon: 'none'
          })
        },
        complete: () => {
          this.setState({ uploading: false })
        }
      })

      uploadTask.progress((res) => {
        this.setState({ uploadProgress: res.progress })
      })
    } catch (error) {
      console.error('上传错误:', error)
      this.setState({ uploading: false })
      Taro.showToast({
        title: '上传失败',
        icon: 'none'
      })
    }
  }

  // 手动输入简历内容
  onTextareaChange = (e) => {
    this.setState({ resumeText: e.detail.value })
  }

  // 分析文本简历
  analyzeTextResume = async () => {
    const { resumeText } = this.state
    if (!resumeText.trim()) {
      Taro.showToast({
        title: '请输入简历内容',
        icon: 'none'
      })
      return
    }

    this.setState({ uploading: true })

    try {
      const result = await resumeService.analyzeText(resumeText)
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
      this.setState({ uploading: false })
    }
  }

  // 查看分析结果
  viewAnalysisResult = () => {
    const { analysisResult } = this.state
    if (analysisResult) {
      Taro.navigateTo({
        url: `/pages/resume-analysis/index?data=${encodeURIComponent(JSON.stringify(analysisResult))}`
      })
    }
  }

  render() {
    const { resumeText, selectedFile, uploading, uploadProgress, analysisResult } = this.state

    return (
      <View className='upload-resume'>
        <View className='upload-section'>
          <Text className='section-title'>方式一：上传简历文件</Text>
          <Text className='section-desc'>支持 PDF、Word、TXT 格式，文件大小不超过5MB</Text>
          
          <View className='file-upload'>
            {selectedFile ? (
              <View className='selected-file'>
                <Text className='file-name'>{selectedFile.name}</Text>
                <Text className='file-size'>{(selectedFile.size / 1024).toFixed(1)}KB</Text>
              </View>
            ) : (
              <View className='upload-placeholder' onClick={this.chooseFile}>
                <Text className='upload-icon'>📁</Text>
                <Text className='upload-text'>点击选择文件</Text>
              </View>
            )}
          </View>

          {uploading && (
            <View className='upload-progress'>
              <Progress percent={uploadProgress} showInfo strokeWidth={6} />
              <Text className='progress-text'>上传中... {uploadProgress}%</Text>
            </View>
          )}

          <Button 
            className='upload-btn'
            onClick={this.uploadResumeFile}
            disabled={!selectedFile || uploading}
          >
            {uploading ? '上传中...' : '上传并分析'}
          </Button>
        </View>

        <View className='divider'>
          <Text className='divider-text'>或</Text>
        </View>

        <View className='text-section'>
          <Text className='section-title'>方式二：直接输入简历内容</Text>
          <Text className='section-desc'>复制粘贴您的简历文本内容</Text>
          
          <Textarea
            className='resume-textarea'
            value={resumeText}
            onInput={this.onTextareaChange}
            placeholder='请输入您的简历内容...'
            maxlength={10000}
          />
          
          <View className='char-count'>
            <Text>{resumeText.length}/10000</Text>
          </View>

          <Button 
            className='analyze-btn'
            onClick={this.analyzeTextResume}
            disabled={!resumeText.trim() || uploading}
          >
            {uploading ? '分析中...' : '分析简历'}
          </Button>
        </View>

        {analysisResult && (
          <View className='result-section'>
            <Text className='section-title'>分析结果</Text>
            <View className='result-preview'>
              <Text className='result-item'>技能关键词: {analysisResult.skills?.length || 0} 个</Text>
              <Text className='result-item'>工作经验: {analysisResult.experience?.length || 0} 段</Text>
              <Text className='result-item'>教育背景: {analysisResult.education?.length || 0} 个</Text>
            </View>
            <Button className='view-result-btn' onClick={this.viewAnalysisResult}>
              查看详细分析
            </Button>
          </View>
        )}
      </View>
    )
  }
}
