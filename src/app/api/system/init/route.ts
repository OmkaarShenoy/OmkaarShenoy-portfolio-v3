import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

function parseUA(ua: string) {
  let browser = "Unknown Browser";
  let os = "Unknown OS";

  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

  if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("iPhone")) os = "iOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("Linux")) os = "Linux";

  return { browser, os };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, referrer, screen, language, timezone, platform } = body;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    let city = req.headers.get("x-vercel-ip-city");
    let region = req.headers.get("x-vercel-ip-country-region");
    let country = req.headers.get("x-vercel-ip-country");
    const userAgentRaw = req.headers.get("user-agent") || "Unknown";

    // ENHANCED FALLBACK: If Vercel headers are missing (localhost)
    if (!city || city === "Unknown") {
      try {
        // If localhost, don't pass the IP (service will use the request's public IP)
        const isLocal = ip === "127.0.0.1" || ip === "::1";
        const geoRes = await fetch(`https://freeipapi.com/api/json/${isLocal ? "" : ip}`);
        const geoData = await geoRes.json();
        
        if (geoData.cityName) {
          city = geoData.cityName;
          region = geoData.regionName;
          country = geoData.countryName;
        }
      } catch (e) {
        console.error("Geo fallback failed:", e);
      }
    }

    const { browser, os } = parseUA(userAgentRaw);

    const visitData = {
      timestamp: new Date().toISOString(),
      ip,
      location: `${city || "Unknown"}, ${region || "Unknown"}, ${country || "Unknown"}`,
      device: `${os} (${browser})`,
      platform,
      timezone,
      url: url.replace(req.nextUrl.origin, ""),
      referrer: referrer.includes(req.nextUrl.origin) ? "Internal" : referrer,
      screen,
      language,
    };

    const dateKey = `visits:${new Date().toISOString().split("T")[0]}`;
    await redis.lpush(dateKey, JSON.stringify(visitData));
    await redis.expire(dateKey, 60 * 60 * 24 * 7);

    return NextResponse.json({ success: true, debug: { city, country } });
  } catch (error) {
    console.error("Logging error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
