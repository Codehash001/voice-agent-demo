import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { BusinessesData, Business, generateBusinessId } from "@/lib/business-config";

const dataFilePath = path.join(process.cwd(), "data", "businesses.json");

async function readBusinesses(): Promise<BusinessesData> {
  try {
    const data = await fs.readFile(dataFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return { businesses: [] };
  }
}

async function writeBusinesses(data: BusinessesData): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = await readBusinesses();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read businesses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const business: Omit<Business, "id"> = await request.json();
    const data = await readBusinesses();
    
    const newBusiness: Business = {
      ...business,
      id: generateBusinessId(business.name),
    };
    
    data.businesses.push(newBusiness);
    await writeBusinesses(data);
    
    return NextResponse.json(newBusiness);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create business" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const business: Business = await request.json();
    const data = await readBusinesses();
    
    const index = data.businesses.findIndex((b) => b.id === business.id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }
    
    data.businesses[index] = business;
    await writeBusinesses(data);
    
    return NextResponse.json(business);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update business" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Business ID required" },
        { status: 400 }
      );
    }
    
    const data = await readBusinesses();
    data.businesses = data.businesses.filter((b) => b.id !== id);
    await writeBusinesses(data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete business" },
      { status: 500 }
    );
  }
}
