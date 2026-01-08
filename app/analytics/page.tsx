"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Phone, Clock, Users } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../components/AuthProvider";

interface AnalyticsData {
    totalCalls: number;
    avgDuration: string;
    conversionRate: number;
    activeAgents: number;
}

export default function AnalyticsPage() {
    const { user, loading: authLoading } = useAuth();
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        totalCalls: 0,
        avgDuration: "0:00",
        conversionRate: 0,
        activeAgents: 0,
    });
    const [loading, setLoading] = useState(true);

    const isMasterAdmin = user?.profile?.role === "master_admin";

    useEffect(() => {
        if (!authLoading && user) {
            // Simulate fetching analytics data
            setTimeout(() => {
                setAnalytics({
                    totalCalls: isMasterAdmin ? 12847 : 3240,
                    avgDuration: "4:32",
                    conversionRate: 24.8,
                    activeAgents: isMasterAdmin ? 45 : 8,
                });
                setLoading(false);
            }, 500);
        }
    }, [authLoading, user, isMasterAdmin]);

    const metrics = [
        {
            title: "Total Calls",
            value: analytics.totalCalls.toLocaleString(),
            icon: <Phone className="w-5 h-5" />,
            color: "bg-blue-500",
            change: "+12.5%",
            changePositive: true,
        },
        {
            title: "Avg. Duration",
            value: analytics.avgDuration,
            icon: <Clock className="w-5 h-5" />,
            color: "bg-green-500",
            change: "-0:15",
            changePositive: true,
        },
        {
            title: "Conversion Rate",
            value: `${analytics.conversionRate}%`,
            icon: <TrendingUp className="w-5 h-5" />,
            color: "bg-purple-500",
            change: "+3.2%",
            changePositive: true,
        },
        {
            title: "Active Agents",
            value: analytics.activeAgents,
            icon: <Users className="w-5 h-5" />,
            color: "bg-amber-500",
            change: "+5",
            changePositive: true,
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Sidebar />

            <div className="ml-[220px]">
                {/* Header */}
                <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">
                    <div className="text-sm text-gray-600">Analytics & Reports</div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {user?.email?.charAt(0).toUpperCase() || "U"}
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    {/* Title */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
                        <p className="text-gray-500 mt-1">
                            {isMasterAdmin
                                ? "Overview of all business performance metrics"
                                : "Your business performance metrics"}
                        </p>
                    </div>

                    {/* Metrics Grid */}
                    {loading ? (
                        <div className="text-gray-500">Loading...</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {metrics.map((metric, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div
                                                className={`${metric.color} w-10 h-10 rounded-lg flex items-center justify-center text-white`}
                                            >
                                                {metric.icon}
                                            </div>
                                            <span
                                                className={`text-sm font-medium ${metric.changePositive ? "text-green-600" : "text-red-600"
                                                    }`}
                                            >
                                                {metric.change}
                                            </span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {metric.value}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">{metric.title}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Chart Placeholder */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <BarChart3 className="w-5 h-5 text-blue-500" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Call Volume Trends
                                    </h2>
                                </div>
                                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                    <div className="text-center">
                                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Chart visualization coming soon</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity Table */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Recent Call Activity
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="text-left py-3 text-sm font-medium text-gray-500">
                                                    Time
                                                </th>
                                                <th className="text-left py-3 text-sm font-medium text-gray-500">
                                                    {isMasterAdmin ? "Business" : "Agent"}
                                                </th>
                                                <th className="text-left py-3 text-sm font-medium text-gray-500">
                                                    Duration
                                                </th>
                                                <th className="text-left py-3 text-sm font-medium text-gray-500">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { time: "2 min ago", business: "Dental Care Plus", duration: "5:23", status: "Completed" },
                                                { time: "15 min ago", business: "SmileBright Clinic", duration: "3:45", status: "Completed" },
                                                { time: "32 min ago", business: "Family Dentistry", duration: "8:12", status: "Completed" },
                                                { time: "1 hour ago", business: "Dental Care Plus", duration: "2:30", status: "Missed" },
                                            ].map((call, index) => (
                                                <tr key={index} className="border-b border-gray-50 last:border-0">
                                                    <td className="py-3 text-sm text-gray-600">{call.time}</td>
                                                    <td className="py-3 text-sm text-gray-900">{call.business}</td>
                                                    <td className="py-3 text-sm text-gray-600">{call.duration}</td>
                                                    <td className="py-3">
                                                        <span
                                                            className={`px-2 py-1 text-xs font-medium rounded-full ${call.status === "Completed"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-red-100 text-red-700"
                                                                }`}
                                                        >
                                                            {call.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
