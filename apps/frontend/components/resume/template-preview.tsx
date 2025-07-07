'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { ResumeTemplate, generateTemplateHTML } from '@/lib/resume-templates';
import PaginatedTemplateRenderer from './paginated-template-renderer';

interface TemplatePreviewProps {
  template: ResumeTemplate | null;
  content: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: () => void;
}

export default function TemplatePreview({ 
  template, 
  content, 
  isOpen, 
  onClose, 
  onSelect 
}: TemplatePreviewProps) {
  if (!template) return null;

  const sampleContent = content || `
# 张三

**前端开发工程师**  
📞 138-8888-8888 | 📧 zhangsan@example.com | 🏠 北京市

## 个人信息
- 工作经验：3年
- 学历：本科
- 专业：计算机科学与技术

## 工作经验

### 高级前端开发工程师 | 某科技公司
*2022.03 - 至今*

- 负责公司核心产品的前端开发，使用React、TypeScript等技术栈
- 优化前端性能，首屏加载时间减少30%
- 建立前端组件库，提高团队开发效率

### 前端开发工程师 | 某互联网公司
*2021.01 - 2022.02*

- 参与多个Web应用的开发和维护
- 负责移动端H5页面开发，确保良好的用户体验
- 与UI设计师密切合作，还原设计稿

## 教育背景

### 北京大学 | 计算机科学与技术 | 本科
*2017.09 - 2021.06*

- GPA: 3.8/4.0
- 主要课程：数据结构、算法设计、计算机网络、数据库系统

## 技能清单

**前端技术：**
- JavaScript/TypeScript - 熟练
- React/Vue.js - 熟练  
- HTML5/CSS3 - 熟练
- Node.js - 了解

**工具：**
- Git/GitHub - 熟练
- Webpack/Vite - 熟练
- Docker - 了解
  `;

  const previewHTML = generateTemplateHTML(template, sampleContent);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            模板预览：{template.name}
          </DialogTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={onSelect}
              className="flex items-center space-x-2"
            >
              选择此模板
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* 预览区域 */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <div className="bg-white shadow-lg mx-auto" style={{ width: 'fit-content' }}>
              <PaginatedTemplateRenderer 
                template={template}
                content={sampleContent}
                scale={0.4}
                showPageNumbers={true}
              />
            </div>
          </div>

          {/* 模板信息 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">模板信息</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">名称：</span>
                <span className="text-gray-600">{template.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">风格：</span>
                <span className="text-gray-600 capitalize">{template.style}</span>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-700">描述：</span>
                <span className="text-gray-600">{template.description}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
