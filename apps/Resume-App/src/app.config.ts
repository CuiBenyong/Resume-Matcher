export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/upload-resume/index',
    'pages/upload-job/index',
    'pages/generate-resume/index',
    'pages/preview-resume/index',
    'pages/history/index',
    'pages/resume-analysis/index',
    'pages/job-analysis/index',
    'pages/edit-resume/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#666',
    selectedColor: '#1976d2',
    backgroundColor: '#fafafa',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        // iconPath: 'assets/images/home.png',
        // selectedIconPath: 'assets/images/home-active.png',
        text: '首页'
      },
      {
        pagePath: 'pages/upload-resume/index',
        // iconPath: 'assets/images/resume.png',
        // selectedIconPath: 'assets/images/resume-active.png',
        text: '上传简历'
      },
      {
        pagePath: 'pages/upload-job/index',
        // iconPath: 'assets/images/job.png',
        // selectedIconPath: 'assets/images/job-active.png',
        text: '职位分析'
      },
      {
        pagePath: 'pages/history/index',
        // iconPath: 'assets/images/history.png',
        // selectedIconPath: 'assets/images/history-active.png',
        text: '历史记录'
      }
    ]
  }
})
