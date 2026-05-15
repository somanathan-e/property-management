"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/layouts/app-shell";
import { apiGet } from "@/services/api";
import type { PagedResult } from "@/types/api";
import type { CustomerRecord, LeaseRecord, PropertyRecord, TenantRecord } from "@/types/entities";

type OverviewData = {
  properties: PropertyRecord[];
  customers: CustomerRecord[];
  leases: LeaseRecord[];
  tenants: TenantRecord[];
};

export function OverviewPage({
  title,
  subtitle,
  pathname
}: Readonly<{
  title: string;
  subtitle: string;
  pathname: string;
}>) {
  const [data, setData] = useState<OverviewData | null>(null);

  useEffect(() => {
    void Promise.all([
      apiGet<PagedResult<PropertyRecord>>("/properties?size=20"),
      apiGet<PagedResult<CustomerRecord>>("/customers?size=20"),
      apiGet<PagedResult<LeaseRecord>>("/leases?size=20"),
      apiGet<PagedResult<TenantRecord>>("/tenants?size=20")
    ]).then(([properties, customers, leases, tenants]) =>
      setData({
        properties: properties.items,
        customers: customers.items,
        leases: leases.items,
        tenants: tenants.items
      })
    );
  }, []);

  const highlights = [
    { label: "Properties", value: String(data?.properties.length ?? 0) },
    { label: "Customers", value: String(data?.customers.length ?? 0) },
    { label: "Leases", value: String(data?.leases.length ?? 0) },
    { label: "Tenants", value: String(data?.tenants.length ?? 0) }
  ];

  const workflowFocus = pathname.startsWith("/crm")
    ? data?.customers.map((customer) => `${customer.customerName} · ${customer.category} · ${customer.status}`) ?? []
    : pathname.startsWith("/administration")
      ? data?.tenants.map((tenant) => `${tenant.tenantName} · ${tenant.status}`) ?? []
      : pathname.startsWith("/property")
        ? data?.properties.map((property) => `${property.propertyName} · ${property.propertyType} · ${property.city}`) ?? []
        : data?.leases.map((lease) => `${lease.leaseNumber} · ${lease.customerName} · ${lease.leaseStatus}`) ?? [];

  return (
    <AppShell title={title} subtitle={subtitle}>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[24px] border border-slate-200 bg-white p-6">
          <h3 className="text-xl font-semibold text-ink">Operational Overview</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {highlights.map((highlight) => (
              <article key={highlight.label} className="rounded-2xl bg-cloud p-4">
                <p className="text-sm text-steel">{highlight.label}</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{highlight.value}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-[24px] border border-slate-200 bg-white p-6">
          <h3 className="text-xl font-semibold text-ink">Current Focus</h3>
          <ul className="mt-6 space-y-3">
            {workflowFocus.slice(0, 6).map((line) => (
              <li key={line} className="rounded-2xl bg-cloud p-4 text-sm text-ink">
                {line}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
