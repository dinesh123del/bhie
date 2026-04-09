import { Router } from 'express';
import {
  WhatsAppClient,
  IntentClassifier,
  ExpenseRecorder,
  DocumentProcessor,
  BusinessSummary,
  AIInsights,
  ReportGenerator,
} from '../services/index.js';
import { Business } from '../models/Business.js';
import { WhatsAppPaymentService } from '../services/whatsapp-payment-service.js';
import { SubscriptionPlanService } from '../services/subscription-plan-service.js';
import WhatsAppSubscription from '../models/WhatsAppSubscription.js';
import { env } from '../config/env.js';

const router = Router();
const waClient = new WhatsAppClient();
const classifier = new IntentClassifier();
const paymentService = new WhatsAppPaymentService();

const userSessions = new Map<string, { step: string; selectedPlan?: string; billingCycle?: 'monthly' | 'yearly' }>();

router.post('/webhook', async (req, res) => {
  try {
    const { entry } = req.body;
    const message = entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const from = message.from;
    const business = await Business.findByPhone(from);

    if (!business) {
      await waClient.sendText(from,
        'Welcome to Biz Plus! 🎉\n\nReply with your registered email to link this WhatsApp number to your account.\n\nExample: user@company.com'
      );
      return res.sendStatus(200);
    }

    if (message.type === 'text') {
      await handleTextMessage(from, business, message.text.body);
    } else if (message.type === 'image') {
      await handleImageMessage(from, business, message.image);
    } else if (message.type === 'document') {
      await handleDocumentMessage(from, business, message.document);
    } else if (message.type === 'audio' || message.type === 'voice') {
      await handleVoiceMessage(from, business, message.audio || message.voice);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.sendStatus(200);
  }
});

async function handleTextMessage(phone: string, business: any, text: string) {
  const lowerText = text.toLowerCase().trim();
  const session = userSessions.get(phone) || { step: 'menu' };

  if (lowerText.includes('@') && lowerText.includes('.')) {
    const linked = await Business.linkPhoneByEmail(text, phone);
    if (linked) {
      await waClient.sendText(phone,
        '✅ Successfully linked!\n\nYou can now:\n• Record expenses: "500 tea"\n• Check balance: "balance"\n• Upload receipts: Send photo\n• Get insights: "insights"\n• Subscribe to plans: "subscribe"'
      );
    } else {
      await waClient.sendText(phone, '❌ Email not found. Please check and try again.');
    }
    return;
  }

  if (lowerText === 'hi' || lowerText === 'hello' || lowerText === 'start') {
    await showMainMenu(phone);
    return;
  }

  if (lowerText === 'menu' || lowerText === 'options') {
    await showMainMenu(phone);
    return;
  }

  if (lowerText === 'subscribe' || lowerText === 'plans' || lowerText === '1') {
    await handleSubscriptionFlow(phone, lowerText, session);
    return;
  }

  if (session.step === 'plan_selection') {
    await handlePlanSelection(phone, lowerText, session);
    return;
  }

  if (session.step === 'billing_cycle') {
    await handleBillingCycle(phone, lowerText, session);
    return;
  }

  if (session.step === 'confirmation') {
    await handlePlanConfirmation(phone, lowerText, session);
    return;
  }

  if (lowerText === 'status' || lowerText === 'subscription') {
    await handleSubscriptionStatus(phone);
    return;
  }

  const intent = await classifier.classify(text);

  switch (intent.type) {
    case 'RECORD_EXPENSE': {
      const expense = await ExpenseRecorder.parse({
        text,
        businessId: business.id,
        source: 'whatsapp'
      });

      await waClient.sendInteractive(phone, {
        type: 'button',
        body: `✅ Recorded: ₹${expense.amount} for "${expense.description}"\n📁 Category: ${expense.category}\n📅 ${expense.date}`,
        buttons: [
          { id: 'confirm', title: '✓ Confirm' },
          { id: 'edit', title: '✏️ Edit' },
          { id: 'cancel', title: '✕ Cancel' }
        ]
      });
      break;
    }

    case 'RECORD_INCOME': {
      const income = await ExpenseRecorder.parseIncome({
        text,
        businessId: business.id,
        source: 'whatsapp'
      });

      await waClient.sendInteractive(phone, {
        type: 'button',
        body: `💰 Recorded Income: ₹${income.amount}\n📝 "${income.description}"\n📅 ${income.date}`,
        buttons: [
          { id: 'confirm_income', title: '✓ Confirm' },
          { id: 'edit', title: '✏️ Edit' }
        ]
      });
      break;
    }

    case 'QUERY_BALANCE': {
      const summary = await BusinessSummary.get(business.id);
      const healthEmoji = summary.healthScore >= 70 ? '🟢' : summary.healthScore >= 40 ? '🟡' : '🔴';

      await waClient.sendText(phone,
        `💰 *${business.name} - This Month*\n\n` +
        `📈 Income: ₹${summary.income.toLocaleString('en-IN')}\n` +
        `📉 Expenses: ₹${summary.expenses.toLocaleString('en-IN')}\n` +
        `📊 Net: ${summary.profit >= 0 ? '+' : ''}₹${summary.profit.toLocaleString('en-IN')}\n\n` +
        `${healthEmoji} Health Score: ${summary.healthScore}/100\n` +
        `📅 Last updated: Just now`
      );
      break;
    }

    case 'QUERY_INSIGHTS': {
      const insights = await AIInsights.getQuickSummary(business.id);
      await waClient.sendText(phone,
        `🔮 *AI Insights for ${business.name}*\n\n` +
        `${insights.summary}\n\n` +
        `🎯 *Top Action:*\n${insights.topAction}\n\n` +
        `Reply REPORT for full analysis`
      );
      break;
    }

    case 'GET_REPORT': {
      await waClient.sendText(phone,
        '📊 Generating your business report...\nThis may take 30 seconds.'
      );

      const reportUrl = await ReportGenerator.createMonthly(business.id);
      await waClient.sendDocument(phone, {
        url: reportUrl,
        caption: `📊 ${business.name} - Monthly Business Report`,
        filename: `Biz Plus_Report_${business.name}_${new Date().toLocaleString('default', { month: 'short', year: '2-digit' })}.pdf`
      });
      break;
    }

    case 'HELP': {
      await waClient.sendText(phone,
        `*Biz Plus WhatsApp Commands:*\n\n` +
        `💸 *Record Expense:*\n"500 tea expense" or "paid 2000 rent"\n\n` +
        `💰 *Record Income:*\n"received 10000 from client" or "5000 sales today"\n\n` +
        `📊 *Check Balance:*\nType "balance" or "summary"\n\n` +
        `🔮 *Get Insights:*\nType "insights" or "advice"\n\n` +
        `📄 *Monthly Report:*\nType "report"\n\n` +
        `📷 *Upload Receipt:*\nSend photo directly\n\n` +
        `💳 *Subscription:*\nType "subscribe" to view plans`
      );
      break;
    }

    default: {
      await waClient.sendText(phone,
        `I didn't understand that. 🤔\n\n` +
        `Try:\n` +
        `• "500 lunch" - record expense\n` +
        `• "balance" - check summary\n` +
        `• "insights" - AI recommendations\n\n` +
        `Reply HELP for all commands`
      );
    }
  }
}

async function handleImageMessage(phone: string, business: any, image: any) {
  await waClient.sendText(phone, '📸 Processing your receipt...');

  try {
    const imageBuffer = await waClient.downloadMedia(image.id);

    const result = await DocumentProcessor.processReceipt({
      image: imageBuffer,
      businessId: business.id,
      source: 'whatsapp'
    });

    await waClient.sendInteractive(phone, {
      type: 'button',
      body: `📄 *Receipt Detected*\n\n💰 Amount: ₹${result.amount}\n🏪 Vendor: ${result.vendor}\n📅 Date: ${result.date}\n📁 Category: ${result.suggestedCategory}`,
      buttons: [
        { id: 'save_expense', title: '💸 Save Expense' },
        { id: 'save_income', title: '💰 Save Income' },
        { id: 'wrong', title: '❌ Wrong' }
      ]
    });
  } catch (error) {
    await waClient.sendText(phone,
      '❌ Could not read receipt. Please try:\n' +
      '• Better lighting\n' +
      '• Clearer image\n' +
      '• All corners visible'
    );
  }
}

async function handleDocumentMessage(phone: string, business: any, document: any) {
  await waClient.sendText(phone, '📄 Processing document...');

  const docBuffer = await waClient.downloadMedia(document.id);

  const result = await DocumentProcessor.processDocument({
    file: docBuffer,
    filename: document.filename,
    mimeType: document.mime_type,
    businessId: business.id
  });

  await waClient.sendText(phone,
    `📄 *Document: ${result.type}*\n\n` +
    `Detected: ${result.category}\n` +
    `Amount: ₹${result.amount || 'N/A'}\n\n` +
    `Saved to your records. View in app: https://app.bizplus.ai/records`
  );
}

async function handleVoiceMessage(phone: string, business: any, audio: any) {
  await waClient.sendText(phone, '🎙️ Processing voice message...');

  const VoiceProcessor = (await import('../services/voice-processor')).VoiceProcessor;
  const processor = new VoiceProcessor();

  const audioUrl = await waClient.getMediaUrl(audio.id);
  const result = await processor.process(audioUrl, business);

  if (result.type === 'expense' || result.type === 'income') {
    await waClient.sendInteractive(phone, {
      type: 'button',
      body: `🎙️ *Voice Recorded*\n\n💰 Amount: ₹${result.amount}\n📝 "${result.description}"\n📁 Type: ${result.type}`,
      buttons: [
        { id: 'confirm', title: '✓ Confirm' },
        { id: 'edit', title: '✏️ Edit' }
      ]
    });
  } else {
    await waClient.sendText(phone,
      'Could not understand. Try speaking clearly:\n' +
      '"Paanch sau chai kharcha" (500 tea expense)\n' +
      '"Das hazaar mila client se" (10,000 received from client)'
    );
  }
}

router.get('/', (req, res) => {
  const mode = req.query['hub.mode'] as string || (req.query.hub as any)?.mode;
  const token = req.query['hub.verify_token'] as string || (req.query.hub as any)?.verify_token;
  const challenge = req.query['hub.challenge'] as string || (req.query.hub as any)?.challenge;

  if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

async function showMainMenu(phone: string) {
  await waClient.sendInteractive(phone, {
    type: 'button',
    body: `*👋 Welcome to Biz Plus!*\n\nChoose an option:`,
    buttons: [
      { id: 'view_plans', title: '💳 View Plans' },
      { id: 'record_expense', title: '💸 Record Expense' },
      { id: 'check_balance', title: '📊 Check Balance' },
      { id: 'help', title: '❓ Help' }
    ]
  });
  userSessions.set(phone, { step: 'menu' });
}

async function handleSubscriptionFlow(phone: string, text: string, session: any) {
  const plans = SubscriptionPlanService.getAllPlans();
  await waClient.sendText(phone, SubscriptionPlanService.formatPlanMessage());
  userSessions.set(phone, { ...session, step: 'plan_selection' });
}

async function handlePlanSelection(phone: string, text: string, session: any) {
  const planCode = text.toLowerCase();

  if (!SubscriptionPlanService.isValidPlan(planCode)) {
    await waClient.sendText(phone, '❌ Invalid plan. Please choose: basic, pro, or premium');
    return;
  }

  const plan = SubscriptionPlanService.getPlan(planCode);
  await waClient.sendInteractive(phone, {
    type: 'button',
    body: `Choose billing cycle for *${plan.name}* plan:`,
    buttons: [
      { id: 'monthly', title: `₹${plan.monthlyPrice}/month` },
      { id: 'yearly', title: `₹${plan.yearlyPrice}/year (Save 17%)` },
      { id: 'back', title: '⬅️ Back' }
    ]
  });

  userSessions.set(phone, { ...session, step: 'billing_cycle', selectedPlan: planCode });
}

async function handleBillingCycle(phone: string, text: string, session: any) {
  const cycle = text.toLowerCase() === 'yearly' ? 'yearly' : 'monthly';
  const plan = SubscriptionPlanService.getPlan(session.selectedPlan);

  if (!plan) {
    await handleSubscriptionFlow(phone, text, session);
    return;
  }

  await waClient.sendText(phone, SubscriptionPlanService.formatPlanConfirmation(plan, cycle));
  userSessions.set(phone, { ...session, step: 'confirmation', billingCycle: cycle });
}

async function handlePlanConfirmation(phone: string, text: string, session: any) {
  if (text.toLowerCase() === 'back') {
    await handleSubscriptionFlow(phone, text, session);
    return;
  }

  if (text.toLowerCase() !== 'confirm') {
    await waClient.sendText(phone, 'Please reply "confirm" to generate payment link or "back" to choose another plan');
    return;
  }

  const plan = SubscriptionPlanService.getPlan(session.selectedPlan);
  const result = await paymentService.createPaymentLink(
    phone,
    session.selectedPlan,
    session.billingCycle,
    { name: phone }
  );

  if (result.success && result.paymentLink) {
    await waClient.sendText(phone,
      `✅ Payment link generated!\n\n` +
      `💰 Plan: ${plan.name} (${session.billingCycle})\n` +
      `💵 Amount: ₹${session.billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}\n\n` +
      `🔗 Click to pay: ${result.paymentLink}\n\n` +
      `After payment, your subscription will be activated automatically.\n\n` +
      `Type "status" to check your subscription status.`
    );
    userSessions.delete(phone);
  } else {
    await waClient.sendText(phone, `❌ Failed to generate payment link: ${result.error}`);
  }
}

async function handleSubscriptionStatus(phone: string) {
  const status = await paymentService.checkSubscriptionStatus(phone);

  if (!status.active) {
    await waClient.sendText(phone,
      `❌ No active subscription\n\n` +
      `Type "subscribe" to view available plans and activate your subscription.`
    );
  } else {
    const plan = SubscriptionPlanService.getPlan(status.plan);
    const expiryDate = status.expiryDate ? new Date(status.expiryDate).toLocaleDateString() : 'N/A';

    await waClient.sendText(phone,
      `✅ *Active Subscription*\n\n` +
      `💳 Plan: ${plan?.name || status.plan}\n` +
      `📅 Expires: ${expiryDate}\n` +
      `🔄 Status: ${status.status}\n\n` +
      `Type "subscribe" to upgrade or renew.`
    );
  }
}

export default router;
