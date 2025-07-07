/**
 * 颜色转换器测试脚本
 * 用于验证 OKLCH 到 RGB 的转换是否正常工作
 */

import { colorConverter, convertOKLCHForCanvas, checkColorSupport } from '../lib/color-converter';

// 测试 OKLCH 颜色
const testColors = [
  'oklch(0.7 0.15 180)',
  'oklch(0.8 0.2 90)',
  'oklch(0.6 0.25 270)',
  'oklch(0.9 0.1 30)',
  'oklch(0.5 0.3 210 / 0.8)',
];

console.log('=== OKLCH 颜色转换测试 ===');

testColors.forEach((color, index) => {
  console.log(`\n测试 ${index + 1}: ${color}`);
  
  try {
    // 测试通用转换
    const converted = colorConverter.convertColor(color, {
      targetColorSpace: 'rgb',
      fallbackColor: '#333333'
    });
    console.log(`通用转换结果: ${converted}`);
    
    // 测试 Canvas 专用转换
    const canvasConverted = convertOKLCHForCanvas(color);
    console.log(`Canvas专用转换: ${canvasConverted}`);
    
  } catch (error) {
    console.error(`转换失败:`, error);
  }
});

// 测试渐变转换
console.log('\n=== 渐变颜色转换测试 ===');
const gradientTest = 'linear-gradient(135deg, oklch(0.8 0.2 180) 0%, oklch(0.6 0.25 240) 100%)';
console.log(`原始渐变: ${gradientTest}`);

try {
  const convertedGradient = colorConverter.convertCSSColors(gradientTest, {
    targetColorSpace: 'rgb'
  });
  console.log(`转换后渐变: ${convertedGradient}`);
} catch (error) {
  console.error('渐变转换失败:', error);
}

// 测试浏览器支持检测
console.log('\n=== 浏览器支持检测 ===');
try {
  const support = checkColorSupport();
  console.log('支持情况:', support);
} catch (error) {
  console.error('支持检测失败:', error);
}

console.log('\n=== 测试完成 ===');
