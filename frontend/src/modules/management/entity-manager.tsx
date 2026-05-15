"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/layouts/app-shell";
import { apiDelete, apiGet, apiPost, apiPut } from "@/services/api";
import type { PagedResult } from "@/types/api";
import type { EntityConfig, FieldConfig, Option } from "@/modules/management/config";

type ReferenceState = Record<string, Option[]>;

function buildInitialValues(fields: FieldConfig[]) {
  return fields.reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.name] = field.options?.[0]?.value ?? "";
    return accumulator;
  }, {});
}

export function EntityManager({ config }: Readonly<{ config: EntityConfig }>) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>(() => buildInitialValues(config.fields));
  const [references, setReferences] = useState<ReferenceState>({});

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("q", search.trim());
    }
    params.set("page", String(page));
    params.set("size", "8");
    if (config.query) {
      for (const [key, value] of new URLSearchParams(config.query).entries()) {
        params.set(key, value);
      }
    }
    return params.toString();
  }, [config.query, page, search]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await apiGet<PagedResult<Record<string, unknown>>>(`${config.endpoint}?${queryString}`);
        setItems(result.items);
        setTotal(result.total);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [config.endpoint, queryString]);

  useEffect(() => {
    async function loadReferences() {
      const entries = await Promise.all(
        config.fields
          .filter((field) => field.referenceEndpoint)
          .map(async (field) => {
            const result = await apiGet<PagedResult<Record<string, unknown>>>(field.referenceEndpoint as string);
            return [
              field.name,
              result.items.map((item) => ({
                label: String(item[field.referenceLabel as string]),
                value: String(item[field.referenceValue as string])
              }))
            ] as const;
          })
      );
      setReferences(Object.fromEntries(entries));
    }

    void loadReferences();
  }, [config.fields]);

  function openCreate() {
    setEditingId(null);
    setFormValues(buildInitialValues(config.fields));
    setIsOpen(true);
    setMessage(null);
  }

  function openEdit(item: Record<string, unknown>) {
    setEditingId(Number(item.id));
    setFormValues(
      config.fields.reduce<Record<string, string>>((accumulator, field) => {
        accumulator[field.name] = item[field.name] == null ? "" : String(item[field.name]);
        return accumulator;
      }, {})
    );
    setIsOpen(true);
    setMessage(null);
  }

  async function refreshCurrentPage() {
    const result = await apiGet<PagedResult<Record<string, unknown>>>(`${config.endpoint}?${queryString}`);
    setItems(result.items);
    setTotal(result.total);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const payload = Object.fromEntries(
        config.fields.map((field) => {
          const value = formValues[field.name] ?? "";
          if ((field.type === "number" || field.name.toLowerCase().endsWith("id")) && value !== "") {
            return [field.name, Number(value)];
          }
          return [field.name, value];
        })
      );
      if (editingId) {
        await apiPut(`${config.endpoint}/${editingId}`, payload);
        setMessage(`${config.title.slice(0, -1)} updated successfully.`);
      } else {
        await apiPost(config.endpoint, payload);
        setMessage(`${config.title.slice(0, -1)} created successfully.`);
      }
      setIsOpen(false);
      await refreshCurrentPage();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to save record");
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    try {
      await apiDelete(`${config.endpoint}/${id}`);
      setMessage(`${config.title.slice(0, -1)} deleted successfully.`);
      await refreshCurrentPage();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to delete record");
    }
  }

  return (
    <AppShell title={config.title} subtitle={config.subtitle}>
      <div className="space-y-6">
        <section className="rounded-[24px] border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full gap-3 md:max-w-xl">
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={`Search ${config.title.toLowerCase()}...`}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => void refreshCurrentPage()}
                className="rounded-2xl bg-cloud px-4 py-3 text-sm font-medium text-ink"
              >
                Refresh
              </button>
            </div>
            <button type="button" onClick={openCreate} className="rounded-2xl bg-accent px-5 py-3 text-sm font-medium text-white">
              Add Record
            </button>
          </div>
          {message ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-6">
          {loading ? (
            <div className="text-sm text-steel">Loading records...</div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl bg-cloud p-6 text-sm text-steel">No records matched the current search.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-steel">
                  <tr>
                    {config.columns.map((column) => (
                      <th key={column.key} className="pb-3">
                        {column.label}
                      </th>
                    ))}
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={String(item.id)} className="border-t border-slate-100">
                      {config.columns.map((column) => (
                        <td key={column.key} className="py-3 text-ink">
                          {String(item[column.key] ?? "")}
                        </td>
                      ))}
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => openEdit(item)} className="rounded-xl bg-cloud px-3 py-2 text-xs font-medium text-ink">
                            Edit
                          </button>
                          <button type="button" onClick={() => void handleDelete(Number(item.id))} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-5 flex items-center justify-between text-sm text-steel">
            <span>
              Page {page} · {total} total records
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="rounded-xl bg-cloud px-3 py-2 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page * 8 >= total}
                onClick={() => setPage((value) => value + 1)}
                className="rounded-xl bg-cloud px-3 py-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {isOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
            <div className="w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-ink">{editingId ? "Edit Record" : "Create Record"}</h3>
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-xl bg-cloud px-3 py-2 text-sm text-ink">
                  Close
                </button>
              </div>
              <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                {config.fields.map((field) => {
                  const options = field.options ?? references[field.name] ?? [];
                  return (
                    <label key={field.name} className="block text-sm text-ink">
                      <span className="mb-2 block font-medium">{field.label}</span>
                      {field.type === "select" ? (
                        <select
                          value={formValues[field.name] ?? ""}
                          onChange={(event) => setFormValues((current) => ({ ...current, [field.name]: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-accent"
                        >
                          <option value="">Select</option>
                          {options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={formValues[field.name] ?? ""}
                          onChange={(event) => setFormValues((current) => ({ ...current, [field.name]: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-accent"
                        />
                      )}
                    </label>
                  );
                })}
                <div className="md:col-span-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsOpen(false)} className="rounded-2xl bg-cloud px-5 py-3 text-sm font-medium text-ink">
                    Cancel
                  </button>
                  <button type="submit" className="rounded-2xl bg-accent px-5 py-3 text-sm font-medium text-white">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
