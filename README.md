# Dentavoice - AI Dental Receptionist

A LiveKit-powered voice AI agent for dental appointment scheduling built with Next.js and TypeScript.

## Features

- **Voice AI Agent**: Talk to an AI dental receptionist to schedule appointments
- **Appointment Booking**: Book, check availability, and cancel appointments
- **Practice Information**: Get hours, location, services, and insurance info
- **Modern UI**: Beautiful admin dashboard with shadcn/ui components

## Prerequisites

- Node.js 20+
- [LiveKit Cloud account](https://cloud.livekit.io) (or self-hosted LiveKit server)
- OpenAI API key (for GPT-4o Realtime)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# LiveKit credentials (from https://cloud.livekit.io)
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud

# OpenAI API key (for GPT-4o Realtime)
OPENAI_API_KEY=your_openai_key

# ElevenLabs API key (for natural voice)
ELEVEN_API_KEY=your_elevenlabs_key

# Calendly API (for appointment scheduling)
CALENDLY_API_KEY=your_calendly_personal_access_token
CALENDLY_EVENT_TYPE_URI=https://api.calendly.com/event_types/YOUR_EVENT_TYPE_ID
```

### 3. Download model files

```bash
npm run agent:download
```

### 4. Run the application

**Terminal 1 - Start the AI agent:**
```bash
npm run agent:dev
```

**Terminal 2 - Start the Next.js frontend:**
```bash
npm run dev
```

### 5. Test it out

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Test AI Agent" on the business card
3. Allow microphone access and start talking!

## Agent Commands

| Command | Description |
|---------|-------------|
| `npm run agent:dev` | Run agent in development mode |
| `npm run agent:start` | Run agent in production mode |
| `npm run agent:download` | Download required model files |

## Calendly Setup

1. **Get your Personal Access Token**:
   - Go to [Calendly Integrations](https://calendly.com/integrations/api_webhooks)
   - Generate a Personal Access Token
   - Add it as `CALENDLY_API_KEY` in `.env.local`

2. **Get your Event Type URI**:
   - Go to your Calendly dashboard
   - Click on the event type you want to use (e.g., "30 Minute Meeting")
   - The URI format is: `https://api.calendly.com/event_types/XXXXXXXX`
   - You can also find it via the API: `GET https://api.calendly.com/event_types`
   - Add it as `CALENDLY_EVENT_TYPE_URI` in `.env.local`

## Agent Capabilities

The AI dental assistant can:

- **Schedule appointments** - Book directly through Calendly with patient name and email
- **Check availability** - View real-time available slots from your Calendly calendar
- **Get event types** - List available appointment types configured in Calendly
- **Answer questions** - Provide practice info (hours, location, services, insurance)

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS, shadcn/ui
- **Voice AI**: OpenAI GPT-4o Realtime (STT + LLM + TTS all-in-one)
- **VAD**: Silero voice activity detection
- **Infrastructure**: LiveKit Agents

## Learn More

- [LiveKit Agents Documentation](https://docs.livekit.io/agents/)
- [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)
- [Next.js Documentation](https://nextjs.org/docs)
