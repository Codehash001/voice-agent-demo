import { Bell, Plus } from "lucide-react";
import Sidebar from "./components/Sidebar";
import BusinessCard from "./components/BusinessCard";
import { Button } from "@/components/ui/button";

export default function Home() {
  const businessData = {
    name: "Bright Smiles Dental",
    phone: "+1 555 123-4567",
    software: "Calendly",
    status: "Online" as const,
    tags: [
      "CANCELLATI",
      "MISSED CAL",
      "INSURANCE",
      "APPOINTMEN",
      "REGULAR SE",
      "TREATMENT",
    ],
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar />

      {/* Main Content */}
      <div className="ml-[180px]">
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
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus size={16} />
              Add Business
            </Button>
          </div>

          {/* Business Cards Grid */}
          <div className="max-w-md">
            <BusinessCard {...businessData} />
          </div>
        </main>
      </div>
    </div>
  );
}
