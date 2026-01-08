"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { UserProfile, AuthUser } from "@/lib/auth";

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchProfile = async (authUser: User): Promise<UserProfile | null> => {
        const { data, error } = await supabase
            .from("users_profile")
            .select("*")
            .eq("id", authUser.id)
            .maybeSingle();

        if (error) {
            // Only log if it's a real error, not just "no rows found"
            if (error.code !== 'PGRST116') {
                console.error("Error fetching profile:", error.message);
            }
            return null;
        }
        return data;
    };

    const refreshProfile = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
            const profile = await fetchProfile(authUser);
            setUser({
                id: authUser.id,
                email: authUser.email || "",
                profile,
            });
        }
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                const profile = await fetchProfile(authUser);
                console.log("Auth User ID:", authUser.id);
                console.log("Fetched Profile:", profile);
                setUser({
                    id: authUser.id,
                    email: authUser.email || "",
                    profile,
                });
            }
            setLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    const profile = await fetchProfile(session.user);
                    setUser({
                        id: session.user.id,
                        email: session.user.email || "",
                        profile,
                    });
                } else {
                    setUser(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
