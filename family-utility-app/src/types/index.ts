// User roles for RBAC
export type UserRole = 'superadmin' | 'admin' | 'read_only';

// User types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

// Train Ticket types
export interface Passenger {
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  seatNumber: string;
  status: string;
  bookingStatus: string;
  currentStatus: string;
}

export interface TrainTicket {
  id: string;
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
  status: 'CNF' | 'WL' | 'RAC' | 'CAN' | 'GNWL' | 'RLWL' | 'PQWL';
  chartStatus: 'NOT_PREPARED' | 'PREPARED';
  distance?: number;
  duration?: string;
  coachNumber?: string;
  ticketPdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PNRStatus {
  pnr: string;
  trainNumber: string;
  trainName: string;
  dateOfJourney: string;
  boardingPoint: string;
  destinationStation: string;
  reservationClass: string;
  chartStatus: string;
  passengers: {
    number: number;
    bookingStatus: string;
    currentStatus: string;
  }[];
}

// Trip types
export interface Trip {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  destination: string;
  tickets: string[]; // Array of ticket IDs
  documents: TripDocument[];
  photos: TripPhoto[];
  placesToVisit: PlaceToVisit[];
  expenses: Expense[];
  totalBudget?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripDocument {
  id: string;
  name: string;
  type: 'ticket' | 'aadhar' | 'passport' | 'hotel' | 'other';
  url: string;
  uploadedAt: Date;
}

export interface TripPhoto {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: Date;
}

export interface PlaceToVisit {
  id: string;
  name: string;
  description?: string;
  address?: string;
  googleMapsUrl?: string;
  estimatedTime?: string;
  visited: boolean;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface Expense {
  id: string;
  category: 'food' | 'transport' | 'accommodation' | 'shopping' | 'entertainment' | 'other';
  description: string;
  amount: number;
  paidBy: string;
  date: Date;
  splitBetween?: string[];
}

// Medicine types
export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age?: number;
  color: string;
  createdAt: Date;
}

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  manufacturer?: string;
  strength?: string; // e.g., "500mg"
  form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'drops' | 'other';
  images: string[]; // URLs to images (max 2)
  assignedTo: string[]; // Family member IDs
  
  // Dosage information
  dosagePerDay: number; // How many times per day
  quantityPerDose: number; // How many tablets/ml per dose
  timing: string[]; // Array of timing values
  
  // Stock information
  totalQuantity: number; // Total tablets/ml in pack
  currentQuantity: number; // Remaining
  stripCount?: number; // For tablets - number of strips
  tabletsPerStrip?: number; // Tablets per strip
  
  // Cost information
  costPerPack: number;
  
  // Additional info
  prescribedBy?: string;
  prescriptionDate?: Date;
  expiryDate?: Date;
  googleInfoUrl?: string;
  notes?: string;
  
  // Tracking
  lastRefillDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicineLog {
  id: string;
  medicineId: string;
  familyMemberId: string;
  takenAt: Date;
  quantity: number;
  notes?: string;
}

// Filter types
export interface TicketFilters {
  searchQuery?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
  source?: string;
  destination?: string;
  passengerName?: string;
  trainNumber?: string;
}

export interface MedicineFilters {
  searchQuery?: string;
  assignedTo?: string;
  form?: string;
  timing?: string;
  lowStock?: boolean;
  expired?: boolean;
}
