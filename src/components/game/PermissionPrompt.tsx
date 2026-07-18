"use client";

interface PermissionPromptProps {
  onGrantCamera: () => void;
  onUseMouse: () => void;
}

export default function PermissionPrompt({
  onGrantCamera,
  onUseMouse,
}: PermissionPromptProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#08080e]/90 backdrop-blur-md select-none">
      <div className="relative w-full max-w-lg mx-6">
        
        {/* Glow behind panel */}
        <div className="absolute -inset-10 bg-gradient-to-r from-[#6c5ce7]/20 via-[#00f5d4]/10 to-[#8833ff]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative px-8 py-10 rounded-3xl border border-[#ffffff10] bg-[#08080e]/60 backdrop-blur-xl"
             style={{ boxShadow: "0 16px 64px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
             
          {/* Accent border corners */}
          <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00f5d4]/30 rounded-tl-3xl" />
          <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#6c5ce7]/30 rounded-br-3xl" />

          <div className="text-center mb-10">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full border-2 border-[#6c5ce7]/30 bg-[#6c5ce7]/5 shadow-[0_0_30px_rgba(108,92,231,0.2)]">
              {/* Inner animated ring */}
              <div className="absolute inset-2 border border-[#6c5ce7]/40 rounded-full animate-[spin_10s_linear_infinite]" />
              <svg
                className="w-10 h-10 text-[#00f5d4] drop-shadow-[0_0_10px_rgba(0,245,212,0.8)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.16a15.53 15.53 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                />
              </svg>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold tracking-wider text-[#e8e8f0] mb-4"
              style={{ fontFamily: "var(--font-display)", textShadow: "0 0 20px rgba(255,255,255,0.2)" }}
            >
              CAMERA REQUIRED
            </h1>

            <p className="text-sm sm:text-base font-mono text-[#6c6c80] leading-relaxed max-w-sm mx-auto">
              HANDSHOOTER uses your camera to track your hand in real time.
              <span className="block mt-2 text-[#00f5d4]/80">Everything is processed locally.</span>
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={onGrantCamera}
              className="group relative w-full py-4 rounded-sm font-display text-sm font-bold tracking-[0.25em] uppercase text-[#08080e] transition-transform duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#00f5d4] to-[#6c5ce7] rounded-sm transition-opacity duration-300 opacity-90 group-hover:opacity-100" />
              <span className="absolute inset-0 rounded-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#00f5d4] to-[#8833ff] blur-lg" />
              <span className="absolute inset-0 rounded-sm ring-1 ring-[#00f5d4] transition-all duration-300" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                GRANT CAMERA ACCESS
              </span>
            </button>

            <button
              onClick={onUseMouse}
              className="group relative w-full py-4 rounded-sm font-mono text-xs font-bold tracking-[0.2em] uppercase text-[#6c6c80] transition-all duration-300 cursor-pointer hover:text-[#e8e8f0]"
            >
              <span className="absolute inset-0 rounded-sm ring-1 ring-[#ffffff10] group-hover:ring-[#ffffff30] bg-[#ffffff05] group-hover:bg-[#ffffff0a] transition-all duration-300" />
              <span className="relative z-10">Use Mouse Instead</span>
            </button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[10px] font-mono text-[#48485a] tracking-wider uppercase">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00f5d4]/5 border border-[#00f5d4]/10 text-[#00f5d4]/80">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f5d4]" />
              Local
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6c5ce7]/5 border border-[#6c5ce7]/10 text-[#6c5ce7]/80">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6c5ce7]" />
              No Upload
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffaa00]/5 border border-[#ffaa00]/10 text-[#ffaa00]/80">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffaa00]" />
              HTTPS Required
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
