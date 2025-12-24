import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const CALENDLY_API_KEY = process.env.CALENDLY_API_KEY;

if (!CALENDLY_API_KEY) {
  console.error("❌ CALENDLY_API_KEY not found in .env.local");
  process.exit(1);
}

async function getEventTypes() {
  console.log("🔍 Fetching your Calendly event types...\n");

  // First get the current user
  const userResponse = await fetch("https://api.calendly.com/users/me", {
    headers: {
      Authorization: `Bearer ${CALENDLY_API_KEY}`,
    },
  });

  if (!userResponse.ok) {
    console.error("❌ Failed to authenticate. Check your CALENDLY_API_KEY.");
    process.exit(1);
  }

  const userData = await userResponse.json();
  const userUri = userData.resource.uri;
  console.log(`✅ Authenticated as: ${userData.resource.name}\n`);

  // Get event types
  const eventTypesResponse = await fetch(
    `https://api.calendly.com/event_types?user=${encodeURIComponent(userUri)}&active=true`,
    {
      headers: {
        Authorization: `Bearer ${CALENDLY_API_KEY}`,
      },
    }
  );

  const eventTypesData = await eventTypesResponse.json();

  if (eventTypesData.collection.length === 0) {
    console.log("⚠️  No active event types found. Create one in your Calendly dashboard first.");
    process.exit(0);
  }

  console.log("📅 Your Event Types:\n");
  console.log("─".repeat(80));

  eventTypesData.collection.forEach((et: any, index: number) => {
    console.log(`\n${index + 1}. ${et.name}`);
    console.log(`   Duration: ${et.duration} minutes`);
    console.log(`   URI: ${et.uri}`);
    console.log(`   Scheduling URL: ${et.scheduling_url}`);
  });

  console.log("\n" + "─".repeat(80));
  console.log("\n✅ Copy one of the URIs above and add it to your .env.local as:");
  console.log("   CALENDLY_EVENT_TYPE_URI=<paste URI here>\n");
}

getEventTypes().catch(console.error);
