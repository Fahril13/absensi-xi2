import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${color} ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
};

export default StatsCard;