import React from 'react';
import { toast } from 'react-hot-toast';

interface Props {
         children: React.ReactNode;
         fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
}

interface State {
         hasError: boolean;
         error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
         constructor(props: Props) {
                  super(props);
                  this.state = { hasError: false };
         }

         static getDerivedStateFromError(error: Error): State {
                  return { hasError: true, error };
         }

         componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
                  console.error('Global Error Boundary caught:', error, errorInfo);
                  // You could also log to an error reporting service here (e.g. Sentry)
         }

         resetErrorBoundary = () => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.href = '/dashboard';
         };

         render() {
                  if (this.state.hasError) {
                           if (this.props.fallback) {
                                    const FallbackComponent = this.props.fallback;
                                    return <FallbackComponent error={this.state.error!} resetErrorBoundary={this.resetErrorBoundary} />;
                           }
                           return (
                                    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8 relative overflow-hidden">
                                             {/* Ambient Background Glow */}
                                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />

                                             <div className="relative z-10 text-center max-w-md">
                                                      <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px]">
                                                               <div className="w-full h-full rounded-[23px] bg-black flex items-center justify-center">
                                                                        <span className="text-white text-3xl font-black">B</span>
                                                               </div>
                                                      </div>

                                                      <h1 className="text-4xl font-black text-white mb-4 tracking-tight">System Encountered a Hiccup</h1>
                                                      <p className="text-[#C0C0C0] mb-8 leading-relaxed">
                                                               BIZ PLUS encountered an unexpected issue while processing. Your data is safe. Let's get you back to the dashboard.
                                                      </p>

                                                      <div className="space-y-4">
                                                               <button
                                                                        onClick={this.resetErrorBoundary}
                                                                        className="w-full px-8 py-4 bg-white text-black font-bold rounded-2xl text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                                                               >
                                                                        Return to Dashboard
                                                               </button>

                                                               <button
                                                                        onClick={() => window.location.reload()}
                                                                        className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-white/60 font-medium rounded-2xl text-base transition-all"
                                                               >
                                                                        Refresh Application
                                                               </button>
                                                      </div>

                                                      <p className="mt-12 text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">
                                                               BIZ PLUS GLOBAL STABILITY ENGINE
                                                      </p>
                                             </div>
                                    </div>
                           );
                  }

                  return this.props.children;
         }
}

export default ErrorBoundary;

