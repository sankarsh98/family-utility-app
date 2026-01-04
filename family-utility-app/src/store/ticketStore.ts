import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { TrainTicket, TicketFilters, PNRStatus, Trip } from '../types';

interface TicketState {
  tickets: TrainTicket[];
  trips: Trip[];
  loading: boolean;
  error: string | null;
  filters: TicketFilters;
  
  // Ticket actions
  fetchTickets: () => Promise<void>;
  addTicket: (ticket: Omit<TrainTicket, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTicket: (id: string, updates: Partial<TrainTicket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  
  // Trip actions
  fetchTrips: () => Promise<void>;
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  
  // PNR check
  checkPNRStatus: (pnr: string) => Promise<PNRStatus | null>;
  
  // Filters
  setFilters: (filters: TicketFilters) => void;
  clearFilters: () => void;
  
  // Computed
  getFilteredTickets: () => TrainTicket[];
  getRecentTickets: (count?: number) => TrainTicket[];
  getUpcomingTickets: () => TrainTicket[];
  getTicketsByStation: (station: string) => TrainTicket[];
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],
  trips: [],
  loading: false,
  error: null,
  filters: {},
  
  fetchTickets: async () => {
    try {
      set({ loading: true, error: null });
      const q = query(collection(db, 'tickets'), orderBy('journeyDate', 'desc'));
      const snapshot = await getDocs(q);
      const tickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        journeyDate: doc.data().journeyDate?.toDate(),
        bookingDate: doc.data().bookingDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as TrainTicket[];
      set({ tickets, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  addTicket: async (ticket) => {
    try {
      set({ loading: true, error: null });
      const now = new Date();
      const docRef = await addDoc(collection(db, 'tickets'), {
        ...ticket,
        journeyDate: Timestamp.fromDate(ticket.journeyDate),
        bookingDate: Timestamp.fromDate(ticket.bookingDate),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });
      
      const newTicket: TrainTicket = {
        ...ticket,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      };
      
      set(state => ({ 
        tickets: [newTicket, ...state.tickets],
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  updateTicket: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const ticketRef = doc(db, 'tickets', id);
      await updateDoc(ticketRef, {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      });
      
      set(state => ({
        tickets: state.tickets.map(t => 
          t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  deleteTicket: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(db, 'tickets', id));
      set(state => ({
        tickets: state.tickets.filter(t => t.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchTrips: async () => {
    try {
      set({ loading: true, error: null });
      const q = query(collection(db, 'trips'), orderBy('startDate', 'desc'));
      const snapshot = await getDocs(q);
      const trips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Trip[];
      set({ trips, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  addTrip: async (trip) => {
    try {
      set({ loading: true, error: null });
      const now = new Date();
      const docRef = await addDoc(collection(db, 'trips'), {
        ...trip,
        startDate: Timestamp.fromDate(trip.startDate),
        endDate: Timestamp.fromDate(trip.endDate),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });
      
      const newTrip: Trip = {
        ...trip,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      };
      
      set(state => ({ 
        trips: [newTrip, ...state.trips],
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  updateTrip: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const tripRef = doc(db, 'trips', id);
      await updateDoc(tripRef, {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      });
      
      set(state => ({
        trips: state.trips.map(t => 
          t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  deleteTrip: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(db, 'trips', id));
      set(state => ({
        trips: state.trips.filter(t => t.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  checkPNRStatus: async (pnr: string) => {
    try {
      // Note: In production, you would call an actual PNR status API
      // This is a placeholder that simulates the API response
      console.log('Checking PNR status for:', pnr);
      
      // For now, return null - implement actual API call
      return null;
    } catch (error: any) {
      set({ error: error.message });
      return null;
    }
  },
  
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
  
  getFilteredTickets: () => {
    const { tickets, filters } = get();
    
    return tickets.filter(ticket => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          ticket.pnr.toLowerCase().includes(query) ||
          ticket.trainName.toLowerCase().includes(query) ||
          ticket.trainNumber.toLowerCase().includes(query) ||
          ticket.boardingStation.toLowerCase().includes(query) ||
          ticket.destinationStation.toLowerCase().includes(query) ||
          ticket.passengers.some(p => p.name.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }
      
      if (filters.dateFrom && ticket.journeyDate < filters.dateFrom) return false;
      if (filters.dateTo && ticket.journeyDate > filters.dateTo) return false;
      if (filters.status && ticket.status !== filters.status) return false;
      
      if (filters.source) {
        const source = filters.source.toLowerCase();
        if (!ticket.boardingStation.toLowerCase().includes(source) &&
            !ticket.boardingStationCode.toLowerCase().includes(source)) {
          return false;
        }
      }
      
      if (filters.destination) {
        const dest = filters.destination.toLowerCase();
        if (!ticket.destinationStation.toLowerCase().includes(dest) &&
            !ticket.destinationStationCode.toLowerCase().includes(dest)) {
          return false;
        }
      }
      
      if (filters.passengerName) {
        const name = filters.passengerName.toLowerCase();
        if (!ticket.passengers.some(p => p.name.toLowerCase().includes(name))) {
          return false;
        }
      }
      
      if (filters.trainNumber && !ticket.trainNumber.includes(filters.trainNumber)) {
        return false;
      }
      
      return true;
    });
  },
  
  getRecentTickets: (count = 5) => {
    const { tickets } = get();
    return tickets
      .sort((a, b) => b.bookingDate.getTime() - a.bookingDate.getTime())
      .slice(0, count);
  },
  
  getUpcomingTickets: () => {
    const { tickets } = get();
    const now = new Date();
    return tickets
      .filter(t => t.journeyDate > now && t.status !== 'CAN')
      .sort((a, b) => a.journeyDate.getTime() - b.journeyDate.getTime());
  },
  
  getTicketsByStation: (station: string) => {
    const { tickets } = get();
    const query = station.toLowerCase();
    return tickets.filter(t => 
      t.boardingStation.toLowerCase().includes(query) ||
      t.boardingStationCode.toLowerCase().includes(query) ||
      t.destinationStation.toLowerCase().includes(query) ||
      t.destinationStationCode.toLowerCase().includes(query)
    );
  },
}));
