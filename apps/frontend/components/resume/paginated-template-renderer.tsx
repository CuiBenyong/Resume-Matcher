'use client';

import React, { useState, useEffect } from 'react';
import { ResumeTemplate, generateTemplateHTML } from '@/lib/resume-templates';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
// 使用统一的分页工具
import { splitContentIntoPages, getPaginationDebugInfo } from '@/lib/pagination-utils';

interface PaginatedTemplateRendererProps {
  template: ResumeTemplate | null;
  content: string;
  className?: string;
  scale?: number;
  showPageNumbers?: boolean;
}

// 生成带分页的模板HTML
function generatePaginatedTemplateHTML(template: ResumeTemplate, content: string, pageNumber: number, totalPages: number): string {
  // 直接使用模板库中的函数生成HTML
  const baseHTML = generateTemplateHTML(template, content);
  
  // 如果只有一页，直接返回
  if (totalPages <= 1) {
    return baseHTML;
  }
  
  // 为多页添加页码
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
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    ">
      第 ${pageNumber} 页，共 ${totalPages} 页
    </div>
  `;
  
  // 在最后的div之前插入页码
  return baseHTML.replace(/(<\/div>\s*<\/div>\s*)$/, pageNumberHTML + '$1');
}

export default function PaginatedTemplateRenderer({ 
  template, 
  content, 
  className = '',
  scale = 0.3,
  showPageNumbers = true
}: PaginatedTemplateRendererProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState<string[]>([]);

  useEffect(() => {
    if (content) {
      const splitPages = splitContentIntoPages(content);
      
      // 详细的调试信息
      const debugInfo = getPaginationDebugInfo(content);
      console.log('预览组件分页调试信息:', debugInfo);
      
      console.log('预览组件分页结果:', {
        originalLength: content.length,
        pagesCount: splitPages.length,
        pages: splitPages.map((page, index) => ({
          pageNumber: index + 1,
          length: page.length,
          lines: page.split('\n').length,
          preview: page.substring(0, 100) + '...'
        }))
      });
      setPages(splitPages);
      setCurrentPage(1);
    }
  }, [content]);

  if (!template || !content || pages.length === 0) {
    return (
      <div className={`prose prose-gray max-w-none ${className}`}>
        <div className="text-gray-500 text-center py-8">
          请选择一个模板来预览简历效果
        </div>
      </div>
    );
  }

  const totalPages = pages.length;
  const currentContent = pages[currentPage - 1] || content;

  // 生成当前页的HTML
  const templateHTML = generatePaginatedTemplateHTML(template, currentContent, currentPage, totalPages);

  // A4尺寸转换：210mm x 297mm = 794px x 1123px (at 96 DPI)
  const a4WidthPx = 794;
  const a4HeightPx = 1123;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return (
    <div className={`paginated-template-renderer ${className}`}>
      {/* 分页控制器 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              第 {currentPage} 页，共 {totalPages} 页
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="h-8 w-8 p-0 text-xs"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 页面内容 */}
      <div 
        className="template-content"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${a4WidthPx}px`,
          height: `${a4HeightPx}px`,
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          position: 'relative'
        }}
        dangerouslySetInnerHTML={{ __html: templateHTML }}
      />

      {/* 页面信息提示 */}
      {totalPages > 1 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-200">
            <FileText className="w-3 h-3 mr-1" />
            简历内容已自动分为 {totalPages} 页，PDF导出时将保持分页效果
          </div>
        </div>
      )}
    </div>
  );
}
