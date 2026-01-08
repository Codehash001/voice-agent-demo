"use client";

import { useEffect, useState } from "react";
import { Building2, Users, Phone, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./components/AuthProvider";

interface DashboardStats {
  totalBusinesses: number;
  totalUsers: number;
  totalCalls: number;
  callsChange: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBusinesses: 0,
    totalUsers: 0,
    totalCalls: 0,
    callsChange: 0,
  });
  const [loading, setLoading] = useState(true);

  const isMasterAdmin = user?.profile?.role === "master_admin";

  useEffect(() => {
    if (!authLoading && user) {
      fetchStats();
    }
  }, [authLoading, user]);

  const fetchStats = async () => {
    try {
      // Fetch businesses count
      const businessRes = await fetch("/api/businesses");
      const businessData = await businessRes.json();
      let businesses = businessData.businesses || [];

      // Filter for business admin
      if (!isMasterAdmin && user?.profile?.business_id) {
        businesses = businesses.filter(
          (b: any) => b.id === user.profile?.business_id
        );
      }

      setStats({
        totalBusinesses: businesses.length,
        totalUsers: 12, // Placeholder
        totalCalls: 1847, // Placeholder
        callsChange: 12.5, // Placeholder percentage
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: isMasterAdmin ? "Total Businesses" : "Your Business",
      value: stats.totalBusinesses,
      icon: <Building2 className="w-5 h-5" />,
      color: "bg-blue-500",
    },
    {
      title: isMasterAdmin ? "Total Users" : "Team Members",
      value: stats.totalUsers,
      icon: <Users className="w-5 h-5" />,
      color: "bg-purple-500",
    },
    {
      title: "Total Calls",
      value: stats.totalCalls.toLocaleString(),
      icon: <Phone className="w-5 h-5" />,
      color: "bg-green-500",
      change: stats.callsChange,
    },
    {
      title: "Conversion Rate",
      value: "24.8%",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-amber-500",
      change: 3.2,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="ml-[220px]">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">
          <div className="text-sm text-gray-600">Dashboard Overview</div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}!
            </h1>
            <p className="text-gray-500 mt-1">
              {isMasterAdmin
                ? "Here's an overview of all your businesses"
                : "Here's how your business is performing"}
            </p>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center text-white`}>
                      {stat.icon}
                    </div>
                    {stat.change !== undefined && (
                      <div className={`flex items-center gap-1 text-sm ${stat.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {stat.change >= 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {Math.abs(stat.change)}%
                      </div>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.title}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/businesses"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Building2 className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-sm text-gray-700">View Businesses</span>
              </a>
              {isMasterAdmin && (
                <a
                  href="/users"
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Users className="w-6 h-6 text-purple-500 mb-2" />
                  <span className="text-sm text-gray-700">Manage Users</span>
                </a>
              )}
              <a
                href="/analytics"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <TrendingUp className="w-6 h-6 text-green-500 mb-2" />
                <span className="text-sm text-gray-700">View Analytics</span>
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
