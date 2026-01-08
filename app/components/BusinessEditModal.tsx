"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { X, Building2, Phone, Mail, MapPin, Clock, DollarSign, FileText, Sparkles, ChevronRight, ChevronLeft, Check, Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Business, defaultBusinessFormData } from "@/lib/business-config";
import React from "react";

interface BusinessEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business | null;
  onSave: (business: Partial<Business>) => void;
  isNew?: boolean;
}

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const steps = [
  { id: 1, title: "Basic Info", description: "Business details" },
  { id: 2, title: "Hours & Services", description: "Operating schedule" },
  { id: 3, title: "Additional Details", description: "Extra information" },
];

export default function BusinessEditModal({
  isOpen,
  onClose,
  business,
  onSave,
  isNew = false,
}: BusinessEditModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone_no: "",
    address: "",
    operating_hours: defaultBusinessFormData.operating_hours,
    practice_software: "",
    services: [] as string[],
    no_show_fees: 0,
    admin_email: "",
    additional_details: "",
  });
  const [servicesInput, setServicesInput] = useState("");
  const [servicesList, setServicesList] = useState<string[]>([]);
  const [timezone, setTimezone] = useState("America/New_York");
  const [customHours, setCustomHours] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);

  // Fetch users for admin dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || "",
        phone_no: business.phone_no || "",
        address: business.address || "",
        operating_hours: business.operating_hours || defaultBusinessFormData.operating_hours,
        practice_software: business.practice_software || "",
        services: business.services || [],
        no_show_fees: business.no_show_fees || 0,
        admin_email: business.admin_email || "",
        additional_details: business.additional_details || "",
      });
      setServicesInput("");
      setServicesList(business.services || []);
    } else {
      setFormData({
        name: "",
        phone_no: "",
        address: "",
        operating_hours: defaultBusinessFormData.operating_hours,
        practice_software: "",
        services: [],
        no_show_fees: 0,
        admin_email: "",
        additional_details: "",
      });
      setServicesInput("");
      setServicesList([]);
    }
    setCurrentStep(1);
  }, [business, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      services: servicesList,
      ...(business?.id ? { id: business.id } : {}),
    };
    onSave(dataToSave);
    onClose();
  };

  const handleServiceKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && servicesInput.trim()) {
      e.preventDefault();
      if (!servicesList.includes(servicesInput.trim())) {
        setServicesList([...servicesList, servicesInput.trim()]);
      }
      setServicesInput("");
    }
  };

  const addService = () => {
    if (servicesInput.trim() && !servicesList.includes(servicesInput.trim())) {
      setServicesList([...servicesList, servicesInput.trim()]);
      setServicesInput("");
    }
  };

  const removeService = (service: string) => {
    setServicesList(servicesList.filter(s => s !== service));
  };

  const updateField = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateOperatingHours = (day: string, value: string) => {
    setFormData({
      ...formData,
      operating_hours: {
        ...formData.operating_hours,
        [day]: value,
      },
    });
  };

  const isStep1Valid = formData.name.trim() !== "" && formData.admin_email.trim() !== "";
  const canProceed = currentStep === 1 ? isStep1Valid : true;

  const handleNext = () => {
    if (currentStep < 3 && canProceed) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl min-h-[600px] max-h-[90vh] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-[#0f172a] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isNew ? "Add New Business" : "Edit Business"}
                </h2>
                <p className="text-blue-100 text-sm">
                  {isNew ? "Set up a new business for AI voice agent" : "Update business information"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                {/* Step Circle */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${currentStep > step.id
                      ? "bg-blue-600 text-white"
                      : currentStep === step.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                      }`}
                  >
                    {currentStep > step.id ? <Check size={18} /> : step.id}
                  </div>
                  <div className="hidden sm:block">
                    <div className={`text-sm font-medium ${currentStep >= step.id ? "text-gray-900" : "text-gray-400"}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400">{step.description}</div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className={`h-1 rounded-full transition-all ${currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
                      }`} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-gray-700">
                  <Building2 size={14} className="text-blue-500" />
                  Business Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("name", e.target.value)}
                  placeholder="Enter business name"
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone_no" className="flex items-center gap-2 text-gray-700">
                    <Phone size={14} className="text-blue-500" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone_no"
                    value={formData.phone_no}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("phone_no", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_email" className="flex items-center gap-2 text-gray-700">
                    <Mail size={14} className="text-blue-500" />
                    Business Admin <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.admin_email}
                    onValueChange={(value) => updateField("admin_email", value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select admin user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.email}>
                          {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2 text-gray-700">
                  <MapPin size={14} className="text-blue-500" />
                  Business Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("address", e.target.value)}
                  placeholder="123 Main Street, Suite 100, City, State ZIP"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-700">
                  <Sparkles size={14} className="text-blue-500" />
                  Practice Management Software
                </Label>
                <Select
                  value={formData.practice_software}
                  onValueChange={(value) => updateField("practice_software", value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your practice software" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Calendly">Calendly</SelectItem>
                    <SelectItem value="Dentrix">Dentrix</SelectItem>
                    <SelectItem value="OpenDental">Open Dental</SelectItem>
                    <SelectItem value="Eaglesoft">Eaglesoft</SelectItem>
                    <SelectItem value="PracticeWorks">PracticeWorks</SelectItem>
                    <SelectItem value="Curve Dental">Curve Dental</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Hours & Services */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Timezone */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-700">
                  <Globe size={14} className="text-blue-500" />
                  Business Timezone
                </Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="America/Phoenix">Arizona (MST)</SelectItem>
                    <SelectItem value="Pacific/Honolulu">Hawaii (HST)</SelectItem>
                    <SelectItem value="America/Anchorage">Alaska (AKST)</SelectItem>
                    <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                    <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Operating Hours - with Custom option */}
              <div>
                <Label className="flex items-center gap-2 text-gray-700 mb-3">
                  <Clock size={14} className="text-blue-500" />
                  Operating Hours
                </Label>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  {daysOfWeek.map((day) => {
                    const isCustom = formData.operating_hours[day] === "Custom";
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <span className="w-24 text-sm font-medium text-gray-600 capitalize">{day}</span>
                        <Select
                          value={isCustom ? "Custom" : (formData.operating_hours[day] || "9:00 AM - 5:00 PM")}
                          onValueChange={(value) => {
                            updateOperatingHours(day, value);
                            if (value !== "Custom") {
                              setCustomHours(prev => ({ ...prev, [day]: "" }));
                            }
                          }}
                        >
                          <SelectTrigger className="w-[180px] h-9 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Closed">Closed</SelectItem>
                            <SelectItem value="24 Hours">24 Hours</SelectItem>
                            <SelectItem value="8:00 AM - 5:00 PM">8:00 AM - 5:00 PM</SelectItem>
                            <SelectItem value="9:00 AM - 5:00 PM">9:00 AM - 5:00 PM</SelectItem>
                            <SelectItem value="9:00 AM - 6:00 PM">9:00 AM - 6:00 PM</SelectItem>
                            <SelectItem value="10:00 AM - 6:00 PM">10:00 AM - 6:00 PM</SelectItem>
                            <SelectItem value="10:00 AM - 7:00 PM">10:00 AM - 7:00 PM</SelectItem>
                            <SelectItem value="8:00 AM - 12:00 PM">8:00 AM - 12:00 PM</SelectItem>
                            <SelectItem value="9:00 AM - 1:00 PM">9:00 AM - 1:00 PM</SelectItem>
                            <SelectItem value="Custom">Custom...</SelectItem>
                          </SelectContent>
                        </Select>
                        {isCustom && (
                          <Input
                            value={customHours[day] || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setCustomHours(prev => ({ ...prev, [day]: e.target.value }));
                              updateOperatingHours(day, e.target.value || "Custom");
                            }}
                            placeholder="e.g., 7:30 AM - 4:00 PM"
                            className="flex-1 h-9 bg-white"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Services - Pills with Enter to Add */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-gray-700">
                  <FileText size={14} className="text-blue-500" />
                  Services Offered
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={servicesInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServicesInput(e.target.value)}
                    onKeyDown={handleServiceKeyDown}
                    placeholder="Type a service and press Enter..."
                    className="flex-1 h-11"
                  />
                  <Button
                    type="button"
                    onClick={addService}
                    className="h-11 px-4 bg-blue-600 hover:bg-blue-700"
                    disabled={!servicesInput.trim()}
                  >
                    <Plus size={18} />
                  </Button>
                </div>
                {servicesList.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl border border-gray-200 min-h-[70px]">
                    {servicesList.map((service, index) => (
                      <span
                        key={index}
                        className="group inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-default"
                      >
                        {service}
                        <button
                          type="button"
                          onClick={() => removeService(service)}
                          className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-100 text-gray-400 opacity-60 group-hover:opacity-100 group-hover:bg-red-100 group-hover:text-red-500 transition-all"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400">Type a service name and press Enter or click + to add</p>
              </div>

              {/* No-Show Fee */}
              <div className="space-y-2">
                <Label htmlFor="no_show_fees" className="flex items-center gap-2 text-gray-700">
                  <DollarSign size={14} className="text-blue-500" />
                  No-Show Fee
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <Input
                    id="no_show_fees"
                    type="number"
                    value={formData.no_show_fees}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("no_show_fees", parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="h-11 pl-8"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="additional_details" className="flex items-center gap-2 text-gray-700">
                  <FileText size={14} className="text-blue-500" />
                  Additional Notes
                </Label>
                <Textarea
                  id="additional_details"
                  value={formData.additional_details}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("additional_details", e.target.value)}
                  placeholder="Add any special instructions, notes, or important information about this business that the AI agent should know..."
                  rows={5}
                  className="resize-none"
                />
              </div>

              {/* Summary Preview */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 mt-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  Ready to {isNew ? "Create" : "Update"}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 text-gray-900 font-medium">{formData.name || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2 text-gray-900">{formData.phone_no || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Admin:</span>
                    <span className="ml-2 text-gray-900">{formData.admin_email || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Software:</span>
                    <span className="ml-2 text-gray-900">{formData.practice_software || "—"}</span>
                  </div>
                  {servicesInput && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Services:</span>
                      <span className="ml-2 text-gray-900">{servicesInput.split(",").slice(0, 4).map(s => s.trim()).join(", ")}{servicesInput.split(",").length > 4 ? "..." : ""}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </div>
          <div className="flex gap-3">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ChevronLeft size={16} />
                Back
              </Button>
            ) : (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                disabled={!canProceed}
              >
                Next
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Check size={16} />
                {isNew ? "Create Business" : "Save Changes"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
