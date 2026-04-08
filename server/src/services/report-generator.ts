import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import { BusinessSummary } from './business-summary';
import { AIInsights } from './ai-insights';
import { Business } from '../models/Business';

interface ReportOptions {
  includeCharts?: boolean;
  includeRecommendations?: boolean;
  includeTransactions?: boolean;
  period?: 'month' | 'quarter' | 'year';
}

export class ReportGenerator {
  private static readonly REPORTS_DIR = path.join(process.cwd(), 'uploads', 'reports');

  static async createMonthly(
    businessId: string, 
    options: ReportOptions = {}
  ): Promise<string> {
    await mkdir(this.REPORTS_DIR, { recursive: true });

    const business = await Business.findById(businessId);
    if (!business) throw new Error('Business not found');

    const summary = await BusinessSummary.get(businessId, options.period || 'month');
    const insights = await AIInsights.getQuickSummary(businessId);
    const analysis = await AIInsights.getDetailedAnalysis(businessId);

    const filename = `BHIE_Report_${business.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    const filepath = path.join(this.REPORTS_DIR, filename);

    const doc = new PDFDocument();
    const stream = createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc.fontSize(24).text('BHIE Business Report', 50, 50);
    doc.fontSize(14).text(business.name, 50, 80);
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 50, 100);

    // Executive Summary
    doc.fontSize(16).text('Executive Summary', 50, 140);
    doc.fontSize(11);
    doc.text(`Financial Health: ${analysis.financialHealth}`, 50, 170);
    doc.text(`Health Score: ${summary.healthScore}/100`, 50, 190);
    doc.text(`This Month's Performance:`, 50, 210);
    doc.text(`  • Income: ₹${summary.income.toLocaleString('en-IN')}`, 70, 230);
    doc.text(`  • Expenses: ₹${summary.expenses.toLocaleString('en-IN')}`, 70, 250);
    doc.text(`  • Net Profit: ₹${summary.profit.toLocaleString('en-IN')}`, 70, 270);

    // AI Insights
    doc.fontSize(16).text('AI Insights', 50, 310);
    doc.fontSize(11).text(insights.summary, 50, 340, { width: 500 });

    // Top Recommendations
    doc.fontSize(14).text('Top Recommendations', 50, 400);
    doc.fontSize(11);
    let y = 430;
    insights.actions.slice(0, 5).forEach((action, index) => {
      doc.text(`${index + 1}. ${action}`, 50, y, { width: 500 });
      y += 25;
    });

    // Expense Breakdown
    doc.addPage();
    doc.fontSize(16).text('Expense Breakdown', 50, 50);
    doc.fontSize(11);
    y = 80;
    analysis.expenseBreakdown.slice(0, 10).forEach((item, index) => {
      doc.text(`${index + 1}. ${item.category}: ₹${item.amount.toLocaleString('en-IN')}`, 50, y);
      y += 20;
    });

    // Footer
    doc.fontSize(10).text('Powered by BHIE - Business Health Implementation Ecosystem', 50, 750, { align: 'center' });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        // Return public URL (you'd configure this based on your CDN/storage)
        resolve(`${process.env.APP_URL}/uploads/reports/${filename}`);
      });
      stream.on('error', reject);
    });
  }

  static async generateInsightsPDF(businessId: string): Promise<Buffer> {
    const business = await Business.findById(businessId);
    const insights = await AIInsights.getDetailedAnalysis(businessId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text(`${business?.name || 'Business'} - AI Insights Report`, 50, 50);
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 50, 80);

      doc.fontSize(14).text('Financial Health Assessment', 50, 120);
      doc.fontSize(11).text(`Status: ${insights.financialHealth}`, 50, 145);
      doc.text(`Health Score: ${insights.trends.score}/100`, 50, 165);

      doc.fontSize(14).text('Predictions & Alerts', 50, 200);
      doc.fontSize(11);
      let y = 225;
      insights.predictions.forEach((prediction) => {
        doc.text(`• ${prediction}`, 50, y, { width: 500 });
        y += 25;
      });

      doc.end();
    });
  }
}
