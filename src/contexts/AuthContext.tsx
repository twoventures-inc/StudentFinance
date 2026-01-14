import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import {
  generateEncryptionKey,
  exportKeyToStorage,
  importKeyFromStorage,
  clearKeyFromStorage
} from '@/lib/encryption';

const ENCRYPTION_KEY_STORAGE = 'sf_encryption_key';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  encryptionReady: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  /** Get encryption key for hooks - internal use */
  getEncryptionKey: () => CryptoKey | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [encryptionReady, setEncryptionReady] = useState(false);

  // Try to restore encryption key on mount
  useEffect(() => {
    const restoreKey = async () => {
      try {
        const key = await importKeyFromStorage(ENCRYPTION_KEY_STORAGE);
        if (key) {
          setEncryptionKey(key);
          setEncryptionReady(true);
        }
      } catch (error) {
        console.error('Failed to restore encryption key:', error);
      }
    };
    restoreKey();
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Clear encryption on sign out
        if (event === 'SIGNED_OUT') {
          setEncryptionKey(null);
          setEncryptionReady(false);
          clearKeyFromStorage(ENCRYPTION_KEY_STORAGE);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeEncryption = useCallback(async (password: string, userId: string) => {
    try {
      const key = await generateEncryptionKey(password, userId);
      setEncryptionKey(key);
      setEncryptionReady(true);
      await exportKeyToStorage(key, ENCRYPTION_KEY_STORAGE);
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
    }
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    // Initialize encryption after successful signup
    if (!error && data.user) {
      await initializeEncryption(password, data.user.id);
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Initialize encryption after successful sign in
    if (!error && data.user) {
      await initializeEncryption(password, data.user.id);
    }

    return { error };
  };

  const signOut = async () => {
    setEncryptionKey(null);
    setEncryptionReady(false);
    clearKeyFromStorage(ENCRYPTION_KEY_STORAGE);
    await supabase.auth.signOut();
  };

  const getEncryptionKey = useCallback(() => encryptionKey, [encryptionKey]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      encryptionReady,
      signUp,
      signIn,
      signOut,
      getEncryptionKey
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
