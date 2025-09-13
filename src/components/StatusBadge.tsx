import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'hadir':
        return {
          label: 'Hadir',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          icon: '✅'
        };
      case 'izin':
        return {
          label: 'Izin',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          icon: '📝'
        };
      case 'sakit':
        return {
          label: 'Sakit',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-200',
          icon: '🤒'
        };
      case 'alfa':
      default:
        return {
          label: 'Tidak Hadir',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          icon: '❌'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

export default StatusBadge;