import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { RevenueFlow3D, GrowthTree3D, LoadingCube3D } from './objects';
import { usePerformanceCheck } from './hooks';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

// Lazy load 3D components for better performance
const LazyRevenueFlow = lazy(() => import('./objects/RevenueFlow').then(m => ({ default: m.RevenueFlow3D })));
const LazyGrowthTree = lazy(() => import('./objects/GrowthTree').then(m => ({ default: m.GrowthTree3D })));

interface Dashboard3DSectionProps {
  revenue?: number;
  growth?: number;
  expenses?: number;
  profit?: number;
}

// Fallback loader
function SectionLoader() {
  return (
    <div className="w-full h-64 flex items-center justify-center">
      <LoadingCube3D size={1} showText={false} />
    </div>
  );
}

export function RevenueFlowCard({
  revenue = 500000,
  growth = 15,
}: {
  revenue?: number;
  growth?: number;
}) {
  const { shouldEnable3D, deviceTier } = usePerformanceCheck();

  if (!shouldEnable3D) {
    // 2D fallback
    return (
      <Card className="h-80">
        <CardHeader>
          <CardTitle>Revenue Flow</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-56">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-500">₹{(revenue / 100000).toFixed(1)}L</p>
            <p className={`text-lg ${growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {growth > 0 ? '↑' : '↓'} {Math.abs(growth)}%
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="h-80 overflow-hidden">
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Revenue Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 -mt-8 h-64">
          <Suspense fallback={<SectionLoader />}>
            <RevenueFlow3D revenue={revenue} growth={growth} particleCount={deviceTier === 'high' ? 50 : 25} />
          </Suspense>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function GrowthTreeCard({
  growth = 25,
  revenue = 1000000,
}: {
  growth?: number;
  revenue?: number;
}) {
  const { shouldEnable3D, deviceTier } = usePerformanceCheck();

  if (!shouldEnable3D) {
    // 2D fallback
    return (
      <Card className="h-80">
        <CardHeader>
          <CardTitle>Business Growth</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-56">
          <div className="text-center">
            <p className={`text-4xl font-bold ${growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {growth > 0 ? '+' : ''}{growth}%
            </p>
            <p className="text-gray-500 mt-2">Growth Rate</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <Card className="h-80 overflow-hidden">
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Business Growth
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-64">
          <Suspense fallback={<SectionLoader />}>
            <GrowthTree3D growth={growth} revenue={revenue} depth={deviceTier === 'high' ? 4 : 3} />
          </Suspense>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function Dashboard3DSection({
  revenue = 500000,
  growth = 15,
  expenses = 300000,
  profit = 200000,
}: Dashboard3DSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <RevenueFlowCard revenue={revenue} growth={growth} />
      <GrowthTreeCard growth={growth} revenue={revenue} />
    </div>
  );
}

export default Dashboard3DSection;
