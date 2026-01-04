import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Filter, 
  X, 
  Calendar,
  MapPin,
  User,
  Train,
  Search
} from 'lucide-react';
import { Button, Input, Select, Drawer } from '../ui';
import { TicketFilters } from '../../types';
import { TICKET_STATUSES } from '../../config/constants';

interface TicketFiltersProps {
  filters: TicketFilters;
  onFiltersChange: (filters: TicketFilters) => void;
  onClear: () => void;
}

export const TicketFiltersPanel: React.FC<TicketFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const handleChange = (key: keyof TicketFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...Object.entries(TICKET_STATUSES).map(([value, { label }]) => ({
      value,
      label,
    })),
  ];

  return (
    <>
      {/* Filter trigger button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        icon={<Filter className="w-4 h-4" />}
        className="relative"
      >
        Filters
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {/* Filter drawer */}
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Filter Tickets"
        side="bottom"
      >
        <div className="space-y-4">
          {/* Search */}
          <Input
            label="Search"
            placeholder="PNR, train name, station..."
            value={filters.searchQuery || ''}
            onChange={(e) => handleChange('searchQuery', e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="From Date"
              value={filters.dateFrom?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleChange('dateFrom', e.target.value ? new Date(e.target.value) : undefined)}
            />
            <Input
              type="date"
              label="To Date"
              value={filters.dateTo?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleChange('dateTo', e.target.value ? new Date(e.target.value) : undefined)}
            />
          </div>

          {/* Status */}
          <Select
            label="Status"
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            options={statusOptions}
          />

          {/* Source/Destination */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Source Station"
              placeholder="Station name/code"
              value={filters.source || ''}
              onChange={(e) => handleChange('source', e.target.value)}
              icon={<MapPin className="w-4 h-4" />}
            />
            <Input
              label="Destination"
              placeholder="Station name/code"
              value={filters.destination || ''}
              onChange={(e) => handleChange('destination', e.target.value)}
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>

          {/* Passenger name */}
          <Input
            label="Passenger Name"
            placeholder="Search by passenger"
            value={filters.passengerName || ''}
            onChange={(e) => handleChange('passengerName', e.target.value)}
            icon={<User className="w-4 h-4" />}
          />

          {/* Train number */}
          <Input
            label="Train Number"
            placeholder="e.g., 12345"
            value={filters.trainNumber || ''}
            onChange={(e) => handleChange('trainNumber', e.target.value)}
            icon={<Train className="w-4 h-4" />}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onClear();
                setIsOpen(false);
              }}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
};

interface QuickFilterProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const QuickFilter: React.FC<QuickFilterProps> = ({ label, isActive, onClick }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
        ${isActive 
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
          : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
        }
      `}
    >
      {label}
    </motion.button>
  );
};
