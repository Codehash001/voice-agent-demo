"use client";

import { useState } from "react";
import { Pencil, Trash2, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VoiceAgentModal from "./VoiceAgentModal";

interface BusinessCardProps {
  name: string;
  phone: string;
  software: string;
  status: "Online" | "Offline";
  tags: string[];
}

export default function BusinessCard({
  name,
  phone,
  software,
  status,
  tags,
}: BusinessCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="p-0 gap-0 shadow-sm border-gray-100">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-sm">
                B
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <Phone size={10} />
                  <span>{phone}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" className="text-gray-400 hover:text-gray-600">
                <Pencil size={14} />
              </Button>
              <Button variant="ghost" size="icon-sm" className="text-red-400 hover:text-red-600 hover:bg-red-50">
                <Trash2 size={14} />
              </Button>
            </div>
          </div>

          {/* Info Row */}
          <div className="flex gap-8 mb-4">
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                Software
              </div>
              <div className="text-sm text-gray-700 font-medium">{software}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                Status
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    status === "Online" ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-sm text-gray-700 font-medium">{status}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-blue-50 text-blue-600 text-[10px] font-medium uppercase tracking-wider hover:bg-blue-100 border-0"
              >
                {tag.length > 10 ? tag.substring(0, 10) + "..." : tag}
              </Badge>
            ))}
          </div>

          {/* Test Button */}
          <Button 
            className="w-full rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white"
            onClick={() => setIsModalOpen(true)}
          >
            <Phone size={14} />
            Test AI Agent
          </Button>
        </CardContent>
      </Card>

      <VoiceAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        businessName={name}
      />
    </>
  );
}
