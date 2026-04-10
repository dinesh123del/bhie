export const SUBSCRIPTION_PLANS = {
    basic: {
        code: 'basic',
        name: 'Basic',
        monthlyPrice: 99,
        yearlyPrice: 999,
        currency: 'INR',
        features: [
            'Expense tracking',
            'Basic insights',
            '50 messages/month',
            '10 receipts/month',
            'Email support'
        ],
        limits: {
            messages: 50,
            aiQueries: 5,
            receipts: 10,
            reports: 1
        }
    },
    pro: {
        code: 'pro',
        name: 'Pro',
        monthlyPrice: 299,
        yearlyPrice: 2999,
        currency: 'INR',
        features: [
            'Everything in Basic',
            'AI-powered insights',
            'Unlimited messages',
            '100 receipts/month',
            '5 reports/month',
            'Priority support'
        ],
        limits: {
            messages: Infinity,
            aiQueries: 50,
            receipts: 100,
            reports: 5
        }
    },
    premium: {
        code: 'premium',
        name: 'Premium',
        monthlyPrice: 599,
        yearlyPrice: 5999,
        currency: 'INR',
        features: [
            'Everything in Pro',
            'Advanced AI analytics',
            'Unlimited everything',
            'Custom reports',
            'WhatsApp priority',
            'Dedicated support'
        ],
        limits: {
            messages: Infinity,
            aiQueries: Infinity,
            receipts: Infinity,
            reports: Infinity
        }
    }
};
export class SubscriptionPlanService {
    static getPlan(planCode) {
        return SUBSCRIPTION_PLANS[planCode] || null;
    }
    static getAllPlans() {
        return Object.values(SUBSCRIPTION_PLANS);
    }
    static getPlanByPrice(price, cycle = 'monthly') {
        for (const plan of Object.values(SUBSCRIPTION_PLANS)) {
            const planPrice = cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            if (planPrice === price) {
                return plan;
            }
        }
        return null;
    }
    static formatPlanMessage() {
        const plans = this.getAllPlans();
        let message = '*💳 Available Plans*\n\n';
        plans.forEach((plan, index) => {
            message += `${index + 1}. *${plan.name}* - ₹${plan.monthlyPrice}/month\n`;
            plan.features.slice(0, 3).forEach(feature => {
                message += `   ✓ ${feature}\n`;
            });
            message += '\n';
        });
        message += 'Reply with plan name (basic/pro/premium) to subscribe\n';
        message += 'Or type "yearly" for yearly plans (save 17%)';
        return message;
    }
    static formatPlanConfirmation(plan, cycle) {
        const price = cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
        const savings = cycle === 'yearly' ? plan.monthlyPrice * 12 - plan.yearlyPrice : 0;
        let message = `*📋 ${plan.name} Plan*\n\n`;
        message += `💰 Price: ₹${price}/${cycle}\n`;
        if (savings > 0) {
            message += `💸 You save: ₹${savings}\n`;
        }
        message += `\n*Features:*\n`;
        plan.features.forEach(feature => {
            message += `✓ ${feature}\n`;
        });
        message += `\nReply "confirm" to generate payment link\n`;
        message += 'Reply "back" to choose another plan';
        return message;
    }
    static isValidPlan(planCode) {
        return planCode in SUBSCRIPTION_PLANS;
    }
}
