import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';
import { generateUniqueId, checkSupabaseConfig } from './authUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isConfigured = useMemo(() => checkSupabaseConfig(), []);

  async function createProfile(userId: string) {
    const uniqueId = generateUniqueId();
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        unique_id: uniqueId,
      })
      .select()
      .single();
    
    if (!error && data) {
      setProfile(data);
    } else {
      console.error('Error creating profile:', error);
    }
  }

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data);
      } else if (error?.code === 'PGRST116') {
        await createProfile(userId);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false); // eslint-disable-line react-hooks/set-state-in-effect -- Intentionally initializing state
      return;
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  async function signUp(email: string, password: string) {
    if (!isConfigured) {
      return { success: false, message: 'Authentication is not configured.' };
    }
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: undefined
      }
    });
    
    if (error) {
      return { success: false, message: error.message };
    }
    
    // Create profile immediately after signup
    if (data.user) {
      await createProfile(data.user.id);
    }
    
    return { success: true, message: 'Account created successfully!' };
  }

  async function signIn(email: string, password: string) {
    if (!isConfigured) {
      throw new Error('Authentication is not configured.');
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    if (!isConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, signUp, signIn, signOut, isConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  // eslint-disable-next-line react-refresh/only-export-components -- Hooks are valid exports alongside components
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
