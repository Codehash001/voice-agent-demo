import { NextResponse } from "next/server";
import { CalendlyClient } from "@/lib/calendly";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as "active" | "canceled" | null;

  const calendly = new CalendlyClient({
    apiKey: process.env.CALENDLY_API_KEY || "",
  });

  try {
    // Get events from the last 30 days and next 30 days
    const now = new Date();
    const minStartTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const maxStartTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const events = await calendly.getScheduledEvents({
      minStartTime,
      maxStartTime,
      status: status || undefined,
    });

    // Get invitees for each event
    const eventsWithInvitees = await Promise.all(
      events.map(async (event) => {
        try {
          const invitees = await calendly.getEventInvitees(event.uri);
          return { ...event, invitees };
        } catch {
          return { ...event, invitees: [] };
        }
      })
    );

    return NextResponse.json({ events: eventsWithInvitees });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
