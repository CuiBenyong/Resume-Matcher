import Taro from '@tarojs/taro'
import { API_BASE_URL } from '../constants/config'

class ApiService {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL || 'http://localhost:8000'
  }

  // 通用请求方法
  async request(options: {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: any
    header?: any
  }) {
    const { url, method = 'GET', data, header = {} } = options

    try {
      const response = await Taro.request({
        url: `${this.baseURL}${url}`,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          ...header
        }
      })

      if (response.statusCode === 200) {
        return response.data
      } else {
        throw new Error(`HTTP ${response.statusCode}: ${response.data?.message || '请求失败'}`)
      }
    } catch (error) {
      console.error('API请求失败:', error)
      throw error
    }
  }

  // GET 请求
  async get(url: string, params?: any) {
    const queryString = params ? 
      '?' + Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&') 
      : ''
    return this.request({
      url: url + queryString,
      method: 'GET'
    })
  }

  // POST 请求
  async post(url: string, data?: any) {
    return this.request({
      url,
      method: 'POST',
      data
    })
  }

  // PUT 请求
  async put(url: string, data?: any) {
    return this.request({
      url,
      method: 'PUT',
      data
    })
  }

  // DELETE 请求
  async delete(url: string) {
    return this.request({
      url,
      method: 'DELETE'
    })
  }
}

export const apiService = new ApiService()
