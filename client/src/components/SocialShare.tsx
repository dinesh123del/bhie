import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Linkedin, Twitter, Download, X, TrendingUp, Target, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShareData {
  type: 'milestone' | 'streak' | 'achievement' | 'profit';
  title: string;
  value: string;
  subtitle: string;
  date: string;
}

interface SocialShareProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareData;
}

export default function SocialShare({ isOpen, onClose, data }: SocialShareProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generatedImage, setGeneratedImage] = useState<string>('');

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      generateBrandedImage();
    }
  }, [isOpen, data]);

  const generateBrandedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (Instagram story aspect ratio)
    canvas.width = 1080;
    canvas.height = 1920;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative circles
    ctx.beginPath();
    ctx.arc(540, 300, 400, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(800, 1200, 300, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(139, 92, 246, 0.08)';
    ctx.fill();

    // BIZ PLUS Logo text
    ctx.font = 'bold 80px system-ui';
    ctx.fillStyle = '#3b82f6';
    ctx.textAlign = 'center';
    ctx.fillText('BIZ PLUS', 540, 200);

    ctx.font = '300 40px system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('Economic Resilience', 540, 260);

    // Achievement badge
    ctx.beginPath();
    ctx.arc(540, 600, 150, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Icon based on type
    ctx.font = '120px system-ui';
    ctx.fillStyle = '#60a5fa';
    const iconMap: Record<string, string> = {
      milestone: '🏆',
      streak: '🔥',
      achievement: '⭐',
      profit: '📈',
    };
    ctx.fillText(iconMap[data.type] || '🎯', 540, 640);

    // Title
    ctx.font = 'bold 60px system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(data.title.toUpperCase(), 540, 900);

    // Main value
    ctx.font = 'bold 140px system-ui';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(data.value, 540, 1100);

    // Subtitle
    ctx.font = '300 50px system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(data.subtitle, 540, 1200);

    // Date
    ctx.font = '300 36px system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(data.date, 540, 1350);

    // CTA Box
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.roundRect(140, 1550, 800, 200, 40);
    ctx.fill();

    ctx.font = 'bold 48px system-ui';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Track your business with BIZ PLUS', 540, 1660);

    ctx.font = '300 36px system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('bizplus.io', 540, 1720);

    // Generate image
    const imageUrl = canvas.toDataURL('image/png');
    setGeneratedImage(imageUrl);
  };

  const shareToLinkedIn = () => {
    const text = encodeURIComponent(
      `Just hit a major milestone with BIZ PLUS! ${data.title}: ${data.value}\n\n` +
      `Tracking my business finances has never been easier. 📊`
    );
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://bizplus.io')}&summary=${text}`,
      '_blank'
    );
    toast.success('Opening LinkedIn...');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(
      `${data.title}: ${data.value} with BIZ PLUS! 🚀\n\n` +
      `The smartest way to track business finances.`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent('https://bizplus.io')}`,
      '_blank'
    );
    toast.success('Opening Twitter...');
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! Just wanted to share my ${data.title.toLowerCase()} with BIZ PLUS: *${data.value}*\n\n` +
      `You should try it for your business too! 📊`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.download = `bizplus-${data.type}-${Date.now()}.png`;
    link.href = generatedImage;
    link.click();
    toast.success('Image downloaded!');
  };

  const copyLink = () => {
    navigator.clipboard.writeText('https://bizplus.io');
    toast.success('Link copied to clipboard!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-xl flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-400" />
                Share Achievement
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            {/* Preview */}
            <div className="mb-6 rounded-2xl overflow-hidden border border-white/10">
              <canvas
                ref={canvasRef}
                className="w-full h-auto"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={shareToLinkedIn}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl transition-colors font-bold"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </button>
              <button
                onClick={shareToTwitter}
                className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white py-3 rounded-xl transition-colors font-bold"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </button>
              <button
                onClick={shareToWhatsApp}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white py-3 rounded-xl transition-colors font-bold"
              >
                <span className="text-lg">💬</span>
                WhatsApp
              </button>
              <button
                onClick={downloadImage}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-colors font-bold"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>

            <button
              onClick={copyLink}
              className="w-full py-3 text-white/50 hover:text-white text-sm transition-colors"
            >
              Copy link to clipboard
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to trigger milestone shares
export function useMilestoneShare() {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const shareMilestone = (data: ShareData) => {
    setShareData(data);
    setIsOpen(true);
  };

  const closeShare = () => {
    setIsOpen(false);
    setTimeout(() => setShareData(null), 300);
  };

  return {
    shareMilestone,
    closeShare,
    isOpen,
    shareData,
  };
}
