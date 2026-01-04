import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Check, 
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { Button, Card } from '../ui';
import { TrainTicket, Passenger } from '../../types';

interface TicketUploaderProps {
  onTicketParsed: (ticket: Omit<TrainTicket, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

interface ParsedTicketData {
  pnr: string;
  trainNumber: string;
  trainName: string;
  journeyDate: Date;
  boardingStation: string;
  boardingStationCode: string;
  destinationStation: string;
  destinationStationCode: string;
  departureTime: string;
  arrivalTime: string;
  travelClass: string;
  quota: string;
  passengers: Passenger[];
  totalFare: number;
  bookingDate: Date;
  status: 'CNF' | 'WL' | 'RAC' | 'CAN';
  chartStatus: 'NOT_PREPARED' | 'PREPARED';
}

export const TicketUploader: React.FC<TicketUploaderProps> = ({ onTicketParsed }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedTicketData | null>(null);

  const parseIRCTCEmail = async (text: string): Promise<ParsedTicketData> => {
    // IRCTC email parsing logic
    // This is a simplified parser - you may need to adjust based on actual email format
    
    const pnrMatch = text.match(/PNR\s*[:\-]?\s*(\d{10})/i);
    const trainMatch = text.match(/Train\s*[:\-]?\s*(\d{5})\s*[\-\/]?\s*(.+?)(?=\n|Departure|Arrival)/i);
    const dateMatch = text.match(/(\d{1,2}[\-\/]\w{3}[\-\/]\d{4}|\d{1,2}\s+\w+\s+\d{4})/i);
    const fromMatch = text.match(/From\s*[:\-]?\s*(.+?)\s*\((\w{2,4})\)/i) || 
                      text.match(/Boarding\s*[:\-]?\s*(.+?)\s*\((\w{2,4})\)/i);
    const toMatch = text.match(/To\s*[:\-]?\s*(.+?)\s*\((\w{2,4})\)/i) ||
                    text.match(/Destination\s*[:\-]?\s*(.+?)\s*\((\w{2,4})\)/i);
    const classMatch = text.match(/Class\s*[:\-]?\s*(\w{2,3})/i);
    const fareMatch = text.match(/(?:Total\s*)?Fare\s*[:\-]?\s*(?:Rs\.?|₹)?\s*([\d,]+(?:\.\d{2})?)/i);
    const quotaMatch = text.match(/Quota\s*[:\-]?\s*(\w+)/i);
    const depTimeMatch = text.match(/Departure\s*[:\-]?\s*(\d{1,2}:\d{2})/i);
    const arrTimeMatch = text.match(/Arrival\s*[:\-]?\s*(\d{1,2}:\d{2})/i);
    
    // Parse passengers
    const passengerRegex = /(\d+)\.\s*(.+?)\s+(\d+)\s+(M|F|Male|Female)\s+(.+?)(?:\n|$)/gi;
    const passengers: Passenger[] = [];
    let passengerMatch;
    
    while ((passengerMatch = passengerRegex.exec(text)) !== null) {
      passengers.push({
        name: passengerMatch[2].trim(),
        age: parseInt(passengerMatch[3]),
        gender: passengerMatch[4].startsWith('M') ? 'M' : 'F',
        seatNumber: passengerMatch[5].trim(),
        status: 'CNF',
        bookingStatus: passengerMatch[5].trim(),
        currentStatus: passengerMatch[5].trim(),
      });
    }
    
    // If no passengers found via regex, try alternative parsing
    if (passengers.length === 0) {
      // Fallback: create a single passenger entry
      passengers.push({
        name: 'Passenger 1',
        age: 30,
        gender: 'M',
        seatNumber: 'TBA',
        status: 'CNF',
        bookingStatus: 'CNF',
        currentStatus: 'CNF',
      });
    }

    // Determine status from text
    let status: 'CNF' | 'WL' | 'RAC' | 'CAN' = 'CNF';
    if (text.includes('CANCELLED') || text.includes('CAN')) status = 'CAN';
    else if (text.includes('RAC')) status = 'RAC';
    else if (text.includes('WL') || text.includes('WAITING')) status = 'WL';

    // Parse journey date
    let journeyDate = new Date();
    if (dateMatch) {
      const dateStr = dateMatch[1];
      journeyDate = new Date(dateStr);
      if (isNaN(journeyDate.getTime())) {
        journeyDate = new Date();
      }
    }

    return {
      pnr: pnrMatch?.[1] || 'Unknown',
      trainNumber: trainMatch?.[1] || 'Unknown',
      trainName: trainMatch?.[2]?.trim() || 'Unknown Train',
      journeyDate,
      boardingStation: fromMatch?.[1]?.trim() || 'Unknown',
      boardingStationCode: fromMatch?.[2]?.trim() || 'UNK',
      destinationStation: toMatch?.[1]?.trim() || 'Unknown',
      destinationStationCode: toMatch?.[2]?.trim() || 'UNK',
      departureTime: depTimeMatch?.[1] || '00:00',
      arrivalTime: arrTimeMatch?.[1] || '00:00',
      travelClass: classMatch?.[1] || 'SL',
      quota: quotaMatch?.[1] || 'GENERAL',
      passengers,
      totalFare: parseFloat(fareMatch?.[1]?.replace(',', '') || '0'),
      bookingDate: new Date(),
      status,
      chartStatus: 'NOT_PREPARED',
    };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setParsedData(null);

    try {
      let text = '';
      
      if (file.type === 'application/pdf') {
        // For PDF files, we need to extract text
        // In a real app, you would use pdf.js or a backend service
        // For now, we'll show a message about PDF handling
        setError('PDF parsing requires backend processing. Please use the manual entry form or paste the email text.');
        setUploading(false);
        return;
      } else if (file.type.includes('text') || file.name.endsWith('.eml')) {
        text = await file.text();
      } else {
        throw new Error('Unsupported file format. Please upload a text file or EML file.');
      }

      const parsed = await parseIRCTCEmail(text);
      setParsedData(parsed);
    } catch (err: any) {
      setError(err.message || 'Failed to parse ticket');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'message/rfc822': ['.eml'],
    },
    maxFiles: 1,
  });

  const handleConfirm = () => {
    if (parsedData) {
      onTicketParsed(parsedData);
      setParsedData(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          <div>
            <p className="font-medium text-gray-900">
              {isDragActive ? 'Drop the file here' : 'Upload IRCTC Ticket Email'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag & drop or click to select (PDF, TXT, EML)
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-4 bg-red-50 rounded-xl border border-red-200"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 rounded-full"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parsed data preview */}
      <AnimatePresence>
        {parsedData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Ticket Parsed Successfully</h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">PNR</span>
                    <span className="font-mono font-medium">{parsedData.pnr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Train</span>
                    <span className="font-medium">{parsedData.trainNumber} - {parsedData.trainName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Route</span>
                    <span className="font-medium">
                      {parsedData.boardingStationCode} → {parsedData.destinationStationCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Passengers</span>
                    <span className="font-medium">{parsedData.passengers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fare</span>
                    <span className="font-medium">₹{parsedData.totalFare}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => setParsedData(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleConfirm}
                    className="flex-1"
                  >
                    Add Ticket
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
