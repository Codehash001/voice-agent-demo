import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role for admin operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export async function POST(request: Request) {
    try {
        const { email, role } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Invite user via Supabase Admin API
        // This sends an email with a link to set their password
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
        });

        if (error) {
            console.error("Error inviting user:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        // Create profile for the invited user
        if (data.user) {
            const { error: profileError } = await supabaseAdmin
                .from("users_profile")
                .insert({
                    id: data.user.id,
                    email: email,
                    role: role || "business_admin",
                    business_id: null,
                });

            if (profileError) {
                console.error("Error creating profile:", profileError);
                // Don't fail the whole request, user is still created
            }
        }

        return NextResponse.json({
            success: true,
            message: "Invitation sent successfully",
            user: data.user,
        });
    } catch (error: any) {
        console.error("Error in POST /api/users/invite:", error);
        return NextResponse.json(
            { error: error.message || "Failed to invite user" },
            { status: 500 }
        );
    }
}
