"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "../components/AuthProvider";
import Sidebar from "../components/Sidebar";
import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@/lib/auth";

interface Business {
    id: string;
    name: string;
}

export default function UsersPage() {
    const { user, loading: authLoading } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: "business_admin" as "master_admin" | "business_admin",
        business_id: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const supabase = createClient();
    const isMasterAdmin = user?.profile?.role === "master_admin";

    useEffect(() => {
        if (!authLoading && user) {
            if (isMasterAdmin) {
                fetchUsers();
                fetchBusinesses();
            }
        }
    }, [authLoading, user]);

    const fetchUsers = async () => {
        try {
            // Use API endpoint that includes verification status
            const res = await fetch("/api/users");
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setUsers(data.users || []);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBusinesses = async () => {
        try {
            const res = await fetch("/api/businesses");
            const data = await res.json();
            setBusinesses(data.businesses || []);
        } catch (err) {
            console.error("Failed to fetch businesses:", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            if (editingUser) {
                // Update existing user profile
                const { error } = await supabase
                    .from("users_profile")
                    .update({
                        role: formData.role,
                        business_id: formData.role === "business_admin" ? formData.business_id : null,
                    })
                    .eq("id", editingUser.id);

                if (error) throw error;
            } else {
                // Invite new user via API (sends email with password setup link)
                const response = await fetch("/api/users/invite", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: formData.email,
                        role: formData.role,
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Failed to invite user");
                }
            }

            setShowModal(false);
            setEditingUser(null);
            setFormData({ email: "", password: "", role: "business_admin", business_id: "" });
            fetchUsers();
        } catch (err: any) {
            setError(err.message || "Failed to save user");
        }
        setSaving(false);
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const { error } = await supabase
                .from("users_profile")
                .delete()
                .eq("id", userId);

            if (error) throw error;
            fetchUsers();
        } catch (err) {
            console.error("Failed to delete user:", err);
        }
    };

    const openEditModal = (userProfile: UserProfile) => {
        setEditingUser(userProfile);
        setFormData({
            email: userProfile.email,
            password: "",
            role: userProfile.role,
            business_id: userProfile.business_id || "",
        });
        setShowModal(true);
    };

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({ email: "", password: "", role: "business_admin", business_id: "" });
        setShowModal(true);
    };

    if (!isMasterAdmin) {
        return (
            <div className="min-h-screen bg-[#f8fafc]">
                <Sidebar />
                <div className="ml-[220px] p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Access denied. Only master admins can manage users.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Sidebar />

            <div className="ml-[220px]">
                {/* Header */}
                <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">
                    <div className="text-sm text-gray-600">User Management</div>
                </header>

                <main className="p-6">
                    {/* Title Row */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl font-semibold text-gray-900">Users</h1>
                        <Button className="bg-blue-500 hover:bg-blue-600" onClick={openAddModal}>
                            <Plus size={16} />
                            Add User
                        </Button>
                    </div>

                    {/* Users Table */}
                    {loading ? (
                        <div className="text-gray-500">Loading...</div>
                    ) : users.length === 0 ? (
                        <div className="text-gray-500">No users found.</div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Business
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users.map((u) => (
                                        <tr key={u.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {u.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-full ${u.status === "verified"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                >
                                                    {u.status === "verified" ? "✓ Verified" : "⏳ Waiting for verification"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-full ${u.role === "master_admin"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : "bg-blue-100 text-blue-800"
                                                        }`}
                                                >
                                                    {u.role.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {u.business_id ? (
                                                    <span className="flex items-center gap-1">
                                                        <Building2 size={14} />
                                                        {businesses.find((b) => b.id === u.business_id)?.name || u.business_id}
                                                    </span>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditModal(u)}
                                                    >
                                                        <Edit size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleDelete(u.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                            {editingUser ? "Edit User" : "Add New User"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!!editingUser}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                    required
                                />
                            </div>

                            {!editingUser && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-700 text-sm">
                                    The user will receive an email with a link to set their password.
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value: "master_admin" | "business_admin") =>
                                        setFormData({ ...formData, role: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="business_admin">Business Admin</SelectItem>
                                        <SelectItem value="master_admin">Master Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {editingUser && formData.role === "business_admin" && (
                                <div className="space-y-2">
                                    <Label htmlFor="business">Assigned Business</Label>
                                    <Select
                                        value={formData.business_id}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, business_id: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a business" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {businesses.map((b) => (
                                                <SelectItem key={b.id} value={b.id}>
                                                    {b.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-600"
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : editingUser ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
