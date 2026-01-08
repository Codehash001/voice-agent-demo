// Business types matching the Supabase schema

export interface Business {
  id: string;
  name: string;
  phone_no: string | null;
  address: string | null;
  operating_hours: Record<string, string> | null;
  practice_software: string | null;
  services: string[] | null;
  no_show_fees: number | null;
  admin_email: string;
  additional_details: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessesData {
  businesses: Business[];
}

export interface BusinessAgent {
  id: string;
  business_id: string;
  agent_name: string;
  greeting_text: string | null;
  pretendence: boolean;
  created_at?: string;
  updated_at?: string;
}

// Form data type for creating/editing businesses
export interface BusinessFormData {
  name: string;
  phone_no: string;
  address: string;
  operating_hours: Record<string, string>;
  practice_software: string;
  services: string[];
  no_show_fees: number;
  admin_email: string;
  additional_details: string;
}

// Default empty form data
export const defaultBusinessFormData: BusinessFormData = {
  name: "",
  phone_no: "",
  address: "",
  operating_hours: {
    monday: "9:00 AM - 5:00 PM",
    tuesday: "9:00 AM - 5:00 PM",
    wednesday: "9:00 AM - 5:00 PM",
    thursday: "9:00 AM - 5:00 PM",
    friday: "9:00 AM - 5:00 PM",
    saturday: "Closed",
    sunday: "Closed",
  },
  practice_software: "",
  services: [],
  no_show_fees: 0,
  admin_email: "",
  additional_details: "",
};
