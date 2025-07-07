// 简历模板配置
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  style: 'modern' | 'classic' | 'creative' | 'minimal';
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'modern-blue',
    name: '现代蓝色',
    description: '简洁现代的设计，适合技术类职位',
    preview: '/resume-templates/modern-blue-preview.png',
    style: 'modern',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#2d3748',
    accentColor: '#3182ce'
  },
  {
    id: 'classic-elegant',
    name: '经典优雅',
    description: '传统商务风格，适合管理类职位',
    preview: '/resume-templates/classic-elegant-preview.png',
    style: 'classic',
    backgroundColor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    textColor: '#1a202c',
    accentColor: '#2b6cb0'
  },
  {
    id: 'creative-green',
    name: '创意绿色',
    description: '富有创意的设计，适合设计类职位',
    preview: '/resume-templates/creative-green-preview.png',
    style: 'creative',
    backgroundColor: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    textColor: '#2d3748',
    accentColor: '#38a169'
  },
  {
    id: 'minimal-gray',
    name: '极简灰色',
    description: '简约设计，突出内容本身',
    preview: '/resume-templates/minimal-gray-preview.png',
    style: 'minimal',
    backgroundColor: 'linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%)',
    textColor: '#374151',
    accentColor: '#6b7280'
  },
  {
    id: 'warm-orange',
    name: '温暖橙色',
    description: '温暖友好的设计，适合服务类职位',
    preview: '/resume-templates/warm-orange-preview.png',
    style: 'modern',
    backgroundColor: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    textColor: '#2d3748',
    accentColor: '#ed8936'
  },
  {
    id: 'professional-purple',
    name: '专业紫色',
    description: '专业大气的设计，适合高级职位',
    preview: '/resume-templates/professional-purple-preview.png',
    style: 'classic',
    backgroundColor: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    textColor: '#2d3748',
    accentColor: '#805ad5'
  }
];

// 根据模板生成HTML结构
export function generateTemplateHTML(template: ResumeTemplate, content: string): string {
  // 使用动态导入或直接使用window上的MarkdownIt
  let md: any;
  
  if (typeof window !== 'undefined') {
    // 客户端环境
    const MarkdownIt = require('markdown-it');
    md = new MarkdownIt({
      html: true,
      breaks: true,
      linkify: true
    });
  } else {
    // 服务端环境，返回原始内容
    return `<div>${content}</div>`;
  }
  
  const htmlContent = md.render(content);
  
  // 清理模板中的颜色，确保PDF导出兼容性
  const sanitizedTemplate = {
    ...template,
    backgroundColor: sanitizeColorForPDF(template.backgroundColor),
    textColor: sanitizeColorForPDF(template.textColor),
    accentColor: sanitizeColorForPDF(template.accentColor)
  };
  
  let templateHTML: string;
  switch (sanitizedTemplate.style) {
    case 'modern':
      templateHTML = getModernTemplate(sanitizedTemplate, htmlContent);
      break;
    case 'classic':
      templateHTML = getClassicTemplate(sanitizedTemplate, htmlContent);
      break;
    case 'creative':
      templateHTML = getCreativeTemplate(sanitizedTemplate, htmlContent);
      break;
    case 'minimal':
      templateHTML = getMinimalTemplate(sanitizedTemplate, htmlContent);
      break;
    default:
      templateHTML = getModernTemplate(sanitizedTemplate, htmlContent);
  }
  
  // 最后再清理一遍HTML中可能残留的现代颜色函数
  return sanitizeTemplateHTML(templateHTML);
}

// 生成支持分页的模板HTML
export function generatePaginatedTemplateHTML(template: ResumeTemplate, content: string, pageNumber: number = 1, totalPages: number = 1): string {
  const baseHTML = generateTemplateHTML(template, content);
  
  // 如果只有一页，返回原始HTML
  if (totalPages <= 1) {
    return baseHTML;
  }
  
  // 添加页码到页面
  const pageNumberHTML = `
    <div style="
      position: absolute;
      bottom: 8mm;
      right: 15mm;
      font-size: 11px;
      color: #666;
      z-index: 100;
      background: rgba(255, 255, 255, 0.9);
      padding: 2px 6px;
      border-radius: 3px;
    ">
      第 ${pageNumber} 页，共 ${totalPages} 页
    </div>
  `;
  
  // 在最后一个div标签前插入页码
  return baseHTML.replace(/(<\/div>\s*<\/div>\s*)$/, pageNumberHTML + '$1');
}

function getModernTemplate(template: ResumeTemplate, content: string): string {
  return `
    <div style="
      width: 210mm;
      height: 297mm;
      background: ${template.backgroundColor};
      font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
      color: ${template.textColor};
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      page-break-after: always;
      margin: 0;
      padding: 0;
    ">
      <!-- 背景装饰 -->
      <div style="
        position: absolute;
        top: -50px;
        right: -50px;
        width: 200px;
        height: 200px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        z-index: 0;
      "></div>
      <div style="
        position: absolute;
        bottom: -100px;
        left: -100px;
        width: 300px;
        height: 300px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 50%;
        z-index: 0;
      "></div>
      
      <!-- 内容区域 -->
      <div style="
        position: relative;
        z-index: 1;
        padding: 15mm;
        background: rgba(255, 255, 255, 0.95);
        margin: 10mm;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        width: calc(210mm - 20mm);
        height: calc(297mm - 20mm);
        box-sizing: border-box;
        overflow: hidden;
      ">
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          @media print {
            body { margin: 0; padding: 0; }
            .page-break { page-break-before: always; }
            .avoid-break { page-break-inside: avoid; }
          }
          h1 { 
            font-size: 28px; 
            font-weight: 700; 
            margin: 0 0 20px 0; 
            color: ${template.accentColor};
            border-bottom: 3px solid ${template.accentColor};
            padding-bottom: 10px;
            page-break-after: avoid;
            break-after: avoid;
          }
          h2 { 
            font-size: 20px; 
            font-weight: 600; 
            margin: 25px 0 15px 0; 
            color: ${template.accentColor};
            position: relative;
            padding-left: 20px;
            page-break-after: avoid;
            break-after: avoid;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          h2::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 20px;
            background: ${template.accentColor};
            border-radius: 2px;
          }
          h3 { 
            font-size: 16px; 
            font-weight: 600; 
            margin: 15px 0 10px 0; 
            color: ${template.textColor};
            page-break-after: avoid;
            break-after: avoid;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          }
          p { 
            margin: 10px 0; 
            line-height: 1.6;
            font-size: 14px;
            orphans: 3;
            widows: 3;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          strong { font-weight: 600; color: ${template.accentColor}; }
          em { font-style: italic; }
          ul, ol { 
            margin: 10px 0; 
            padding-left: 25px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          li { 
            margin: 6px 0;
            line-height: 1.5;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          hr { 
            margin: 20px 0; 
            border: none; 
            border-top: 2px solid ${template.accentColor};
            opacity: 0.3;
            page-break-after: avoid;
            break-after: avoid;
          }
          a { color: ${template.accentColor}; text-decoration: none; }
          .work-experience, .education-item, .project-item {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 20px;
          }
        </style>
        ${content}
      </div>
    </div>
  `;
}

function getClassicTemplate(template: ResumeTemplate, content: string): string {
  return `
    <div style="
      width: 210mm;
      height: 297mm;
      background: ${template.backgroundColor};
      font-family: 'Times New Roman', serif;
      color: ${template.textColor};
      position: relative;
      box-sizing: border-box;
      page-break-after: always;
      margin: 0;
      padding: 0;
    ">
      <!-- 页眉装饰 -->
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 8mm;
        background: ${template.accentColor};
      "></div>
      
      <!-- 内容区域 -->
      <div style="
        padding: 15mm 20mm;
        background: white;
        margin: 8mm 10mm 10mm 10mm;
        width: calc(210mm - 20mm);
        height: calc(297mm - 18mm);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        box-sizing: border-box;
        overflow: hidden;
      ">
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          h1 { 
            font-size: 26px; 
            font-weight: bold; 
            margin: 0 0 20px 0; 
            color: ${template.accentColor};
            text-align: center;
            letter-spacing: 1px;
            page-break-after: avoid;
          }
          h2 { 
            font-size: 18px; 
            font-weight: bold; 
            margin: 20px 0 12px 0; 
            color: ${template.accentColor};
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid ${template.accentColor};
            padding-bottom: 5px;
            page-break-after: avoid;
          }
          h3 { 
            font-size: 16px; 
            font-weight: bold; 
            margin: 15px 0 8px 0; 
            color: ${template.textColor};
            page-break-after: avoid;
          }
          p { 
            margin: 8px 0; 
            line-height: 1.6;
            font-size: 14px;
            text-align: justify;
            orphans: 3;
            widows: 3;
          }
          strong { font-weight: bold; }
          em { font-style: italic; }
          ul, ol { 
            margin: 10px 0; 
            padding-left: 20px;
            page-break-inside: avoid;
          }
          li { 
            margin: 5px 0;
            line-height: 1.5;
            page-break-inside: avoid;
          }
          hr { 
            margin: 15px 0; 
            border: none; 
            border-top: 1px solid ${template.accentColor};
            page-break-after: avoid;
          }
          a { color: ${template.accentColor}; text-decoration: underline; }
        </style>
        ${content}
      </div>
    </div>
  `;
}

function getCreativeTemplate(template: ResumeTemplate, content: string): string {
  return `
    <div style="
      width: 210mm;
      height: 297mm;
      background: ${template.backgroundColor};
      font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
      color: ${template.textColor};
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      page-break-after: always;
      margin: 0;
      padding: 0;
    ">
      <!-- 创意背景元素 -->
      <div style="
        position: absolute;
        top: 20mm;
        right: 10mm;
        width: 80mm;
        height: 80mm;
        background: rgba(255, 255, 255, 0.1);
        transform: rotate(45deg);
        border-radius: 20px;
      "></div>
      <div style="
        position: absolute;
        bottom: 30mm;
        left: 5mm;
        width: 60mm;
        height: 60mm;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 50%;
      "></div>
      
      <!-- 侧边装饰条 -->
      <div style="
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 8mm;
        background: linear-gradient(to bottom, ${template.accentColor}, rgba(255, 255, 255, 0.3));
      "></div>
      
      <!-- 内容区域 -->
      <div style="
        position: relative;
        padding: 15mm 15mm 15mm 23mm;
        background: rgba(255, 255, 255, 0.9);
        margin: 8mm 8mm 8mm 0;
        border-radius: 0 20px 20px 0;
        width: calc(210mm - 8mm);
        height: calc(297mm - 16mm);
        box-sizing: border-box;
        overflow: hidden;
      ">
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          h1 { 
            font-size: 30px; 
            font-weight: 300; 
            margin: 0 0 25px 0; 
            color: ${template.accentColor};
            position: relative;
            page-break-after: avoid;
          }
          h1::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            width: 60px;
            height: 4px;
            background: ${template.accentColor};
            border-radius: 2px;
          }
          h2 { 
            font-size: 22px; 
            font-weight: 400; 
            margin: 30px 0 15px 0; 
            color: ${template.accentColor};
            position: relative;
            padding-left: 25px;
            page-break-after: avoid;
          }
          h2::before {
            content: '●';
            position: absolute;
            left: 0;
            color: ${template.accentColor};
            font-size: 20px;
          }
          h3 { 
            font-size: 16px; 
            font-weight: 500; 
            margin: 15px 0 10px 0; 
            color: ${template.textColor};
            page-break-after: avoid;
          }
          p { 
            margin: 12px 0; 
            line-height: 1.7;
            font-size: 14px;
            orphans: 3;
            widows: 3;
          }
          strong { font-weight: 600; color: ${template.accentColor}; }
          em { font-style: italic; }
          ul, ol { 
            margin: 12px 0; 
            padding-left: 25px;
            page-break-inside: avoid;
          }
          li { 
            margin: 8px 0;
            line-height: 1.6;
            page-break-inside: avoid;
          }
          hr { 
            margin: 25px 0; 
            border: none; 
            height: 2px;
            background: linear-gradient(to right, ${template.accentColor}, transparent);
            page-break-after: avoid;
          }
          a { color: ${template.accentColor}; text-decoration: none; font-weight: 500; }
        </style>
        ${content}
      </div>
    </div>
  `;
}

function getMinimalTemplate(template: ResumeTemplate, content: string): string {
  return `
    <div style="
      width: 210mm;
      height: 297mm;
      background: ${template.backgroundColor};
      font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
      color: ${template.textColor};
      box-sizing: border-box;
      page-break-after: always;
      margin: 0;
      padding: 0;
    ">
      <!-- 内容区域 -->
      <div style="
        padding: 20mm 25mm;
        background: white;
        width: 210mm;
        height: 297mm;
        box-sizing: border-box;
        overflow: hidden;
      ">
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          h1 { 
            font-size: 24px; 
            font-weight: 300; 
            margin: 0 0 30px 0; 
            color: ${template.textColor};
            letter-spacing: 2px;
            text-align: center;
            page-break-after: avoid;
          }
          h2 { 
            font-size: 16px; 
            font-weight: 400; 
            margin: 25px 0 15px 0; 
            color: ${template.accentColor};
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 14px;
            page-break-after: avoid;
          }
          h3 { 
            font-size: 15px; 
            font-weight: 500; 
            margin: 15px 0 8px 0; 
            color: ${template.textColor};
            page-break-after: avoid;
          }
          p { 
            margin: 8px 0; 
            line-height: 1.8;
            font-size: 13px;
            font-weight: 300;
            orphans: 3;
            widows: 3;
          }
          strong { font-weight: 500; }
          em { font-style: italic; }
          ul, ol { 
            margin: 10px 0; 
            padding-left: 20px;
            page-break-inside: avoid;
          }
          li { 
            margin: 5px 0;
            line-height: 1.6;
            font-size: 13px;
            font-weight: 300;
            page-break-inside: avoid;
          }
          hr { 
            margin: 20px 0; 
            border: none; 
            border-top: 1px solid #e5e5e5;
            page-break-after: avoid;
          }
          a { color: ${template.accentColor}; text-decoration: none; }
        </style>
        ${content}
      </div>
    </div>
  `;
}

// 颜色函数清理辅助函数，确保PDF导出兼容性
function sanitizeColorForPDF(color: string): string {
  // 如果包含现代颜色函数，转换为兼容格式
  if (color.includes('oklch') || color.includes('color(') || color.includes('lab(') || color.includes('lch(')) {
    // 根据常见的现代颜色函数提供fallback
    if (color.includes('oklch')) {
      return '#3182ce'; // 默认蓝色
    }
    return '#333333'; // 默认深灰色
  }
  
  // 确保渐变背景使用兼容颜色
  if (color.includes('linear-gradient') || color.includes('radial-gradient')) {
    // 检查渐变中是否有现代颜色函数
    if (color.includes('oklch') || color.includes('color(') || color.includes('lab(') || color.includes('lch(')) {
      // 提供fallback渐变
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }
  
  return color;
}

// 清理模板HTML中的现代颜色函数
function sanitizeTemplateHTML(html: string): string {
  // 替换可能的oklch、color()等现代函数
  return html
    .replace(/oklch\([^)]+\)/gi, '#3182ce')
    .replace(/color\([^)]+\)/gi, '#333333')
    .replace(/lab\([^)]+\)/gi, '#666666')
    .replace(/lch\([^)]+\)/gi, '#999999');
}
