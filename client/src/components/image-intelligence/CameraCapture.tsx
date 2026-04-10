"use client"
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Check, RefreshCw, Zap, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { premiumFeedback } from '../../utils/premiumFeedback';
import { PremiumButton, PremiumCard } from '../ui/PremiumComponents';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    setIsInitializing(true);
    setError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      premiumFeedback.success();
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions.');
      toast.error('Camera access denied or unavailable');
      premiumFeedback.error();
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
    }
    return () => stopCamera();
  }, [isOpen]);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      premiumFeedback.haptic(10);
    }
  };

  const handleConfirm = () => {
    if (!capturedImage) return;

    // Convert dataUrl to File
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `snap-receipt-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        onClose();
      });
  };

  const handleRetake = () => {
    setCapturedImage(null);
    premiumFeedback.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8"
      >
        <PremiumCard className="relative w-full max-w-4xl aspect-[4/3] md:aspect-video overflow-hidden border-sky-500/30 bg-transparent p-0 shadow-[0_0_100px_rgba(14,165,233,0.2)]">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Live Intelligence Capture</h3>
             </div>
             <button
               onClick={onClose}
               className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-all"
             >
               <X className="h-5 w-5" />
             </button>
          </div>

          {/* Camera View */}
          <div className="relative h-full w-full bg-black flex items-center justify-center">
            {isInitializing && (
              <div className="flex flex-col items-center gap-4">
                <RefreshCw className="h-10 w-10 animate-spin text-sky-400" />
                <p className="text-xs font-black uppercase tracking-widest text-sky-400">Initializing Lens...</p>
              </div>
            )}

            {error && (
              <div className="p-8 text-center bg-rose-500/10 rounded-3xl border border-rose-500/20">
                <p className="text-rose-400 font-bold mb-4">{error}</p>
                <PremiumButton onClick={startCamera}>Try Again</PremiumButton>
              </div>
            )}

            {!capturedImage ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`h-full w-full object-cover transition-opacity duration-700 ${isInitializing ? 'opacity-0' : 'opacity-100'}`}
              />
            ) : (
              <img
                src={capturedImage}
                alt="Captured document"
                className="h-full w-full object-contain"
              />
            )}

            {/* Viewfinder Overlay */}
            {!capturedImage && !isInitializing && !error && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[80%] h-[70%] border-2 border-white/20 rounded-3xl relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/60 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/60 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/60 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/60 rounded-br-xl" />
                  
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Align artifact inside scanner</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-8 flex items-center justify-center gap-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            {!capturedImage ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={takePhoto}
                disabled={isInitializing || !!error}
                className="relative group h-20 w-20 flex items-center justify-center"
              >
                <div className="absolute inset-0 rounded-full border-4 border-white group-hover:border-sky-400 transition-colors" />
                <div className="h-14 w-14 rounded-full bg-white group-hover:bg-sky-400 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.4)] group-hover:shadow-[0_0_30px_rgba(14,165,233,0.6)]" />
              </motion.button>
            ) : (
              <div className="flex gap-4">
                <PremiumButton
                  variant="secondary"
                  size="lg"
                  icon={<RefreshCw className="h-5 w-5" />}
                  onClick={handleRetake}
                >
                  Retake
                </PremiumButton>
                <PremiumButton
                  variant="primary"
                  size="lg"
                  icon={<Check className="h-5 w-5" />}
                  onClick={handleConfirm}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)]"
                >
                  Analyze Snippet
                </PremiumButton>
              </div>
            )}
          </div>

          {/* Canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />
        </PremiumCard>

        {/* Decorative background elements */}
        <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-[150px] -z-10 animate-pulse" />
        <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[150px] -z-10 animate-pulse" />
      </motion.div>
    </AnimatePresence>
  );
};
