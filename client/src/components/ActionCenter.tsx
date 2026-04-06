import { motion } from 'framer-motion';
import { Download, Sparkles, Wand2 } from 'lucide-react';
import { ActionRecommendation } from '../utils/dashboardIntelligence';
import { premiumFeedback } from '../utils/premiumFeedback';

interface ActionCenterProps {
  recommendations: ActionRecommendation[];
  onAskWhatShouldIDo: () => void;
  onExport: () => void;
}

const priorityClasses = {
  high: 'bg-[#FF3B30]/10 text-[#FF3B30]',
  medium: 'bg-[#FF9500]/10 text-[#FF9500]',
  low: 'bg-[#007AFF]/10 text-[#007AFF]',
};

export default function ActionCenter({
  recommendations,
  onAskWhatShouldIDo,
  onExport,
}: ActionCenterProps) {
  return (
    <div className="apple-card p-6 md:p-8 h-full min-h-[420px] flex flex-col justify-between">
      <div className="flex flex-col gap-6 h-full">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#007AFF]/10 text-[#007AFF] w-fit">
            <Wand2 className="h-3.5 w-3.5" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Action Center</span>
          </div>
          <div>
            <h3 className="text-[24px] font-bold tracking-tight text-white">Next Steps.</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-[#A1A1A6]">
              Focus only on the moves that can improve profit, reduce cost, or sharpen decisions.
            </p>
          </div>
        </div>

        <div className="grid gap-3 mt-2 flex-1">
          {recommendations.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: [0.2, 0.8, 0.2, 1] }}
              className="rounded-xl border border-white/5 bg-[#1C1C1E] p-4 group hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="max-w-[80%]">
                   <div className="flex items-center gap-2 mb-1">
                      <p className="text-[15px] font-semibold text-white tracking-tight">{item.title}</p>
                   </div>
                  <p className="text-[13px] leading-relaxed text-[#A1A1A6]">{item.description}</p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#636366]">{item.impact}</p>
                </div>
                <span className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${priorityClasses[item.priority]}`}>
                  {item.priority}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

         <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/5">
            <button 
              className="flex-1 py-2.5 px-4 bg-white hover:bg-white/90 text-black text-[14px] font-medium rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg"
              onClick={() => {
                premiumFeedback.click();
                onAskWhatShouldIDo();
              }}
            >
              <Sparkles className="h-4 w-4" /> Ask Intelligence
            </button>
            <button 
              className="flex-1 py-2.5 px-4 bg-[#1C1C1E] border border-white/10 hover:bg-[#2C2C2E] text-white text-[14px] font-medium rounded-full transition-colors flex items-center justify-center gap-2"
              onClick={() => {
                premiumFeedback.click();
                onExport();
              }}
            >
              <Download className="h-4 w-4" /> Export Report
            </button>
         </div>
      </div>
    </div>
  );
}
