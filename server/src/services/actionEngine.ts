import DailySummary from '../models/DailySummary.js';
import { AIEngine } from '../utils/aiEngine.js';
import mongoose from 'mongoose';

export interface BusinessAction {
  title: string;
  description: string;
  category: 'revenue' | 'expense' | 'customer';
  priority: 'high' | 'medium' | 'low';
  impact: string;
  timeToExecute: string;
}

export class ActionEngine {
  /**
   * Run the daily audit and generate 3 focused actions
   */
  static async generateDailyActions(businessId: mongoose.Types.ObjectId): Promise<BusinessAction[]> {
    console.log(`🧠 Actions: Auditing business ${businessId}...`);

    // 1. Get recent metrics from Read Model
    const summaries = await DailySummary.find({ businessId })
      .sort({ date: -1 })
      .limit(7); // Last 7 days

    if (summaries.length === 0) return this.generateDefaultActions();

    const latest = summaries[0];
    const previous = summaries[1] || latest;
    
    const revenueDrop = latest.totalRevenue < previous.totalRevenue * 0.9;
    const expenseSpike = latest.totalExpenses > previous.totalExpenses * 1.1;

    // 2. Build prompt for AI Generator
    const prompt = `
      AUDIT DATA:
      - 24h Revenue: $${latest.totalRevenue} (Previous: $${previous.totalRevenue})
      - 24h Expenses: $${latest.totalExpenses} (Previous: $${previous.totalExpenses})
      - New Customers: ${latest.newCustomers}
      - Total Orders: ${latest.totalOrders}

      CORE PROBLEMS:
      ${revenueDrop ? "- Revenue dropped >10% since yesterday." : ""}
      ${expenseSpike ? "- Expenses spiked >10% since yesterday." : ""}
      
      Generate exactly 3 actionable, revenue-focused tasks for the business owner.
      Each must be under 1 hour to execute.

      Return JSON array:
      [ { "title": "name", "description": "how-to", "category": "revenue/expense/customer", "priority": "high/medium/low", "impact": "description", "timeToExecute": "mins" } ]
    `;

    try {
      const response = await AIEngine.generateCompletion(prompt);
      return JSON.parse(response.content);
    } catch (e) {
      console.error('❌ Actions: Generation failed', e);
      return this.generateDefaultActions();
    }
  }

  private static generateDefaultActions(): BusinessAction[] {
    return [
      { 
        title: 'Review Inventory', 
        description: 'Update stock levels for top sellers.', 
        category: 'revenue', 
        priority: 'medium', 
        impact: 'Prevent stockouts', 
        timeToExecute: '30 mins' 
      },
      { 
        title: 'Social Post', 
        description: 'Post a highlight video of your best product.', 
        category: 'customer', 
        priority: 'high', 
        impact: 'Improve engagement', 
        timeToExecute: '15 mins' 
      },
      { 
        title: 'Audit Invoices', 
        description: 'Check for pending payments from clients.', 
        category: 'revenue', 
        priority: 'high', 
        impact: 'Improve cash flow', 
        timeToExecute: '45 mins' 
      }
    ];
  }
}
