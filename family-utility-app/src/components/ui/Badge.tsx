import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {children}
    </span>
  );
};

interface StatusBadgeProps {
  status: 'CNF' | 'WL' | 'RAC' | 'CAN' | 'GNWL' | 'RLWL' | 'PQWL' | string;
}

export const TicketStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getVariant = () => {
    switch (status) {
      case 'CNF':
        return 'success';
      case 'CAN':
        return 'danger';
      case 'RAC':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'CNF':
        return 'Confirmed';
      case 'WL':
      case 'GNWL':
      case 'RLWL':
      case 'PQWL':
        return 'Waiting';
      case 'RAC':
        return 'RAC';
      case 'CAN':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return <Badge variant={getVariant()}>{getLabel()}</Badge>;
};
