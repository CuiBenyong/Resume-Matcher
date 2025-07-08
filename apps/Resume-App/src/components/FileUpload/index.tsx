import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { API_CONFIG } from '../../constants/config';
import './index.scss';

interface FileUploadProps {
  accept?: string[];
  maxSize?: number; // MB
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = ['pdf', 'doc', 'docx'],
  maxSize = 10,
  onSuccess,
  onError,
  className = '',
  children,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    if (disabled || uploading) return;

    Taro.chooseFile({
      count: 1,
      type: 'file',
      extension: accept,
      success: (res) => {
        const file = res.tempFiles[0];
        
        // 检查文件大小
        if (file.size > maxSize * 1024 * 1024) {
          Taro.showToast({
            title: `文件大小不能超过${maxSize}MB`,
            icon: 'none'
          });
          onError?.({ message: '文件过大' });
          return;
        }

        // 上传文件
        uploadFile(file);
      },
      fail: (error) => {
        console.error('选择文件失败:', error);
        Taro.showToast({
          title: '选择文件失败',
          icon: 'none'
        });
        onError?.(error);
      }
    });
  };

  const uploadFile = (file: any) => {
    setUploading(true);
    
    Taro.uploadFile({
      url: `${API_CONFIG.baseURL}/api/v1/upload`,
      filePath: file.path,
      name: 'file',
      formData: {
        type: 'resume'
      },
      header: {
        'Authorization': `Bearer ${Taro.getStorageSync('token')}`
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.success) {
            Taro.showToast({
              title: '上传成功',
              icon: 'success'
            });
            onSuccess?.(data.data);
          } else {
            throw new Error(data.message || '上传失败');
          }
        } catch (error) {
          console.error('解析响应失败:', error);
          Taro.showToast({
            title: '上传失败',
            icon: 'none'
          });
          onError?.(error);
        }
      },
      fail: (error) => {
        console.error('上传失败:', error);
        Taro.showToast({
          title: '上传失败',
          icon: 'none'
        });
        onError?.(error);
      },
      complete: () => {
        setUploading(false);
      }
    });
  };

  return (
    <View className={`file-upload ${className}`}>
      <Button 
        className={`upload-btn ${uploading ? 'uploading' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleUpload}
        loading={uploading}
        disabled={disabled}
      >
        {children || (
          <View className="upload-content">
            <Text className="upload-icon">📄</Text>
            <Text className="upload-text">
              {uploading ? '上传中...' : '选择文件'}
            </Text>
            <Text className="upload-tip">
              支持 {accept.join('/')} 格式，最大 {maxSize}MB
            </Text>
          </View>
        )}
      </Button>
    </View>
  );
};

export default FileUpload;
