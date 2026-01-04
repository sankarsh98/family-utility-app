import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Check, 
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { Button, Card } from '../ui';
import { TrainTicket, Passenger } from '../../types';
import { getTrainTimes, fetchTrainSchedule, COMMON_TRAINS } from '../../utils/trainData';

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
  const [parsedTickets, setParsedTickets] = useState<ParsedTicketData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const parseIRCTCEmail = async (text: string): Promise<ParsedTicketData> => {
    // IRCTC email parsing logic
    // Handle both raw email format and HTML content in EML files
    
    // Remove HTML tags if present and decode content
    let cleanText = text
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#\d+;/g, '')
      .replace(/=\r?\n/g, '') // Quoted-printable line breaks
      .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/\s+/g, ' ');

    console.log('Parsing IRCTC email text:', cleanText.substring(0, 1000));
    
    // PNR patterns - IRCTC format: "PNR No. : 4938302790"
    const pnrMatch = cleanText.match(/PNR\s*(?:No\.?|Number)?\s*[:\s]\s*(\d{10})/i) ||
                     cleanText.match(/(\d{10})\s*(?:is your PNR|PNR)/i);
    
    // Train number and name patterns - "Train No. / Name : 12733 / NARAYANADRI SF"
    const trainMatch = cleanText.match(/Train\s*(?:No\.?\s*\/\s*Name|Number)[:\s]*(\d{5})\s*[\/\s]+([A-Za-z\s]+?)(?=\s+Quota|\s+on|\s+from)/i) ||
                       cleanText.match(/(\d{5})\s*[\-\/]\s*([A-Za-z\s]+?)(?=\s+Quota|\s+Class|\s+From)/i);
    
    // Quota - "Quota : GENERAL"
    const quotaMatch = cleanText.match(/Quota\s*[:\s]\s*([A-Z]+)/i);
    
    // Class - "Class : SLEEPER CLASS" or just "SL", "3A", etc.
    const classMatch = cleanText.match(/Class\s*[:\s]\s*([A-Za-z\s]+?)(?=\s+From|\s+Transaction|$)/i) ||
                       cleanText.match(/\b(SLEEPER\s*CLASS|FIRST\s*AC|SECOND\s*AC|THIRD\s*AC|1A|2A|3A|SL|CC|2S|3E|EC|FC)\b/i);
    
    // Station patterns - "From : NELLORE (NLR)" "To : LINGAMPALLI (LPI)"
    const fromMatch = cleanText.match(/From\s*[:\s]\s*([A-Za-z\s]+?)\s*\(([A-Z]{2,5})\)/i);
    // const toMatch = cleanText.match(/(?:To|Reservation\s*(?:Up\s*to|Upto))\s*[:\s]\s*([A-Za-z\s]+?)\s*\(?\s*([A-Z]{2,5})\s*\)?/i);
    const toMatch = cleanText.match(/(?:To|Destination|Reserv(?:ation)?\s*(?:Upto|Up\s*To))[:\s-]*([A-Za-z\s]+?)\s*\(([A-Z]{2,5})\)/i) ||
                    cleanText.match(/(?:to|→)\s*([A-Za-z\s]+?)\s*\(([A-Z]{2,5})\)/i);
    // Boarding station - "Boarding At : NLR"
    const boardingMatch = cleanText.match(/Boarding\s*(?:At)?\s*[:\s]\s*([A-Z]{2,5})/i);
    
    // Date of Journey - "Date of Journey : 10-Feb-2026"
    const journeyDateMatch = cleanText.match(/Date\s*(?:of)?\s*Journey\s*[:\s]\s*(\d{1,2}[\-\/][A-Za-z]{3}[\-\/]\d{4})/i) ||
                             cleanText.match(/Date\s*(?:of)?\s*Journey\s*[:\s]\s*(\d{1,2}[\-\/]\d{1,2}[\-\/]\d{4})/i);
    
    // Booking Date - "Date & Time of Booking : 03-Jan-2026 09:17:40 PM HRS"
    const bookingDateMatch = cleanText.match(/Date\s*&\s*Time\s*of\s*Booking\s*[:\s]\s*(\d{1,2}[\-\/][A-Za-z]{3}[\-\/]\d{4})/i);
    
    // Departure/Arrival times - "Scheduled Departure* : N.A." or actual time
    const depTimeMatch = cleanText.match(/(?:Scheduled\s+)?Departure\*?\s*[:\s]\s*(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
    const arrTimeMatch = cleanText.match(/(?:Scheduled\s+)?Arrival\s*[:\s]\s*(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
    
    // Total Fare - "Total Fare Rs. 768.60" or "Rs. 768.60"
    // const fareMatch = cleanText.match(/(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{2})?)/i);
    // const fareMatch = cleanText.match(/(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d+)?)/i);
    // Match fare in format: "Rs. 768.60 *#" or "Rs. 768.60" or "₹768.60"
    const fareMatch = cleanText.match(/(?:Rs\.?|INR|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)\s*\*?#?/i) ||
                      cleanText.match(/Total\s*Fare[:\s]*(?:Rs\.?|INR|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    // Parse passengers from table format:
    // "Sl. No. Name Age Gender Catering Service Option Status Coach Seat / Berth / WL No"
    // "1 P NARENDER RAJU 53 Male N/A CNF S6 10"
    const passengers: Passenger[] = [];
    
    // Pattern for IRCTC table format: number, name, age, gender, N/A, status, coach, seat
    const passengerTableRegex = /(\d+)\s+([A-Z][A-Z\s]+?)\s+(\d{1,3})\s+(Male|Female|M|F)\s+N\/A\s+(CNF|WL|RAC|CAN|RLWL|GNWL|PQWL)\s+([A-Z0-9]+)\s+(\d+)/gi;
    let passengerMatch;
    
    while ((passengerMatch = passengerTableRegex.exec(cleanText)) !== null) {
      const gender = passengerMatch[4].toUpperCase();
      const rawStatus = passengerMatch[5].toUpperCase();
      const coach = passengerMatch[6];
      const seat = passengerMatch[7];
      
      // Normalize status - RLWL, GNWL, PQWL are all waitlist types
      let normalizedStatus: 'CNF' | 'WL' | 'RAC' = 'CNF';
      if (rawStatus === 'CNF') {
        normalizedStatus = 'CNF';
      } else if (rawStatus === 'RAC') {
        normalizedStatus = 'RAC';
      } else if (['WL', 'RLWL', 'GNWL', 'PQWL'].includes(rawStatus)) {
        normalizedStatus = 'WL';
      }
      
      passengers.push({
        name: passengerMatch[2].trim(),
        age: parseInt(passengerMatch[3]),
        gender: gender.startsWith('M') ? 'M' : 'F',
        seatNumber: `${coach}-${seat}`,
        status: normalizedStatus,
        bookingStatus: rawStatus,
        currentStatus: `${coach}/${seat}`,
      });
    }
    
    // Alternative pattern for different format: "1. Name, Age, Gender, Status"
    if (passengers.length === 0) {
      const altPassengerRegex = /(\d+)\.\s*([A-Za-z\s]+?),?\s*(\d+)\s*(?:yrs?|years?)?,?\s*(M|F|Male|Female)\s*,?\s*(CNF|WL|RAC|RLWL)/gi;
      let altMatch;
      while ((altMatch = altPassengerRegex.exec(cleanText)) !== null) {
        const gender = altMatch[4].toUpperCase();
        const rawStatus = altMatch[5].toUpperCase();
        let normalizedStatus: 'CNF' | 'WL' | 'RAC' = 'CNF';
        if (rawStatus === 'CNF') normalizedStatus = 'CNF';
        else if (rawStatus === 'RAC') normalizedStatus = 'RAC';
        else normalizedStatus = 'WL';
        
        passengers.push({
          name: altMatch[2].trim(),
          age: parseInt(altMatch[3]),
          gender: gender.startsWith('M') ? 'M' : 'F',
          seatNumber: 'TBA',
          status: normalizedStatus,
          bookingStatus: rawStatus,
          currentStatus: rawStatus,
        });
      }
    }
    
    // If still no passengers found, create a placeholder
    if (passengers.length === 0) {
      // Try to get adult/child count
      const adultMatch = cleanText.match(/Adult\s*[:\s]\s*(\d+)/i);
      const numPassengers = parseInt(adultMatch?.[1] || '1');
      for (let i = 1; i <= numPassengers; i++) {
        passengers.push({
          name: `Passenger ${i}`,
          age: 30,
          gender: 'M',
          seatNumber: 'TBA',
          status: 'CNF',
          bookingStatus: 'CNF',
          currentStatus: 'CNF',
        });
      }
    }

    // Determine overall status - check ALL passengers
    // If any passenger has WL or RAC, the overall status reflects that
    let status: 'CNF' | 'WL' | 'RAC' | 'CAN' = 'CNF';
    let hasWL = false;
    let hasRAC = false;
    let hasCAN = false;
    
    for (const p of passengers) {
      if (p.status === 'WL') hasWL = true;
      if (p.status === 'RAC') hasRAC = true;
      // Check if passenger status indicates cancellation
      if (p.bookingStatus === 'CAN') hasCAN = true;
    }
    
    // Check for explicit ticket cancellation - more specific patterns
    // This should match "Ticket Cancelled" or "Booking Cancelled" but not "Cancellation Charges"
    const isCancelled = cleanText.match(/(?:ticket|booking|PNR)\s+(?:has\s+been\s+)?cancell?ed/i) ||
                        cleanText.match(/cancell?ation\s+of\s+(?:ticket|booking|PNR)/i) ||
                        cleanText.match(/your\s+(?:ticket|booking)\s+(?:is|has\s+been)\s+cancell?ed/i) ||
                        hasCAN;
    
    // Priority: CAN > WL > RAC > CNF
    if (isCancelled) {
      status = 'CAN';
    } else if (hasWL) {
      status = 'WL';
    } else if (hasRAC) {
      status = 'RAC';
    }
    // All passengers confirmed = CNF (default)

    // Parse journey date - format: "10-Feb-2026" or "10/02/2026"
    let journeyDate = new Date();
    if (journeyDateMatch) {
      const dateStr = journeyDateMatch[1];
      // Parse DD-Mon-YYYY format (e.g., "10-Feb-2026")
      const monthNames: { [key: string]: number } = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
      };
      const parts = dateStr.split(/[\-\/]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const monthStr = parts[1].toLowerCase();
        const month = monthNames[monthStr.substring(0, 3)] ?? parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        journeyDate = new Date(year, month, day);
      }
    }
    
    // Parse booking date
    let bookingDate = new Date();
    if (bookingDateMatch) {
      const dateStr = bookingDateMatch[1];
      const monthNames: { [key: string]: number } = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
      };
      const parts = dateStr.split(/[\-\/]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const monthStr = parts[1].toLowerCase();
        const month = monthNames[monthStr.substring(0, 3)] ?? parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        bookingDate = new Date(year, month, day);
      }
    }
    
    // Convert class name to code
    const classNameToCode: { [key: string]: string } = {
      'sleeper class': 'SL',
      'sleeper': 'SL',
      'first ac': '1A',
      'first class ac': '1A',
      'second ac': '2A',
      'second class ac': '2A',
      'third ac': '3A',
      'third class ac': '3A',
      'chair car': 'CC',
      'second sitting': '2S',
      'ac 3 economy': '3E',
      'executive class': 'EC',
      'first class': 'FC',
    };
    
    let travelClass = 'SL';
    if (classMatch) {
      const classValue = classMatch[1].trim().toUpperCase();
      // Check if it's already a code
      if (['1A', '2A', '3A', 'SL', 'CC', '2S', '3E', 'EC', 'FC'].includes(classValue)) {
        travelClass = classValue;
      } else {
        // Try to convert from name
        const lowerClass = classMatch[1].trim().toLowerCase();
        travelClass = classNameToCode[lowerClass] || 'SL';
      }
    }
    
    // Use boarding station code if available, otherwise use from station
    const boardingCode = boardingMatch?.[1] || fromMatch?.[2] || 'UNK';
    const destCode = toMatch?.[2]?.trim() || 'UNK';
    const trainNum = trainMatch?.[1] || '';
    
    // Try to get train times from lookup table first (sync)
    let trainTimes = getTrainTimes(trainNum, boardingCode, destCode);
    
    // If not found in static data, try to fetch from API (async)
    if (!trainTimes && trainNum) {
      try {
        trainTimes = await fetchTrainSchedule(trainNum, boardingCode, destCode);
      } catch (error) {
        console.log('Failed to fetch train schedule from API:', error);
      }
    }
    
    // Use looked up times if available, otherwise use parsed or default
    const departureTime = trainTimes?.boardingTime || depTimeMatch?.[1] || 'N.A.';
    const arrivalTime = trainTimes?.arrivalTime || arrTimeMatch?.[1] || 'N.A.';
    // Get train name from: API result > parsed from email > common trains lookup > default
    const finalTrainName = trainTimes?.trainName || trainMatch?.[2]?.trim() || COMMON_TRAINS[trainNum] || 'Unknown Train';

    const result = {
      pnr: pnrMatch?.[1] || 'Unknown',
      trainNumber: trainMatch?.[1] || 'Unknown',
      trainName: finalTrainName,
      journeyDate,
      boardingStation: fromMatch?.[1]?.trim() || 'Unknown',
      boardingStationCode: boardingCode,
      destinationStation: toMatch?.[1]?.trim() || 'Unknown',
      destinationStationCode: destCode,
      departureTime,
      arrivalTime,
      travelClass,
      quota: quotaMatch?.[1]?.toUpperCase() || 'GENERAL',
      passengers,
      totalFare: parseFloat(fareMatch?.[1]?.replace(/,/g, '') || '0'),
      bookingDate,
      status,
      chartStatus: 'NOT_PREPARED' as const,
    };

    console.log('Parsed IRCTC ticket:', result);
    return result;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setParsedTickets([]);
    setCurrentIndex(0);

    const successfullyParsed: ParsedTicketData[] = [];
    const errors: string[] = [];

    for (const file of acceptedFiles) {
      try {
        let text = '';
        
        if (file.type === 'application/pdf') {
          errors.push(`${file.name}: PDF parsing requires backend processing.`);
          continue;
        } else if (file.type.includes('text') || file.name.endsWith('.eml')) {
          text = await file.text();
        } else {
          errors.push(`${file.name}: Unsupported file format.`);
          continue;
        }

        const parsed = await parseIRCTCEmail(text);
        successfullyParsed.push(parsed);
      } catch (err: any) {
        errors.push(`${file.name}: ${err.message || 'Failed to parse'}`);
      }
    }

    if (errors.length > 0 && successfullyParsed.length === 0) {
      setError(errors.join('\n'));
    } else if (errors.length > 0) {
      setError(`Parsed ${successfullyParsed.length} tickets. Errors: ${errors.length}`);
    }

    setParsedTickets(successfullyParsed);
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'message/rfc822': ['.eml'],
    },
    multiple: true,
  });

  const currentTicket = parsedTickets[currentIndex];

  const handleConfirm = () => {
    if (currentTicket) {
      onTicketParsed(currentTicket);
      if (currentIndex < parsedTickets.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setParsedTickets([]);
        setCurrentIndex(0);
      }
    }
  };

  const handleConfirmAll = () => {
    parsedTickets.forEach(ticket => {
      onTicketParsed(ticket);
    });
    setParsedTickets([]);
    setCurrentIndex(0);
  };

  const handleSkip = () => {
    if (currentIndex < parsedTickets.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setParsedTickets([]);
      setCurrentIndex(0);
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
              Drag & drop or click to select (PDF, TXT, EML) - Multiple files supported
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
        {currentTicket && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {parsedTickets.length > 1 
                        ? `Ticket ${currentIndex + 1} of ${parsedTickets.length}` 
                        : 'Ticket Parsed Successfully'}
                    </h3>
                  </div>
                  {parsedTickets.length > 1 && (
                    <span className="text-sm text-gray-500">
                      {parsedTickets.length - currentIndex - 1} remaining
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">PNR</span>
                    <span className="font-mono font-medium">{currentTicket.pnr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Train</span>
                    <span className="font-medium">{currentTicket.trainNumber} - {currentTicket.trainName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Route</span>
                    <span className="font-medium">
                      {currentTicket.boardingStationCode} → {currentTicket.destinationStationCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Journey Date</span>
                    <span className="font-medium">
                      {currentTicket.journeyDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Passengers</span>
                    <span className="font-medium">{currentTicket.passengers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fare</span>
                    <span className="font-medium text-maroon-600">₹{currentTicket.totalFare.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => { setParsedTickets([]); setCurrentIndex(0); }}
                    className="flex-1"
                  >
                    Cancel All
                  </Button>
                  {parsedTickets.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        onClick={handleSkip}
                      >
                        Skip
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleConfirmAll}
                      >
                        Add All ({parsedTickets.length})
                      </Button>
                    </>
                  )}
                  <Button
                    variant="primary"
                    onClick={handleConfirm}
                    className="flex-1"
                  >
                    {parsedTickets.length > 1 ? 'Add This' : 'Add Ticket'}
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
