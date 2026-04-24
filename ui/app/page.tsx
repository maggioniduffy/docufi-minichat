import Chat from "@/components/Chat";

export default function Home() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header
        className="flex items-center px-6 h-14 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">
            Docufi
            <span className="text-white/35 font-normal"> · Minichat</span>
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <Chat />
      </div>
    </div>
  );
}
