"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKey } from "@phosphor-icons/react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-4">
      <div className="p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md w-full max-w-sm shadow-2xl relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-white/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/10 rounded-full">
              <LockKey size={24} weight="duotone" className="text-white/80" />
            </div>
            <h1 className="text-2xl font-bold font-instrument italic">Admin Access</h1>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all font-outfit"
              />
            </div>
            {error && <p className="text-red-400 text-sm font-outfit">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-semibold rounded-xl px-4 py-3 hover:bg-white/90 active:scale-[0.98] transition-all font-outfit flex justify-center items-center"
            >
              {isLoading ? "Verifying..." : "View Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
