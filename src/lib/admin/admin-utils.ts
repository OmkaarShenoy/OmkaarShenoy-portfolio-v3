export interface Visit {
  timestamp: string;
  ip: string;
  location: string;
  company: string;
  device: string;
  platform: string;
  timezone: string;
  url: string;
  referrer: string;
  screen: string;
  language: string;
  isBot: boolean;
  visitorId?: string;
  visitCount: number;
  campaign?: any;
}

export interface Session {
  id: string;
  visitorId: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  pages: Visit[];
  referrer: string;
  entryPage: string;
  exitPage: string;
}

export interface VisitorProfile {
  id: string;
  ip: string;
  location: string;
  company: string;
  device: string;
  isBot: boolean;
  firstSeen: string;
  lastSeen: string;
  totalPageViews: number;
  sessions: Session[];
  scores: {
    engagement: number;
    recruiterLikelihood: number;
    suspiciousness: number;
  };
  engagementLevel: "Low" | "Medium" | "High";
  notes?: string;
}

export interface Insight {
  id: string;
  type: "positive" | "warning" | "neutral" | "negative";
  message: string;
}

/**
 * Groups raw visits into sessions and visitor profiles.
 */
export function processVisitorData(visits: Visit[], notesMap: Record<string, string> = {}): VisitorProfile[] {
  const visitorsMap = new Map<string, VisitorProfile>();

  // Helper to get a stable ID for a visitor
  const getVisitorId = (v: Visit) => {
    return v.visitorId || v.ip || "unknown";
  };

  // Group visits by visitor
  const rawGrouped = new Map<string, Visit[]>();
  visits.forEach(v => {
    const vId = getVisitorId(v);
    if (!rawGrouped.has(vId)) {
      rawGrouped.set(vId, []);
    }
    rawGrouped.get(vId)!.push(v);
  });

  // Process each visitor
  rawGrouped.forEach((visitorVisits, vId) => {
    // Sort visits oldest to newest for session building
    visitorVisits.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const sessions: Session[] = [];
    let currentSession: Session | null = null;
    const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

    visitorVisits.forEach((v) => {
      const vTime = new Date(v.timestamp).getTime();

      if (!currentSession) {
        currentSession = createNewSession(v, vId);
      } else {
        const lastTime = new Date(currentSession.pages[currentSession.pages.length - 1].timestamp).getTime();
        if (vTime - lastTime > SESSION_TIMEOUT_MS) {
          // Close old session
          closeSession(currentSession);
          sessions.push(currentSession);
          // Start new session
          currentSession = createNewSession(v, vId);
        } else {
          // Add to current session
          currentSession.pages.push(v);
          currentSession.endTime = v.timestamp;
          currentSession.exitPage = v.url;
        }
      }
    });

    if (currentSession) {
      closeSession(currentSession);
      sessions.push(currentSession);
    }

    // Sort sessions newest to oldest
    sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    // Build profile based on newest visit for meta
    const newestVisit = visitorVisits[visitorVisits.length - 1];
    
    // Anonymize ID for UI if it's an IP and no visitorId
    let displayId = vId;
    if (vId === newestVisit.ip && !newestVisit.visitorId) {
       // Just a simple hash-like slice of IP
       displayId = `anon-${vId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`;
    }

    const profile: VisitorProfile = {
      id: vId, // Original ID for tracking
      ip: newestVisit.ip,
      location: newestVisit.location,
      company: newestVisit.company || "Unknown",
      device: newestVisit.device || "Unknown",
      isBot: newestVisit.isBot,
      firstSeen: visitorVisits[0].timestamp,
      lastSeen: newestVisit.timestamp,
      totalPageViews: visitorVisits.length,
      sessions,
      scores: {
        engagement: 0,
        recruiterLikelihood: 0,
        suspiciousness: 0,
      },
      engagementLevel: "Low",
      notes: notesMap[vId] || "",
    };

    // Calculate Scores
    profile.scores = calculateScores(profile);
    
    if (profile.scores.engagement > 70) profile.engagementLevel = "High";
    else if (profile.scores.engagement > 30) profile.engagementLevel = "Medium";
    else profile.engagementLevel = "Low";

    visitorsMap.set(vId, profile);
  });

  return Array.from(visitorsMap.values());
}

function createNewSession(v: Visit, visitorId: string): Session {
  return {
    id: `sess_${visitorId}_${new Date(v.timestamp).getTime()}`,
    visitorId,
    startTime: v.timestamp,
    endTime: v.timestamp,
    durationSeconds: 0,
    pages: [v],
    referrer: v.referrer,
    entryPage: v.url,
    exitPage: v.url,
  };
}

function closeSession(session: Session) {
  const start = new Date(session.startTime).getTime();
  const end = new Date(session.endTime).getTime();
  session.durationSeconds = Math.max(0, Math.floor((end - start) / 1000));
}

function calculateScores(profile: VisitorProfile) {
  let engagement = 0;
  let recruiterLikelihood = 0;
  let suspiciousness = 0;

  if (profile.isBot) return { engagement: 0, recruiterLikelihood: 0, suspiciousness: 100 };

  // Engagement Signals
  if (profile.totalPageViews > 1) engagement += 10;
  if (profile.totalPageViews > 4) engagement += 20;
  if (profile.sessions.length > 1) engagement += 30; // Returning visitor

  const totalDuration = profile.sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  if (totalDuration > 60) engagement += 10;
  if (totalDuration > 300) engagement += 20;

  // Recruiter Signals
  profile.sessions.forEach(s => {
    // LinkedIn referrer
    if (s.referrer && s.referrer.toLowerCase().includes("linkedin")) {
      recruiterLikelihood += 40;
    }
    // Viewed resume
    s.pages.forEach(p => {
      if (p.url.toLowerCase().includes("resume")) {
        recruiterLikelihood += 30;
        engagement += 10;
      }
    });
  });

  // Corporate / Business ISP check
  const isCorporate = profile.company && 
    profile.company !== "Unknown" && 
    !profile.company.toLowerCase().includes("comcast") &&
    !profile.company.toLowerCase().includes("spectrum") &&
    !profile.company.toLowerCase().includes("verizon") &&
    !profile.company.toLowerCase().includes("att") &&
    !profile.company.toLowerCase().includes("centurylink") &&
    !profile.company.toLowerCase().includes("cox");
    
  if (isCorporate) {
    recruiterLikelihood += 20;
  }

  // Suspiciousness Signals
  profile.sessions.forEach(s => {
    s.pages.forEach(p => {
      const url = p.url.toLowerCase();
      if (url.includes("/admin") || url.includes("/wp-login") || url.includes(".env")) {
        suspiciousness += 50;
      }
    });
    
    // Spamming requests (many pages, 0 duration)
    if (s.pages.length > 10 && s.durationSeconds < 5) {
      suspiciousness += 40;
    }
  });

  return {
    engagement: Math.min(100, engagement),
    recruiterLikelihood: Math.min(100, recruiterLikelihood),
    suspiciousness: Math.min(100, suspiciousness),
  };
}

export function generateInsights(profiles: VisitorProfile[]): Insight[] {
  const insights: Insight[] = [];
  let idCounter = 1;
  const now = new Date().getTime();

  // Find high-intent recruiter profiles recently
  const recruiters = profiles.filter(p => !p.isBot && p.scores.recruiterLikelihood > 50 && (now - new Date(p.lastSeen).getTime()) < 24 * 60 * 60 * 1000);
  if (recruiters.length > 0) {
    insights.push({
      id: `ins_${idCounter++}`,
      type: "positive",
      message: `Possible recruiter activity \u2014 ${recruiters.length} visitor${recruiters.length > 1 ? 's' : ''} with high intent today.`
    });
  }

  // Find returning visitors
  const returning = profiles.filter(p => !p.isBot && p.sessions.length >= 3 && (now - new Date(p.lastSeen).getTime()) < 7 * 24 * 60 * 60 * 1000);
  if (returning.length > 0) {
    insights.push({
      id: `ins_${idCounter++}`,
      type: "neutral",
      message: `${returning.length} highly engaged returning visitor${returning.length > 1 ? 's' : ''} this week.`
    });
  }

  // Suspicious activity
  const threats = profiles.filter(p => p.scores.suspiciousness > 50 && (now - new Date(p.lastSeen).getTime()) < 2 * 60 * 60 * 1000);
  if (threats.length > 0) {
    insights.push({
      id: `ins_${idCounter++}`,
      type: "negative",
      message: `Suspicious activity detected \u2014 ${threats.length} probe${threats.length > 1 ? 's' : ''} in the last 2 hours.`
    });
  }

  // High engagement
  const engaged = profiles.filter(p => !p.isBot && p.scores.engagement > 80 && (now - new Date(p.lastSeen).getTime()) < 24 * 60 * 60 * 1000);
  if (engaged.length > 0) {
    insights.push({
       id: `ins_${idCounter++}`,
       type: "positive",
       message: `${engaged.length} highly engaged session${engaged.length > 1 ? 's' : ''} today.`
    });
  }

  return insights.slice(0, 4); // return max 4
}

export interface IntelligenceEvent {
  id: string;
  timestamp: string;
  type: "positive" | "warning" | "neutral" | "negative";
  title: string;
  description: string;
  visitorId: string;
}

export function generateLiveEvents(profiles: VisitorProfile[]): IntelligenceEvent[] {
  const events: IntelligenceEvent[] = [];
  
  profiles.forEach(p => {
    if (p.isBot) {
      // Latest bot threat
      events.push({
        id: `evt_bot_${p.id}_${p.lastSeen}`,
        timestamp: p.lastSeen,
        type: "negative",
        title: `Bot Threat Detected`,
        description: `Probing from ${p.location}`,
        visitorId: p.id
      });
      return;
    }

    const latestSession = p.sessions[0];
    if (!latestSession) return;

    // High intent / Recruiter
    if (p.scores.recruiterLikelihood > 50) {
      events.push({
        id: `evt_rec_${p.id}_${p.lastSeen}`,
        timestamp: p.lastSeen,
        type: "positive",
        title: `High Intent Visitor`,
        description: `${p.company !== "Unknown" ? p.company : "Visitor"} exploring site`,
        visitorId: p.id
      });
    } else if (p.sessions.length > 1) {
      events.push({
        id: `evt_ret_${p.id}_${latestSession.startTime}`,
        timestamp: latestSession.startTime,
        type: "neutral",
        title: `Returning Visitor`,
        description: `Session #${p.sessions.length} from ${p.location}`,
        visitorId: p.id
      });
    } else if (latestSession.referrer.includes("linkedin")) {
      events.push({
        id: `evt_lin_${p.id}_${latestSession.startTime}`,
        timestamp: latestSession.startTime,
        type: "positive",
        title: `LinkedIn Referral`,
        description: `Landed on ${latestSession.entryPage}`,
        visitorId: p.id
      });
    } else if (latestSession.pages.length >= 3) {
      events.push({
        id: `evt_eng_${p.id}_${latestSession.endTime}`,
        timestamp: latestSession.endTime,
        type: "positive",
        title: `Engaged Session`,
        description: `${latestSession.pages.length} pages in ${latestSession.durationSeconds}s`,
        visitorId: p.id
      });
    } else {
       // Just a standard visit
       events.push({
         id: `evt_std_${p.id}_${latestSession.startTime}`,
         timestamp: latestSession.startTime,
         type: "neutral",
         title: `New Visitor`,
         description: `From ${p.location}`,
         visitorId: p.id
       });
    }
  });

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 30);
}
