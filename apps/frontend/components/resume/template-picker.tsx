'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Eye } from 'lucide-react';
import { ResumeTemplate, resumeTemplates } from '@/lib/resume-templates';

interface TemplatePickerProps {
  selectedTemplate: ResumeTemplate | null;
  onTemplateSelect: (template: ResumeTemplate) => void;
  onPreview: (template: ResumeTemplate) => void;
}

export default function TemplatePicker({ selectedTemplate, onTemplateSelect, onPreview }: TemplatePickerProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">选择简历模板</h2>
        <p className="text-gray-600">
          选择一个适合您职位的专业模板，点击预览查看效果
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resumeTemplates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
              selectedTemplate?.id === template.id
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'hover:shadow-md'
            }`}
            onMouseEnter={() => setHoveredTemplate(template.id)}
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            <CardHeader className="pb-4">
              <div className="relative">
                {/* 模板预览区域 */}
                <div 
                  className="w-full h-48 rounded-lg mb-4 relative overflow-hidden"
                  style={{ 
                    background: template.backgroundColor,
                  }}
                >
                  {/* 模拟简历内容预览 */}
                  <div className="absolute inset-4 bg-white/95 rounded-lg p-4 text-xs">
                    <div 
                      className="h-3 rounded mb-3"
                      style={{ backgroundColor: template.accentColor, width: '60%' }}
                    ></div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-300 rounded w-full"></div>
                      <div className="h-2 bg-gray-300 rounded w-4/5"></div>
                      <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                    </div>
                    <div 
                      className="h-2 rounded mt-4 mb-2"
                      style={{ backgroundColor: template.accentColor, width: '40%' }}
                    ></div>
                    <div className="space-y-1">
                      <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                      <div className="h-1.5 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-1.5 bg-gray-200 rounded w-4/5"></div>
                    </div>
                  </div>

                  {/* 选中标记 */}
                  {selectedTemplate?.id === template.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* 悬停预览按钮 */}
                  {hoveredTemplate === template.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white text-gray-900 hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview(template);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        预览
                      </Button>
                    </div>
                  )}
                </div>

                <CardTitle className="text-lg font-semibold">
                  {template.name}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {template.description}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 capitalize">
                    {template.style}
                  </span>
                </div>
                <Button
                  variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTemplateSelect(template)}
                >
                  {selectedTemplate?.id === template.id ? '已选择' : '选择'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTemplate && (
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <h3 className="font-semibold text-blue-900">
                已选择模板：{selectedTemplate.name}
              </h3>
              <p className="text-blue-700 text-sm">
                {selectedTemplate.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
