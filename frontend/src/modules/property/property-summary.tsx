"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/services/api";
import type { PagedResult } from "@/types/api";
import type { PropertyRecord } from "@/types/entities";

export function PropertySummary() {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);

  useEffect(() => {
    void apiGet<PagedResult<PropertyRecord>>("/properties?page=1&size=5").then((result) => setProperties(result.items));
  }, []);

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-6">
      <h3 className="text-xl font-semibold text-ink">Portfolio Snapshot</h3>
      <div className="mt-6 space-y-4">
        <div className="rounded-2xl bg-cloud p-4">
          <p className="text-sm text-steel">Active Properties</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{properties.length}</p>
        </div>
        {properties.slice(0, 3).map((property) => (
          <div key={property.id} className="rounded-2xl bg-cloud p-4">
            <p className="text-sm font-medium text-ink">{property.propertyName}</p>
            <p className="mt-1 text-sm text-steel">
              {property.propertyCode} · {property.propertyType} · {property.city}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

