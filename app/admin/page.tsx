"use client";

import { useEffect, useState } from "react";

interface Invitee {
  uri: string;
  name: string;
  email: string;
  status: string;
  timezone: string;
  createdAt: string;
  cancelUrl: string;
  rescheduleUrl: string;
}

interface Booking {
  uri: string;
  name: string;
  status: string;
  startTime: string;
  endTime: string;
  location: any;
  inviteesCounter: { total: number; active: number; limit: number };
  createdAt: string;
  updatedAt: string;
  invitees: Invitee[];
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "canceled">("all");

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await fetch(`/api/calendly-bookings${params}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setBookings(data.events || []);
      }
    } catch (err) {
      setError("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendly Bookings</h1>
            <p className="text-gray-600 mt-1">Bright Smiles Dental - Admin Dashboard</p>
          </div>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>

        <div className="mb-6 flex gap-2">
          {(["all", "active", "canceled"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border hover:bg-gray-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No bookings found</p>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.uri}
                className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                  booking.status === "active"
                    ? "border-l-green-500"
                    : "border-l-red-400"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.name}
                    </h3>
                    <p className="text-gray-600">
                      {formatDate(booking.startTime)} at {formatTime(booking.startTime)} -{" "}
                      {formatTime(booking.endTime)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                {booking.invitees.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Patient Details
                    </h4>
                    {booking.invitees.map((invitee) => (
                      <div key={invitee.uri} className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{invitee.name}</p>
                          <p className="text-sm text-gray-500">{invitee.email}</p>
                        </div>
                        <div className="flex gap-2">
                          {booking.status === "active" && (
                            <>
                              <a
                                href={invitee.rescheduleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
                              >
                                Reschedule
                              </a>
                              <a
                                href={invitee.cancelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition"
                              >
                                Cancel
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
