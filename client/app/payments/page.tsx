"use client"

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import UsageDashboard from '@/components/UsageDashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const tiers = [
         { name: 'Free', price: 0, limit: '100 AI queries/month', features: ['Basic AI', 'Receipt Scanning'] },
         { name: 'Pro', price: 499, limit: 'Unlimited AI', features: ['Advanced Analytics', 'WhatsApp Bot', 'Predictions'] },
         { name: 'Business', price: 999, limit: 'Team Access', features: ['All Pro + Custom Reports', 'API Access'] }
]

export default function PaymentsPage() {
         const { user } = useAuth()
         const [selectedTier, setSelectedTier] = useState('pro')

         const handleUpgrade = async () => {
                  const response = await fetch('/api/subscriptions/create-checkout-session', {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({ tier: selectedTier })
                  })
                  const { url } = await response.json()
                  window.location.href = url!
         }

         return (
                  <div className="container py-20">
                           <h1 className="text-4xl font-bold text-center mb-16">Choose Your Plan</h1>

                           <div className="grid md:grid-cols-3 gap-8 mb-16">
                                    {tiers.map((tier, i) => (
                                             <Card key={tier.name} className={selectedTier === tier.name.toLowerCase() ? 'glass ring-2 ring-primary border-transparent shadow-2xl' : ''}>
                                                      <CardHeader>
                                                               <CardTitle>{tier.name}</CardTitle>
                                                               <CardDescription>{tier.limit}</CardDescription>
                                                               <div className="text-4xl font-bold">₹{tier.price}/month</div>
                                                      </CardHeader>
                                                      <CardContent>
                                                               <ul className="space-y-2 mb-8">
                                                                        {tier.features.map((feature) => (
                                                                                 <li key={feature} className="flex items-center">
                                                                                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                                                                                          {feature}
                                                                                 </li>
                                                                        ))}
                                                               </ul>
                                                               <Button
                                                                        className="w-full"
                                                                        onClick={() => setSelectedTier(tier.name.toLowerCase())}
                                                                        size="lg"
                                                               >
                                                                        {user?.plan === tier.name.toLowerCase() ? 'Current Plan' : 'Select Plan'}
                                                               </Button>
                                                      </CardContent>
                                             </Card>
                                    ))}
                           </div>

                           <div className="max-w-4xl mx-auto">
                                    <UsageDashboard isOpen={false} onClose={() => { }} />
                           </div>

                           <Button onClick={handleUpgrade} className="mt-16 mx-auto block">
                                    Upgrade to {tiers.find(t => t.name.toLowerCase() === selectedTier)?.name}
                           </Button>
                  </div>
         )
}

