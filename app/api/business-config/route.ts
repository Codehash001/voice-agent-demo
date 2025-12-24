import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { BusinessesData } from "@/lib/business-config";

const dataFilePath = path.join(process.cwd(), "data", "businesses.json");

async function readBusinesses(): Promise<BusinessesData> {
  try {
    const data = await fs.readFile(dataFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return { businesses: [] };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("id");

  try {
    const data = await readBusinesses();
    
    if (businessId) {
      const business = data.businesses.find((b) => b.id === businessId);
      if (!business) {
        return NextResponse.json(
          { error: "Business not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(business);
    }
    
    // Return first business as default if no ID specified
    if (data.businesses.length > 0) {
      return NextResponse.json(data.businesses[0]);
    }
    
    return NextResponse.json(
      { error: "No businesses configured" },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read business config" },
      { status: 500 }
    );
  }
}
