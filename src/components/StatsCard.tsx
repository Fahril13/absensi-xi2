import React from 'react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, className = '' }) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
  return (
    <motion.div
      className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${color} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <CountUp
            end={numericValue}
            duration={2}
            className="text-2xl font-bold text-gray-900"
          />
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </motion.div>
  );
};

export default StatsCard;