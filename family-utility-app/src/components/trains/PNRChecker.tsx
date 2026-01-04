import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Train
} from 'lucide-react';
import { Button, Input, Card } from '../ui';
import { PNRStatus } from '../../types';

interface PNRCheckerProps {
  onStatusReceived?: (status: PNRStatus) => void;
}

export const PNRChecker: React.FC<PNRCheckerProps> = ({ onStatusReceived }) => {
  const [pnr, setPnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<PNRStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkPNR = async () => {
    if (pnr.length !== 10) {
      setError('Please enter a valid 10-digit PNR number');
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      // Note: In production, you would call an actual PNR API
      // Example using RapidAPI's IRCTC API:
      // const response = await fetch(`https://irctc1.p.rapidapi.com/api/v3/getPNRStatus`, {
      //   method: 'GET',
      //   headers: {
      //     'X-RapidAPI-Key': 'YOUR_API_KEY',
      //     'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
      //   }
      // });
      
      // For demo purposes, simulate an API response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response
      const mockStatus: PNRStatus = {
        pnr,
        trainNumber: '12733',
        trainName: 'Narayanadri Express',
        dateOfJourney: '10-Feb-2026',
        boardingPoint: 'TIRUPATI',
        destinationStation: 'NELLORE',
        reservationClass: 'SL',
        chartStatus: 'NOT_PREPARED',
        passengers: [
          { number: 1, bookingStatus: 'S5/45', currentStatus: 'CNF' },
          { number: 2, bookingStatus: 'S5/46', currentStatus: 'CNF' },
        ],
      };
      
      setStatus(mockStatus);
      onStatusReceived?.(mockStatus);
    } catch (err: any) {
      setError(err.message || 'Failed to check PNR status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status.includes('CNF') || status.startsWith('S') || status.startsWith('B')) {
      return 'text-green-600';
    }
    if (status.includes('RAC')) {
      return 'text-orange-600';
    }
    if (status.includes('WL')) {
      return 'text-yellow-600';
    }
    if (status.includes('CAN')) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('CNF') || status.startsWith('S') || status.startsWith('B')) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
    if (status.includes('WL') || status.includes('RAC')) {
      return <Clock className="w-5 h-5 text-yellow-600" />;
    }
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter 10-digit PNR"
          value={pnr}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
            setPnr(value);
          }}
          className="font-mono text-lg tracking-wider"
        />
        <Button
          variant="primary"
          onClick={checkPNR}
          loading={loading}
          disabled={pnr.length !== 10}
          icon={<Search className="w-4 h-4" />}
        >
          Check
        </Button>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Result */}
      {status && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="p-4">
              {/* Train info */}
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="p-2 bg-primary-100 rounded-xl">
                  <Train className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {status.trainNumber} - {status.trainName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {status.boardingPoint} → {status.destinationStation}
                  </p>
                  <p className="text-sm text-gray-500">
                    {status.dateOfJourney} • {status.reservationClass}
                  </p>
                </div>
                <div className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${status.chartStatus === 'PREPARED' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                  }
                `}>
                  Chart {status.chartStatus === 'PREPARED' ? 'Prepared' : 'Not Prepared'}
                </div>
              </div>

              {/* Passengers */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Passenger Status</h4>
                {status.passengers.map((passenger, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-sm font-semibold text-gray-700">{passenger.number}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Booking Status</p>
                        <p className="font-medium text-gray-900">{passenger.bookingStatus}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(passenger.currentStatus)}
                      <span className={`font-semibold ${getStatusColor(passenger.currentStatus)}`}>
                        {passenger.currentStatus}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Refresh button */}
              <Button
                variant="outline"
                onClick={checkPNR}
                loading={loading}
                icon={<RefreshCw className="w-4 h-4" />}
                className="w-full mt-4"
              >
                Refresh Status
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
