import Link from "next/link"
import { ArrowRight, Building2, HeartPulse, Radar } from "lucide-react"

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-12">
      <section className="rounded-[2rem] border border-border bg-card p-10 shadow-lg shadow-slate-900/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Nalam</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Hospital Load Balancer for Patients and Hospital Admins
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Real-time patient routing, hospital status management, and intelligent recommendation powered by Supabase and FastAPI.
            </p>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-2 lg:w-auto">
            <Link href="/user" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-primary-foreground shadow-sm transition hover:brightness-110">
              Patient Portal
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/admin" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-4 text-base font-semibold text-foreground transition hover:bg-muted">
              Admin Portal
              <Building2 className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Patient journey</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Patients enter symptoms, request hospital recommendation, and get prioritized care instructions with the best hospital match.
          </p>
        </article>
        <article className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Hospital operations</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Hospital admins update bed capacity, ICU availability, load metrics, and watch changes propagate live across the system.
          </p>
        </article>
        <article className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Connected system</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The recommendation engine runs on FastAPI, while Supabase Realtime keeps the hospital dashboard in sync instantly.
          </p>
        </article>
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-border bg-card p-10">
        <div className="flex items-center gap-4 text-foreground">
          <Radar className="h-6 w-6 text-primary" />
          <div>
            <p className="text-sm font-semibold">Ready to deploy</p>
            <p className="text-sm text-muted-foreground">Run both frontend and backend to see the full Nalam experience.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
