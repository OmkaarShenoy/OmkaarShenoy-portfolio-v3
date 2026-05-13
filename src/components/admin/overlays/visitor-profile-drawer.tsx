import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserCircle2, Briefcase, Bot, MapPin, Monitor, Clock, Link as LinkIcon, AlertTriangle } from "lucide-react";
import { VisitorProfile } from "@/lib/admin/admin-utils";
import { format, formatDistanceToNow } from "date-fns";

interface VisitorProfileDrawerProps {
  profile: VisitorProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveNote?: (id: string, note: string) => void;
}

export function VisitorProfileDrawer({ profile, isOpen, onClose, onSaveNote }: VisitorProfileDrawerProps) {
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setNote(profile.notes || "");
    }
  }, [profile]);

  const handleSaveNote = async () => {
    if (!profile || !onSaveNote) return;
    setIsSaving(true);
    await onSaveNote(profile.id, note);
    setIsSaving(false);
  };

  return (
    <AnimatePresence>
      {isOpen && profile && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-neutral-950 border-l border-white/10 z-50 flex flex-col shadow-2xl overflow-hidden font-outfit"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between bg-neutral-900/50">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  profile.isBot ? "bg-red-500/10 text-red-400" :
                  profile.scores.recruiterLikelihood > 50 ? "bg-blue-500/10 text-blue-400" :
                  "bg-neutral-800 text-neutral-400"
                }`}>
                  {profile.isBot ? <Bot size={24} /> : profile.scores.recruiterLikelihood > 50 ? <Briefcase size={24} /> : <UserCircle2 size={24} />}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white break-all">
                    {profile.id.startsWith("anon-") ? profile.id : "ID: " + profile.id.slice(0, 12)}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      profile.engagementLevel === "High" ? "bg-green-500/20 text-green-400" :
                      profile.engagementLevel === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-neutral-800 text-neutral-400"
                    }`}>
                      {profile.engagementLevel} Intent
                    </span>
                    {profile.isBot && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Bot</span>}
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Identity & Context */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 text-neutral-500 mb-1">
                    <MapPin size={14} />
                    <span className="text-xs uppercase tracking-wider">Location</span>
                  </div>
                  <p className="text-sm text-neutral-200">{profile.location}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 text-neutral-500 mb-1">
                    <Briefcase size={14} />
                    <span className="text-xs uppercase tracking-wider">ISP / Org</span>
                  </div>
                  <p className="text-sm text-neutral-200 truncate" title={profile.company}>{profile.company}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 text-neutral-500 mb-1">
                    <Monitor size={14} />
                    <span className="text-xs uppercase tracking-wider">Device</span>
                  </div>
                  <p className="text-sm text-neutral-200">{profile.device}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 text-neutral-500 mb-1">
                    <Clock size={14} />
                    <span className="text-xs uppercase tracking-wider">First Seen</span>
                  </div>
                  <p className="text-sm text-neutral-200">{formatDistanceToNow(new Date(profile.firstSeen), { addSuffix: true })}</p>
                </div>
              </div>

              {/* Signals */}
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-3 uppercase tracking-wider">Intelligence Signals</h3>
                <div className="space-y-2">
                  {profile.scores.recruiterLikelihood > 50 && (
                     <div className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/20 p-3 rounded-lg">
                       <Briefcase size={16} className="text-blue-400" />
                       <span className="text-sm text-blue-200">High likelihood of being a recruiter or employer</span>
                     </div>
                  )}
                  {profile.scores.suspiciousness > 40 && (
                     <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 p-3 rounded-lg">
                       <AlertTriangle size={16} className="text-red-400" />
                       <span className="text-sm text-red-200">Suspicious browsing patterns detected</span>
                     </div>
                  )}
                  {profile.sessions.some(s => s.referrer.toLowerCase().includes("linkedin")) && (
                     <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-lg">
                       <LinkIcon size={16} className="text-neutral-400" />
                       <span className="text-sm text-neutral-300">Arrived via LinkedIn</span>
                     </div>
                  )}
                  {profile.sessions.length > 1 && (
                     <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 p-3 rounded-lg">
                       <UserCircle2 size={16} className="text-green-400" />
                       <span className="text-sm text-green-200">Returning visitor ({profile.sessions.length} sessions)</span>
                     </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Manual Notes</h3>
                  <button 
                    onClick={handleSaveNote}
                    disabled={isSaving || note === profile.notes}
                    className="text-xs bg-white text-black px-3 py-1 rounded-full font-medium disabled:opacity-50 transition-opacity"
                  >
                    {isSaving ? "Saving..." : "Save Note"}
                  </button>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note about this visitor (e.g., 'Recruiter from Google')..."
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-sm text-neutral-200 focus:outline-none focus:border-white/20 resize-none h-24 placeholder:text-neutral-600"
                />
              </div>

              {/* Sessions Timeline */}
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-4 uppercase tracking-wider">Session Timeline</h3>
                <div className="space-y-6">
                  {profile.sessions.map((session, idx) => (
                    <div key={session.id} className="relative pl-4 border-l border-white/10">
                      <div className="absolute w-2 h-2 bg-neutral-700 rounded-full -left-[4.5px] top-1.5" />
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-medium text-neutral-300">
                          {format(new Date(session.startTime), "MMM d, h:mm a")}
                        </p>
                        <span className="text-xs text-neutral-500">{session.durationSeconds}s</span>
                      </div>
                      
                      {session.referrer && session.referrer !== "Internal" && session.referrer !== "Direct" && (
                         <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3 bg-white/5 inline-flex px-2 py-1 rounded">
                           <LinkIcon size={10} />
                           <span>from {session.referrer.replace('https://', '').replace('http://', '').split('/')[0]}</span>
                         </div>
                      )}

                      <div className="space-y-2 mt-2">
                        {session.pages.map((p, i) => (
                          <div key={i} className="flex items-center gap-3 group">
                            <span className="text-xs text-neutral-600 font-mono w-16 shrink-0">
                              {format(new Date(p.timestamp), "HH:mm:ss")}
                            </span>
                            <div className="flex-1 bg-neutral-900/50 border border-white/5 rounded px-3 py-1.5 text-sm text-neutral-300 truncate group-hover:bg-neutral-800 transition-colors">
                              {p.url}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
