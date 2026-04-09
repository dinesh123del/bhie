import { Router } from 'express';
import multer from 'multer';
import momentIntelligenceService from '../services/momentIntelligenceService.js';
import RealTimeIntelligence from '../services/realTimeIntelligence.js';
import { IntentClassifier } from '../services/intent-classifier.js';
import { ExpenseRecorder } from '../services/expense-recorder.js';
import Record from '../models/Record.js';
import mongoose from 'mongoose';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const intentClassifier = new IntentClassifier();

/**
 * Capture and analyze a "moment" (frame + audio snippet)
 * POST /api/moment/capture
 */
router.post('/capture', upload.fields([
  { name: 'frame', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req: any, res) => {
  try {
    const files = req.files as any;
    const frameFile = files?.frame?.[0];
    const audioFile = files?.audio?.[0];
    const { context, businessId, userId } = req.body;

    const analysisResult = await momentIntelligenceService.analyzeMoment(
      frameFile?.buffer,
      audioFile?.buffer,
      context
    );

    // Broadcast the result via Socket.io if the system is available
    const realTimeIntel = req.app.locals.realTimeIntelligence as RealTimeIntelligence;
    if (realTimeIntel) {
      await realTimeIntel.publishEvent({
        type: 'insight',
        userId: userId || req.user?.id || 'anonymous',
        businessId: businessId || req.user?.businessId || 'global',
        data: {
          category: 'moment_intelligence',
          ...analysisResult
        },
        severity: 'low',
        priority: 3
      });
    }

    res.json({
      success: true,
      analysis: analysisResult
    });
  } catch (error) {
    console.error('Moment intelligence capture error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process moment intelligence'
    });
  }
});

/**
 * Direct execution of business actions based on speech/text
 * POST /api/moment/execute-action
 */
router.post('/execute-action', async (req: any, res) => {
  try {
    const { text, businessId, userId } = req.body;
    const effectiveUserId = userId || req.user?.id;
    const effectiveBusinessId = businessId || req.user?.businessId;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text required' });
    }

    const intent = await intentClassifier.classify(text);
    let actionResult: any = { type: intent.type, success: false };

    switch (intent.type) {
      case 'RECORD_EXPENSE':
        if (intent.entities) {
          const expenseData = {
            amount: intent.entities.amount || 0,
            description: intent.entities.description || 'Voice Expense',
            category: intent.entities.category || 'Miscellaneous',
            date: new Date().toISOString(),
            raw: text
          };
          const saved = await ExpenseRecorder.saveExpense(expenseData, effectiveBusinessId, 'voice-sentinel');
          actionResult = { ...actionResult, success: true, data: saved, message: `Recorded expense of ${expenseData.amount}` };
        }
        break;

      case 'RECORD_INCOME':
        if (intent.entities) {
          const incomeData = {
            amount: intent.entities.amount || 0,
            description: intent.entities.description || 'Voice Income',
            category: 'Income',
            date: new Date().toISOString(),
            raw: text
          };
          const saved = await ExpenseRecorder.saveIncome(incomeData, effectiveBusinessId, 'voice-sentinel');
          actionResult = { ...actionResult, success: true, data: saved, message: `Recorded income of ${incomeData.amount}` };
        }
        break;

      case 'QUERY_BALANCE': {
        const records = await Record.find({ businessId: effectiveBusinessId });
        const income = records.filter(r => r.type === 'income').reduce((acc, r) => acc + r.amount, 0);
        const expenses = records.filter(r => r.type === 'expense').reduce((acc, r) => acc + r.amount, 0);
        actionResult = { 
          ...actionResult, 
          success: true, 
          data: { balance: income - expenses, income, expenses },
          message: `Current balance is ${income - expenses}`
        };
        break;
      }

      case 'QUERY_INSIGHTS':
        actionResult = { 
          ...actionResult, 
          success: true, 
          message: "AERA is analyzing your global resilience patterns. Insights will appear in your HUD shortly." 
        };
        break;

      case 'HELP':
        actionResult = {
          ...actionResult,
          success: true,
          message: "I can Record Expenses ('Spent 500 on tea'), Incomes ('Received 1000 from client'), and Query Balance ('What is my balance?')."
        };
        break;

      default:
        actionResult.message = "Intent recognized but no automated action assigned yet.";
    }

    // Broadcast the action result via Socket.io
    const realTimeIntel = req.app.locals.realTimeIntelligence as RealTimeIntelligence;
    if (realTimeIntel) {
      await realTimeIntel.publishEvent({
        type: 'insight',
        userId: effectiveUserId,
        businessId: effectiveBusinessId,
        data: {
          category: 'speech_action',
          action: intent.type,
          result: actionResult
        },
        severity: 'medium',
        priority: 2
      });
    }

    res.json({
      success: true,
      intent,
      actionResult
    });
  } catch (error) {
    console.error('Moment intelligence execution error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to execute speech action'
    });
  }
});

export default router;
