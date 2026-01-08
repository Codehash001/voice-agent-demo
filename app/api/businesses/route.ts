import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: businesses, error } = await supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching businesses:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ businesses: businesses || [] });
  } catch (error) {
    console.error("Error in GET /api/businesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data: business, error } = await supabase
      .from("businesses")
      .insert({
        name: body.name,
        phone_no: body.phone_no || null,
        address: body.address || null,
        operating_hours: body.operating_hours || {},
        practice_software: body.practice_software || null,
        services: body.services || [],
        no_show_fees: body.no_show_fees || 0,
        admin_email: body.admin_email,
        additional_details: body.additional_details || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating business:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("Error in POST /api/businesses:", error);
    return NextResponse.json(
      { error: "Failed to create business" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Business ID required" },
        { status: 400 }
      );
    }

    const { data: business, error } = await supabase
      .from("businesses")
      .update({
        name: body.name,
        phone_no: body.phone_no || null,
        address: body.address || null,
        operating_hours: body.operating_hours || {},
        practice_software: body.practice_software || null,
        services: body.services || [],
        no_show_fees: body.no_show_fees || 0,
        admin_email: body.admin_email,
        additional_details: body.additional_details || null,
      })
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating business:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("Error in PUT /api/businesses:", error);
    return NextResponse.json(
      { error: "Failed to update business" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Business ID required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("businesses")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting business:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/businesses:", error);
    return NextResponse.json(
      { error: "Failed to delete business" },
      { status: 500 }
    );
  }
}
