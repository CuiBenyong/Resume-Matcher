/**
 * 统一的分页工具函数
 * 确保预览和导出使用相同的分页逻辑
 */

export interface PaginationConfig {
  maxLinesPerPage: number;
  sectionBreakThreshold: number;
  subSectionBreakThreshold: number;
}

// 默认分页配置
export const DEFAULT_PAGINATION_CONFIG: PaginationConfig = {
  maxLinesPerPage: 45, // 基础行数限制
  sectionBreakThreshold: 0.7, // 主要章节分页阈值
  subSectionBreakThreshold: 0.8, // 子章节分页阈值
};

/**
 * 统一的智能分页函数
 * @param content Markdown内容
 * @param config 分页配置
 * @returns 分页后的内容数组
 */
export function splitContentIntoPages(
  content: string, 
  config: PaginationConfig = DEFAULT_PAGINATION_CONFIG
): string[] {
  const lines = content.split('\n');
  const pages: string[] = [];
  let currentPage: string[] = [];
  let currentLines = 0;
  
  const { maxLinesPerPage, sectionBreakThreshold, subSectionBreakThreshold } = config;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // 计算行高权重
    let lineWeight = 1;
    if (trimmedLine.match(/^#{1}\s/)) {
      lineWeight = 2.5; // H1标题
    } else if (trimmedLine.match(/^#{2}\s/)) {
      lineWeight = 2; // H2标题
    } else if (trimmedLine.match(/^#{3}\s/)) {
      lineWeight = 1.5; // H3标题
    } else if (trimmedLine.length > 100) {
      lineWeight = Math.ceil(trimmedLine.length / 80); // 长行
    }
    
    const isNewSection = trimmedLine.match(/^#{1,2}\s/); // 主要章节
    const isSubSection = trimmedLine.match(/^#{3}\s/); // 子章节
    
    // 智能分页决策
    const shouldPageBreak = (
      // 主要章节且当前页已有内容且接近满页
      (isNewSection && currentLines > 15 && currentLines + lineWeight > maxLinesPerPage * sectionBreakThreshold) ||
      // 子章节且当前页内容较多
      (isSubSection && currentLines > 25 && currentLines + lineWeight > maxLinesPerPage * subSectionBreakThreshold) ||
      // 超过最大行数限制
      (currentLines + lineWeight > maxLinesPerPage && currentPage.length > 5)
    );
    
    if (shouldPageBreak) {
      if (currentPage.length > 0) {
        pages.push(currentPage.join('\n'));
        currentPage = [];
        currentLines = 0;
      }
    }
    
    currentPage.push(line);
    currentLines += lineWeight;
  }
  
  if (currentPage.length > 0) {
    pages.push(currentPage.join('\n'));
  }
  
  // 确保至少有一页
  return pages.length > 0 ? pages : [content];
}

/**
 * 获取内容的预计页数
 * @param content Markdown内容
 * @param config 分页配置
 * @returns 预计页数
 */
export function getEstimatedPageCount(
  content: string, 
  config: PaginationConfig = DEFAULT_PAGINATION_CONFIG
): number {
  return splitContentIntoPages(content, config).length;
}

/**
 * 生成分页调试信息
 * @param content Markdown内容
 * @param config 分页配置
 * @returns 调试信息
 */
export function getPaginationDebugInfo(
  content: string, 
  config: PaginationConfig = DEFAULT_PAGINATION_CONFIG
) {
  const pages = splitContentIntoPages(content, config);
  return {
    totalLength: content.length,
    totalLines: content.split('\n').length,
    pagesCount: pages.length,
    pagesSummary: pages.map((page, index) => ({
      pageIndex: index + 1,
      lines: page.split('\n').length,
      characters: page.length,
      firstLine: page.split('\n')[0]?.trim() || '',
      lastLine: page.split('\n').slice(-1)[0]?.trim() || '',
    })),
    config,
  };
}
