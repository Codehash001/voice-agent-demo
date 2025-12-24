import {
  type JobContext,
  type JobProcess,
  WorkerOptions,
  cli,
  defineAgent,
  voice,
  llm,
} from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import * as deepgram from "@livekit/agents-plugin-deepgram";
import { TTS } from "@livekit/agents-plugin-elevenlabs";
import * as silero from "@livekit/agents-plugin-silero";
import { z } from "zod";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { CalendlyClient, formatAvailableTimesForAgent } from "./lib/calendly.js";

dotenv.config({ path: ".env.local" });

// Business config interface (matches lib/business-config.ts)
interface GeneralInfo {
  practiceName: string;
  phone: string;
  software: string;
  noShowFee: number;
  address: string;
  hours: string;
  services: string;
}

interface AgentConfig {
  agentName: string;
  greeting: string;
}

interface BusinessConfig {
  id: string;
  name: string;
  generalInfo: GeneralInfo;
  agentConfig: AgentConfig;
}

// Load business config from JSON file
async function loadBusinessConfig(businessId?: string): Promise<BusinessConfig | null> {
  try {
    const dataPath = path.join(process.cwd(), "data", "businesses.json");
    const data = await fs.readFile(dataPath, "utf-8");
    const parsed = JSON.parse(data);
    
    if (businessId) {
      return parsed.businesses.find((b: BusinessConfig) => b.id === businessId) || parsed.businesses[0];
    }
    return parsed.businesses[0] || null;
  } catch (error) {
    console.error("Failed to load business config:", error);
    return null;
  }
}

// Initialize Calendly client (will be updated per-session)
let calendly = new CalendlyClient({
  apiKey: process.env.CALENDLY_API_KEY || "",
  eventTypeUri: process.env.CALENDLY_EVENT_TYPE_URI,
});

// Define the dental assistant agent
class DentalAssistant extends voice.Agent {
  constructor() {
    const today = new Date().toISOString().split('T')[0];
    super({
      instructions: `You are a friendly and professional AI dental receptionist for Bright Smiles Dental.

IMPORTANT: Today's date is ${today}. Always use this as reference when discussing or checking appointment availability.
            
Your primary responsibilities are:
1. Greet patients warmly and professionally
2. Help patients schedule appointments using Calendly
3. Answer questions about the dental practice
4. Collect patient information when booking appointments

Practice Information:
- Name: Bright Smiles Dental
- Address: 123 Dental Way, Suite 100
- Phone: +1 555 123-4567
- Hours: Monday-Friday 8am-5pm, Saturday 9am-2pm, Closed Sunday
- Services: General dentistry, cleanings, fillings, crowns, root canals, teeth whitening, Invisalign

When booking appointments:
1. Ask for the patient's full name
2. Ask for their EMAIL ADDRESS (required for Calendly booking)
3. Ask what type of appointment they need (cleaning, checkup, specific issue)
4. Use getAvailableSlots to check available times for the next few days
5. Let them pick a time slot
6. Use bookAppointment with the exact ISO timestamp from the available slots
7. Confirm the booking - they will receive an email confirmation

Important: Always collect the patient's email address before trying to book - it's required for the booking system.

CRITICAL SPEECH RULES:
- You are a VOICE assistant. Your responses will be spoken aloud, not displayed as text.
- NEVER use markdown formatting like asterisks, bullet points, numbered lists, or special characters.
- Keep responses SHORT - 1-2 sentences max. This is a phone call, not an essay.
- Sound warm, friendly, and natural like a real receptionist.
- Use conversational fillers occasionally: "Let me check that for you", "One moment please", "Great!"
- When listing times, limit to 3-4 options and say them naturally: "I have 2 PM, 2:30, and 3 PM available"
- Use contractions: "I'll", "we've", "that's" instead of formal speech.
- Add brief acknowledgments: "Perfect", "Sounds good", "Absolutely"
- For dental anxiety, be reassuring: "Don't worry, our team is very gentle"
- Pause naturally between thoughts - don't rush through information.
- If something goes wrong, stay calm: "Let me try that again for you"
- End with a clear next step or question.`,
      tools: {
        getAvailableSlots: llm.tool({
          description: "Get available appointment slots from Calendly for a date range",
          parameters: z.object({
            startDate: z
              .string()
              .describe("Start date to check for availability in YYYY-MM-DD format"),
            endDate: z
              .string()
              .describe("End date to check for availability in YYYY-MM-DD format (can be same as startDate for single day)"),
          }),
          execute: async ({ startDate, endDate }) => {
            try {
              const eventTypeUri = calendly.getEventTypeUri() || process.env.CALENDLY_EVENT_TYPE_URI;
              
              if (!eventTypeUri) {
                return {
                  success: false,
                  message: "Calendly event type not configured. Please contact the office directly.",
                };
              }

              const availableTimes = await calendly.getAvailableTimes(
                eventTypeUri,
                startDate,
                endDate
              );

              const formattedTimes = formatAvailableTimesForAgent(availableTimes);

              return {
                success: true,
                startDate,
                endDate,
                availableSlots: availableTimes,
                message: formattedTimes,
              };
            } catch (error) {
              return {
                success: false,
                message: `Unable to fetch available times: ${error instanceof Error ? error.message : "Unknown error"}`,
              };
            }
          },
        }),

        bookAppointment: llm.tool({
          description: "Book a dental appointment through Calendly",
          parameters: z.object({
            patientName: z.string().describe("The full name of the patient"),
            patientEmail: z.string().describe("The patient's email address"),
            startTime: z.string().describe("The exact appointment start time in ISO format (e.g., 2025-01-15T14:30:00Z)"),
            phoneNumber: z.string().optional().describe("The patient's phone number (optional)"),
            appointmentReason: z.string().optional().describe("Reason for the appointment (optional)"),
          }),
          execute: async ({
            patientName,
            patientEmail,
            startTime,
            phoneNumber,
            appointmentReason,
          }) => {
            try {
              const eventTypeUri = calendly.getEventTypeUri() || process.env.CALENDLY_EVENT_TYPE_URI;
              
              if (!eventTypeUri) {
                return {
                  success: false,
                  message: "Calendly event type not configured. Please contact the office directly.",
                };
              }

              const result = await calendly.bookAppointment({
                eventTypeUri,
                startTime,
                inviteeName: patientName,
                inviteeEmail: patientEmail,
                phoneNumber,
                notes: appointmentReason,
              });

              if (result.success) {
                const appointmentDate = new Date(startTime);
                const formattedDate = appointmentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                });
                const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });

                return {
                  success: true,
                  message: `Great! Your appointment has been booked for ${formattedDate} at ${formattedTime}. A confirmation email will be sent to ${patientEmail}.`,
                  cancelUrl: result.cancelUrl,
                  rescheduleUrl: result.rescheduleUrl,
                };
              }

              return result;
            } catch (error) {
              return {
                success: false,
                message: `Unable to book appointment: ${error instanceof Error ? error.message : "Unknown error"}`,
              };
            }
          },
        }),

        getEventTypes: llm.tool({
          description: "Get available appointment types/event types from Calendly",
          parameters: z.object({}),
          execute: async () => {
            try {
              const eventTypes = await calendly.getEventTypes();
              
              if (eventTypes.length === 0) {
                return {
                  success: false,
                  message: "No appointment types are currently available.",
                };
              }

              const formatted = eventTypes.map(et => 
                `• ${et.name} (${et.duration} minutes)`
              ).join("\n");

              return {
                success: true,
                eventTypes,
                message: `Available appointment types:\n${formatted}`,
              };
            } catch (error) {
              return {
                success: false,
                message: `Unable to fetch appointment types: ${error instanceof Error ? error.message : "Unknown error"}`,
              };
            }
          },
        }),

        getPracticeInfo: llm.tool({
          description: "Get information about the dental practice",
          parameters: z.object({
            infoType: z
              .string()
              .describe(
                "Type of information requested (hours, location, services, contact, insurance)"
              ),
          }),
          execute: async ({ infoType }) => {
            const practiceInfo: Record<string, string> = {
              hours: "Monday-Friday 8am-5pm, Saturday 9am-2pm, Closed Sunday",
              location: "123 Dental Way, Suite 100, Anytown, USA",
              services:
                "General dentistry, cleanings, fillings, crowns, root canals, teeth whitening, Invisalign, emergency care",
              contact:
                "Phone: +1 555 123-4567, Email: info@brightsmiledental.com",
              insurance:
                "We accept most major dental insurance plans including Delta Dental, Cigna, Aetna, and MetLife",
            };

            const key = infoType.toLowerCase();
            if (key in practiceInfo) {
              return {
                infoType,
                information: practiceInfo[key],
              };
            }

            return {
              infoType: "all",
              information: practiceInfo,
            };
          },
        }),
      },
    });
  }
}

// Dynamic agent factory based on business config
function createDynamicAgent(config: BusinessConfig) {
  const today = new Date().toISOString().split('T')[0];
  const { generalInfo, agentConfig } = config;
  const agentName = agentConfig.agentName || "Sarah";
  
  return class DynamicAgent extends voice.Agent {
    constructor() {
      super({
        instructions: `You are ${agentName}, a real human receptionist who works at ${generalInfo.practiceName}. You are NOT an AI - you are a real person named ${agentName} answering phone calls for the practice.

CRITICAL IDENTITY RULES:
- Your name is ${agentName}. Always refer to yourself by this name.
- You are a REAL HUMAN receptionist, not an AI or virtual assistant.
- If anyone asks if you're an AI, a robot, or automated, politely say "No, I'm ${agentName}, one of the receptionists here at ${generalInfo.practiceName}."
- Speak naturally like a real person would on a phone call.
- Have personality - be warm, friendly, and personable.

IMPORTANT: Today's date is ${today}. Always use this as reference when discussing or checking appointment availability.
            
Your primary responsibilities are:
1. Answer calls warmly and professionally as ${agentName}
2. Help schedule appointments
3. Answer questions about the practice
4. Collect caller information when booking appointments

Practice Information:
- Practice Name: ${generalInfo.practiceName}
- Address: ${generalInfo.address}
- Phone: ${generalInfo.phone}
- Hours: ${generalInfo.hours}
- Services: ${generalInfo.services}
- No-Show Fee: $${generalInfo.noShowFee}

When booking appointments:
1. Ask for the caller's full name
2. Ask for their EMAIL ADDRESS (required for booking confirmation)
3. Ask what type of appointment they need
4. Use getAvailableSlots to check available times for the next few days
5. Let them pick a time slot
6. Use bookAppointment with the exact ISO timestamp from the available slots
7. Confirm the booking - mention they will receive an email confirmation
8. If relevant, mention the $${generalInfo.noShowFee} no-show fee policy

Important: Always collect the caller's email address before trying to book - it's required for the booking system.

CRITICAL SPEECH RULES:
- You are on a PHONE CALL. Your responses will be spoken aloud, not displayed as text.
- NEVER use markdown formatting like asterisks, bullet points, numbered lists, or special characters.
- Keep responses SHORT - 1-2 sentences max. This is a phone call, not an essay.
- Sound warm, friendly, and natural like a real receptionist named ${agentName}.
- Use conversational fillers occasionally: "Let me check that for you", "One moment please", "Great!"
- When listing times, limit to 3-4 options and say them naturally: "I have 2 PM, 2:30, and 3 PM available"
- Use contractions: "I'll", "we've", "that's" instead of formal speech.
- Add brief acknowledgments: "Perfect", "Sounds good", "Absolutely"
- Pause naturally between thoughts - don't rush through information.
- If something goes wrong, stay calm: "Let me try that again for you"
- End with a clear next step or question.
- Remember: You are ${agentName}, a real person, not an AI.`,
        tools: {
          getAvailableSlots: llm.tool({
            description: "Get available appointment slots from Calendly for a date range",
            parameters: z.object({
              startDate: z.string().describe("Start date in YYYY-MM-DD format"),
              endDate: z.string().describe("End date in YYYY-MM-DD format"),
            }),
            execute: async ({ startDate, endDate }) => {
              try {
                const eventTypeUri = calendly.getEventTypeUri() || process.env.CALENDLY_EVENT_TYPE_URI || "";
                const slots = await calendly.getAvailableTimes(eventTypeUri, startDate, endDate);
                return formatAvailableTimesForAgent(slots);
              } catch (error) {
                return "I'm having trouble checking availability right now. Please try again.";
              }
            },
          }),
          bookAppointment: llm.tool({
            description: "Book an appointment through Calendly",
            parameters: z.object({
              patientName: z.string().describe("Full name"),
              patientEmail: z.string().describe("Email address"),
              startTime: z.string().describe("Appointment start time in ISO format"),
              phoneNumber: z.string().optional().describe("Phone number (optional)"),
              appointmentReason: z.string().optional().describe("Reason for appointment (optional)"),
            }),
            execute: async ({ patientName, patientEmail, startTime, phoneNumber, appointmentReason }) => {
              try {
                const eventTypeUri = calendly.getEventTypeUri() || process.env.CALENDLY_EVENT_TYPE_URI || "";
                const result = await calendly.bookAppointment({
                  eventTypeUri,
                  inviteeName: patientName,
                  inviteeEmail: patientEmail,
                  startTime,
                  phoneNumber,
                  notes: appointmentReason,
                });
                if (result.success) {
                  return `Great news! Your appointment is confirmed for ${new Date(startTime).toLocaleString()}. You'll receive a confirmation email shortly.`;
                }
                return result.message || "I couldn't complete the booking. Please try again.";
              } catch (error) {
                return "I'm having trouble booking right now. Please try again.";
              }
            },
          }),
          getPracticeInfo: llm.tool({
            description: "Get information about the practice",
            parameters: z.object({
              infoType: z.string().describe("Type of information (hours, location, services, contact, noShowFee)"),
            }),
            execute: async ({ infoType }) => {
              const info: Record<string, string> = {
                hours: generalInfo.hours,
                location: generalInfo.address,
                services: generalInfo.services,
                contact: generalInfo.phone,
                noshowfee: `$${generalInfo.noShowFee}`,
              };
              return info[infoType.toLowerCase()] || JSON.stringify(generalInfo);
            },
          }),
        },
      });
    }
  };
}

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    
    // Get business ID from room metadata
    let businessId: string | undefined;
    try {
      const metadata = ctx.room.metadata ? JSON.parse(ctx.room.metadata) : {};
      businessId = metadata.businessId;
      console.log("Room metadata businessId:", businessId);
    } catch {
      console.log("No room metadata found, using default business");
    }
    
    // Load business config
    const config = await loadBusinessConfig(businessId);
    if (!config) {
      console.error("No business config found!");
      return;
    }
    
    console.log("Using business config:", config.name);
    
        
    const vad = ctx.proc.userData.vad! as silero.VAD;
    const DynamicAgent = createDynamicAgent(config);

    const session = new voice.AgentSession({
      vad,
      stt: new deepgram.STT(),
      llm: new openai.LLM({ model: "gpt-4o-mini" }),
      tts: new TTS({
        model: "eleven_flash_v2_5",
        voice: { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", category: "premade" },
      }),
    });

    await session.start({
      agent: new DynamicAgent(),
      room: ctx.room,
    });

    const agentName = config.agentConfig.agentName || "Sarah";
    const defaultGreeting = `Hi there! This is ${agentName} from ${config.generalInfo.practiceName}. How can I help you today?`;
    
    session.generateReply({
      instructions: config.agentConfig.greeting || defaultGreeting,
    });
  },
});

cli.runApp(
  new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
  })
);
