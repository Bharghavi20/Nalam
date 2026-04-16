export function LiveIndicator({ online }: { online: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200"
      style={{ borderColor: online ? "rgba(16,185,129,0.18)" : "rgba(148,163,184,0.32)" }}>
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${online ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
      <span className={online ? "text-emerald-600" : "text-slate-500"}>{online ? "LIVE" : "OFFLINE"}</span>
    </div>
  )
}
