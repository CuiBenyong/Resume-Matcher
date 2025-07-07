/**
 * 现代CSS颜色函数支持工具
 * 提供oklch, color(), lab(), lch()等现代颜色函数的转换和兼容性支持
 */

import * as culori from 'culori';

export interface ColorConversionOptions {
  fallbackColor?: string;
  targetColorSpace?: 'rgb' | 'hsl' | 'hex';
  preserveAlpha?: boolean;
  precision?: number;
}

/**
 * 现代颜色函数转换器
 */
export class ModernColorConverter {
  private defaultOptions: ColorConversionOptions = {
    fallbackColor: '#333333',
    targetColorSpace: 'hex',
    preserveAlpha: true,
    precision: 3
  };

  /**
   * 转换现代CSS颜色函数为兼容格式
   * @param colorValue 颜色值字符串
   * @param options 转换选项
   * @returns 转换后的颜色值
   */
  convertColor(colorValue: string, options?: ColorConversionOptions): string {
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      // 检查是否为现代颜色函数
      if (!this.isModernColorFunction(colorValue)) {
        return colorValue; // 已经是兼容格式，直接返回
      }

      // 使用 culori 解析颜色
      const parsedColor = culori.parse(colorValue);
      
      if (!parsedColor) {
        console.warn(`无法解析颜色值: ${colorValue}, 使用fallback颜色`);
        return opts.fallbackColor!;
      }

      // 根据目标颜色空间转换
      let convertedColor: string;
      switch (opts.targetColorSpace) {
        case 'rgb':
          convertedColor = culori.formatRgb(parsedColor);
          break;
        case 'hsl':
          convertedColor = culori.formatHsl(parsedColor);
          break;
        case 'hex':
        default:
          convertedColor = culori.formatHex(parsedColor);
          break;
      }
      
      return convertedColor || opts.fallbackColor!;
      
    } catch (error) {
      console.warn(`颜色转换失败: ${colorValue}`, error);
      return opts.fallbackColor!;
    }
  }

  /**
   * 检查是否为现代颜色函数
   */
  private isModernColorFunction(colorValue: string): boolean {
    if (!colorValue || typeof colorValue !== 'string') return false;
    
    const modernFunctions = ['oklch', 'oklab', 'lch', 'lab', 'color'];
    return modernFunctions.some(func => 
      colorValue.toLowerCase().includes(`${func}(`)
    );
  }

  /**
   * 批量转换CSS样式中的颜色
   */
  convertCSSColors(cssText: string, options?: ColorConversionOptions): string {
    const opts = { ...this.defaultOptions, ...options };
    
    // 匹配各种颜色属性的正则表达式
    const colorPatterns = [
      // oklch函数 - oklch(L C H / alpha)
      /oklch\(\s*[^)]+\s*\)/gi,
      // oklab函数 - oklab(L a b / alpha)
      /oklab\(\s*[^)]+\s*\)/gi,
      // lch函数 - lch(L C H / alpha)  
      /lch\(\s*[^)]+\s*\)/gi,
      // lab函数 - lab(L a b / alpha)
      /lab\(\s*[^)]+\s*\)/gi,
      // color函数 - color(colorspace values / alpha)
      /color\(\s*[^)]+\s*\)/gi
    ];

    let result = cssText;
    
    colorPatterns.forEach(pattern => {
      result = result.replace(pattern, (match) => {
        return this.convertColor(match, opts);
      });
    });

    return result;
  }

  /**
   * 为HTML元素转换现代颜色函数
   */
  convertElementColors(element: HTMLElement, options?: ColorConversionOptions): void {
    const opts = { ...this.defaultOptions, ...options };
    
    // 转换内联样式
    if (element.style.cssText) {
      element.style.cssText = this.convertCSSColors(element.style.cssText, opts);
    }

    // 处理特定的样式属性
    const colorProperties = [
      'color', 'backgroundColor', 'borderColor', 'borderTopColor', 
      'borderRightColor', 'borderBottomColor', 'borderLeftColor',
      'outlineColor', 'textDecorationColor', 'fill', 'stroke',
      'background', 'backgroundImage'
    ];

    colorProperties.forEach(prop => {
      const value = element.style.getPropertyValue(prop);
      if (value && this.containsModernColorFunction(value)) {
        const convertedValue = this.convertCSSColors(value, opts);
        element.style.setProperty(prop, convertedValue);
      }
    });

    // 递归处理子元素
    Array.from(element.children).forEach(child => {
      if (child instanceof HTMLElement) {
        this.convertElementColors(child, opts);
      }
    });
  }

  /**
   * 检查CSS值是否包含现代颜色函数
   */
  private containsModernColorFunction(cssValue: string): boolean {
    if (!cssValue || typeof cssValue !== 'string') return false;
    
    const modernFunctions = ['oklch(', 'oklab(', 'lch(', 'lab(', 'color('];
    return modernFunctions.some(func => 
      cssValue.toLowerCase().includes(func)
    );
  }

  /**
   * 为PDF导出优化的颜色转换
   */
  convertForPDFExport(element: HTMLElement): void {
    const pdfOptions: ColorConversionOptions = {
      fallbackColor: '#333333',
      targetColorSpace: 'hex', // PDF导出最好用hex格式
      preserveAlpha: true,
      precision: 6
    };

    // 首先转换现代颜色函数
    this.convertElementColors(element, pdfOptions);
    
    // 等待样式应用
    window.getComputedStyle(element).color; // 强制样式计算
    
    // 额外处理计算样式，确保兼容性
    this.processComputedStyles(element);
    
    // 递归处理所有子元素
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        this.processComputedStyles(el);
      }
    });
  }

  /**
   * 处理计算样式，确保颜色兼容性
   */
  private processComputedStyles(element: HTMLElement): void {
    const computedStyle = window.getComputedStyle(element);
    
    // 强制应用计算后的颜色值，避免现代颜色函数
    const colorProps = [
      { computed: 'color', style: 'color' },
      { computed: 'backgroundColor', style: 'backgroundColor' },
      { computed: 'borderColor', style: 'borderColor' },
      { computed: 'borderTopColor', style: 'borderTopColor' },
      { computed: 'borderRightColor', style: 'borderRightColor' },
      { computed: 'borderBottomColor', style: 'borderBottomColor' },
      { computed: 'borderLeftColor', style: 'borderLeftColor' }
    ];

    colorProps.forEach(({ computed, style }) => {
      const value = computedStyle.getPropertyValue(computed);
      if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
        // 确保是标准格式
        try {
          const parsed = culori.parse(value);
          if (parsed) {
            const hexColor = culori.formatHex(parsed);
            if (hexColor) {
              element.style.setProperty(style, hexColor);
            }
          }
        } catch (error) {
          // 如果解析失败，保持原值
          element.style.setProperty(style, value);
        }
      }
    });
  }

  /**
   * 创建颜色兼容性检查器
   */
  static createCompatibilityChecker() {
    return {
      supportsOklch: (): boolean => {
        try {
          const testDiv = document.createElement('div');
          testDiv.style.color = 'oklch(0.7 0.15 180)';
          document.body.appendChild(testDiv);
          const computed = window.getComputedStyle(testDiv).color;
          document.body.removeChild(testDiv);
          return computed !== '' && computed !== 'rgb(0, 0, 0)';
        } catch {
          return false;
        }
      },
      
      supportsColorFunction: (): boolean => {
        try {
          const testDiv = document.createElement('div');
          testDiv.style.color = 'color(srgb 1 0 0)';
          document.body.appendChild(testDiv);
          const computed = window.getComputedStyle(testDiv).color;
          document.body.removeChild(testDiv);
          return computed !== '' && computed !== 'rgb(0, 0, 0)';
        } catch {
          return false;
        }
      },

      getSupport: () => {
        const checker = ModernColorConverter.createCompatibilityChecker();
        return {
          oklch: checker.supportsOklch(),
          colorFunction: checker.supportsColorFunction(),
          userAgent: navigator.userAgent,
          culoriVersion: 'installed' // culori库已安装
        };
      }
    };
  }

  /**
   * 预处理模板颜色配置
   */
  preprocessTemplateColors(templateConfig: any): any {
    const processed = { ...templateConfig };
    
    const colorFields = ['backgroundColor', 'textColor', 'accentColor'];
    colorFields.forEach(field => {
      if (processed[field]) {
        processed[field] = this.convertColor(processed[field], {
          targetColorSpace: 'hex',
          fallbackColor: field === 'backgroundColor' ? '#ffffff' : '#333333'
        });
      }
    });
    
    return processed;
  }

  /**
   * 专为 Canvas 兼容性优化的颜色转换
   * Canvas 不支持现代颜色函数，需要完全转换为 RGB/HEX
   */
  convertForCanvasCompatibility(element: HTMLElement): void {
    // 递归处理所有元素
    const processElement = (el: HTMLElement) => {
      // 处理内联样式
      if (el.style.cssText) {
        el.style.cssText = this.convertCSSColors(el.style.cssText, {
          targetColorSpace: 'rgb',
          fallbackColor: '#333333',
          preserveAlpha: true
        });
      }

      // 处理所有可能的颜色属性
      const colorProperties = [
        'color', 'backgroundColor', 'borderColor', 'borderTopColor', 
        'borderRightColor', 'borderBottomColor', 'borderLeftColor',
        'outlineColor', 'textDecorationColor', 'fill', 'stroke',
        'backgroundImage'
      ];

      colorProperties.forEach(prop => {
        const value = el.style.getPropertyValue(prop);
        if (value && this.containsModernColorFunction(value)) {
          const convertedValue = this.convertCanvasColor(value);
          el.style.setProperty(prop, convertedValue, 'important');
        }
      });

      // 特殊处理背景渐变
      const background = el.style.background;
      if (background && (background.includes('oklch') || background.includes('gradient'))) {
        el.style.setProperty('background', this.convertGradientColors(background), 'important');
      }
    };

    // 处理根元素
    processElement(element);

    // 处理所有子元素
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        processElement(el);
      }
    });

    // 强制样式重新计算
    window.getComputedStyle(element).color;
  }

  /**
   * 专门处理 OKLCH 颜色转换为 Canvas 兼容格式
   */
  convertOKLCHtoCanvasCompatible(oklchValue: string): string {
    try {
      // 更精确的 OKLCH 解析和转换
      const oklchMatch = oklchValue.match(/oklch\(\s*([^)]+)\s*\)/i);
      if (!oklchMatch) return '#333333';
      
      const values = oklchMatch[1].split(/\s+|,/).map(v => v.trim()).filter(v => v);
      
      if (values.length >= 3) {
        // 解析 L, C, H 值
        const L = parseFloat(values[0].replace('%', '')) / (values[0].includes('%') ? 100 : 1);
        const C = parseFloat(values[1]);
        const H = parseFloat(values[2]);
        const alpha = values.length > 3 ? parseFloat(values[3]) : 1;
        
        // 使用culori进行更精确的转换
        const oklchColor = { mode: 'oklch' as const, l: L, c: C, h: H, alpha };
        const rgbColor = culori.formatRgb(oklchColor);
        
        return rgbColor || this.fallbackColorForOKLCH(L, C, H, alpha);
      }
      
      return '#333333';
    } catch (error) {
      console.warn(`OKLCH转换失败: ${oklchValue}`, error);
      return '#333333';
    }
  }

  /**
   * OKLCH 转换失败时的fallback颜色生成
   */
  private fallbackColorForOKLCH(L: number, C: number, H: number, alpha?: number): string {
    // 基于亮度生成灰阶颜色作为备选
    const gray = Math.round(L * 255);
    const r = Math.max(0, Math.min(255, gray + (C * Math.cos(H * Math.PI / 180) * 50)));
    const g = Math.max(0, Math.min(255, gray));
    const b = Math.max(0, Math.min(255, gray + (C * Math.sin(H * Math.PI / 180) * 50)));
    
    if (alpha !== undefined && alpha < 1) {
      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
    }
    
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }

  /**
   * 转换单个颜色为 Canvas 兼容格式
   */
  private convertCanvasColor(colorValue: string): string {
    try {
      // 优先处理 OKLCH 颜色
      if (colorValue.toLowerCase().includes('oklch(')) {
        return this.convertOKLCHtoCanvasCompatible(colorValue);
      }
      
      // 检查是否包含其他现代颜色函数
      if (this.containsModernColorFunction(colorValue)) {
        const parsed = culori.parse(colorValue);
        if (parsed) {
          // 转换为 RGB 格式，Canvas 完全支持
          const rgbColor = culori.formatRgb(parsed);
          return rgbColor || '#333333';
        }
      }
      return colorValue;
    } catch (error) {
      console.warn(`Canvas颜色转换失败: ${colorValue}`, error);
      return '#333333';
    }
  }

  /**
   * 转换渐变中的现代颜色函数
   */
  private convertGradientColors(gradientValue: string): string {
    // 匹配渐变中的颜色值
    const modernColorPattern = /(oklch|oklab|lch|lab|color)\s*\([^)]+\)/gi;
    
    return gradientValue.replace(modernColorPattern, (match) => {
      return this.convertCanvasColor(match);
    });
  }

  /**
   * 创建 Canvas 兼容的样式表
   */
  generateCanvasCompatibleCSS(originalCSS: string): string {
    return this.convertCSSColors(originalCSS, {
      targetColorSpace: 'rgb',
      fallbackColor: '#333333',
      preserveAlpha: true
    });
  }

  /**
   * 检查并修复 Canvas 渲染问题
   */
  validateCanvasCompatibility(element: HTMLElement): { 
    isCompatible: boolean; 
    issues: string[]; 
    fixedElement?: HTMLElement 
  } {
    const issues: string[] = [];
    let isCompatible = true;

    const checkElement = (el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      
      // 检查关键颜色属性
      ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
        const value = style.getPropertyValue(prop);
        if (value && this.containsModernColorFunction(value)) {
          issues.push(`元素包含不兼容的颜色函数 ${prop}: ${value}`);
          isCompatible = false;
        }
      });
    };

    // 检查根元素和所有子元素
    checkElement(element);
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        checkElement(el);
      }
    });

    // 如果发现问题，创建修复版本
    let fixedElement: HTMLElement | undefined;
    if (!isCompatible) {
      fixedElement = element.cloneNode(true) as HTMLElement;
      this.convertForCanvasCompatibility(fixedElement);
    }

    return {
      isCompatible,
      issues,
      fixedElement
    };
  }
}

// 默认导出实例
export const colorConverter = new ModernColorConverter();

// 便捷函数
export const convertModernColors = (cssText: string, options?: ColorConversionOptions) => 
  colorConverter.convertCSSColors(cssText, options);

export const prepareElementForPDF = (element: HTMLElement) => 
  colorConverter.convertForPDFExport(element);

export const prepareElementForCanvas = (element: HTMLElement) => 
  colorConverter.convertForCanvasCompatibility(element);

export const validateCanvasColors = (element: HTMLElement) => 
  colorConverter.validateCanvasCompatibility(element);

export const checkColorSupport = () => 
  ModernColorConverter.createCompatibilityChecker().getSupport();

export const convertOKLCHForCanvas = (oklchValue: string) => 
  colorConverter.convertOKLCHtoCanvasCompatible(oklchValue);

export const preprocessTemplateColors = (templateConfig: any) =>
  colorConverter.preprocessTemplateColors(templateConfig);
