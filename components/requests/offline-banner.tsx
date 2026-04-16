export function OfflineBanner() {
  return (
    <div className="rounded-[1.75rem] border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-destructive">Offline Mode Active</p>
          <p className="text-muted-foreground">Using cached hospital data while your connection is restoring.</p>
        </div>
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
      </div>
    </div>
  )
}
