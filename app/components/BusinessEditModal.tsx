"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Phone, Shield, Clock, Users, FileText, AlertTriangle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Business, defaultAIFeatures } from "@/lib/business-config";
import React from "react";

interface BusinessEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business | null;
  onSave: (business: Business) => void;
  isNew?: boolean;
}

const defaultBusiness: Omit<Business, "id"> = {
  name: "",
  phone: "",
  software: "Calendly",
  status: "Online",
  tags: ["SCHEDULING", "APPOINTMENTS"],
  generalInfo: {
    practiceName: "",
    phone: "",
    software: "Calendly",
    noShowFee: 50,
    address: "",
    hours: "Monday-Friday 9am-5pm",
    services: "",
  },
  aiFeatures: defaultAIFeatures,
  agentConfig: {
    agentName: "",
    greeting: "",
  },
};

const aiFeaturesList = [
  { key: "smartCancellations", label: "Smart Cancellations", description: "Automatically fill gaps by calling eligible patients when slots open up.", icon: Calendar, disabled: true },
  { key: "missedCallRecovery", label: "Missed Call Recovery", description: "Intercept missed calls and book appointments immediately.", icon: Phone, disabled: true },
  { key: "insurancePreScreen", label: "Insurance Pre-Screen", description: "Collect details and set coverage expectations during the call.", icon: Shield, disabled: true },
  { key: "confirmationNoShow", label: "Confirmation & No-Show", description: "Call to confirm and handle no-show fee warnings automatically.", icon: Clock, disabled: true },
  { key: "regularScheduling", label: "Regular Scheduling", description: "Standard booking following provider-specific preferences.", icon: Calendar, disabled: false },
  { key: "treatmentFollowUp", label: "Treatment Follow-Up", description: "Call patients with unscheduled diagnosed treatment.", icon: FileText, disabled: true },
  { key: "patientReactivation", label: "Patient Reactivation", description: "Recall patients not seen in 12-24 months.", icon: Users, disabled: true },
  { key: "emergencyTriage", label: "Emergency Triage", description: "After-hours structured emergency questioning and escalation.", icon: AlertTriangle, disabled: true },
  { key: "newPatientIntake", label: "New Patient Intake", description: "Collect demographics and explain what to expect.", icon: Users, disabled: true },
  { key: "dailyAnalytics", label: "Daily Analytics", description: "Generate and send daily ROI reports to the office manager.", icon: BarChart3, disabled: true },
];

export default function BusinessEditModal({
  isOpen,
  onClose,
  business,
  onSave,
  isNew = false,
}: BusinessEditModalProps) {
  const [formData, setFormData] = useState<Business | Omit<Business, "id">>(
    business || defaultBusiness
  );

  useEffect(() => {
    if (business) {
      setFormData(business);
    } else {
      setFormData(defaultBusiness);
    }
  }, [business, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      id: isNew ? "" : (formData as Business).id,
      name: formData.generalInfo.practiceName,
      phone: formData.generalInfo.phone,
      software: formData.generalInfo.software,
    } as Business;
    onSave(dataToSave);
    onClose();
  };

  const updateGeneralInfo = (field: string, value: string | number) => {
    setFormData({
      ...formData,
      generalInfo: {
        ...formData.generalInfo,
        [field]: value,
      },
    });
  };

  const updateAgentConfig = (field: string, value: string) => {
    setFormData({
      ...formData,
      agentConfig: {
        ...formData.agentConfig,
        [field]: value,
      },
    });
  };

  const toggleAIFeature = (key: string) => {
    setFormData({
      ...formData,
      aiFeatures: {
        ...formData.aiFeatures,
        [key]: !formData.aiFeatures[key as keyof typeof formData.aiFeatures],
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isNew ? "Create New Practice Account" : "Edit Practice Account"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-8">
          {/* Section 1: General Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <h3 className="text-lg font-semibold">General Information</h3>
              </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="practiceName">Practice Name</Label>
                <Input
                  id="practiceName"
                  value={formData.generalInfo.practiceName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateGeneralInfo("practiceName", e.target.value)}
                  placeholder="e.g., Bright Smiles Dental"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Dedicated Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.generalInfo.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateGeneralInfo("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label>Practice Software</Label>
                <Select
                  value={formData.generalInfo.software}
                  onValueChange={(value) => updateGeneralInfo("software", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select software" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Calendly">Calendly</SelectItem>
                    <SelectItem value="Dentrix">Dentrix</SelectItem>
                    <SelectItem value="OpenDental">Open Dental</SelectItem>
                    <SelectItem value="Eaglesoft">Eaglesoft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="noShowFee">No-Show Fee ($)</Label>
                <Input
                  id="noShowFee"
                  type="number"
                  value={formData.generalInfo.noShowFee}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateGeneralInfo("noShowFee", parseInt(e.target.value) || 0)}
                  placeholder="50"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  value={formData.generalInfo.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateGeneralInfo("address", e.target.value)}
                  placeholder="123 Dental Way, Suite 100, City, State ZIP"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="hours">Business Hours</Label>
                <Input
                  id="hours"
                  value={formData.generalInfo.hours}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateGeneralInfo("hours", e.target.value)}
                  placeholder="Monday-Friday 8am-5pm, Saturday 9am-2pm"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="services">Services Offered</Label>
                <Textarea
                  id="services"
                  value={formData.generalInfo.services}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateGeneralInfo("services", e.target.value)}
                  placeholder="General dentistry, cleanings, fillings, crowns, root canals..."
                  rows={2}
                />
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Section 2: Modular AI Features */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <h3 className="text-lg font-semibold">Modular AI Features</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Select which AI capabilities should be enabled for this specific practice.</p>
            
            <div className="grid grid-cols-2 gap-3">
              {aiFeaturesList.map((feature) => {
                const Icon = feature.icon;
                const isEnabled = formData.aiFeatures[feature.key as keyof typeof formData.aiFeatures];
                const isDisabled = feature.disabled;
                
                return (
                  <div
                    key={feature.key}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                      isEnabled && !isDisabled
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white"
                    } ${isDisabled ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        isEnabled && !isDisabled ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{feature.label}</div>
                        <div className="text-xs text-gray-500 max-w-[180px]">{feature.description}</div>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => !isDisabled && toggleAIFeature(feature.key)}
                      disabled={isDisabled}
                    />
                  </div>
                );
              })}
            </div>
            </CardContent>
          </Card>

          {/* Section 3: Agent Configuration */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <h3 className="text-lg font-semibold">Agent Configuration</h3>
              </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentName">Agent Name</Label>
                <Input
                  id="agentName"
                  value={formData.agentConfig.agentName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAgentConfig("agentName", e.target.value)}
                  placeholder="e.g., Sarah, Michael, Emily"
                />
                <p className="text-xs text-muted-foreground">The AI will introduce itself with this name</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="greeting">Agent Greeting</Label>
                <Textarea
                  id="greeting"
                  value={formData.agentConfig.greeting}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateAgentConfig("greeting", e.target.value)}
                  placeholder="Hi there! This is Sarah from Bright Smiles Dental. How can I help you today?"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">How the agent greets callers when they connect</p>
              </div>
            </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} className="px-8">
            Cancel
          </Button>
          <Button onClick={handleSave} className="px-8 bg-blue-500 hover:bg-blue-600">
            {isNew ? "Create Business Account" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
