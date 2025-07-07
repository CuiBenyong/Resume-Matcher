import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const { html, options = {} } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // 启动 Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // 设置页面内容
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // 设置视口
    await page.setViewport({
      width: 794,  // A4 宽度 (210mm at 96 DPI)
      height: 1123 // A4 高度 (297mm at 96 DPI)
    });

    // 等待所有样式和内容加载完成
    await page.evaluate(() => {
      return new Promise((resolve) => {
        // 等待字体加载
        if (document.fonts) {
          document.fonts.ready.then(() => resolve(undefined));
        } else {
          setTimeout(() => resolve(undefined), 1000);
        }
      });
    });

    // 额外等待确保分页正确计算
    await new Promise(resolve => setTimeout(resolve, 500));

    // 生成 PDF
    const pdfOptions = {
      format: 'A4' as const,
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      },
      preferCSSPageSize: true,
      ...options
    };

    const pdfBuffer = await page.pdf(pdfOptions);

    // 关闭浏览器
    await browser.close();

    // 返回 PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"'
      }
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
