import React, { useState, useEffect } from 'react';
import { Brain, Info } from 'lucide-react';
import AIPredictionCard from '../components/AIPredictionCard';
import api from '../lib/axios';

const AIPredictor: React.FC = () => {
  const [recordCount, setRecordCount] = useState(0);

  useEffect(() => {
    fetchRecordCount();
  }, []);

  const fetchRecordCount = async () => {
    try {
      const res = await api.get('/records');
      const count = Array.isArray(res.data) ? res.data.length : res.data.records?.length || 0;
      setRecordCount(count);
    } catch (error) {
      console.error('Failed to fetch record count:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-4 md:p-8">
      {/* Fixed background grid */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0 bg-repeat"
          style={{
            backgroundImage:
              'linear-gradient(0deg, transparent 24%, rgba(79, 172, 254, 0.1) 25%, rgba(79, 172, 254, 0.1) 26%, transparent 27%, transparent 74%, rgba(79, 172, 254, 0.1) 75%, rgba(79, 172, 254, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(79, 172, 254, 0.1) 25%, rgba(79, 172, 254, 0.1) 26%, transparent 27%, transparent 74%, rgba(79, 172, 254, 0.1) 75%, rgba(79, 172, 254, 0.1) 76%, transparent 77%, transparent)',
            backgroundSize: '60px 60px',
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 animate-fadeIn">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
              <Brain className="text-blue-400" size={28} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">AI Predictor</h1>
              <p className="text-gray-400 text-lg mt-1">
                Advanced analytics & intelligent forecasting
              </p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <InfoCard
            icon="🎯"
            title="Health Score"
            description="Comprehensive analysis of your record portfolio"
          />
          <InfoCard
            icon="⚡"
            title="Risk Assessment"
            description="Identifies potential issues before they arise"
          />
          <InfoCard
            icon="💡"
            title="Smart Suggestions"
            description="Actionable recommendations to improve performance"
          />
        </div>

        {/* Stats Section */}
        {recordCount > 0 && (
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl flex items-center gap-4">
            <Info className="text-blue-400 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-white mb-1">Current Dataset</p>
              <p className="text-sm text-gray-300">
                Analysis based on {recordCount} record{recordCount !== 1 ? 's' : ''} with
                real-time updates
              </p>
            </div>
          </div>
        )}

        {/* Main Prediction Component */}
        <AIPredictionCard key={recordCount} />

        {/* How It Works Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProcessCard
              step={1}
              title="Data Collection"
              description="Analyzes all your records and their statuses"
              icon="📦"
            />
            <ProcessCard
              step={2}
              title="Intelligent Analysis"
              description="Applies ML algorithms to predict performance"
              icon="🧠"
            />
            <ProcessCard
              step={3}
              title="Actionable Insights"
              description="Provides recommendations to improve metrics"
              icon="⚡"
            />
          </div>
        </div>

        {/* Metrics Explanation */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricExplanation
            label="Health Score"
            range="0-100"
            description="Based on record completion rate and status distribution. Higher scores indicate better overall performance."
            factors={['Active records boost score', 'Draft records reduce score', 'Completion rate is weighted']}
          />
          <MetricExplanation
            label="Risk Level"
            range="Low / Medium / High"
            description="Indicates potential issues that could affect your business. Determined by multiple risk factors."
            factors={['High draft percentage = high risk', 'Low completion rate = medium/high risk', 'Diversification matters']}
          />
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

interface InfoCardProps {
  icon: string;
  title: string;
  description: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, description }) => (
  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/15 transition-all">
    <div className="text-3xl mb-2">{icon}</div>
    <h3 className="font-semibold text-white mb-1">{title}</h3>
    <p className="text-xs text-gray-400">{description}</p>
  </div>
);

interface ProcessCardProps {
  step: number;
  title: string;
  description: string;
  icon: string;
}

const ProcessCard: React.FC<ProcessCardProps> = ({
  step,
  title,
  description,
  icon,
}) => (
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-xl backdrop-blur-xl border border-white/10 group-hover:border-white/20 transition-all"></div>
    <div className="relative p-6">
      <div className="flex items-start gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              {step}
            </div>
            <h3 className="font-semibold text-white">{title}</h3>
          </div>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  </div>
);

interface MetricExplanationProps {
  label: string;
  range: string;
  description: string;
  factors: string[];
}

const MetricExplanation: React.FC<MetricExplanationProps> = ({
  label,
  range,
  description,
  factors,
}) => (
  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
    <h3 className="text-lg font-bold text-white mb-2">{label}</h3>
    <p className="text-xs text-blue-400 mb-3">Range: {range}</p>
    <p className="text-sm text-gray-400 mb-4">{description}</p>
    <div className="space-y-2">
      {factors.map((factor, idx) => (
        <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
          <span className="text-blue-400 mt-1">→</span>
          <span>{factor}</span>
        </div>
      ))}
    </div>
  </div>
);

export default AIPredictor;
