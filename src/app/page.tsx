'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [introFinished, setIntroFinished] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Permanently lock the background image since we use the video now
  useEffect(() => {
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = '#000000';
    
    // NUCLEAR OPTION: Destroy scrollbars completely at the CSS level
    const style = document.createElement('style');
    style.id = 'nuclear-no-scroll';
    style.innerHTML = `
      html, body {
        overflow: hidden !important;
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      * {
        scrollbar-width: none !important;
      }
      *::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundColor = '';
      const el = document.getElementById('nuclear-no-scroll');
      if (el) el.remove();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/team/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/play");
      } else {
        setError(data.error || "Failed to register team");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Background Video - Plays once then stays paused on the last frame */}
      <video
        autoPlay
        muted
        playsInline
        onEnded={() => setIntroFinished(true)}
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/entry.mp4"
      />

      {/* Fallback skip button */}
      {!introFinished && (
        <button 
          onClick={() => setIntroFinished(true)}
          className="absolute bottom-10 right-10 text-white/50 hover:text-white font-mono text-sm uppercase tracking-widest transition-colors z-[10000]"
        >
          [ Skip Sequence ]
        </button>
      )}

      {/* Initialize Squad Form - Appears after intro */}
      {introFinished && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 w-full max-w-lg win-bevel paper-texture p-8 md:p-12 shadow-2xl flex flex-col mx-4"
        >
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-4xl font-black tracking-tighter text-center uppercase text-[#3E2723] drop-shadow-sm font-sans italic">Initialize Squad</h2>
            <div className="w-full max-w-xs h-0.5 bg-gradient-to-r from-transparent via-[#A1887F] to-transparent mt-4" />
            <p className="text-[10px] text-[#8D6E63] font-mono mt-2 uppercase tracking-[0.3em] font-bold">Protocol: ARCHIVE_CONNECT_v1.0.4</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6 flex flex-col w-full">
            <div className="relative flex flex-col gap-2">
              <label className="text-[10px] text-[#3A6EA5] uppercase tracking-[0.2em] font-black ml-1 italic">Squad Designation</label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-[#EFEBE9] border-2 border-[#D7CCC8] rounded px-5 py-4 text-[#3E2723] placeholder:text-[#A1887F]/30 focus:outline-none focus:border-[#3A6EA5] focus:bg-white transition-all duration-300 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05)] font-sans italic font-bold"
                placeholder="Enter Squad Name..."
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-[#FFEBEE] border-l-4 border-[#B71C1C] text-[#C62828] text-[10px] font-mono font-bold uppercase tracking-widest shadow-md"
              >
                [AUTH_NOTICE]: {error}
              </motion.div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#A67C52] text-[#F5E6D3] uppercase tracking-[0.3em] font-black rounded-xl transition-all duration-300 disabled:opacity-50 shadow-xl"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? "SYNCHRONIZING..." : "ESTABLISH LINK"}
                  {!loading && <ChevronRight size={18} />}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-10 pt-6 border-t border-[#D7CCC8] flex items-center justify-center gap-2 opacity-50">
            <Shield size={14} className="text-[#3A6EA5]" />
            <span className="text-[9px] uppercase tracking-[0.2em] font-black text-[#8D6E63]">Secure Connection Established</span>
          </div>
        </motion.div>
      )}
      
      {introFinished && (
        <div className="relative z-10 mt-8 text-[10px] text-[#A1887F] font-bold font-mono uppercase tracking-widest opacity-50">
          &gt; ARCHIVE_STATUS: READY
        </div>
      )}
    </div>
  );
}

