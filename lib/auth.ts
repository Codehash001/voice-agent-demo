export type UserRole = 'master_admin' | 'business_admin';

export interface UserProfile {
    id: string;
    email: string;
    role: UserRole;
    business_id: string | null;
    created_at?: string;
    status?: 'verified' | 'waiting' | 'unknown';
    last_sign_in_at?: string | null;
}

export interface AuthUser {
    id: string;
    email: string;
    profile: UserProfile | null;
}
