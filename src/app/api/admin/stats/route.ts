import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all visits keys
    const keys = await redis.keys("visits:*");
    
    if (!keys || keys.length === 0) {
      return NextResponse.json({ visits: [] });
    }

    let allVisits: any[] = [];
    
    const pipeline = redis.pipeline();
    for (const key of keys) {
      pipeline.lrange(key, 0, -1);
    }
    const results = await pipeline.exec();
    
    for (const logs of results) {
       if (Array.isArray(logs)) {
         for (const log of logs) {
           try {
             allVisits.push(typeof log === "string" ? JSON.parse(log) : log);
           } catch (e) {
             console.error("Parse error on log:", log);
           }
         }
       }
    }
    
    // Sort by timestamp descending (newest first)
    allVisits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Fetch visitor notes
    const visitorNotes = await redis.hgetall("visitor_notes") || {};

    return NextResponse.json({ visits: allVisits, notes: visitorNotes });
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
