// Common Indian Railways train schedules
// This is a static lookup table for popular trains
// In production, you would integrate with actual IRCTC/Indian Railways API

interface TrainSchedule {
  trainNumber: string;
  trainName: string;
  stations: {
    code: string;
    name: string;
    arrivalTime: string;
    departureTime: string;
    day: number; // Day relative to journey start (1 = same day)
  }[];
}

// Popular train schedules (sample data)
const TRAIN_SCHEDULES: TrainSchedule[] = [
  {
    trainNumber: '12733',
    trainName: 'NARAYANADRI SF EXP',
    stations: [
      { code: 'SC', name: 'Secunderabad Jn', arrivalTime: '--', departureTime: '20:30', day: 1 },
      { code: 'LPI', name: 'Lingampalli', arrivalTime: '20:56', departureTime: '20:58', day: 1 },
      { code: 'MBNR', name: 'Mahabubnagar', arrivalTime: '22:45', departureTime: '22:47', day: 1 },
      { code: 'KRN', name: 'Kurnool City', arrivalTime: '00:48', departureTime: '00:50', day: 2 },
      { code: 'GTL', name: 'Guntakal Jn', arrivalTime: '02:30', departureTime: '02:40', day: 2 },
      { code: 'GY', name: 'Gooty', arrivalTime: '03:02', departureTime: '03:04', day: 2 },
      { code: 'YNPD', name: 'Yerraguntla', arrivalTime: '04:23', departureTime: '04:25', day: 2 },
      { code: 'KDP', name: 'Kadapa', arrivalTime: '05:00', departureTime: '05:02', day: 2 },
      { code: 'NRE', name: 'Nandalur', arrivalTime: '05:40', departureTime: '05:42', day: 2 },
      { code: 'RU', name: 'Renigunta Jn', arrivalTime: '07:00', departureTime: '07:05', day: 2 },
      { code: 'TPTY', name: 'Tirupati', arrivalTime: '07:35', departureTime: '--', day: 2 },
    ]
  },
  {
    trainNumber: '12734',
    trainName: 'NARAYANADRI SF EXP',
    stations: [
      { code: 'TPTY', name: 'Tirupati', arrivalTime: '--', departureTime: '19:30', day: 1 },
      { code: 'RU', name: 'Renigunta Jn', arrivalTime: '19:50', departureTime: '19:55', day: 1 },
      { code: 'NLR', name: 'Nellore', arrivalTime: '21:33', departureTime: '21:35', day: 1 },
      { code: 'OGL', name: 'Ongole', arrivalTime: '23:08', departureTime: '23:10', day: 1 },
      { code: 'GNT', name: 'Guntur Jn', arrivalTime: '01:10', departureTime: '01:15', day: 2 },
      { code: 'BZA', name: 'Vijayawada Jn', arrivalTime: '02:30', departureTime: '02:40', day: 2 },
      { code: 'KI', name: 'Khammam', arrivalTime: '04:53', departureTime: '04:55', day: 2 },
      { code: 'WL', name: 'Warangal', arrivalTime: '06:28', departureTime: '06:30', day: 2 },
      { code: 'SC', name: 'Secunderabad Jn', arrivalTime: '08:30', departureTime: '--', day: 2 },
    ]
  },
  {
    trainNumber: '12259',
    trainName: 'SEALDAH DURONTO',
    stations: [
      { code: 'NDLS', name: 'New Delhi', arrivalTime: '--', departureTime: '19:15', day: 1 },
      { code: 'SDAH', name: 'Sealdah', arrivalTime: '12:30', departureTime: '--', day: 2 },
    ]
  },
  {
    trainNumber: '12301',
    trainName: 'HOWRAH RAJDHANI',
    stations: [
      { code: 'NDLS', name: 'New Delhi', arrivalTime: '--', departureTime: '16:55', day: 1 },
      { code: 'CNB', name: 'Kanpur Central', arrivalTime: '21:48', departureTime: '21:53', day: 1 },
      { code: 'ALD', name: 'Prayagraj Jn', arrivalTime: '00:25', departureTime: '00:30', day: 2 },
      { code: 'MGS', name: 'Mughal Sarai', arrivalTime: '02:40', departureTime: '02:50', day: 2 },
      { code: 'GAYA', name: 'Gaya Jn', arrivalTime: '05:15', departureTime: '05:20', day: 2 },
      { code: 'DHN', name: 'Dhanbad Jn', arrivalTime: '07:25', departureTime: '07:30', day: 2 },
      { code: 'ASN', name: 'Asansol Jn', arrivalTime: '08:20', departureTime: '08:23', day: 2 },
      { code: 'HWH', name: 'Howrah Jn', arrivalTime: '09:55', departureTime: '--', day: 2 },
    ]
  },
];

export interface TrainTimeLookup {
  trainNumber: string;
  trainName: string;
  boardingTime: string;
  arrivalTime: string;
  duration: string;
}

/**
 * Look up train times based on train number and station codes
 */
export function getTrainTimes(
  trainNumber: string,
  boardingStationCode: string,
  destinationStationCode: string
): TrainTimeLookup | null {
  const train = TRAIN_SCHEDULES.find(t => t.trainNumber === trainNumber);
  if (!train) return null;

  const boardingStation = train.stations.find(s => s.code === boardingStationCode);
  const destinationStation = train.stations.find(s => s.code === destinationStationCode);

  if (!boardingStation || !destinationStation) return null;

  // Calculate duration
  let duration = 'N/A';
  if (boardingStation.departureTime !== '--' && destinationStation.arrivalTime !== '--') {
    const [depHour, depMin] = boardingStation.departureTime.split(':').map(Number);
    const [arrHour, arrMin] = destinationStation.arrivalTime.split(':').map(Number);
    
    let totalMinutes = (arrHour * 60 + arrMin) - (depHour * 60 + depMin);
    if (destinationStation.day > boardingStation.day) {
      totalMinutes += (destinationStation.day - boardingStation.day) * 24 * 60;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    duration = `${hours}h ${minutes}m`;
  }

  return {
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    boardingTime: boardingStation.departureTime,
    arrivalTime: destinationStation.arrivalTime,
    duration,
  };
}

/**
 * Try to fetch train schedule from external API (with fallback to static data)
 */
export async function fetchTrainSchedule(
  trainNumber: string,
  boardingStationCode: string,
  destinationStationCode: string
): Promise<TrainTimeLookup | null> {
  // First try static lookup
  const staticResult = getTrainTimes(trainNumber, boardingStationCode, destinationStationCode);
  if (staticResult) return staticResult;

  // Try to fetch from a free public API
  try {
    // Using the Indian Railways API via confirmtkt (free tier available)
    // Note: In production, you should use your own API key and handle rate limits
    const response = await fetch(
      `https://indian-railway-api.cyclic.app/trains/getSchedule/${trainNumber}`,
      { 
        signal: AbortSignal.timeout(5000), // 5 second timeout
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.schedule && Array.isArray(data.schedule)) {
        const boardingStation = data.schedule.find((s: any) => 
          s.stationCode === boardingStationCode || 
          s.station_code === boardingStationCode
        );
        const destStation = data.schedule.find((s: any) => 
          s.stationCode === destinationStationCode || 
          s.station_code === destinationStationCode
        );
        
        if (boardingStation && destStation) {
          return {
            trainNumber,
            trainName: data.trainName || data.train_name || COMMON_TRAINS[trainNumber] || 'Express',
            boardingTime: boardingStation.departureTime || boardingStation.departure || 'N.A.',
            arrivalTime: destStation.arrivalTime || destStation.arrival || 'N.A.',
            duration: calculateDuration(
              boardingStation.departureTime || boardingStation.departure,
              destStation.arrivalTime || destStation.arrival,
              boardingStation.day || 1,
              destStation.day || 1
            ),
          };
        }
      }
    }
  } catch (error) {
    console.log('External API failed, using estimated times');
  }

  // If external API fails, return null and let the caller handle it
  return null;
}

/**
 * Calculate duration between two times
 */
function calculateDuration(depTime: string, arrTime: string, depDay: number, arrDay: number): string {
  if (!depTime || !arrTime || depTime === '--' || arrTime === '--') return 'N.A.';
  
  try {
    const [depHour, depMin] = depTime.split(':').map(Number);
    const [arrHour, arrMin] = arrTime.split(':').map(Number);
    
    let totalMinutes = (arrHour * 60 + arrMin) - (depHour * 60 + depMin);
    if (arrDay > depDay) {
      totalMinutes += (arrDay - depDay) * 24 * 60;
    }
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Next day
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  } catch {
    return 'N.A.';
  }
}

/**
 * Common train names lookup for when we only have train number
 */
export const COMMON_TRAINS: { [key: string]: string } = {
  '12733': 'NARAYANADRI SF EXP',
  '12734': 'NARAYANADRI SF EXP',
  '12259': 'SEALDAH DURONTO',
  '12260': 'DURONTO EXP',
  '12301': 'HOWRAH RAJDHANI',
  '12302': 'NEW DELHI RAJDHANI',
  '12951': 'MUMBAI RAJDHANI',
  '12952': 'DELHI RAJDHANI',
  '12627': 'KARNATAKA EXP',
  '12628': 'KARNATAKA EXP',
  '12723': 'TELANGANA EXP',
  '12724': 'TELANGANA EXP',
  '12785': 'AP SAMPARK KRANTI',
  '12786': 'AP SAMPARK KRANTI',
  '11019': 'KONARK EXPRESS',
  '11020': 'KONARK EXPRESS',
  '12615': 'GRAND TRUNK EXP',
  '12616': 'GRAND TRUNK EXP',
};
