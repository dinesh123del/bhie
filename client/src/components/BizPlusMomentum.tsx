import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, Mic, Activity, Zap, Info, Settings, StopCircle, Play } from 'lucide-react';
import { momentAPI } from '../services/api';
import { premiumFeedback } from '../utils/premiumFeedback';
import { PremiumButton, PremiumCard } from './ui/PremiumComponents';
import { toast } from 'react-hot-toast';

interface MomentInsight {
  emotional_state: string;
  presence_detected: boolean;
  audio_sentiment: string;
  keywords: string[];
  resilience_impact: number;
  timestamp: number;
}

export const BizPlusMomentum: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastInsight, setLastInsight] = useState<MomentInsight | null>(null);
  const [lastAction, setLastAction] = useState<{ message: string; type: string } | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);
  const isActiveRef = useRef(false);

  const startSpeechRecognition = useCallback(() => {
    // @ts-expect-error: SpeechRecognition is not standard in all browsers
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        // Use the ref to check the LATEST activation state
        if (isActiveRef.current) {
          try { recognition.start(); } catch (e) {
            console.warn('Speech Recognition restart failed:', e);
          }
        }
      };
      
      recognition.onresult = async (event: any) => {
        if (!isActiveRef.current) return;
        
        const transcript = event.results[event.results.length - 1][0].transcript;
        console.log('Sentinel Speech:', transcript);
        
        // Execute Business Action
        try {
          const result = await momentAPI.executeAction(transcript);
          if (result.success && result.actionResult.success) {
            setLastAction({ 
              message: result.actionResult.message, 
              type: result.actionResult.type 
            });
            premiumFeedback.success();
            // Clear action after 7 seconds
            setTimeout(() => setLastAction(null), 7000);
          }
        } catch (err) {
          console.error('Action Execution Error:', err);
        }
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.error('Speech Recognition start error:', e);
      }
    }
  }, []); // Remove isActive dependency to prevent unnecessary recreations

  const startSentinel = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: 15 },
        audio: true
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      
      // Update state AND ref synchronously
      setIsActive(true);
      isActiveRef.current = true;
      
      // Reset previous session data
      setLastInsight(null);
      setLastAction(null);
      
      startSpeechRecognition();
      premiumFeedback.success();
      toast.success('Biz Plus Sentinel Active');
    } catch (err) {
      console.error('Sentinel activation error:', err);
      toast.error('Camera/Mic access required for Sentinel');
      setIsActive(false);
      isActiveRef.current = false;
    }
  };

  const stopSentinel = () => {
    // Update ref immediately to block listeners
    isActiveRef.current = false;
    setIsActive(false);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) { /* ignore */ }
    }
    
    setIsCapturing(false);
    setIsListening(false);
    toast('Sentinel Mode Standby', { icon: '🛡️' });
  };

  const captureMoment = useCallback(async () => {
    if (!isActive || !videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const frameBlob = await new Promise<Blob | null>(resolve => 
        canvas.toBlob(resolve, 'image/jpeg', 0.6)
      );

      const formData = new FormData();
      if (frameBlob) {
        formData.append('frame', frameBlob, 'moment.jpg');
      }
      formData.append('context', document.title);

      try {
        const result = await momentAPI.capture(formData);
        if (result.success) {
          setLastInsight(result.analysis);
          premiumFeedback.haptic(5);
        }
      } catch (err) {
        console.error('Moment capture failed:', err);
      } finally {
        setIsCapturing(false);
      }
    }
  }, [isActive, isCapturing]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(captureMoment, 15000);
      captureMoment();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, captureMoment]);

  return (
    <div className="fixed bottom-24 right-8 z-[60] flex flex-col items-end gap-4">
      <AnimatePresence>
        {/* Action HUD */}
        {isActive && lastAction && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-2"
          >
            <PremiumCard className="w-80 bg-emerald-500/10 backdrop-blur-3xl border-emerald-500/30 p-4 border-2 shadow-[0_0_60px_rgba(16,185,129,0.2)]">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                     <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Autonomous Action</h4>
                    <p className="text-xs font-bold text-white leading-tight">{lastAction.message}</p>
                  </div>
               </div>
            </PremiumCard>
          </motion.div>
        )}

        {/* Insight HUD */}
        {isActive && lastInsight && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-2"
          >
            <PremiumCard className="w-72 bg-slate-950/80 backdrop-blur-2xl border-sky-500/30 p-4 shadow-[0_0_50px_rgba(14,165,233,0.1)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                  <Activity className="h-4 w-4 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-400">Live Resilience</h4>
                  <p className="text-xs font-bold text-white capitalize">{lastInsight.emotional_state} State Detected</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(lastInsight.resilience_impact / 2) * 100}%` }}
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500"
                  />
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {lastInsight.keywords.slice(0, 3).map((k, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-wider text-white/60">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        layout
        className="flex items-center gap-3 bg-slate-950/90 backdrop-blur-xl border border-white/10 p-2 rounded-full shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div
              key="active"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex items-center gap-2 px-3 overflow-hidden whitespace-nowrap"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Sentinel Active</span>
              </div>
              <div className="h-4 w-px bg-white/10 mx-2" />
               {isListening && (
                 <motion.div 
                   animate={{ scale: [1, 1.2, 1] }} 
                   transition={{ repeat: Infinity, duration: 1 }}
                   className="flex items-center gap-1.5"
                 >
                   <Mic className="h-3 w-3 text-sky-400" />
                   <span className="text-[9px] font-black uppercase tracking-tighter text-sky-400">Listening...</span>
                 </motion.div>
               )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          onClick={() => isActive ? stopSentinel() : startSentinel()}
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500 ${
            isActive 
              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white' 
              : 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 hover:scale-105 active:scale-95'
          }`}
        >
          {isActive ? <StopCircle className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
        </button>
      </motion.div>

      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
