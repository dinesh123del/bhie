"use client"
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PartnerWidgetProps {
  partnerId: string;
  apiKey: string;
  theme?: 'light' | 'dark' | 'auto';
  width?: number;
  height?: number;
  businessId?: string;
}

interface HealthData {
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  creditworthiness: string;
  confidence: number;
  lastUpdated: string;
}

export const BizPlusPartnerWidget: React.FC<PartnerWidgetProps> = ({
  partnerId,
  apiKey,
  theme = 'auto',
  width = 400,
  height = 300,
  businessId
}) => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = useCallback(async () => {
    try {
      setLoading(true);

      // If no specific business, show aggregated portfolio view
      const endpoint = businessId
        ? `/api/partner/v2/businesses/${businessId}/health-score`
        : `/api/partner/v2/partners/${partnerId}/portfolio`;

      const response = await fetch(endpoint, {
        headers: {
          'X-API-Key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch health data');
      }

      const data = await response.json();

      if (businessId) {
        setHealth({
          score: data.score,
          trend: data.trend,
          creditworthiness: data.creditworthiness,
          confidence: data.confidence,
          lastUpdated: data.generatedAt
        });
      } else {
        // Portfolio view - show average
        setHealth({
          score: data.summary.avgHealth,
          trend: data.summary.healthTrend,
          creditworthiness: data.summary.avgCreditworthiness,
          confidence: 0.95,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [businessId, partnerId, apiKey]);

  useEffect(() => {
    // Fetch initial health data
    fetchHealthData();

    // Set up SSE for real-time updates
    let eventSource: EventSource | null = null;

    if (businessId) {
      eventSource = new EventSource(
        `/api/partner/v2/stream/health?partner=${partnerId}&businesses=${businessId}&key=${apiKey}`
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setHealth(data);
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      };

      eventSource.onerror = () => {
        console.error('SSE connection error');
      };
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [partnerId, apiKey, businessId, theme, fetchHealthData]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#22c55e'; // green-500
    if (score >= 65) return '#84cc16'; // lime-500
    if (score >= 50) return '#eab308'; // yellow-500
    if (score >= 35) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 35) return 'Poor';
    return 'Critical';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  if (loading) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center bg-gray-100 rounded-xl"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center bg-red-50 rounded-xl p-4"
      >
        <p className="text-red-600 text-sm text-center">
          ⚠️ Unable to load health score<br />
          <span className="text-xs">{error || 'Please try again later'}</span>
        </p>
      </div>
    );
  }

  const scoreColor = getScoreColor(health.score);
  const scoreLabel = getScoreLabel(health.score);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{ width, height }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            <span className="text-white font-semibold">BIZ PLUS Health Score</span>
          </div>
          <span className="text-xs text-blue-100">
            Powered by AI
          </span>
        </div>
      </div>

      {/* Score Display */}
      <div className="p-6">
        <div className="flex items-center justify-center">
          {/* Circular Progress */}
          <div className="relative">
            <svg width="120" height="120" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 339.292' }}
                animate={{
                  strokeDasharray: `${(health.score / 100) * 339.292} 339.292`
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>

            {/* Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-4xl font-bold"
                style={{ color: scoreColor }}
              >
                {health.score}
              </span>
              <span className="text-xs text-gray-500">/ 100</span>
            </div>
          </div>
        </div>

        {/* Score Label */}
        <div className="text-center mt-4">
          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${scoreColor}20`,
              color: scoreColor
            }}
          >
            {scoreLabel} {getTrendIcon(health.trend)}
          </span>
        </div>

        {/* Creditworthiness */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Credit Rating</span>
            <span className="font-medium capitalize">{health.creditworthiness}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">AI Confidence</span>
            <span className="font-medium">{Math.round(health.confidence * 100)}%</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-[#C0C0C0]">
            Last updated: {new Date(health.lastUpdated).toLocaleTimeString()}
          </p>
          <a
            href="https://bizplus.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
          >
            Learn more about BIZ PLUS →
          </a>
        </div>
      </div>
    </motion.div>
  );
};

// Compact inline badge version
export const BizPlusHealthBadge: React.FC<{
  score: number;
  size?: 'sm' | 'md' | 'lg';
}> = ({ score, size = 'md' }) => {
  const getColor = (s: number) => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 65) return 'bg-lime-500';
    if (s >= 50) return 'bg-yellow-500';
    if (s >= 35) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg'
  };

  return (
    <div
      className={`${sizes[size]} ${getColor(score)} rounded-full flex items-center justify-center text-white font-bold shadow-md`}
      title={`Health Score: ${score}/100`}
    >
      {score}
    </div>
  );
};
