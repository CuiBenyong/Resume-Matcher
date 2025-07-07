import React from 'react';
import { View, Text } from '@tarojs/components';
import './index.scss';

interface LoadingProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'spinner' | 'dots' | 'pulse';
  overlay?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  text = '加载中...',
  size = 'medium',
  type = 'spinner',
  overlay = false,
  className = ''
}) => {
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <View className={`dots-loader ${size}`}>
            <View className="dot" />
            <View className="dot" />
            <View className="dot" />
          </View>
        );
      case 'pulse':
        return (
          <View className={`pulse-loader ${size}`}>
            <View className="pulse-circle" />
          </View>
        );
      default:
        return (
          <View className={`spinner-loader ${size}`}>
            <View className="spinner" />
          </View>
        );
    }
  };

  return (
    <View className={`loading ${overlay ? 'overlay' : ''} ${className}`}>
      <View className="loading-content">
        {renderLoader()}
        {text && <Text className="loading-text">{text}</Text>}
      </View>
    </View>
  );
};

export default Loading;
