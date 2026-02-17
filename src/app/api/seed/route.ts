import { NextResponse } from "next/server";
import { initDb, seedEntities } from "@/lib/db";

export async function POST() {
  try {
    await initDb();
    await seedEntities();
    return NextResponse.json({ success: true, message: "Database seeded" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
