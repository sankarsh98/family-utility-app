import { create } from 'zustand';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { ALLOWED_USERS } from '../config/constants';
import { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAllowed: boolean;
  
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  isAllowed: false,
  
  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Check if user is in allowed list (testing mode)
      const isAllowed = ALLOWED_USERS.includes(firebaseUser.email || '');
      
      if (!isAllowed) {
        await firebaseSignOut(auth);
        set({ 
          error: 'Access denied. Your email is not in the allowed users list.',
          loading: false,
          user: null,
          isAllowed: false
        });
        return;
      }
      
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const isAllowed = ALLOWED_USERS.includes(firebaseUser.email || '');
        
        if (isAllowed) {
          const user: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
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
