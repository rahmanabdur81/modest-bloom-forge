import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { fetchUserRoles } from "@/lib/auth/roles";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: string[];
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  const [roles, setRoles] = useState<string[]>([]);
  const [rolesUserId, setRolesUserId] = useState<string | null>(null);

  const rolesReady = !user || rolesUserId === user.id;
  const loading = authLoading || roleLoading || !rolesReady;
  const isAdmin = rolesReady && roles.includes("admin");

  // 1. AUTH LISTENER
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    );

    // initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. ROLE FETCHING (separate concern)
  useEffect(() => {
    if (!user) {
      setRoles([]);
      setRolesUserId(null);
      setRoleLoading(false);
      return;
    }

    let cancelled = false;
    setRoleLoading(true);

    fetchUserRoles(user.id)
      .then((roles) => {
        if (!cancelled) {
          setRoles(roles);
          setRolesUserId(user.id);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRoles([]);
          setRolesUserId(user.id);
        }
      })
      .finally(() => {
        if (!cancelled) setRoleLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // AUTH METHODS

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, roles, isAdmin, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
