import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

function getRedisClient() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const redis = getRedisClient();
    const resend = getResendClient();

    if (!redis) {
      return NextResponse.json({ error: "Missing Upstash Redis config" }, { status: 500 });
    }

    if (!resend) {
      return NextResponse.json({ error: "Missing Resend API key" }, { status: 500 });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateKey = `visits:${yesterday.toISOString().split("T")[0]}`;

    const logs = await redis.lrange(dateKey, 0, -1);

    if (!logs || logs.length === 0) {
      return NextResponse.json({ message: "No visits recorded for yesterday." });
    }

    const visits = logs.map((log: any) => (typeof log === "string" ? JSON.parse(log) : log));

    const totalVisits = visits.length;
    const botVisits = visits.filter((v: any) => v.isBot).length;
    const humanVisits = totalVisits - botVisits;

    // Calculate Popularity
    const urlCounts: Record<string, number> = {};
    visits.forEach((v: any) => {
      const path = v.url || "/";
      urlCounts[path] = (urlCounts[path] || 0) + 1;
    });

    const sortedUrls = Object.entries(urlCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Top 5

    const popularityHtml = sortedUrls
      .map(
        ([url, count]) => `
      <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #ddd; font-size: 13px;">
        <span style="font-family: monospace;">${url}</span>
        <span style="font-weight: bold;">${count} visits</span>
      </div>
    `
      )
      .join("");

    const tableRows = visits
      .map(
        (v: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 13px;">${new Date(v.timestamp).toLocaleTimeString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 13px;">
          <strong>${v.location}</strong><br/>
          ${v.company && v.company !== "Unknown" ? `<span style="color: #0056b3; font-weight: bold; font-size: 11px;">🏢 ${v.company}</span><br/>` : ""}
          <span style="color: #666; font-size: 11px;">IP: ${v.ip}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 13px;">
          ${v.isBot ? "🤖 Bot" : (v.visitCount > 1 ? `🔄 Return (#${v.visitCount})` : "🆕 New")} - ${v.device}<br/>
          <span style="color: #666; font-size: 11px;">${v.screen} | ${v.timezone}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 13px;">
          ${v.url}<br/>
          <span style="color: #666; font-size: 11px;">via ${v.referrer}</span>
          ${v.campaign && (v.campaign.source || v.campaign.ref || v.campaign.medium) ? `<br/><span style="color: #d946ef; font-size: 11px; font-weight: bold;">🔗 ${v.campaign.source || v.campaign.ref || v.campaign.medium}</span>` : ""}
        </td>
      </tr>
    `
      )
      .join("");

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 900px; margin: 0 auto; color: #333; line-height: 1.5;">
        <h1 style="color: #000; font-size: 24px; margin-bottom: 5px;">Daily Visitor Summary</h1>
        <p style="color: #666; margin-top: 0;">${yesterday.toDateString()} • <strong>${totalVisits} total visits</strong> (${humanVisits} human, ${botVisits} bots)</p>
        
        <div style="background: #fdfdfd; border: 1px solid #eee; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h2 style="font-size: 16px; margin-top: 0; border-bottom: 1px solid #000; padding-bottom: 5px;">Top Visited Pages</h2>
          ${popularityHtml}
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed;">
          <thead>
            <tr style="background: #f9f9f9; text-align: left; color: #000; font-weight: bold;">
              <th style="padding: 12px 10px; border-bottom: 2px solid #000; width: 15%;">Time</th>
              <th style="padding: 12px 10px; border-bottom: 2px solid #000; width: 30%;">Location</th>
              <th style="padding: 12px 10px; border-bottom: 2px solid #000; width: 30%;">Device & Session</th>
              <th style="padding: 12px 10px; border-bottom: 2px solid #000; width: 25%;">Path & Source</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <p style="margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px;">
          Sent from your Portfolio Analytics Engine. All times are based on the visitor's local timezone.
        </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "Portfolio Tracking <onboarding@resend.dev>",
      to: ["omkaarshenoyos@gmail.com"],
      subject: `📊 Daily Report: ${totalVisits} visits (${humanVisits} human) on ${yesterday.toLocaleDateString()}`,
      html: htmlContent,
    });

    if (error) return NextResponse.json({ error }, { status: 500 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
