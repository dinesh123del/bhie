import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Check, X, Bell, Clock, FileText, TrendingUp, Smartphone, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface WhatsAppSettings {
  enabled: boolean;
  phoneNumber: string;
  dailySummary: boolean;
  weeklyReport: boolean;
  largeTransactions: boolean;
  threshold: number;
}

const PREVIEW_MESSAGES = [
  {
    time: '8:00 AM',
    content: `📊 AERA Daily Summary - Apr 8, 2026

💰 Revenue: ₹45,000
💸 Expenses: ₹23,400
📈 Profit: ₹21,600 (+12% vs yesterday)

Top expenses:
• Inventory: ₹12,000
• Marketing: ₹5,000
• Operations: ₹4,400

You're on a 🔥 12-day streak!
View full report: aera.cloud/dashboard`,
  },
  {
    time: '2:30 PM',
    content: `⚠️ Large Transaction Alert

Amount: ₹25,000
Category: Equipment
Merchant: Tech Solutions Ltd

This is above your usual pattern.
Reply Y to confirm, N to review.`,
  },
  {
    time: '6:00 PM',
    content: `🎯 Weekly Report - Week 14

This week at a glance:
✓ Revenue up 15%
✓ 3 expenses auto-categorized
✓ 2 tax deductions identified

Potential savings found: ₹8,400

Great week! Keep it up 💪`,
  },
];

export default function WhatsAppIntegration() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<WhatsAppSettings>({
    enabled: false,
    phoneNumber: '',
    dailySummary: true,
    weeklyReport: true,
    largeTransactions: true,
    threshold: 10000,
  });
  const [showSetup, setShowSetup] = useState(false);
  const [activePreview, setActivePreview] = useState(0);

  useEffect(() => {
    // Load saved settings
    const stored = localStorage.getItem(`aera_whatsapp_${user?.id}`);
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, [user]);

  const saveSettings = () => {
    localStorage.setItem(`aera_whatsapp_${user?.id}`, JSON.stringify(settings));
    toast.success('WhatsApp settings saved!');
    setShowSetup(false);
  };

  const connectWhatsApp = () => {
    // Simulate WhatsApp connection
    toast.success('Opening WhatsApp...');
    const message = encodeURIComponent(
      'Hi AERA! I want to connect my business account to get daily summaries. My email: ' + 
      (user?.email || '')
    );
    window.open(`https://wa.me/918045672200?text=${message}`, '_blank');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/20 flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">WhatsApp Reports</h2>
        <p className="text-white/50">
          Get your business insights delivered to WhatsApp daily
        </p>
      </div>

      {!settings.enabled ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Benefits */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Clock, text: 'Morning summary at 8 AM' },
              { icon: Bell, text: 'Instant large txn alerts' },
              { icon: FileText, text: 'Weekly reports every Sunday' },
              { icon: Shield, text: 'Secure & private' },
            ].map((benefit) => (
              <div key={benefit.text} className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                <benefit.icon className="w-5 h-5 text-green-400" />
                <span className="text-white/70 text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Phone Mockup */}
          <div className="relative bg-slate-800 rounded-3xl p-4 border border-white/10 max-w-xs mx-auto">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-b-2xl" />
            <div className="bg-slate-900 rounded-2xl overflow-hidden">
              <div className="bg-green-600 p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-lg">🤖</span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">AERA Bot</p>
                  <p className="text-green-200 text-xs">online</p>
                </div>
              </div>
              <div className="p-4 space-y-3 h-64 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePreview}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/10 rounded-lg p-3 text-white text-xs whitespace-pre-line"
                  >
                    <p className="text-white/50 text-xs mb-1">
                      {PREVIEW_MESSAGES[activePreview].time}
                    </p>
                    {PREVIEW_MESSAGES[activePreview].content}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            
            {/* Preview Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {PREVIEW_MESSAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActivePreview(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === activePreview ? 'bg-green-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={connectWhatsApp}
            className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Connect WhatsApp
          </button>

          <p className="text-center text-white/30 text-xs">
            By connecting, you agree to receive automated messages. 
            Reply STOP anytime to unsubscribe.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Connected Status */}
          <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/30 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-white font-bold mb-1">WhatsApp Connected!</p>
            <p className="text-white/50 text-sm">
              Receiving reports at {settings.phoneNumber}
            </p>
          </div>

          {/* Settings */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
            <h4 className="text-white font-bold mb-4">Notification Settings</h4>
            
            {[
              { key: 'dailySummary', label: 'Daily morning summary', desc: '8:00 AM every day' },
              { key: 'weeklyReport', label: 'Weekly digest', desc: 'Every Sunday evening' },
              { key: 'largeTransactions', label: 'Large transaction alerts', desc: 'When spending exceeds threshold' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white text-sm">{item.label}</p>
                  <p className="text-white/40 text-xs">{item.desc}</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof WhatsAppSettings] }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings[item.key as keyof WhatsAppSettings] ? 'bg-green-500' : 'bg-white/20'
                  }`}
                >
                  <motion.div
                    animate={{ x: settings[item.key as keyof WhatsAppSettings] ? 24 : 4 }}
                    className="w-4 h-4 bg-white rounded-full absolute top-1"
                  />
                </button>
              </div>
            ))}

            {/* Threshold Slider */}
            {settings.largeTransactions && (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/50 text-sm">Alert threshold</span>
                  <span className="text-green-400 font-bold">₹{settings.threshold.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={settings.threshold}
                  onChange={(e) => setSettings(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                  className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-green-500"
                />
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>₹1,000</span>
                  <span>₹1,00,000</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={saveSettings}
              className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-white/90 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => setSettings(prev => ({ ...prev, enabled: false }))}
              className="px-6 bg-red-500/20 text-red-400 font-bold py-3 rounded-xl hover:bg-red-500/30 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
