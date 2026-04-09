import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X } from 'lucide-react';
import VoiceAssistant3D from './VoiceAssistant3D';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Types for Speech Recognition
interface IWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}
const { SpeechRecognition, webkitSpeechRecognition } = window as unknown as IWindow;
const SpeechRecognitionAPI = SpeechRecognition || webkitSpeechRecognition;

export const GlobalVoiceAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const resultText = event.results[current][0].transcript;
      setTranscript(resultText);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript) {
        processCommand(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error("Microphone access denied.");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Make sure we process the command when transcript finishes if it didn't trigger in onend due to state closure
  const processCommand = (cmdText: string) => {
    if (!cmdText) return;
    const lowerCmd = cmdText.toLowerCase();
    console.log("Voice Command Recognized:", lowerCmd);

    let recognized = false;

    // Navigation Commands
    if (lowerCmd.includes('dashboard') || lowerCmd.includes('home')) {
      navigate('/dashboard');
      toast.success("Navigating to Dashboard", { icon: '🚀' });
      recognized = true;
    } else if (lowerCmd.includes('analytics') || lowerCmd.includes('charts')) {
      navigate('/analytics');
      toast.success("Opening Analytics", { icon: '📊' });
      recognized = true;
    } else if (lowerCmd.includes('scan') || lowerCmd.includes('camera') || lowerCmd.includes('receipt')) {
      navigate('/scan-bill');
      toast.success("Launching Scanner", { icon: '📷' });
      recognized = true;
    } else if (lowerCmd.includes('predict') || lowerCmd.includes('forecast')) {
      navigate('/predictions');
      toast.success("Opening Predictions Engine", { icon: '🔮' });
      recognized = true;
    } else if (lowerCmd.includes('record') || lowerCmd.includes('expense') || lowerCmd.includes('income')) {
      navigate('/records');
      toast.success("Opening Records", { icon: '📝' });
      recognized = true;
    }

    if (!recognized) {
      toast("Command not recognized. Try 'open dashboard' or 'go to analytics'.", { 
        icon: '🤔',
        style: { background: '#333', color: '#fff' }
      });
    }

    // Auto close after brief delay
    setTimeout(() => {
      setIsOpen(false);
      setTranscript('');
    }, 2000);
  };

  const toggleListen = () => {
    if (!recognitionRef.current) {
      toast.error("Speech Recognition is not supported on this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const openAssistant = () => {
    setIsOpen(true);
    // Optional: auto-start listening when opened
    // setTimeout(() => toggleListen(), 500);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAssistant}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center text-white"
          style={{
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.1), inset 0 0 10px rgba(255,255,255,0.2)'
          }}
        >
          <Mic size={24} />
        </motion.button>
      )}

      {/* Full Screen Cinematic Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(30px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)', transition: { duration: 0.5 } }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60"
          >
            {/* Close Button */}
            <button 
              onClick={() => {
                if (isListening) recognitionRef.current?.stop();
                setIsOpen(false);
              }}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2"
            >
              <X size={32} />
            </button>

            {/* 3D Visualizer Container */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.1 }}
              className="w-80 h-80 relative flex items-center justify-center"
            >
              <VoiceAssistant3D isListening={isListening} />
            </motion.div>

            {/* Transcription & Status Text */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 text-center max-w-2xl px-6"
            >
              <h2 className="text-4xl font-light text-white tracking-wide mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                {transcript ? `"${transcript}"` : (isListening ? "Listening..." : "How can I help you?")}
              </h2>
              <p className="text-white/40 text-sm uppercase tracking-widest">
                {isListening ? "Processing your voice" : "Tap the sphere to speak"}
              </p>
            </motion.div>

            {/* Manual Toggle Button embedded */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={toggleListen}
              className={`mt-12 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 border backdrop-blur-md ${
                isListening 
                  ? 'bg-white/10 border-white/40 text-white shadow-[0_0_40px_rgba(255,255,255,0.3)]' 
                  : 'bg-black/50 border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              {isListening ? <Mic size={32} className="animate-pulse" /> : <MicOff size={32} />}
            </motion.button>
            
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalVoiceAssistant;
