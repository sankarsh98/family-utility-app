import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  gradient?: 'train' | 'medicine' | 'primary' | 'secondary' | 'success' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  gradient = 'none',
}) => {
  const gradients = {
    train: 'gradient-train text-white',
    medicine: 'gradient-medicine text-white',
    primary: 'gradient-primary text-white',
    secondary: 'gradient-secondary text-white',
    success: 'gradient-success text-white',
    none: 'bg-white',
  };

  return (
    <motion.div
      whileHover={hoverable ? { y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        rounded-2xl shadow-lg overflow-hidden
        ${gradients[gradient]}
        ${hoverable ? 'cursor-pointer card-hover' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-4 py-3 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-4 py-3 border-t border-gray-100 ${className}`}>
    {children}
  </div>
);
