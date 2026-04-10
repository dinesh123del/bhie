import Stripe from 'stripe'
import { env } from '../config/env'
import logger from '../utils/logger'
import Subscription, { ISubscription } from '../models/Subscription'
import User from '../models/User'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
         apiVersion: '2024-06-20'
})

export class StripeService {
         static async createCustomer(userId: string, email: string) {
                  try {
                           const customer = await stripe.customers.create({
                                    email,
                                    metadata: { userId }
                           })
                           return customer.id
                  } catch (error) {
                           logger.error('Stripe customer creation failed', error)
                           throw error
                  }
         }

         static async createSubscription(customerId: string, priceId: string) {
                  const subscription = await stripe.subscriptions.create({
                           customer: customerId,
                           items: [{ price: priceId }],
                           payment_behavior: 'default_incomplete',
                           expand: ['latest_invoice.payment_intent']
                  })

                  // Save to DB
                  const subDoc = new Subscription({
                           userId: customerId, // link to user
                           stripeId: subscription.id,
                           tier: priceId.includes('pro') ? 'pro' : 'business',
                           currentPeriodStart: new Date(subscription.current_period_start * 1000),
                           currentPeriodEnd: new Date(subscription.current_period_end * 1000)
                  })
                  await subDoc.save()

                  return subscription
         }

         static async handleWebhook(payload: Buffer, signature: string) {
                  const event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET!)

                  switch (event.type) {
                           case 'checkout.session.completed':
                                    // Handle successful checkout
                                    break
                           case 'invoice.payment_succeeded':
                                    // Update subscription status - invoice object has subscription id
                                    const invoice = event.data.object as Stripe.Invoice
                                    if (invoice.subscription) {
                                             await Subscription.findOneAndUpdate(
                                                      { stripeId: invoice.subscription as string },
                                                      { status: 'active' }
                                             )
                                    }
                                    break
                           case 'customer.subscription.deleted':
                                    const canceledSub = event.data.object as Stripe.Subscription
                                    await Subscription.findOneAndUpdate(
                                             { stripeId: canceledSub.id },
                                             { status: 'canceled' }
                                    )
                                    break
                  }

                  return event
         }
}

export default StripeService

