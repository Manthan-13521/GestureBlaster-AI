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
    <div className="fixed inset-0 flex items-center justify-center bg-[#08080e] select-none">
      <div className="relative w-full max-w-lg mx-6">
        <div className="absolute -inset-8 bg-gradient-to-r from-[#6c5ce7]/10 via-[#00f5d4]/5 to-[#8833ff]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full border border-[#6c5ce7]/30">
              <svg
                className="w-8 h-8 text-[#6c5ce7]"
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
              className="text-2xl sm:text-3xl font-bold text-[#e8e8f0] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Camera Required
            </h1>

            <p className="text-sm sm:text-base font-mono text-[#6c6c80] leading-relaxed max-w-sm mx-auto">
              HANDSHOOTER uses your camera to track your hand in real time.
              Everything is processed locally — nothing is uploaded or stored.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onGrantCamera}
              className="group relative w-full py-4 rounded-sm font-display text-sm font-bold tracking-[0.25em] uppercase text-[#08080e] transition-all duration-300 cursor-pointer"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#00f5d4] to-[#6c5ce7] rounded-sm transition-opacity duration-300 group-hover:opacity-90" />
              <span className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#00f5d4] to-[#8833ff] blur-xl" />
              <span className="absolute inset-0 rounded-sm ring-1 ring-[#00f5d4]/50 group-hover:ring-[#6c5ce7]/70" />
              <span className="relative z-10">Grant Camera</span>
            </button>

            <button
              onClick={onUseMouse}
              className="group relative w-full py-4 rounded-sm font-mono text-xs tracking-[0.2em] uppercase text-[#6c6c80] transition-all duration-300 cursor-pointer hover:text-[#e8e8f0]"
            >
              <span className="absolute inset-0 rounded-sm ring-1 ring-[#6c6c80]/20 group-hover:ring-[#6c6c80]/40 transition-all duration-300" />
              <span className="relative z-10">Use Mouse Instead</span>
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 text-[10px] font-mono text-[#48485a] tracking-wider uppercase">
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#00f5d4]" />
              Local
            </span>
            <span className="w-px h-3 bg-[#48485a]" />
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#6c5ce7]" />
              No Upload
            </span>
            <span className="w-px h-3 bg-[#48485a]" />
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#8833ff]" />
              HTTPS Required
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
