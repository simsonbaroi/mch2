import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export type AppRole = 'admin' | 'billing_clerk' | 'viewer';

interface LocalUser {
  id: string;
  email: string;
  fullName?: string;
}

interface AuthState {
  user: LocalUser | null;
  session: { user: LocalUser } | null;
  role: AppRole | null;
  isLoading: boolean;
}

interface StoredUser extends LocalUser {
  password: string;
  role: AppRole;
}

const USERS_KEY = 'mch_users';
const SESSION_KEY = 'mch_session';

export const useLocalAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    isLoading: true,
  });

  // Get stored users
  const getStoredUsers = (): StoredUser[] => {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Save users
  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  // Initialize with default admin if no users exist
  useEffect(() => {
    const users = getStoredUsers();
    if (users.length === 0) {
      // Create default admin user
      const defaultAdmin: StoredUser = {
        id: 'admin-1',
        email: 'admin@hospital.local',
        password: 'admin123',
        fullName: 'Administrator',
        role: 'admin',
      };
      saveUsers([defaultAdmin]);
    }

    // Check for existing session
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        const users = getStoredUsers();
        const user = users.find(u => u.id === session.userId);
        if (user) {
          setAuthState({
            user: { id: user.id, email: user.email, fullName: user.fullName },
            session: { user: { id: user.id, email: user.email, fullName: user.fullName } },
            role: user.role,
            isLoading: false,
          });
          return;
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const users = getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!user) {
      toast.error('Invalid email or password');
      return { error: new Error('Invalid credentials') };
    }

    const localUser = { id: user.id, email: user.email, fullName: user.fullName };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
    
    setAuthState({
      user: localUser,
      session: { user: localUser },
      role: user.role,
      isLoading: false,
    });

    toast.success('Signed in successfully');
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    const users = getStoredUsers();
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast.error('This email is already registered');
      return { error: new Error('Email already registered') };
    }

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      fullName,
      role: 'billing_clerk', // Default role for new users
    };

    saveUsers([...users, newUser]);

    const localUser = { id: newUser.id, email: newUser.email, fullName: newUser.fullName };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: newUser.id }));
    
    setAuthState({
      user: localUser,
      session: { user: localUser },
      role: newUser.role,
      isLoading: false,
    });

    toast.success('Account created successfully');
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(SESSION_KEY);
    setAuthState({
      user: null,
      session: null,
      role: null,
      isLoading: false,
    });
    toast.success('Signed out successfully');
    return { error: null };
  }, []);

  const hasRole = (role: AppRole): boolean => {
    return authState.role === role;
  };

  const canEdit = (): boolean => {
    return authState.role === 'admin' || authState.role === 'billing_clerk';
  };

  const isAdmin = (): boolean => {
    return authState.role === 'admin';
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    hasRole,
    canEdit,
    isAdmin,
  };
};
