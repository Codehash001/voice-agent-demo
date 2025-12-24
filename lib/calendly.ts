const CALENDLY_API_BASE = "https://api.calendly.com";

interface CalendlyConfig {
  apiKey: string;
  eventTypeUri?: string;
}

interface AvailableTime {
  startTime: string;
  status: string;
}

interface EventType {
  uri: string;
  name: string;
  slug: string;
  duration: number;
  schedulingUrl: string;
}

interface BookingResult {
  success: boolean;
  eventUri?: string;
  cancelUrl?: string;
  rescheduleUrl?: string;
  message: string;
}

export class CalendlyClient {
  private apiKey: string;
  private eventTypeUri: string | null = null;
  private userUri: string | null = null;

  constructor(config: CalendlyConfig) {
    this.apiKey = config.apiKey;
    this.eventTypeUri = config.eventTypeUri || null;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${CALENDLY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Calendly API error:", JSON.stringify({ status: response.status, endpoint, error }, null, 2));
      throw new Error(error.message || `Calendly API error: ${response.status}`);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<{ uri: string; name: string; email: string }> {
    const data = await this.request("/users/me");
    this.userUri = data.resource.uri;
    return {
      uri: data.resource.uri,
      name: data.resource.name,
      email: data.resource.email,
    };
  }

  async getEventTypes(): Promise<EventType[]> {
    if (!this.userUri) {
      await this.getCurrentUser();
    }

    const data = await this.request(
      `/event_types?user=${encodeURIComponent(this.userUri!)}&active=true`
    );

    // Log location configuration for debugging
    data.collection.forEach((et: any) => {
      console.log(`Event type "${et.name}" location config:`, JSON.stringify(et.location, null, 2));
    });

    return data.collection.map((et: any) => ({
      uri: et.uri,
      name: et.name,
      slug: et.slug,
      duration: et.duration,
      schedulingUrl: et.scheduling_url,
    }));
  }

  async getAvailableTimes(
    eventTypeUri: string,
    _startDate: string,
    _endDate: string
  ): Promise<AvailableTime[]> {
    // Always calculate fresh times to ensure they're in the future
    // Add 1 minute buffer to ensure start_time is definitely in the future
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    const startTime = now.toISOString();
    
    // End time: 6 days from now (to stay under 7-day limit)
    const endDate = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
    const endTime = endDate.toISOString();
    
    console.log("Fetching available times:", { eventTypeUri, startTime, endTime });
    
    const params = new URLSearchParams({
      event_type: eventTypeUri,
      start_time: startTime,
      end_time: endTime,
    });

    console.log("Request URL:", `/event_type_available_times?${params}`);
    const data = await this.request(`/event_type_available_times?${params}`);

    return data.collection.map((slot: any) => ({
      startTime: slot.start_time,
      status: slot.status,
    }));
  }

  async bookAppointment(options: {
    eventTypeUri: string;
    startTime: string;
    inviteeName: string;
    inviteeEmail: string;
    inviteeTimezone?: string;
    phoneNumber?: string;
    notes?: string;
  }): Promise<BookingResult> {
    try {
      const body: any = {
        event_type: options.eventTypeUri,
        start_time: options.startTime,
        invitee: {
          name: options.inviteeName,
          email: options.inviteeEmail,
          timezone: options.inviteeTimezone || "America/New_York",
        },
        location: {
          kind: "physical",
          location: "New York, USA",
        },
      };

      console.log("Booking request body:", JSON.stringify(body, null, 2));

      if (options.phoneNumber) {
        body.invitee.text_reminder_number = options.phoneNumber;
      }

      if (options.notes) {
        body.questions_and_answers = [
          {
            question: "Notes",
            answer: options.notes,
            position: 0,
          },
        ];
      }

      const data = await this.request("/invitees", {
        method: "POST",
        body: JSON.stringify(body),
      });

      return {
        success: true,
        eventUri: data.resource.event,
        cancelUrl: data.resource.cancel_url,
        rescheduleUrl: data.resource.reschedule_url,
        message: `Appointment booked successfully for ${options.inviteeName}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to book appointment",
      };
    }
  }

  async cancelAppointment(inviteeUri: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.request(`${inviteeUri}/cancellation`, {
        method: "POST",
        body: JSON.stringify({
          reason: reason || "Cancelled by AI assistant",
        }),
      });

      return {
        success: true,
        message: "Appointment cancelled successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to cancel appointment",
      };
    }
  }

  setEventTypeUri(uri: string) {
    this.eventTypeUri = uri;
  }

  getEventTypeUri(): string | null {
    return this.eventTypeUri;
  }

  async getScheduledEvents(options?: { 
    minStartTime?: string; 
    maxStartTime?: string;
    status?: 'active' | 'canceled';
  }): Promise<any[]> {
    if (!this.userUri) {
      await this.getCurrentUser();
    }

    const params = new URLSearchParams({
      user: this.userUri!,
      sort: 'start_time:desc',
    });

    if (options?.minStartTime) {
      params.append('min_start_time', options.minStartTime);
    }
    if (options?.maxStartTime) {
      params.append('max_start_time', options.maxStartTime);
    }
    if (options?.status) {
      params.append('status', options.status);
    }

    const data = await this.request(`/scheduled_events?${params}`);

    return data.collection.map((event: any) => ({
      uri: event.uri,
      name: event.name,
      status: event.status,
      startTime: event.start_time,
      endTime: event.end_time,
      location: event.location,
      inviteesCounter: event.invitees_counter,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    }));
  }

  async getEventInvitees(eventUri: string): Promise<any[]> {
    const eventUuid = eventUri.split('/').pop();
    const data = await this.request(`/scheduled_events/${eventUuid}/invitees`);

    return data.collection.map((invitee: any) => ({
      uri: invitee.uri,
      name: invitee.name,
      email: invitee.email,
      status: invitee.status,
      timezone: invitee.timezone,
      createdAt: invitee.created_at,
      cancelUrl: invitee.cancel_url,
      rescheduleUrl: invitee.reschedule_url,
    }));
  }
}

export function formatAvailableTimesForAgent(times: AvailableTime[]): string {
  if (times.length === 0) {
    return "No available times found for the requested date range.";
  }

  const grouped: Record<string, string[]> = {};

  times.forEach((slot) => {
    const date = new Date(slot.startTime);
    const dateKey = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(timeStr);
  });

  const entries = Object.entries(grouped).slice(0, 3);
  const parts: string[] = [];

  entries.forEach(([date, slots]) => {
    const limitedSlots = slots.slice(0, 4);
    const timesJoined = limitedSlots.length > 1 
      ? limitedSlots.slice(0, -1).join(", ") + " and " + limitedSlots[limitedSlots.length - 1]
      : limitedSlots[0];
    parts.push(`On ${date}, I have ${timesJoined}`);
  });

  if (parts.length === 1) {
    return parts[0] + ". Would any of those work for you?";
  }

  return parts.join(". ") + ". Which works best for you?";
}
