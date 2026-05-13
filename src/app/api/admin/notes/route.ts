import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, note } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing visitor ID" }, { status: 400 });
    }

    if (!note) {
      // If note is empty, we delete the field from the hash
      await redis.hdel("visitor_notes", id);
    } else {
      await redis.hset("visitor_notes", { [id]: note });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save visitor note:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
