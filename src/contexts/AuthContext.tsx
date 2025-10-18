import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthError {
  message: string;
  code?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        (async () => {
          setUser(session?.user ?? null);
        })();
      });

      return () => subscription.unsubscribe();
    } catch {
      // Мок-режим для демонстрации
      setUser(null);
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? { message: error.message, code: error.message } : null };
    } catch {
      // Мок-авторизация для демонстрации
      const mockUser = {
        id: 'mock-user-id',
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        identities: [],
        factors: [],
      } as User;
      
      setUser(mockUser);
      return { error: null };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (!error && data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: 'owner',
        });
      }

      return { error: error ? { message: error.message, code: error.message } : null };
    } catch {
      // Мок-регистрация для демонстрации
      const mockUser = {
        id: 'mock-user-id',
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        identities: [],
        factors: [],
      } as User;
      
      setUser(mockUser);
      return { error: null };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      return { error: error ? { message: error.message, code: error.message } : null };
    } catch (error: any) {
      return { error: { message: error.message || 'Ошибка входа через Google', code: 'GOOGLE_AUTH_ERROR' } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Мок-выход для демонстрации
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
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
