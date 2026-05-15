"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/services/api";
import type { DashboardSummary, LeaseRecord } from "@/types/entities";
import type { PagedResult } from "@/types/api";
import { PropertySummary } from "@/modules/property/property-summary";

type KpiCard = {
  label: string;
  value: string;
  delta: string;
  tone: "accent" | "success" | "warn";
};

const toneClass: Record<KpiCard["tone"], string> = {
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  warn: "bg-warn/10 text-warn"
};

export function ExecutiveDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [leases, setLeases] = useState<LeaseRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [summaryData, leaseData] = await Promise.all([
          apiGet<DashboardSummary>("/dashboard/executive"),
          apiGet<PagedResult<LeaseRecord>>("/leases?page=1&size=5")
        ]);
        setSummary(summaryData);
        setLeases(leaseData.items);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  if (loading) {
    return <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-sm text-steel">Loading dashboard...</div>;
  }

  if (error || !summary) {
    return <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error ?? "Dashboard unavailable"}</div>;
  }

  const kpis: KpiCard[] = [
    { label: "Occupancy", value: summary.occupancyPercentage, delta: "Portfolio", tone: "success" },
    { label: "Revenue", value: summary.revenueSummary, delta: "Monthly", tone: "accent" },
    { label: "Expiring Leases", value: String(summary.expiringLeases), delta: "Needs action", tone: "warn" },
    { label: "Pending Approvals", value: String(summary.pendingApprovals), delta: "Workflow queue", tone: "accent" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card) => (
          <article key={card.label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-steel">{card.label}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${toneClass[card.tone]}`}>{card.delta}</span>
            </div>
            <p className="mt-6 text-3xl font-semibold text-ink">{card.value}</p>
          </article>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[24px] border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-ink">Recent Lease Activity</h3>
              <p className="mt-1 text-sm text-steel">Current lease queue across active records and recent child transactions.</p>
            </div>
            <span className="rounded-full bg-cloud px-3 py-1 text-xs font-medium text-steel">{leases.length} records</span>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-steel">
                <tr>
                  <th className="pb-3">Lease</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Workflow</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {leases.map((lease) => (
                  <tr key={lease.id} className="border-t border-slate-100">
                    <td className="py-3 font-medium text-ink">
                      <Link href={`/leases/${lease.id}`} className="hover:text-accent">
                        {lease.leaseNumber}
                      </Link>
                    </td>
                    <td className="py-3 text-steel">{lease.customerName}</td>
                    <td className="py-3 text-steel">{lease.latestTransactionType}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-cloud px-3 py-1 text-xs font-medium text-ink">{lease.leaseStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <PropertySummary />
      </div>
    </div>
  );
}
