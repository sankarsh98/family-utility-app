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
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Medicine, FamilyMember, MedicineFilters, MedicineLog } from '../types';

interface MedicineState {
  medicines: Medicine[];
  familyMembers: FamilyMember[];
  medicineLogs: MedicineLog[];
  loading: boolean;
  error: string | null;
  filters: MedicineFilters;
  
  // Medicine actions
  fetchMedicines: () => Promise<void>;
  addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMedicine: (id: string, updates: Partial<Medicine>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  uploadMedicineImage: (medicineId: string, file: File) => Promise<string>;
  
  // Family member actions
  fetchFamilyMembers: () => Promise<void>;
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'createdAt'>) => Promise<void>;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => Promise<void>;
  deleteFamilyMember: (id: string) => Promise<void>;
  
  // Medicine log actions
  logMedicineTaken: (medicineId: string, memberId: string, quantity: number) => Promise<void>;
  
  // Filters
  setFilters: (filters: MedicineFilters) => void;
  clearFilters: () => void;
  
  // Computed
  getFilteredMedicines: () => Medicine[];
  getMedicinesByMember: (memberId: string) => Medicine[];
  getLowStockMedicines: () => Medicine[];
  getExpiredMedicines: () => Medicine[];
  getEstimatedMonthlyCost: (memberId?: string) => number;
  getDaysRemaining: (medicine: Medicine) => number;
}

export const useMedicineStore = create<MedicineState>((set, get) => ({
  medicines: [],
  familyMembers: [],
  medicineLogs: [],
  loading: false,
  error: null,
  filters: {},
  
  fetchMedicines: async () => {
    try {
      set({ loading: true, error: null });
      const q = query(collection(db, 'medicines'), orderBy('name'));
      const snapshot = await getDocs(q);
      const medicines = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        prescriptionDate: doc.data().prescriptionDate?.toDate(),
        expiryDate: doc.data().expiryDate?.toDate(),
        lastRefillDate: doc.data().lastRefillDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Medicine[];
      set({ medicines, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  addMedicine: async (medicine) => {
    try {
      set({ loading: true, error: null });
      const now = new Date();
      const docRef = await addDoc(collection(db, 'medicines'), {
        ...medicine,
        prescriptionDate: medicine.prescriptionDate ? Timestamp.fromDate(medicine.prescriptionDate) : null,
        expiryDate: medicine.expiryDate ? Timestamp.fromDate(medicine.expiryDate) : null,
        lastRefillDate: medicine.lastRefillDate ? Timestamp.fromDate(medicine.lastRefillDate) : null,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });
      
      const newMedicine: Medicine = {
        ...medicine,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      };
      
      set(state => ({ 
        medicines: [...state.medicines, newMedicine].sort((a, b) => a.name.localeCompare(b.name)),
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  updateMedicine: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const medicineRef = doc(db, 'medicines', id);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      };
      
      // Convert dates to Timestamps
      if (updates.prescriptionDate) {
        updateData.prescriptionDate = Timestamp.fromDate(updates.prescriptionDate);
      }
      if (updates.expiryDate) {
        updateData.expiryDate = Timestamp.fromDate(updates.expiryDate);
      }
      if (updates.lastRefillDate) {
        updateData.lastRefillDate = Timestamp.fromDate(updates.lastRefillDate);
      }
      
      await updateDoc(medicineRef, updateData);
      
      set(state => ({
        medicines: state.medicines.map(m => 
          m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  deleteMedicine: async (id) => {
    try {
      set({ loading: true, error: null });
      const medicine = get().medicines.find(m => m.id === id);
      
      // Delete associated images from storage
      if (medicine?.images) {
        for (const imageUrl of medicine.images) {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (e) {
            console.error('Failed to delete image:', e);
          }
        }
      }
      
      await deleteDoc(doc(db, 'medicines', id));
      set(state => ({
        medicines: state.medicines.filter(m => m.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  uploadMedicineImage: async (medicineId: string, file: File) => {
    try {
      const fileName = `medicines/${medicineId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
  
  fetchFamilyMembers: async () => {
    try {
      set({ loading: true, error: null });
      const q = query(collection(db, 'familyMembers'), orderBy('name'));
      const snapshot = await getDocs(q);
      const members = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as FamilyMember[];
      set({ familyMembers: members, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  addFamilyMember: async (member) => {
    try {
      set({ loading: true, error: null });
      const now = new Date();
      const docRef = await addDoc(collection(db, 'familyMembers'), {
        ...member,
        createdAt: Timestamp.fromDate(now),
      });
      
      const newMember: FamilyMember = {
        ...member,
        id: docRef.id,
        createdAt: now,
      };
      
      set(state => ({ 
        familyMembers: [...state.familyMembers, newMember],
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  updateFamilyMember: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const memberRef = doc(db, 'familyMembers', id);
      await updateDoc(memberRef, updates);
      
      set(state => ({
        familyMembers: state.familyMembers.map(m => 
          m.id === id ? { ...m, ...updates } : m
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  deleteFamilyMember: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(db, 'familyMembers', id));
      
      // Remove member from all medicines
      const { medicines, updateMedicine } = get();
      for (const medicine of medicines) {
        if (medicine.assignedTo.includes(id)) {
          await updateMedicine(medicine.id, {
            assignedTo: medicine.assignedTo.filter(m => m !== id)
          });
        }
      }
      
      set(state => ({
        familyMembers: state.familyMembers.filter(m => m.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  logMedicineTaken: async (medicineId, memberId, quantity) => {
    try {
      const medicine = get().medicines.find(m => m.id === medicineId);
      if (!medicine) return;
      
      // Update current quantity
      const newQuantity = Math.max(0, medicine.currentQuantity - quantity);
      await get().updateMedicine(medicineId, { currentQuantity: newQuantity });
      
      // Log the action
      await addDoc(collection(db, 'medicineLogs'), {
        medicineId,
        familyMemberId: memberId,
        quantity,
        takenAt: Timestamp.fromDate(new Date()),
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
  
  getFilteredMedicines: () => {
    const { medicines, filters } = get();
    
    return medicines.filter(medicine => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          medicine.name.toLowerCase().includes(query) ||
          medicine.genericName?.toLowerCase().includes(query) ||
          medicine.manufacturer?.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }
      
      if (filters.assignedTo && !medicine.assignedTo.includes(filters.assignedTo)) {
        return false;
      }
      
      if (filters.form && medicine.form !== filters.form) {
        return false;
      }
      
      if (filters.timing && !medicine.timing.includes(filters.timing)) {
        return false;
      }
      
      if (filters.lowStock) {
        const daysRemaining = get().getDaysRemaining(medicine);
        if (daysRemaining > 7) return false;
      }
      
      if (filters.expired) {
        if (!medicine.expiryDate || medicine.expiryDate > new Date()) return false;
      }
      
      return true;
    });
  },
  
  getMedicinesByMember: (memberId) => {
    const { medicines } = get();
    return medicines.filter(m => m.assignedTo.includes(memberId));
  },
  
  getLowStockMedicines: () => {
    const { medicines, getDaysRemaining } = get();
    return medicines.filter(m => getDaysRemaining(m) <= 7);
  },
  
  getExpiredMedicines: () => {
    const { medicines } = get();
    const now = new Date();
    return medicines.filter(m => m.expiryDate && m.expiryDate < now);
  },
  
  getEstimatedMonthlyCost: (memberId) => {
    const { medicines } = get();
    const relevantMedicines = memberId 
      ? medicines.filter(m => m.assignedTo.includes(memberId))
      : medicines;
    
    return relevantMedicines.reduce((total, medicine) => {
      const dailyDoses = medicine.dosagePerDay * medicine.quantityPerDose;
      const monthlyDoses = dailyDoses * 30;
      const costPerUnit = medicine.costPerPack / medicine.totalQuantity;
      return total + (monthlyDoses * costPerUnit);
    }, 0);
  },
  
  getDaysRemaining: (medicine) => {
    const dailyConsumption = medicine.dosagePerDay * medicine.quantityPerDose;
    if (dailyConsumption === 0) return Infinity;
    return Math.floor(medicine.currentQuantity / dailyConsumption);
  },
}));
