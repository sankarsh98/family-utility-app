import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Train, 
  Calendar, 
  Users,
  ChevronRight,
  Armchair,
  Edit,
  Trash2
} from 'lucide-react';
import { TrainTicket } from '../../types';
import { Card, TicketStatusBadge } from '../ui';
import { TRAIN_CLASSES } from '../../config/constants';

interface TicketCardProps {
  ticket: TrainTicket;
  onClick?: () => void;
  onEdit?: (ticket: TrainTicket) => void;
  onDelete?: (ticketId: string) => void;
  canEdit?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick, onEdit, onDelete, canEdit = true }) => {
  const isPast = ticket.journeyDate < new Date();

  return (
    <Card 
      onClick={onClick} 
      hoverable 
      className={`${isPast ? 'opacity-75' : ''} bg-white/90 backdrop-blur border border-gold-200 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-primary-100 to-gold-100 rounded-xl border border-gold-200">
              <Train className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-maroon-600">{ticket.trainNumber}</p>
              <p className="text-sm text-gray-600">{ticket.trainName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TicketStatusBadge status={ticket.status} />
            {canEdit && onEdit && (
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(ticket); }}
                className="p-1.5 hover:bg-gold-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4 text-gray-500" />
              </button>
            )}
            {canEdit && onDelete && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(ticket.id); }}
                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            )}
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase">From</p>
            <p className="font-semibold text-maroon-600">{ticket.boardingStationCode}</p>
            <p className="text-sm text-gray-600 truncate">{ticket.boardingStation}</p>
          </div>
          
          <div className="flex flex-col items-center px-2">
            <div className="w-8 h-px bg-gold-300" />
            <ChevronRight className="w-4 h-4 text-gold-400 -my-1" />
            <div className="w-8 h-px bg-gold-300" />
          </div>
          
          <div className="flex-1 text-right">
            <p className="text-xs text-gray-500 uppercase">To</p>
            <p className="font-semibold text-maroon-600">{ticket.destinationStationCode}</p>
            <p className="text-sm text-gray-600 truncate">{ticket.destinationStation}</p>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gold-100">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-primary-500" />
            <span>{format(ticket.journeyDate, 'dd MMM yyyy')}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Armchair className="w-4 h-4 text-primary-500" />
            <span>{TRAIN_CLASSES[ticket.travelClass as keyof typeof TRAIN_CLASSES] || ticket.travelClass}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{ticket.passengers.length} Passenger{ticket.passengers.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Passengers preview */}
        <div className="mt-3 flex flex-wrap gap-1">
          {ticket.passengers.slice(0, 3).map((passenger, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600"
            >
              {passenger.name}
            </span>
          ))}
          {ticket.passengers.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
              +{ticket.passengers.length - 3} more
            </span>
          )}
        </div>

        {/* Fare */}
        {ticket.totalFare > 0 && (
          <div className="mt-3 text-right">
            <span className="text-lg font-bold text-maroon-600">₹{ticket.totalFare.toFixed(2)}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

interface TicketDetailCardProps {
  ticket: TrainTicket;
}

export const TicketDetailCard: React.FC<TicketDetailCardProps> = ({ 
  ticket
}) => {
  return (
    <div className="space-y-4">
      {/* Train info card */}
      <Card gradient="train">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Train className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">{ticket.trainNumber}</h2>
              <p className="text-white/80">{ticket.trainName}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{ticket.boardingStationCode}</p>
            </div>
            <div className="flex-1 px-4">
              <div className="border-t border-dashed border-white/40" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{ticket.destinationStationCode}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* PNR Info */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">PNR Number</p>
              <p className="text-xl font-bold text-gray-900 font-mono">{ticket.pnr}</p>
            </div>
            <TicketStatusBadge status={ticket.status} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Journey Date</p>
              <p className="font-semibold text-gray-900">
                {format(ticket.journeyDate, 'dd MMM yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Class</p>
              <p className="font-semibold text-gray-900">
                {TRAIN_CLASSES[ticket.travelClass as keyof typeof TRAIN_CLASSES] || ticket.travelClass}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quota</p>
              <p className="font-semibold text-gray-900">{ticket.quota}</p>
            </div>
            {ticket.totalFare > 0 && (
              <div>
                <p className="text-sm text-gray-500">Total Fare</p>
                <p className="font-semibold text-maroon-600">₹{ticket.totalFare.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Passengers */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Passengers</h3>
          <div className="space-y-3">
            {ticket.passengers.map((passenger, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{passenger.name}</p>
                    <p className="text-sm text-gray-500">
                      {passenger.age} yrs, {passenger.gender === 'M' ? 'Male' : passenger.gender === 'F' ? 'Female' : 'Other'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{passenger.seatNumber || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{passenger.currentStatus}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {/* Stations */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Journey Details</h3>
          
          <div className="relative">
            {/* Boarding */}
            <div className="flex gap-4 pb-6">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-primary-600 rounded-full" />
                <div className="w-0.5 h-full bg-gray-200" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{ticket.boardingStation}</p>
                <p className="text-sm text-gray-500">{ticket.boardingStationCode}</p>
              </div>
            </div>
            
            {/* Destination */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-secondary-600 rounded-full" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{ticket.destinationStation}</p>
                <p className="text-sm text-gray-500">{ticket.destinationStationCode}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
