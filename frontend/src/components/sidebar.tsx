"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationSections } from "@/constants/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="overflow-visible rounded-[28px] border border-slate-200 bg-white shadow-card">
      <div className="bg-[linear-gradient(135deg,#102033_0%,#183354_55%,#1e5eff_130%)] px-5 py-4 text-white">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">PMS</p>
            <h1 className="mt-1 text-2xl font-semibold">Enterprise Property Management</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {navigationSections.map((section) => (
              <details key={section.title} className="relative">
                <summary
                  className={[
                    "cursor-pointer list-none rounded-2xl border px-4 py-2 text-sm font-medium transition",
                    section.items.some((item) => pathname === item.href)
                      ? "border-white/20 bg-white text-ink shadow-sm"
                      : "border-white/15 bg-white/10 text-white hover:bg-white/20"
                  ].join(" ")}
                >
                  {section.title}
                </summary>
                <div className="absolute left-0 z-20 mt-2 min-w-[220px] rounded-2xl border border-slate-200 bg-white p-2 text-ink shadow-card">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "block rounded-xl px-3 py-2 text-sm transition",
                        pathname === item.href ? "bg-accent text-white" : "hover:bg-cloud"
                      ].join(" ")}
                    >
                      <span className="block font-medium">{item.label}</span>
                      <span className={["mt-1 block text-xs", pathname === item.href ? "text-white/80" : "text-steel"].join(" ")}>
                        {item.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </nav>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur">
            <p className="text-white/60">Portfolio Workspace</p>
            <p className="mt-1 font-medium text-white">Enterprise Operations</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
