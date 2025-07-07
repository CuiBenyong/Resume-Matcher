'use client';

import React from 'react';
import { ResumeTemplate, generateTemplateHTML } from '@/lib/resume-templates';

interface TemplateRendererProps {
  template: ResumeTemplate | null;
  content: string;
  className?: string;
  scale?: number;
}

export default function TemplateRenderer({ 
  template, 
  content, 
  className = '',
  scale = 0.3
}: TemplateRendererProps) {
  if (!template || !content) {
    return (
      <div className={`prose prose-gray max-w-none ${className}`}>
        <div className="text-gray-500 text-center py-8">
          请选择一个模板来预览简历效果
        </div>
      </div>
    );
  }

  const templateHTML = generateTemplateHTML(template, content);

  // A4尺寸转换：210mm x 297mm = 794px x 1123px (at 96 DPI)
  const a4WidthPx = 794;
  const a4HeightPx = 1123;

  return (
    <div className={`template-renderer ${className}`}>
      <div 
        className="template-content"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${a4WidthPx}px`,      // A4 宽度（像素）
          height: `${a4HeightPx}px`,    // A4 高度（像素）
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          backgroundColor: '#ffffff'
        }}
        dangerouslySetInnerHTML={{ __html: templateHTML }}
      />
    </div>
  );
}
