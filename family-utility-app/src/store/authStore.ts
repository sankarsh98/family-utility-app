import { create } from 'zustand';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import { ALLOWED_USERS, USER_ROLES } from '../config/constants';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAllowed: boolean;
  
  // Role-based permission helpers
  canEdit: () => boolean;
  canDelete: () => boolean;
  canManageUsers: () => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  isReadOnly: () => boolean;
  
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => () => void;
}

// Async function to get role from Firestore, fallback to constants
const getUserRoleFromFirestore = async (email: string | null): Promise<UserRole> => {
  if (!email) return 'read_only';
  try {
    const docRef = doc(db, 'userRoles', email);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().role as UserRole;
    }
  } catch (error) {
    console.error('Failed to fetch role from Firestore:', error);
  }
  // Fallback to constants
  return USER_ROLES[email] || 'read_only';
};

// Check if user is allowed (either in Firestore or constants)
const isUserAllowed = async (email: string | null): Promise<boolean> => {
  if (!email) return false;
  // Check Firestore first
  try {
    const docRef = doc(db, 'userRoles', email);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return true;
  } catch (error) {
    console.error('Failed to check user in Firestore:', error);
  }
  // Fallback to constants
  return ALLOWED_USERS.includes(email);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  isAllowed: false,
  
  // Permission helpers
  canEdit: () => {
    const role = get().user?.role;
    return role === 'superadmin' || role === 'admin';
  },
  
  canDelete: () => {
    const role = get().user?.role;
    return role === 'superadmin' || role === 'admin';
  },
  
  canManageUsers: () => {
    return get().user?.role === 'superadmin';
  },
  
  isSuperAdmin: () => get().user?.role === 'superadmin',
  isAdmin: () => get().user?.role === 'admin',
  isReadOnly: () => get().user?.role === 'read_only',
  
  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Check if user is in allowed list (Firestore or constants)
      const allowed = await isUserAllowed(firebaseUser.email);
      
      if (!allowed) {
        await firebaseSignOut(auth);
        set({ 
          error: 'Access denied. Your email is not in the allowed users list.',
          loading: false,
          user: null,
          isAllowed: false
        });
        return;
      }
      
      // Get role from Firestore or constants
      const role = await getUserRoleFromFirestore(firebaseUser.email);
      
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role,
      };
      
      set({ user, isAllowed: true, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to sign in',
        loading: false 
      });
    }
  },
  
  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, isAllowed: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to sign out' });
    }
  },
  
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Check if user is allowed (Firestore or constants)
        const allowed = await isUserAllowed(firebaseUser.email);
        
        if (allowed) {
          // Get role from Firestore or constants
          const role = await getUserRoleFromFirestore(firebaseUser.email);
          const user: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role,
          };
          set({ user, isAllowed: true, loading: false });
        } else {
          firebaseSignOut(auth);
          set({ user: null, isAllowed: false, loading: false });
        }
      } else {
        set({ user: null, isAllowed: false, loading: false });
      }
    });
    
    return unsubscribe;
  },
}));
