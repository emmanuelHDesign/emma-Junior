/**
 * ZION STOCK OS - Authentication Hook
 * React hook for authentication state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';
import {
  storeTokens,
  storeUser,
  clearTokens,
  getStoredUser,
  isAuthenticated as checkAuth,
  validatePassword,
  validateEmail,
} from '../lib/auth';

// Demo users for offline mode
const DEMO_USERS = [
  {
    id: 'user-admin',
    email: 'admin@zionpaper.cm',
    password: 'Admin123!',
    name: 'Admin ZION',
    role: 'admin' as UserRole,
    companyId: 'comp-1',
  },
  {
    id: 'user-magasinier',
    email: 'magasinier@zionpaper.cm',
    password: 'Magasin123!',
    name: 'Jean Kamga',
    role: 'magasinier' as UserRole,
    companyId: 'comp-1',
    warehouseId: 'wh-1',
  },
  {
    id: 'user-vendeur',
    email: 'vendeur@zionpaper.cm',
    password: 'Vendeur123!',
    name: 'Marie Ngono',
    role: 'vendeur' as UserRole,
    companyId: 'comp-1',
  },
];

// Generate fake JWT token for demo
function generateDemoToken(userId: string, role: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(JSON.stringify({
    sub: userId,
    role: role,
    exp: now + 3600, // 1 hour
    iat: now,
    type: 'access',
  }));
  const signature = btoa('demo-signature');
  return `${header}.${payload}.${signature}`;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string, companyName?: string) => Promise<boolean>;
  logout: () => void;
  checkSession: () => boolean;
  clearError: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });

        // Validate inputs
        if (!validateEmail(email)) {
          set({ isLoading: false, error: 'Email invalide' });
          return false;
        }

        if (!password) {
          set({ isLoading: false, error: 'Mot de passe requis' });
          return false;
        }

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check demo users (offline mode)
        const demoUser = DEMO_USERS.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (demoUser) {
          const user: User = {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            companyId: demoUser.companyId,
            warehouseId: demoUser.warehouseId,
            createdAt: new Date().toISOString(),
          };

          // Generate demo tokens
          const accessToken = generateDemoToken(user.id, user.role);
          const refreshToken = generateDemoToken(user.id, 'refresh');
          
          storeTokens(accessToken, refreshToken);
          storeUser(user);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        }

        // In production, this would call the API
        // const response = await authApi.login(email, password);
        // if (response.error) {
        //   set({ isLoading: false, error: response.error });
        //   return false;
        // }

        set({
          isLoading: false,
          error: 'Email ou mot de passe incorrect',
        });

        return false;
      },

      register: async (
        email: string,
        password: string,
        fullName: string,
        _companyName?: string
      ): Promise<boolean> => {
        set({ isLoading: true, error: null });

        // Validate inputs
        if (!validateEmail(email)) {
          set({ isLoading: false, error: 'Email invalide' });
          return false;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
          set({ isLoading: false, error: passwordValidation.message });
          return false;
        }

        if (fullName.length < 2) {
          set({ isLoading: false, error: 'Nom trop court' });
          return false;
        }

        // Check if email already exists in demo users
        if (DEMO_USERS.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          set({ isLoading: false, error: 'Cet email est déjà utilisé' });
          return false;
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        // Create new user (demo mode)
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: email.toLowerCase(),
          name: fullName,
          role: 'admin', // First user of company is admin
          companyId: `comp-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        const accessToken = generateDemoToken(newUser.id, newUser.role);
        const refreshToken = generateDemoToken(newUser.id, 'refresh');
        
        storeTokens(accessToken, refreshToken);
        storeUser(newUser);

        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return true;
      },

      logout: () => {
        clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      checkSession: (): boolean => {
        const isAuth = checkAuth();
        const user = getStoredUser();

        if (isAuth && user) {
          set({ user, isAuthenticated: true });
          return true;
        }

        set({ user: null, isAuthenticated: false });
        return false;
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: (data: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...data };
          storeUser(updatedUser);
          set({ user: updatedUser });
        }
      },
    }),
    {
      name: 'zion-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selector hooks for common checks
export const useIsAdmin = () => {
  const user = useAuth((state) => state.user);
  return user?.role === 'admin';
};

export const useIsManager = () => {
  const user = useAuth((state) => state.user);
  return user?.role === 'admin' || user?.role === 'magasinier';
};

export const useUserRole = () => {
  const user = useAuth((state) => state.user);
  return user?.role || null;
};
