"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Bot,
    Settings,
    Power,
    Mic,
    Save,
    Check,
    Building2,
    Phone,
    Zap,
    PhoneCall
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/app/components/AuthProvider";
import Sidebar from "@/app/components/Sidebar";
import VoiceAgentModal from "@/app/components/VoiceAgentModal";
import { createClient } from "@/lib/supabase/client";

interface AgentService {
    id: string;
    name: string;
    display_name: string;
    description: string;
    config: Record<string, unknown>;
}

interface Business {
    id: string;
    name: string;
    phone_no: string;
}

interface Agent {
    id: string;
    agent_name: string;
    greeting_text: string;
    pretendence: boolean;
}

export default function AgentConfigPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const supabase = createClient();

    const businessId = params.businessId as string;
    const agentId = params.agentId as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [business, setBusiness] = useState<Business | null>(null);
    const [agent, setAgent] = useState<Agent | null>(null);
    const [services, setServices] = useState<AgentService[]>([]);
    const [enabledServices, setEnabledServices] = useState<Record<string, boolean>>({});

    // Agent settings
    const [agentName, setAgentName] = useState("");
    const [greetingText, setGreetingText] = useState("");
    const [pretendence, setPretendence] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            fetchData();
        }
    }, [authLoading, user, businessId, agentId]);

    const fetchData = async () => {
        try {
            const { data: businessData } = await supabase
                .from("businesses")
                .select("id, name, phone_no")
                .eq("id", businessId)
                .single();

            if (businessData) setBusiness(businessData);

            let agentData = null;
            if (agentId !== "default") {
                const { data } = await supabase
                    .from("business_agents")
                    .select("*")
                    .eq("id", agentId)
                    .single();
                agentData = data;
            } else {
                const { data: agents } = await supabase
                    .from("business_agents")
                    .select("*")
                    .eq("business_id", businessId)
                    .limit(1);

                if (agents && agents.length > 0) agentData = agents[0];
            }

            if (agentData) {
                setAgent(agentData);
                setAgentName(agentData.agent_name || "");
                setGreetingText(agentData.greeting_text || "");
                setPretendence(agentData.pretendence || false);
            }

            const { data: servicesData } = await supabase
                .from("agent_services")
                .select("*")
                .order("name");

            if (servicesData) setServices(servicesData);

            if (agentData) {
                const { data: enabledData } = await supabase
                    .from("business_agent_services")
                    .select("service_id, is_active")
                    .eq("business_id", businessId)
                    .eq("agent_id", agentData.id);

                if (enabledData) {
                    const enabled: Record<string, boolean> = {};
                    enabledData.forEach(s => { enabled[s.service_id] = s.is_active; });
                    setEnabledServices(enabled);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleService = async (serviceId: string, isActive: boolean) => {
        if (!agent) return;
        setEnabledServices(prev => ({ ...prev, [serviceId]: isActive }));

        try {
            await supabase
                .from("business_agent_services")
                .upsert({
                    business_id: businessId,
                    agent_id: agent.id,
                    service_id: serviceId,
                    is_active: isActive,
                }, { onConflict: "business_id,agent_id,service_id" });
        } catch (error) {
            console.error("Error toggling service:", error);
            setEnabledServices(prev => ({ ...prev, [serviceId]: !isActive }));
        }
    };

    const saveAgentSettings = async () => {
        if (!agent) return;
        setSaving(true);
        setSaved(false);

        try {
            await supabase
                .from("business_agents")
                .update({
                    agent_name: agentName,
                    greeting_text: greetingText,
                    pretendence: pretendence,
                })
                .eq("id", agent.id);

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error("Error saving agent:", error);
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-screen">
                <Sidebar />
                <main className="flex-1 ml-[220px] p-8 bg-gray-50">
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-pulse text-gray-400">Loading...</div>
                    </div>
                </main>
            </div>
        );
    }

    const activeCount = Object.values(enabledServices).filter(Boolean).length;

    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 ml-[220px] bg-gray-50 overflow-y-auto">
                {/* Header Bar */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 z-10">
                    <div className="flex items-center justify-between max-w-5xl mx-auto">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push("/businesses")}
                                className="gap-2 text-gray-500 hover:text-gray-900"
                            >
                                <ArrowLeft size={16} />
                                Back
                            </Button>
                            <div className="h-6 w-px bg-gray-200" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <Bot size={20} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold text-gray-900">
                                        {agentName || "AI Agent"}
                                    </h1>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <Building2 size={12} />
                                        {business?.name}
                                        {business?.phone_no && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <Phone size={12} />
                                                {business.phone_no}
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={saveAgentSettings}
                            disabled={saving}
                            className={`gap-2 ${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {saved ? <Check size={16} /> : <Save size={16} />}
                            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                        </Button>
                    </div>
                </div>

                <div className="p-8">
                    <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
                        {/* Left Column - Agent Settings */}
                        <div className="col-span-2 space-y-6">
                            {/* Agent Identity */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Mic size={16} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-gray-900">Agent Identity</h2>
                                            <p className="text-xs text-gray-500">How your agent introduces itself</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="agentName" className="text-sm font-medium text-gray-700">
                                                Agent Name
                                            </Label>
                                            <Input
                                                id="agentName"
                                                value={agentName}
                                                onChange={(e) => setAgentName(e.target.value)}
                                                placeholder="e.g., Sarah, Alex, or your business name"
                                                className="h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Behavior</Label>
                                            <div className="h-11 flex items-center gap-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <Switch
                                                    id="pretendence"
                                                    checked={pretendence}
                                                    onCheckedChange={setPretendence}
                                                />
                                                <Label htmlFor="pretendence" className="text-sm text-gray-600 cursor-pointer">
                                                    Pretend to be human
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="greeting" className="text-sm font-medium text-gray-700">
                                            Greeting Message
                                        </Label>
                                        <Textarea
                                            id="greeting"
                                            value={greetingText}
                                            onChange={(e) => setGreetingText(e.target.value)}
                                            placeholder="Hello! Thank you for calling. How can I assist you today?"
                                            rows={3}
                                            className="resize-none"
                                        />
                                        <p className="text-xs text-gray-400">
                                            This is the first thing callers will hear when the agent answers
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Services */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                                <Zap size={16} className="text-green-600" />
                                            </div>
                                            <div>
                                                <h2 className="font-semibold text-gray-900">Agent Services</h2>
                                                <p className="text-xs text-gray-500">Features your agent can perform</p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            <span className="font-semibold text-green-600">{activeCount}</span>
                                            <span className="text-gray-400"> / {services.length} active</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {services.map((service) => {
                                        const isActive = enabledServices[service.id] || false;
                                        return (
                                            <div
                                                key={service.id}
                                                className={`flex items-center justify-between p-5 transition-colors ${isActive ? 'bg-green-50/30' : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex-1 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium text-gray-900">
                                                            {service.display_name}
                                                        </h4>
                                                        {isActive && (
                                                            <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-green-100 text-green-700 rounded-full">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-0.5">
                                                        {service.description}
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={isActive}
                                                    onCheckedChange={(checked) => toggleService(service.id, checked)}
                                                />
                                            </div>
                                        );
                                    })}

                                    {services.length === 0 && (
                                        <div className="p-8 text-center text-gray-500">
                                            No services available. Please run the database migrations.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Quick Stats */}
                        <div className="space-y-6">
                            {/* Test Agent Card */}
                            <div className="bg-[#0f172a] rounded-2xl p-6 text-white">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <PhoneCall size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Test Your Agent</h3>
                                        <p className="text-xs text-gray-400">Inbound call simulation</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 mb-4">
                                    Simulate an inbound call to test how your AI agent responds to callers.
                                </p>
                                <Button
                                    onClick={() => setIsTestModalOpen(true)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
                                >
                                    <Phone size={16} />
                                    Start Test Call
                                </Button>
                            </div>

                            {/* Status Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                    <span className="font-medium text-gray-900">Agent Status</span>
                                </div>
                                <div className="text-3xl font-bold text-green-600 mb-1">Online</div>
                                <p className="text-sm text-gray-500">Ready to handle calls</p>
                            </div>

                            {/* Active Services Summary */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h3 className="font-medium text-gray-900 mb-4">Active Services</h3>
                                {activeCount > 0 ? (
                                    <div className="space-y-2">
                                        {services
                                            .filter(s => enabledServices[s.id])
                                            .map(service => (
                                                <div
                                                    key={service.id}
                                                    className="flex items-center gap-2 text-sm text-gray-600"
                                                >
                                                    <Check size={14} className="text-green-500" />
                                                    {service.display_name}
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">No services enabled yet</p>
                                )}
                            </div>

                            {/* Help Card */}
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                                <h3 className="font-semibold mb-2">Need Help?</h3>
                                <p className="text-sm text-blue-100 mb-4">
                                    Configure each service to customize how your AI agent handles different scenarios.
                                </p>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                                >
                                    View Documentation
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Test Call Modal */}
            <VoiceAgentModal
                isOpen={isTestModalOpen}
                onClose={() => setIsTestModalOpen(false)}
                businessName={business?.name || ""}
                businessId={businessId}
            />
        </div>
    );
}
