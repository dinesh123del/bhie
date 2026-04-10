"use client"

import { ThemeProvider } from '@/src/contexts/ThemeContext'
import { LanguageProvider } from '@/src/contexts/LanguageContext'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from '@/src/hooks/useAuth'
import { Toaster } from 'react-hot-toast'
import NetworkStatus from '@/src/components/NetworkStatus'
import PremiumBackground from '@/src/components/ui/PremiumBackground'
import GlobalVoiceAssistant from '@/src/components/voice/GlobalVoiceAssistant'
import { UpgradeModal } from '@/src/components/UpgradeModal'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <HelmetProvider>
          <AuthProvider>
            <PremiumBackground>
              <NetworkStatus />
              <main className="min-h-screen">
                {children}
              </main>
              <Toaster />
              <UpgradeModal />
              <GlobalVoiceAssistant />
            </PremiumBackground>
          </AuthProvider>
        </HelmetProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
