import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { getPostHogClient } from "@/lib/posthog-server";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, message } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Deduplication Logic
    const redisKey = `wave:${email}`;
    const lastMessage = await redis.get(redisKey);

    // If they sent the same message (or no message) within 24 hours, don't email again
    if (lastMessage === (message || "NO_MESSAGE")) {
      return NextResponse.json({ success: true, duplicated: true });
    }

    // Send Real-time Email
    const { data, error } = await resend.emails.send({
      from: "Portfolio Wave <onboarding@resend.dev>",
      to: ["omkaarshenoyos@gmail.com"],
      subject: `👋 New Wave from ${email}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Someone waved at you!</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong> ${message || "No message provided"}</p>
          <hr/>
          <p style="font-size: 12px; color: #999;">Sent in real-time from your portfolio.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: email,
        event: "wave_error",
        properties: { error_source: "resend" },
      });
      await posthog.shutdown();
      return NextResponse.json({ error }, { status: 500 });
    }

    // Store in Redis with 24h TTL to prevent spam
    await redis.set(redisKey, message || "NO_MESSAGE", { ex: 60 * 60 * 24 });

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: email,
      event: "wave_sent",
      properties: { has_message: !!(message && message !== "NO_MESSAGE") },
    });
    await posthog.shutdown();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wave error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
