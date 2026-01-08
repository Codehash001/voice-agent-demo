import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Admin client to access auth.users
const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export async function GET() {
    try {
        const supabase = await createClient();

        // Fetch user profiles
        const { data: profiles, error: profileError } = await supabase
            .from("users_profile")
            .select("id, email, role, business_id")
            .order("email", { ascending: true });

        if (profileError) {
            console.error("Error fetching profiles:", profileError);
            return NextResponse.json(
                { error: profileError.message },
                { status: 500 }
            );
        }

        // Fetch auth users to get confirmation status
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

        if (authError) {
            console.error("Error fetching auth users:", authError);
            // Return profiles without status if auth fails
            return NextResponse.json({
                users: (profiles || []).map(p => ({ ...p, status: "unknown" }))
            });
        }

        // Map auth status to profiles using last_sign_in_at
        const usersWithStatus = (profiles || []).map(profile => {
            // Try matching by ID first, then by email as fallback
            let authUser = authData.users.find(u => u.id === profile.id);
            if (!authUser) {
                authUser = authData.users.find(u => u.email === profile.email);
            }

            let status = "waiting";

            if (authUser) {
                // If user has signed in at least once, they are verified
                if (authUser.last_sign_in_at) {
                    status = "verified";
                } else {
                    status = "waiting"; // Waiting for verification
                }
            }

            return {
                ...profile,
                status,
                last_sign_in_at: authUser?.last_sign_in_at || null,
                created_at: authUser?.created_at || null,
            };
        });

        return NextResponse.json({ users: usersWithStatus });
    } catch (error) {
        console.error("Error in GET /api/users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
