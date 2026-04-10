import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Loader,
  RotateCw,
} from 'lucide-react';
import api from '../lib/axios';

interface Metrics {
  totalRecords: number;
  draftCount: number;
  activeCount: number;
  archivedCount: number;
  completionRate: number;
  riskFactors: string[];
}

interface PredictionData {
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
  metrics: Metrics;
  timestamp: string;
}

// import { PredictionsWithRecommendations } from '../types/api'; // Removed unused import

interface RecommendationCardProps {
  recommendation: {
    type: 'critical' | 'warning' | 'suggestion';
    message: string;
  };
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'critical':
        return { bg: 'bg-red-500/20 border-red-500/30 text-red-300', icon: '⚠️', textColor: 'text-red-300' };
      case 'warning':
        return { bg: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300', icon: '⚠️', textColor: 'text-yellow-300' };
      case 'suggestion':
        return { bg: 'bg-[#00D4FF]/20 text-[#00D4FF]/20 border-blue-500/30 text-blue-300', icon: '💡', textColor: 'text-blue-300' };
      default:
        return { bg: 'bg-gray-500/20 border-gray-500/30 text-[#C0C0C0]', icon: 'ℹ️', textColor: 'text-[#C0C0C0]' };
    }
  };

  const config = getTypeConfig(recommendation.type);

  return (
    <div className={`p-4 rounded-xl border ${config.bg} hover:shadow-lg transition-all`}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{config.icon}</span>
        <p className={`text-sm leading-relaxed font-medium ${config.textColor}`}>
          {recommendation.message}
        </p>
      </div>
    </div>
  );
};

const PredictionCard: React.FC = () => {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [recommendationsData, setRecommendationsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrediction();
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await api.get('/analytics/predictions');
      setRecommendationsData(res.data);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    }
  };

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError(null);

      // First fetch records
      const recordsRes = await api.get('/records');
      const recordsData = Array.isArray(recordsRes.data)
        ? recordsRes.data
        : recordsRes.data.records || [];

      // Then fetch prediction
      const predictionRes = await api.post('/ai/predict', {
        records: recordsData,
      });

      setPrediction(predictionRes.data);
    } catch (err) {
      console.error('Failed to fetch prediction:', err);
      setError('Failed to load prediction');
    } finally {
      setLoading(false);
    }
  };

  // Risk level styling
  const getRiskConfig = (level: string) => {
    switch (level) {
      case 'low':
        return {
          color: 'from-emerald-600 to-emerald-700',
          bgColor: 'bg-emerald-500/20',
          borderColor: 'border-emerald-500/30',
          textColor: 'text-emerald-400',
          icon: CheckCircle,
          label: '✓ Low Risk',
        };
      case 'medium':
        return {
          color: 'from-yellow-600 to-yellow-700',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400',
          icon: AlertCircle,
          label: '⚠ Medium Risk',
        };
      case 'high':
        return {
          color: 'from-red-600 to-red-700',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          icon: AlertTriangle,
          label: '⚠ High Risk',
        };
      default:
        return {
          color: 'from-blue-600 to-blue-700',
          bgColor: 'bg-[#00D4FF]/20 text-[#00D4FF]/20',
          borderColor: 'border-blue-500/30',
          textColor: 'text-[#00D4FF]',
          icon: AlertCircle,
          label: 'Unknown',
        };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'from-emerald-500 to-emerald-600';
    if (score >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader className="animate-spin text-[#00D4FF]" size={24} />
          <p className="text-[#C0C0C0]">Processing your records...</p>
        </div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={24} />
          <div className="flex-1">
            <h3 className="font-semibold text-red-400 mb-1">Prediction Error</h3>
            <p className="text-sm text-red-300 mb-4">
              {error || 'Failed to generate prediction'}
            </p>
            <button
              onClick={fetchPrediction}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <RotateCw size={16} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const riskConfig = getRiskConfig(prediction.riskLevel);
  const RiskIcon = riskConfig.icon;
  const scoreColor = getScoreColor(prediction.healthScore);

  return (
    <div className="space-y-4">
      {/* Main Health Score Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-xl border border-white/10 group-hover:border-white/20 transition-all duration-300"></div>

        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Health Score</h2>
              <p className="text-sm text-[#C0C0C0]">
                Based on {prediction.metrics.totalRecords} record
                {prediction.metrics.totalRecords !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={fetchPrediction}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#C0C0C0] hover:text-white"
            >
              <RotateCw size={20} />
            </button>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Score Circle */}
            <div className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  {/* Background circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    strokeDasharray={`${(prediction.healthScore / 100) * 440} 440`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient
                      id="scoreGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div
                    className={`text-5xl font-bold bg-gradient-to-r ${scoreColor} bg-clip-text text-transparent`}
                  >
                    {prediction.healthScore}
                  </div>
                  <div className="text-xs text-[#C0C0C0] mt-1">/ 100</div>
                </div>
              </div>
            </div>

            {/* Risk & Metrics */}
            <div className="flex flex-col justify-between">
              {/* Risk Level */}
              <div
                className={`${riskConfig.bgColor} border ${riskConfig.borderColor} rounded-xl p-4 mb-4`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <RiskIcon className={riskConfig.textColor} size={24} />
                  <h3 className={`text-lg font-bold ${riskConfig.textColor}`}>
                    {riskConfig.label}
                  </h3>
                </div>
                {prediction.metrics.riskFactors.length > 0 && (
                  <div className="space-y-1">
                    {prediction.metrics.riskFactors.map((factor, idx) => (
                      <p key={idx} className="text-xs text-[#C0C0C0]">
                        • {factor}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-xs text-[#C0C0C0] mb-1">Active</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {prediction.metrics.activeCount}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-xs text-[#C0C0C0] mb-1">Draft</p>
                  <p className="text-lg font-bold text-yellow-400">
                    {prediction.metrics.draftCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[#C0C0C0]">Completion Rate</p>
              <p className="text-sm font-bold text-[#00D4FF]">
                {prediction.metrics.completionRate}%
              </p>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${scoreColor} transition-all duration-1000`}
                style={{ width: `${prediction.metrics.completionRate}%` }}
              ></div>
            </div>
          </div>

          {/* Strategic Recommendations */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-emerald-400" size={18} />
              <h3 className="font-semibold text-white">Business Advisor</h3>
              {recommendationsData?.advisor && (
                <div className="ml-auto text-xs bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-3 py-1 rounded-full font-medium">
                  Strategy Advisor
                </div>
              )}
              {recommendationsData && (
                <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                  {recommendationsData.trend.toUpperCase()}
                </span>
              )}
            </div>
            {recommendationsData?.advisor ? (
              <div className="space-y-4">
                {/* Consultant Summary */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-6">
                  <p className="text-lg font-semibold text-white leading-relaxed mb-3">
                    {recommendationsData.advisor.summary}
                  </p>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-blue-300 font-medium text-sm leading-relaxed">
                      🎯 {recommendationsData.advisor.advice}
                    </p>
                  </div>
                </div>

                {/* Additional Recommendations */}
                {recommendationsData.recommendations && recommendationsData.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-[#C0C0C0] mb-3 uppercase tracking-wide">Additional Actions</h4>
                    <div className="space-y-2">
                      {recommendationsData.recommendations!.slice(0, 3).map((rec: any, idx: number) => (
                        <RecommendationCard key={idx} recommendation={rec} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[#C0C0C0] text-sm p-6 text-center">No advisor insights available yet</p>
            )}
            {recommendationsData && (
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-xs">
                <div>Trend: <span className="font-bold">{recommendationsData.trend}</span></div>
                <div>Pred. Revenue: ₹{recommendationsData.predictedRevenue.toLocaleString()}</div>
                <div>Pred. Profit: ₹{recommendationsData.predictedProfit.toLocaleString()}</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Last updated:{' '}
              {new Date(prediction.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <button
              onClick={fetchPrediction}
              className="text-xs px-3 py-1 bg-[#00D4FF]/20 text-[#00D4FF]/20 border border-blue-500/30 text-[#00D4FF] rounded hover:bg-[#00D4FF]/20 text-[#00D4FF]/30 transition-colors flex items-center gap-1"
            >
              <TrendingUp size={12} />
              Refresh Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Records"
          value={prediction.metrics.totalRecords}
          icon="📊"
        />
        <MetricCard
          label="Active"
          value={prediction.metrics.activeCount}
          icon="✓"
          color="emerald"
        />
        <MetricCard
          label="Draft"
          value={prediction.metrics.draftCount}
          icon="✏"
          color="yellow"
        />
        <MetricCard
          label="Archived"
          value={prediction.metrics.archivedCount}
          icon="📦"
          color="gray"
        />
      </div>
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: number;
  icon: string;
  color?: 'emerald' | 'yellow' | 'gray' | 'blue';
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  color = 'blue',
}) => {
  const colorMap = {
    emerald: 'from-emerald-600/20 to-emerald-700/10 border-emerald-500/30',
    yellow: 'from-yellow-600/20 to-yellow-700/10 border-yellow-500/30',
    gray: 'from-gray-600/20 to-gray-700/10 border-gray-500/30',
    blue: 'from-blue-600/20 to-blue-700/10 border-blue-500/30',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-4 text-center`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-[#C0C0C0]">{label}</div>
    </div>
  );
};

export default PredictionCard;
