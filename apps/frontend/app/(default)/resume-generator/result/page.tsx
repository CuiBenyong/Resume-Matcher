'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ArrowLeft, Copy, Check, Palette, ZoomIn, ZoomOut, RotateCcw, Eye, X } from 'lucide-react';
// 移除Canvas相关依赖，仅使用Puppeteer方案
import MarkdownIt from 'markdown-it';
import TemplatePicker from '@/components/resume/template-picker';
import TemplatePreview from '@/components/resume/template-preview';
import TemplateRenderer from '@/components/resume/template-renderer';
import PaginatedTemplateRenderer from '@/components/resume/paginated-template-renderer';
import { ResumeTemplate, resumeTemplates, generateTemplateHTML } from '@/lib/resume-templates';
// 移除Canvas相关的导入，仅使用Puppeteer方案
import { prepareElementForPDF, preprocessTemplateColors } from '@/lib/color-converter';
// 导入统一的分页工具
import { splitContentIntoPages, getPaginationDebugInfo } from '@/lib/pagination-utils';

// 清理Markdown代码块标签的函数
function cleanMarkdownCodeBlocks(text: string): string {
  return text
    // 移除开头的代码块标签 ```md ```markdown ```
    .replace(/^```\s*(md|markdown)?\s*\n?/gim, '')
    // 移除结尾的代码块标签 ```
    .replace(/\n?```\s*$/gim, '')
    // 移除中间可能出现的多余代码块标签
    .replace(/```\s*(md|markdown)?\s*\n?/gim, '')
    .replace(/\n?```/gim, '')
    // 清理可能的多余空行
    .replace(/^\n+/, '')
    .replace(/\n+$/, '')
    .trim();
}

// 确保颜色兼容性的函数
async function ensureColorCompatibility(element: HTMLElement): Promise<void> {
  // 强制重新计算样式
  window.getComputedStyle(element).color;
  
  // 再次检查并转换任何残留的现代颜色函数
  const allElements = element.querySelectorAll('*');
  allElements.forEach(el => {
    if (el instanceof HTMLElement) {
      const computedStyle = window.getComputedStyle(el);
      
      // 检查关键颜色属性
      ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && value.includes('oklch')) {
          // 如果还有OKLCH，强制设置为安全颜色
          if (prop === 'backgroundColor') {
            el.style.setProperty(prop, '#ffffff', 'important');
          } else {
            el.style.setProperty(prop, '#333333', 'important');
          }
        }
      });
    }
  });
  
  // 等待样式应用
  await new Promise(resolve => setTimeout(resolve, 100));
}

// 处理克隆文档的函数
async function processClonedDocument(clonedDoc: Document): Promise<void> {
  const clonedElements = clonedDoc.querySelectorAll('*');
  clonedElements.forEach(element => {
    const htmlElement = element as HTMLElement;
    const style = htmlElement.style;
    
    // 确保没有现代颜色函数残留
    ['color', 'backgroundColor', 'borderColor', 'background'].forEach(prop => {
      const value = style.getPropertyValue(prop);
      if (value) {
        // 检查并替换任何可能的现代颜色函数
        const modernColorRegex = /(oklch|oklab|lch|lab|color)\s*\([^)]*\)/gi;
        if (modernColorRegex.test(value)) {
          // 使用简单的RGB值替换
          if (prop === 'backgroundColor') {
            style.setProperty(prop, '#ffffff', 'important');
          } else if (prop === 'background') {
            style.setProperty(prop, 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'important');
          } else {
            style.setProperty(prop, '#333333', 'important');
          }
        }
      }
    });
    
    // 额外检查计算样式
    const computedStyle = clonedDoc.defaultView?.getComputedStyle(htmlElement);
    if (computedStyle) {
      ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && /(oklch|oklab|lch|lab)\s*\([^)]*\)/gi.test(value)) {
          // 强制覆盖现代颜色函数
          if (prop === 'backgroundColor') {
            style.setProperty(prop, '#ffffff', 'important');
          } else {
            style.setProperty(prop, '#333333', 'important');
          }
        }
      });
    }
  });
}

// 安全的URI解码函数，避免malformed URI错误
function safeDecodeURIComponent(str: string | null): string {
  if (!str) return '';
  
  let decodedStr = '';
  try {
    decodedStr = decodeURIComponent(str);
  } catch (error) {
    console.warn('URI decode failed, returning original string:', error);
    // 如果解码失败，尝试替换常见的编码字符
    decodedStr = str
      .replace(/%20/g, ' ')
      .replace(/%21/g, '!')
      .replace(/%22/g, '"')
      .replace(/%23/g, '#')
      .replace(/%24/g, '$')
      .replace(/%25/g, '%')
      .replace(/%26/g, '&')
      .replace(/%27/g, "'")
      .replace(/%28/g, '(')
      .replace(/%29/g, ')')
      .replace(/%2A/g, '*')
      .replace(/%2B/g, '+')
      .replace(/%2C/g, ',')
      .replace(/%2D/g, '-')
      .replace(/%2E/g, '.')
      .replace(/%2F/g, '/')
      .replace(/%3A/g, ':')
      .replace(/%3B/g, ';')
      .replace(/%3C/g, '<')
      .replace(/%3D/g, '=')
      .replace(/%3E/g, '>')
      .replace(/%3F/g, '?')
      .replace(/%40/g, '@')
      .replace(/%5B/g, '[')
      .replace(/%5C/g, '\\')
      .replace(/%5D/g, ']')
      .replace(/%5E/g, '^')
      .replace(/%5F/g, '_')
      .replace(/%60/g, '`')
      .replace(/%7B/g, '{')
      .replace(/%7C/g, '|')
      .replace(/%7D/g, '}')
      .replace(/%7E/g, '~');
  }
  
  // 清理解码后的Markdown代码块标签
  return cleanMarkdownCodeBlocks(decodedStr);
}

// Markdown渲染组件
function MarkdownRenderer({ content }: { content: string }) {
  // 简单的Markdown渲染，你也可以使用react-markdown库
  const renderMarkdown = (text: string) => {
    // 先清理代码块标签，再进行渲染
    const cleanedText = cleanMarkdownCodeBlocks(text);
    return cleanedText
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-6">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/\n/gim, '<br>');
  };

  return (
    <div 
      className="prose prose-gray max-w-none"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}

function ResumeResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(resumeTemplates[0]);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplate | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.6); // 添加缩放状态，默认0.6

  const resumeId = searchParams.get('id');
  const markdownContent = searchParams.get('content');

  // 点击外部关闭导出选项 - 已移除
  useEffect(() => {
    if (!resumeId || !markdownContent) {
      router.push('/resume-generator');
    }
  }, [resumeId, markdownContent, router]);

  // 键盘快捷键支持缩放和ESC关闭modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC键关闭模态框
      if (event.key === 'Escape') {
        if (showTemplatePicker) {
          setShowTemplatePicker(false);
          return;
        }
        if (showTemplatePreview) {
          setShowTemplatePreview(false);
          return;
        }
      }
      
      // Ctrl/Cmd + 加号 放大
      if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        setPreviewScale(prev => Math.min(1.5, prev + 0.1));
      }
      // Ctrl/Cmd + 减号 缩小
      else if ((event.ctrlKey || event.metaKey) && event.key === '-') {
        event.preventDefault();
        setPreviewScale(prev => Math.max(0.2, prev - 0.1));
      }
      // Ctrl/Cmd + 0 重置
      else if ((event.ctrlKey || event.metaKey) && event.key === '0') {
        event.preventDefault();
        setPreviewScale(0.6);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTemplatePicker, showTemplatePreview]);

  const handleCopyMarkdown = async () => {
    if (markdownContent) {
      try {
        await navigator.clipboard.writeText(safeDecodeURIComponent(markdownContent));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('复制失败:', err);
      }
    }
  };

  const handleDownloadMarkdown = () => {
    if (markdownContent) {
      const blob = new Blob([safeDecodeURIComponent(markdownContent)], {
        type: 'text/markdown;charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '简历.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Puppeteer PDF导出方案（唯一方案）
  const handlePuppeteerPDFExport = async () => {
    const cleanedMarkdown = safeDecodeURIComponent(markdownContent);
    
    // 使用统一的分页函数
    const pages = splitContentIntoPages(cleanedMarkdown);
    
    // 添加调试信息
    const debugInfo = getPaginationDebugInfo(cleanedMarkdown);
    console.log('Puppeteer PDF分页调试信息:', debugInfo);
    
    console.log('Puppeteer PDF分页信息:', {
      originalLength: cleanedMarkdown.length,
      pagesCount: pages.length,
      template: selectedTemplate?.name || 'default'
    });
    
    let htmlContent;
    if (selectedTemplate) {
      // 为多页内容生成完整的HTML
      const pageContents = pages.map((pageContent, pageIndex) => {
        const templateHTML = generateTemplateHTML(selectedTemplate, pageContent);
        
        // 为每页添加分页样式
        return `
          <div class="page-container" style="
            page-break-after: ${pageIndex < pages.length - 1 ? 'always' : 'auto'};
            page-break-inside: avoid;
            min-height: 100vh;
            position: relative;
          ">
            ${templateHTML}
            ${pages.length > 1 ? `
              <div class="page-number">
                第 ${pageIndex + 1} 页，共 ${pages.length} 页
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
      
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>简历</title>
          <style>
            @page { 
              size: A4; 
              margin: 15mm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif;
            }
            .page-container {
              page-break-after: always;
              position: relative;
              width: 100%;
              min-height: calc(100vh - 30mm);
              box-sizing: border-box;
            }
            .page-container:last-child {
              page-break-after: avoid;
            }
            /* 确保模板样式正确应用 */
            h1, h2, h3 { 
              page-break-after: avoid;
              page-break-inside: avoid;
            }
            p, li { 
              orphans: 3; 
              widows: 3; 
              page-break-inside: avoid;
            }
            ul, ol {
              page-break-inside: avoid;
            }
            /* 防止单独的列表项出现在页面顶部 */
            li:first-child {
              page-break-before: avoid;
            }
            /* 确保页码正确显示 */
            .page-number {
              position: absolute;
              bottom: 8mm;
              right: 15mm;
              font-size: 11px;
              color: #666;
              z-index: 100;
            }
          </style>
        </head>
        <body>
          ${pageContents}
        </body>
        </html>
      `;
    } else {
      // 使用默认样式处理多页
      const md = new MarkdownIt({
        html: true,
        breaks: true,
        linkify: true
      });
      
      const pageContents = pages.map((pageContent, pageIndex) => {
        const renderedMarkdown = md.render(pageContent);
        
        return `
          <div class="page-container" style="
            page-break-after: ${pageIndex < pages.length - 1 ? 'always' : 'auto'};
            page-break-inside: avoid;
          ">
            ${renderedMarkdown}
            ${pages.length > 1 ? `
              <div class="page-number">
                第 ${pageIndex + 1} 页，共 ${pages.length} 页
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
      
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>简历</title>
          <style>
            @page { 
              size: A4; 
              margin: 15mm;
            }
            body {
              font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .page-container {
              page-break-after: always;
              min-height: calc(100vh - 30mm);
              position: relative;
            }
            .page-container:last-child {
              page-break-after: avoid;
            }
            h1 { 
              font-size: 24px; 
              font-weight: bold; 
              margin: 20px 0 16px 0; 
              color: #1a1a1a; 
              page-break-after: avoid;
            }
            h2 { 
              font-size: 20px; 
              font-weight: bold; 
              margin: 16px 0 12px 0; 
              color: #2d2d2d; 
              page-break-after: avoid;
            }
            h3 { 
              font-size: 16px; 
              font-weight: 600; 
              margin: 12px 0 8px 0; 
              color: #404040; 
              page-break-after: avoid;
            }
            p { 
              margin: 8px 0; 
              orphans: 3; 
              widows: 3; 
            }
            strong { font-weight: 600; }
            em { font-style: italic; }
            ul, ol { 
              margin: 8px 0; 
              padding-left: 20px;
              page-break-inside: avoid;
            }
            li { 
              margin: 4px 0;
              page-break-inside: avoid;
            }
            hr { 
              margin: 16px 0; 
              border: none; 
              border-top: 1px solid #e0e0e0;
              page-break-after: avoid;
            }
            a { color: #0066cc; text-decoration: none; }
          </style>
        </head>
        <body>
          ${pageContents}
        </body>
        </html>
      `;
    }
    
    // 发送到后端 Puppeteer 服务
    const response = await fetch('/api/pdf-export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        options: {
          format: 'A4',
          margin: {
            top: '15mm',
            right: '15mm',
            bottom: '15mm',
            left: '15mm'
          },
          printBackground: true,
          preferCSSPageSize: true
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`PDF导出失败: ${response.statusText}`);
    }
    
    // 下载PDF
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const personalInfo = searchParams.get('personalInfo');
    let fileName = 'resume.pdf';
    if (personalInfo) {
      try {
        const info = JSON.parse(decodeURIComponent(personalInfo));
        fileName = `${info.name || 'resume'}_简历_${selectedTemplate?.name || 'default'}.pdf`;
      } catch (e) {
        fileName = `简历_${selectedTemplate?.name || 'default'}.pdf`;
      }
    }
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    if (!markdownContent) return;
    
    setIsGeneratingPDF(true);
    try {
      // 直接使用Puppeteer方案
      await handlePuppeteerPDFExport();
    } catch (err) {
      console.error('PDF生成失败:', err);
      alert('PDF生成失败，请重试。错误信息：' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleGoBack = () => {
    router.push('/resume-generator');
  };

  const handleCreateNew = () => {
    router.push('/resume-generator');
  };

  const handleTemplateSelect = (template: ResumeTemplate) => {
    setSelectedTemplate(template);
    setShowTemplatePicker(false);
    // 可以添加一个简单的成功提示
    console.log('模板已切换为:', template.name);
  };

  const handleTemplatePreview = (template: ResumeTemplate) => {
    setPreviewTemplate(template);
    setShowTemplatePreview(true);
  };

  const handleClosePreview = () => {
    setShowTemplatePreview(false);
    setPreviewTemplate(null);
  };

  const handleSelectFromPreview = () => {
    if (previewTemplate) {
      setSelectedTemplate(previewTemplate);
      setShowTemplatePreview(false);
      setPreviewTemplate(null);
    }
  };

  if (!markdownContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            加载中...
          </h1>
          <p className="text-gray-600">
            正在加载简历内容
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部操作栏 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回编辑
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                简历生成结果
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleCopyMarkdown}
                className="flex items-center"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    复制Markdown
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownloadMarkdown}
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                下载MD
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowTemplatePicker(true)}
                className="flex items-center"
              >
                <Palette className="w-4 h-4 mr-2" />
                选择模板
              </Button>
              
              <Button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGeneratingPDF ? '生成PDF中...' : '下载PDF'}
              </Button>
              
              <Button
                variant="secondary"
                onClick={handleCreateNew}
              >
                创建新简历
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 当前选中模板显示 */}
        {selectedTemplate && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-6 h-6 rounded"
                  style={{ background: selectedTemplate.backgroundColor }}
                ></div>
                <div>
                  <h3 className="font-semibold text-blue-900">
                    当前模板：{selectedTemplate.name}
                  </h3>
                  <p className="text-blue-700 text-sm">
                    {selectedTemplate.description}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplatePicker(true)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Palette className="w-4 h-4 mr-2" />
                更换模板
              </Button>
            </div>
          </div>
        )}

        {/* Markdown 源码 - 全宽显示 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Markdown 源码</CardTitle>
            <CardDescription>
              可以复制此内容到其他Markdown编辑器中使用
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {safeDecodeURIComponent(markdownContent)}
              </pre>
            </div>
            {/* 内容长度提示 */}
            <div className="mt-3 text-xs text-gray-500 text-center">
              内容长度: {safeDecodeURIComponent(markdownContent).length} 字符
              {safeDecodeURIComponent(markdownContent).length > 3000 && 
                <span className="ml-2 text-blue-600">• 可能需要多页显示</span>
              }
            </div>
          </CardContent>
        </Card>

        {/* 完整简历预览 */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>完整简历预览</CardTitle>
                  <CardDescription>
                    {selectedTemplate ? 
                      `这是使用 ${selectedTemplate.name} 模板的完整简历版本，可用于最终确认格式和内容` :
                      '这是简历的完整版本，可用于最终确认格式和内容'
                    }
                  </CardDescription>
                </div>
                
                {/* 缩放控制器 */}
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewScale(Math.max(0.2, previewScale - 0.1))}
                    disabled={previewScale <= 0.2}
                    className="p-2 h-8 w-8"
                    title="缩小 (Ctrl + -)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  
                  <div className="text-sm text-gray-600 min-w-[60px] text-center font-medium">
                    {Math.round(previewScale * 100)}%
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewScale(Math.min(1.5, previewScale + 0.1))}
                    disabled={previewScale >= 1.5}
                    className="p-2 h-8 w-8"
                    title="放大 (Ctrl + +)"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  
                  <div className="w-px h-6 bg-gray-300"></div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewScale(0.6)}
                    className="p-2 h-8 w-8"
                    title="重置缩放 (Ctrl + 0)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-6 rounded-lg overflow-auto">
                <div 
                  className="flex justify-center items-start min-h-[400px]"
                  style={{
                    // 动态调整容器高度以适应缩放内容
                    minHeight: `${400 * previewScale}px`
                  }}
                >
                  {selectedTemplate ? (
                    <div 
                      className="transition-transform duration-200 ease-in-out origin-top"
                      style={{ 
                        transform: `scale(${previewScale})`,
                        marginBottom: `${(1 - previewScale) * 200}px` // 调整底部边距以避免重叠
                      }}
                    >
                      <PaginatedTemplateRenderer 
                        template={selectedTemplate}
                        content={safeDecodeURIComponent(markdownContent)}
                        scale={1} // 使用外部缩放控制，组件内部不缩放
                        showPageNumbers={true}
                      />
                    </div>
                  ) : (
                    <div 
                      className="bg-white p-8 border border-gray-200 rounded-lg transition-transform duration-200 ease-in-out origin-top shadow-sm"
                      style={{ 
                        transform: `scale(${previewScale})`,
                        marginBottom: `${(1 - previewScale) * 200}px`
                      }}
                    >
                      <MarkdownRenderer content={safeDecodeURIComponent(markdownContent)} />
                    </div>
                  )}
                </div>
                
                {/* 缩放提示 */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    💡 提示：使用 Ctrl/Cmd + +/- 键可快速缩放，Ctrl/Cmd + 0 重置缩放
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 成功提示和操作指南 */}
        <div className="mt-8">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    简历生成成功！
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>您的简历已成功生成。您可以：</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>复制Markdown源码到其他编辑器中继续编辑</li>
                      <li>下载Markdown文件保存到本地</li>
                      <li>使用缩放功能查看简历的不同显示比例</li>
                      <li>点击"下载PDF"直接生成PDF版本</li>
                      <li>分享给他人或用于求职投递</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 模板选择器 - 底部弹出Modal */}
      {showTemplatePicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          {/* 点击遮罩关闭 */}
          <div 
            className="absolute inset-0"
            onClick={() => setShowTemplatePicker(false)}
          />
          
          {/* Modal内容 */}
          <div className="relative bg-white rounded-t-2xl w-full max-w-6xl max-h-[85vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            {/* Modal头部 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">选择简历模板</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    选择一个适合您职位的专业模板
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplatePicker(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Modal内容区域 */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resumeTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedTemplate?.id === template.id
                        ? 'ring-2 ring-blue-500 shadow-lg'
                        : 'hover:shadow-sm'
                    }`}
                  >
                    <CardContent className="p-4">
                      {/* 模板预览区域 */}
                      <div 
                        className="w-full h-32 rounded-lg mb-3 relative overflow-hidden"
                        style={{ 
                          background: template.backgroundColor,
                        }}
                      >
                        {/* 模拟简历内容预览 */}
                        <div className="absolute inset-2 bg-white/95 rounded-md p-2 text-xs">
                          <div 
                            className="h-2 rounded mb-1"
                            style={{ backgroundColor: template.accentColor, width: '60%' }}
                          />
                          <div className="h-1 bg-gray-300 rounded mb-1" style={{ width: '80%' }} />
                          <div className="h-1 bg-gray-300 rounded mb-1" style={{ width: '70%' }} />
                          <div className="h-1 bg-gray-300 rounded mb-1" style={{ width: '90%' }} />
                          <div 
                            className="h-1 rounded mb-1"
                            style={{ backgroundColor: template.accentColor, width: '45%', opacity: 0.7 }}
                          />
                          <div className="h-1 bg-gray-300 rounded" style={{ width: '75%' }} />
                        </div>
                        
                        {/* 选中状态指示器 */}
                        {selectedTemplate?.id === template.id && (
                          <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      
                      {/* 模板信息 */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-gray-900">
                          {template.name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {template.description}
                        </p>
                        
                        {/* 操作按钮 */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTemplatePreview(template)}
                            className="flex-1 text-xs h-8"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            预览
                          </Button>
                          <Button
                            variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTemplateSelect(template)}
                            className="flex-1 text-xs h-8"
                          >
                            {selectedTemplate?.id === template.id ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                已选择
                              </>
                            ) : (
                              '选择'
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 模板预览 */}
      {showTemplatePreview && previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          content={safeDecodeURIComponent(markdownContent || '')}
          isOpen={showTemplatePreview}
          onClose={handleClosePreview}
          onSelect={handleSelectFromPreview}
        />
      )}

      {/* 打印样式 */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:mt-0 {
            margin-top: 0 !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:border-none {
            border: none !important;
          }
          
          .print\\:bg-transparent {
            background: transparent !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ResumeResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            加载中...
          </h1>
          <p className="text-gray-600">
            正在加载简历结果
          </p>
        </div>
      </div>
    }>
      <ResumeResultContent />
    </Suspense>
  );
}
