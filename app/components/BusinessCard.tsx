"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Phone, MapPin, Settings, Plus, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VoiceAgentModal from "./VoiceAgentModal";
import { Business } from "@/lib/business-config";
import { createClient } from "@/lib/supabase/client";

interface BusinessCardProps {
  business: Business;
  onEdit: () => void;
  onDelete: () => void;
}

interface Agent {
  id: string;
  agent_name: string;
}

export default function BusinessCard({
  business,
  onEdit,
  onDelete,
}: BusinessCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchAgent();
  }, [business.id]);

  const fetchAgent = async () => {
    try {
      const { data } = await supabase
        .from("business_agents")
        .select("id, agent_name")
        .eq("business_id", business.id)
        .limit(1);

      if (data && data.length > 0) {
        setAgent(data[0]);
      } else {
        setAgent(null);
      }
    } catch (error) {
      console.error("Error fetching agent:", error);
    } finally {
      setLoadingAgent(false);
    }
  };

  const createAgent = async () => {
    setCreatingAgent(true);
    try {
      // Create the agent
      const { data: agentData, error: agentError } = await supabase
        .from("business_agents")
        .insert({
          business_id: business.id,
          agent_name: "AI Assistant",
          greeting_text: `Hello! Thank you for calling ${business.name}. How can I help you today?`,
          pretendence: false,
        })
        .select()
        .single();

      if (agentError) throw agentError;

      if (agentData) {
        // Fetch all available services
        const { data: services } = await supabase
          .from("agent_services")
          .select("id");

        // Enable all services by default
        if (services && services.length > 0) {
          const serviceRecords = services.map(service => ({
            business_id: business.id,
            agent_id: agentData.id,
            service_id: service.id,
            is_active: true,
          }));

          await supabase
            .from("business_agent_services")
            .insert(serviceRecords);
        }

        setAgent(agentData);
        // Navigate to configure page after creation
        router.push(`/businesses/${business.id}/agent/${agentData.id}`);
      }
    } catch (error) {
      console.error("Error creating agent:", error);
    } finally {
      setCreatingAgent(false);
    }
  };

  return (
    <>
      <Card className="p-0 gap-0 shadow-sm border-gray-100">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-sm">
                {business.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{business.name}</h3>
                {business.phone_no && (
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Phone size={10} />
                    <span>{business.phone_no}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-gray-400 hover:text-gray-600"
                onClick={onEdit}
              >
                <Pencil size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-red-400 hover:text-red-600 hover:bg-red-50"
                onClick={onDelete}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>

          {/* Info Row */}
          <div className="flex gap-8 mb-4">
            {business.practice_software && (
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                  Software
                </div>
                <div className="text-sm text-gray-700 font-medium">{business.practice_software}</div>
              </div>
            )}
            {business.admin_email && (
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                  Admin
                </div>
                <div className="text-sm text-gray-700 font-medium truncate max-w-[150px]">
                  {business.admin_email}
                </div>
              </div>
            )}
          </div>

          {/* Address */}
          {business.address && (
            <div className="flex items-start gap-2 mb-4 text-gray-500 text-xs">
              <MapPin size={12} className="mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{business.address}</span>
            </div>
          )}

          {/* Services Tags */}
          {business.services && business.services.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {business.services.slice(0, 3).map((service, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-blue-50 text-blue-600 text-[10px] font-medium uppercase tracking-wider hover:bg-blue-100 border-0"
                >
                  {service.length > 15 ? service.substring(0, 15) + "..." : service}
                </Badge>
              ))}
              {business.services.length > 3 && (
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-500 text-[10px] font-medium border-0"
                >
                  +{business.services.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* AI Agent Button - Changes based on agent existence */}
          {loadingAgent ? (
            <Button
              className="w-full rounded-full bg-gray-200 text-gray-400"
              disabled
            >
              Loading...
            </Button>
          ) : agent ? (
            <Button
              className="w-full rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white"
              onClick={() => router.push(`/businesses/${business.id}/agent/${agent.id}`)}
            >
              <Settings size={14} />
              Configure AI Agent
            </Button>
          ) : (
            <Button
              className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={createAgent}
              disabled={creatingAgent}
            >
              <Plus size={14} />
              {creatingAgent ? "Creating..." : "Create AI Agent"}
            </Button>
          )}
        </CardContent>
      </Card>

      <VoiceAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        businessName={business.name}
        businessId={business.id}
      />
    </>
  );
}
