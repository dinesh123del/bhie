import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const SparkBackground = () => {
  const sparks = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.4 + 0.1,
      blur: i % 5 === 0 ? "blur(4px)" : "blur(0px)", // Distance simulation
      scale: i % 5 === 0 ? 2 : 1,
      color: i % 3 === 0 ? "#8AB4F8" : i % 2 === 0 ? "#C58AF9" : "#FFFFFF"
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#020203]">
      {/* Deep Gradient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
      
      {/* Interactive Sparks */}
      {sparks.map((spark) => (
        <motion.div
          key={spark.id}
          initial={{ 
            x: `${spark.x}%`, 
            y: `${spark.y}%`, 
            opacity: 0,
            scale: 0 
          }}
          animate={{ 
            x: [`${spark.x}%`, `${(spark.x + 8) % 100}%`, `${(spark.x - 8 + 100) % 100}%`],
            y: [`${spark.y}%`, `${(spark.y - 12 + 100) % 100}%`, `${(spark.y + 8) % 100}%`],
            opacity: [0, spark.opacity, 0],
            scale: [0, spark.scale, 0]
          }}
          transition={{
            duration: spark.duration,
            repeat: Infinity,
            delay: spark.delay,
            ease: "linear"
          }}
          style={{
            width: spark.size,
            height: spark.size,
            filter: spark.blur,
            backgroundColor: spark.color,
          }}
          className="absolute rounded-full shadow-[0_0_12px_rgba(255,255,255,0.2)]"
        />
      ))}

      {/* Grid Pattern (Subtle) */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
};

export default SparkBackground;
