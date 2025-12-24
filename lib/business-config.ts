export interface GeneralInfo {
  practiceName: string;
  phone: string;
  software: string;
  noShowFee: number;
  address: string;
  hours: string;
  services: string;
}

export interface AIFeatures {
  smartCancellations: boolean;
  missedCallRecovery: boolean;
  insurancePreScreen: boolean;
  confirmationNoShow: boolean;
  regularScheduling: boolean;
  treatmentFollowUp: boolean;
  patientReactivation: boolean;
  emergencyTriage: boolean;
  newPatientIntake: boolean;
  dailyAnalytics: boolean;
}

export interface AgentConfig {
  agentName: string;
  greeting: string;
}

export interface Business {
  id: string;
  name: string;
  phone: string;
  software: string;
  status: "Online" | "Offline";
  tags: string[];
  generalInfo: GeneralInfo;
  aiFeatures: AIFeatures;
  agentConfig: AgentConfig;
}

export interface BusinessesData {
  businesses: Business[];
}

export const defaultAIFeatures: AIFeatures = {
  smartCancellations: false,
  missedCallRecovery: false,
  insurancePreScreen: false,
  confirmationNoShow: false,
  regularScheduling: true,
  treatmentFollowUp: false,
  patientReactivation: false,
  emergencyTriage: false,
  newPatientIntake: false,
  dailyAnalytics: false,
};

export function generateBusinessId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
