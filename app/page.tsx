"use client";

import { useEffect, useState } from "react";
import { Bell, Plus } from "lucide-react";
import Sidebar from "./components/Sidebar";
import BusinessCard from "./components/BusinessCard";
import BusinessEditModal from "./components/BusinessEditModal";
import { Button } from "@/components/ui/button";
import { Business } from "@/lib/business-config";

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isNewBusiness, setIsNewBusiness] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const res = await fetch("/api/businesses");
      const data = await res.json();
      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error("Failed to fetch businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (business: Business) => {
    setSelectedBusiness(business);
    setIsNewBusiness(false);
    setEditModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedBusiness(null);
    setIsNewBusiness(true);
    setEditModalOpen(true);
  };

  const handleSave = async (business: Business) => {
    try {
      if (isNewBusiness) {
        await fetch("/api/businesses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(business),
        });
      } else {
        await fetch("/api/businesses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(business),
        });
      }
      fetchBusinesses();
    } catch (error) {
      console.error("Failed to save business:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this business?")) return;
    try {
      await fetch(`/api/businesses?id=${id}`, { method: "DELETE" });
      fetchBusinesses();
    } catch (error) {
      console.error("Failed to delete business:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar />

      {/* Main Content */}
      <div className="ml-[220px]">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">
          <div className="text-sm text-gray-600">Manage Businesses</div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
              <Bell size={18} />
            </Button>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-900">
              Active Practices
            </h1>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleAddNew}>
              <Plus size={16} />
              Add Business
            </Button>
          </div>

          {/* Business Cards Grid */}
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : businesses.length === 0 ? (
            <div className="text-gray-500">No businesses yet. Add one to get started!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  onEdit={() => handleEdit(business)}
                  onDelete={() => handleDelete(business.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <BusinessEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        business={selectedBusiness}
        onSave={handleSave}
        isNew={isNewBusiness}
      />
    </div>
  );
}
