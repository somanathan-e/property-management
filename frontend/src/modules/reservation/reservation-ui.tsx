"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/layouts/app-shell";
import { apiGet, apiPost, apiPut } from "@/services/api";
import type { PagedResult } from "@/types/api";
import type { CustomerRecord, LeaseRecord, PropertyRecord, ReservationRecord } from "@/types/entities";

type TowerOption = {
  id: number;
  towerName: string;
  towerCode: string;
};

type UnitOption = {
  id: number;
  unitName: string;
  unitCode: string;
  towerCode: string;
  occupancyStatus?: string;
};

type ReservationFormState = Record<string, string>;
type WorkflowFormState = Record<string, string>;
type ConvertFormState = Record<string, string>;

const reservationStatusOptions = ["DRAFT", "PENDING_PAYMENT", "PENDING_APPROVAL", "CONFIRMED", "CONVERTED", "CANCELLED", "EXPIRED"];
const workflowStatusOptions = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "ESCALATED"];
const paymentStatusOptions = ["PENDING", "PARTIAL", "RECEIVED", "REFUNDED"];
const leaseTypeOptions = ["COMMERCIAL", "RESIDENTIAL", "RETAIL"];

function todayText() {
  return new Date().toISOString().slice(0, 10);
}

function buildReservationForm(record?: ReservationRecord | null): ReservationFormState {
  return {
    reservationNumber: record?.reservationNumber ?? `RSV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
    propertyId: record ? String(record.propertyId) : "",
    towerId: record ? String(record.towerId) : "",
    unitId: record ? String(record.unitId) : "",
    customerId: record ? String(record.customerId) : "",
    reservationStatus: record?.reservationStatus ?? "DRAFT",
    workflowStatus: record?.workflowStatus ?? "DRAFT",
    paymentStatus: record?.paymentStatus ?? "PENDING",
    reservationDate: record?.reservationDate ?? todayText(),
    expiryDate: record?.expiryDate ?? "",
    quotedRent: record ? String(record.quotedRent) : "",
    currency: record?.currency ?? "AED",
    depositAmount: record ? String(record.depositAmount) : "",
    createdBy: record?.createdBy ?? "leasing.user",
    notes: record?.notes ?? ""
  };
}

function buildWorkflowForm(record: ReservationRecord): WorkflowFormState {
  return {
    reservationStatus: record.reservationStatus,
    workflowStatus: record.workflowStatus,
    paymentStatus: record.paymentStatus,
    updatedBy: "leasing.manager",
    notes: record.notes ?? ""
  };
}

function buildConvertForm(record: ReservationRecord): ConvertFormState {
  return {
    leaseNumber: `LS-${new Date().getFullYear()}-${String(record.id).padStart(3, "0")}-${String(Date.now()).slice(-3)}`,
    leaseType: "COMMERCIAL",
    startDate: record.expiryDate,
    endDate: "",
    createdBy: "leasing.user",
    notes: `Converted from reservation ${record.reservationNumber}`
  };
}

function badgeTone(value: string) {
  const normalized = value.toUpperCase();
  if (["CONFIRMED", "CONVERTED", "APPROVED", "RECEIVED"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  }
  if (["PENDING_PAYMENT", "PENDING_APPROVAL", "SUBMITTED", "UNDER_REVIEW", "PARTIAL", "ESCALATED"].includes(normalized)) {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  }
  if (["CANCELLED", "EXPIRED", "REJECTED", "REFUNDED"].includes(normalized)) {
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-100";
  }
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function formatMoney(value: number, currency: string) {
  return `${currency} ${value.toLocaleString()}`;
}

export function ReservationWorkspacePage() {
  const [records, setRecords] = useState<ReservationRecord[]>([]);
  const [search, setSearch] = useState("");
  const [reservationStatus, setReservationStatus] = useState("");
  const [workflowStatus, setWorkflowStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [towers, setTowers] = useState<TowerOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [editingReservation, setEditingReservation] = useState<ReservationRecord | null>(null);
  const [reservationFormOpen, setReservationFormOpen] = useState(false);
  const [reservationForm, setReservationForm] = useState<ReservationFormState>(() => buildReservationForm(null));
  const [workflowReservation, setWorkflowReservation] = useState<ReservationRecord | null>(null);
  const [workflowForm, setWorkflowForm] = useState<WorkflowFormState | null>(null);
  const [convertReservation, setConvertReservation] = useState<ReservationRecord | null>(null);
  const [convertForm, setConvertForm] = useState<ConvertFormState | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", "8");
    if (search.trim()) {
      params.set("q", search.trim());
    }
    if (reservationStatus) {
      params.set("reservationStatus", reservationStatus);
    }
    if (workflowStatus) {
      params.set("workflowStatus", workflowStatus);
    }
    return params.toString();
  }, [page, reservationStatus, search, workflowStatus]);

  async function loadReservations() {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<PagedResult<ReservationRecord>>(`/reservations?${queryString}`);
      setRecords(result.items);
      setTotal(result.total);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReservations();
  }, [queryString]);

  useEffect(() => {
    void Promise.all([
      apiGet<PagedResult<PropertyRecord>>("/properties?size=100"),
      apiGet<PagedResult<TowerOption>>("/towers?size=100"),
      apiGet<PagedResult<UnitOption>>("/units?size=100"),
      apiGet<PagedResult<CustomerRecord>>("/customers?size=100")
    ]).then(([propertyData, towerData, unitData, customerData]) => {
      setProperties(propertyData.items);
      setTowers(towerData.items);
      setUnits(unitData.items);
      setCustomers(customerData.items);
    });
  }, []);

  const kpis = useMemo(() => {
    const pendingApproval = records.filter((record) => record.workflowStatus === "SUBMITTED" || record.workflowStatus === "UNDER_REVIEW").length;
    const confirmed = records.filter((record) => record.reservationStatus === "CONFIRMED").length;
    const converted = records.filter((record) => record.convertedLeaseId != null).length;
    const deposit = records.reduce((sum, record) => sum + record.depositAmount, 0);
    return [
      { label: "Pending Approval", value: String(pendingApproval), note: "Approval queue" },
      { label: "Confirmed", value: String(confirmed), note: "Ready to lease" },
      { label: "Converted", value: String(converted), note: "Lease handoff" },
      { label: "Deposits", value: deposit.toLocaleString(), note: "Captured value" }
    ];
  }, [records]);

  function openCreate() {
    setEditingReservation(null);
    setReservationForm(buildReservationForm(null));
    setReservationFormOpen(true);
    setMessage(null);
  }

  function openEdit(record: ReservationRecord) {
    setEditingReservation(record);
    setReservationForm(buildReservationForm(record));
    setReservationFormOpen(true);
    setMessage(null);
  }

  function closeForm() {
    setEditingReservation(null);
    setReservationFormOpen(false);
    setReservationForm(buildReservationForm(null));
  }

  function openWorkflow(record: ReservationRecord) {
    setWorkflowReservation(record);
    setWorkflowForm(buildWorkflowForm(record));
    setMessage(null);
  }

  function openConvert(record: ReservationRecord) {
    setConvertReservation(record);
    setConvertForm(buildConvertForm(record));
    setMessage(null);
  }

  async function submitReservation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const payload = {
      reservationNumber: reservationForm.reservationNumber,
      propertyId: Number(reservationForm.propertyId),
      towerId: Number(reservationForm.towerId),
      unitId: Number(reservationForm.unitId),
      customerId: Number(reservationForm.customerId),
      reservationStatus: reservationForm.reservationStatus,
      workflowStatus: reservationForm.workflowStatus,
      paymentStatus: reservationForm.paymentStatus,
      reservationDate: reservationForm.reservationDate,
      expiryDate: reservationForm.expiryDate,
      quotedRent: Number(reservationForm.quotedRent),
      currency: reservationForm.currency,
      depositAmount: Number(reservationForm.depositAmount),
      createdBy: reservationForm.createdBy,
      notes: reservationForm.notes || null
    };
    try {
      if (editingReservation) {
        await apiPut(`/reservations/${editingReservation.id}`, payload);
        setMessage("Reservation updated successfully.");
      } else {
        await apiPost("/reservations", payload);
        setMessage("Reservation created successfully.");
      }
      closeForm();
      await loadReservations();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to save reservation");
    }
  }

  async function submitWorkflow(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workflowReservation || !workflowForm) {
      return;
    }
    try {
      await apiPost(`/reservations/${workflowReservation.id}/workflow`, workflowForm);
      setWorkflowReservation(null);
      setWorkflowForm(null);
      setMessage("Reservation workflow updated successfully.");
      await loadReservations();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to update workflow");
    }
  }

  async function submitConvert(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!convertReservation || !convertForm) {
      return;
    }
    try {
      const lease = await apiPost<LeaseRecord>(`/reservations/${convertReservation.id}/convert-to-lease`, convertForm);
      setConvertReservation(null);
      setConvertForm(null);
      setMessage(`Reservation converted to lease ${lease.leaseNumber}.`);
      await loadReservations();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to convert reservation");
    }
  }

  return (
    <AppShell title="Reservation Management" subtitle="Unit availability, reservation capture, payment status, approval workflow, and lease conversion.">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#102033_0%,#183354_55%,#1e5eff_130%)] px-6 py-6 text-white md:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/60">Commercial Management</p>
                <h3 className="mt-3 text-3xl font-semibold">Reservation Operations</h3>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">
                  Reserve available units, capture deposit status, move records through approval, and convert confirmed reservations into lease drafts.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {kpis.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                    <p className="text-xs text-white/60">{item.label}</p>
                    <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-xs text-white/55">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_380px]">
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-steel">Unit Availability Grid</p>
                <h4 className="mt-2 text-2xl font-semibold text-ink">Search and action reservations</h4>
                <p className="mt-2 text-sm text-steel">The reservation flow follows availability, reservation form, payment details, approval workflow, and confirmation.</p>
              </div>
              <button type="button" onClick={openCreate} className="rounded-2xl bg-accent px-5 py-3 text-sm font-medium text-white">
                New Reservation
              </button>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search reservation, unit, customer, property"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent"
              />
              <Select value={reservationStatus} onChange={(value) => { setReservationStatus(value); setPage(1); }} options={reservationStatusOptions} placeholder="All Reservation Statuses" />
              <Select value={workflowStatus} onChange={(value) => { setWorkflowStatus(value); setPage(1); }} options={workflowStatusOptions} placeholder="All Workflow Statuses" />
              <button type="button" onClick={() => void loadReservations()} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-ink">
                Refresh
              </button>
            </div>
            {message ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
            {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-steel">Available Units</p>
            <div className="mt-4 space-y-3">
              {units.slice(0, 5).map((unit) => (
                <div key={unit.id} className="rounded-2xl bg-cloud p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{unit.unitCode}</p>
                      <p className="mt-1 text-xs text-steel">{unit.unitName} · {unit.towerCode}</p>
                    </div>
                    <Badge label={unit.occupancyStatus ?? "AVAILABLE"} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-steel">Reservation Register</p>
              <h4 className="mt-2 text-xl font-semibold text-ink">Payment, approval, and conversion control</h4>
            </div>
            <span className="rounded-full bg-cloud px-3 py-1 text-xs font-medium text-steel">{total} reservations</span>
          </div>
          <div className="mt-6 rounded-[24px] border border-slate-200">
            {loading ? (
              <p className="p-6 text-sm text-steel">Loading reservations...</p>
            ) : records.length === 0 ? (
              <p className="p-6 text-sm text-steel">No reservations matched the current filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[1200px] text-left text-sm">
                  <thead className="bg-slate-50 text-steel">
                    <tr>
                      {["Reservation", "Customer", "Property", "Unit", "Window", "Rent", "Deposit", "Reservation Status", "Workflow", "Payment", "Converted Lease", "Actions"].map((label) => (
                        <th key={label} className="px-4 py-4 font-medium">{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-t border-slate-100 align-top hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-ink">
                          {record.reservationNumber}
                          <p className="mt-1 text-xs text-steel">{record.createdBy} · {record.createdDate.slice(0, 10)}</p>
                        </td>
                        <td className="px-4 py-4 text-steel">{record.customerName}</td>
                        <td className="px-4 py-4 text-steel">{record.propertyName}</td>
                        <td className="px-4 py-4 text-steel">{record.unitCode} · {record.unitName}</td>
                        <td className="px-4 py-4 text-steel">{record.reservationDate} to {record.expiryDate}</td>
                        <td className="px-4 py-4 text-steel">{formatMoney(record.quotedRent, record.currency)}</td>
                        <td className="px-4 py-4 text-steel">{formatMoney(record.depositAmount, record.currency)}</td>
                        <td className="px-4 py-4"><Badge label={record.reservationStatus} /></td>
                        <td className="px-4 py-4"><Badge label={record.workflowStatus} /></td>
                        <td className="px-4 py-4"><Badge label={record.paymentStatus} /></td>
                        <td className="px-4 py-4 text-steel">
                          {record.convertedLeaseId ? <Link className="font-medium text-accent" href={`/leases/${record.convertedLeaseId}`}>{record.convertedLeaseNumber}</Link> : "-"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => openEdit(record)} className="rounded-xl bg-cloud px-3 py-2 text-xs font-medium text-ink">Edit</button>
                            <button type="button" onClick={() => openWorkflow(record)} className="rounded-xl bg-cloud px-3 py-2 text-xs font-medium text-ink">Workflow</button>
                            <button type="button" disabled={record.convertedLeaseId != null} onClick={() => openConvert(record)} className="rounded-xl bg-accent px-3 py-2 text-xs font-medium text-white disabled:opacity-40">Convert</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="mt-5 flex items-center justify-between text-sm text-steel">
            <span>Page {page} · {total} total reservations</span>
            <div className="flex gap-2">
              <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 disabled:opacity-50">Previous</button>
              <button type="button" disabled={page * 8 >= total} onClick={() => setPage((value) => value + 1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 disabled:opacity-50">Next</button>
            </div>
          </div>
        </section>

        {reservationFormOpen ? (
          <ReservationFormModal
            editing={editingReservation != null}
            form={reservationForm}
            properties={properties}
            towers={towers}
            units={units}
            customers={customers}
            onClose={closeForm}
            onSubmit={submitReservation}
            onChange={setReservationForm}
          />
        ) : null}

        {workflowReservation && workflowForm ? (
          <WorkflowModal record={workflowReservation} form={workflowForm} onClose={() => setWorkflowReservation(null)} onSubmit={submitWorkflow} onChange={setWorkflowForm} />
        ) : null}

        {convertReservation && convertForm ? (
          <ConvertModal record={convertReservation} form={convertForm} onClose={() => setConvertReservation(null)} onSubmit={submitConvert} onChange={setConvertForm} />
        ) : null}
      </div>
    </AppShell>
  );
}

function ReservationFormModal({
  editing,
  form,
  properties,
  towers,
  units,
  customers,
  onClose,
  onSubmit,
  onChange
}: Readonly<{
  editing: boolean;
  form: ReservationFormState;
  properties: PropertyRecord[];
  towers: TowerOption[];
  units: UnitOption[];
  customers: CustomerRecord[];
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: React.Dispatch<React.SetStateAction<ReservationFormState>>;
}>) {
  return (
    <Modal title={editing ? "Edit Reservation" : "Create Reservation"} onClose={onClose}>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <Field label="Reservation Number" name="reservationNumber" value={form.reservationNumber} onChange={onChange} />
        <SelectField label="Customer" name="customerId" value={form.customerId} onChange={onChange} options={customers.map((item) => ({ label: item.customerName, value: String(item.id) }))} />
        <SelectField label="Property" name="propertyId" value={form.propertyId} onChange={onChange} options={properties.map((item) => ({ label: item.propertyName, value: String(item.id) }))} />
        <SelectField label="Tower" name="towerId" value={form.towerId} onChange={onChange} options={towers.map((item) => ({ label: item.towerName, value: String(item.id) }))} />
        <SelectField label="Unit" name="unitId" value={form.unitId} onChange={onChange} options={units.map((item) => ({ label: `${item.unitCode} · ${item.unitName}`, value: String(item.id) }))} />
        <SelectField label="Reservation Status" name="reservationStatus" value={form.reservationStatus} onChange={onChange} options={reservationStatusOptions.map((item) => ({ label: item, value: item }))} />
        <SelectField label="Workflow Status" name="workflowStatus" value={form.workflowStatus} onChange={onChange} options={workflowStatusOptions.map((item) => ({ label: item, value: item }))} />
        <SelectField label="Payment Status" name="paymentStatus" value={form.paymentStatus} onChange={onChange} options={paymentStatusOptions.map((item) => ({ label: item, value: item }))} />
        <Field label="Reservation Date" name="reservationDate" type="date" value={form.reservationDate} onChange={onChange} />
        <Field label="Expiry Date" name="expiryDate" type="date" value={form.expiryDate} onChange={onChange} />
        <Field label="Quoted Rent" name="quotedRent" type="number" value={form.quotedRent} onChange={onChange} />
        <Field label="Deposit Amount" name="depositAmount" type="number" value={form.depositAmount} onChange={onChange} />
        <Field label="Currency" name="currency" value={form.currency} onChange={onChange} />
        <Field label="Created By" name="createdBy" value={form.createdBy} onChange={onChange} />
        <label className="block text-sm text-ink md:col-span-2">
          <span className="mb-2 block font-medium">Notes</span>
          <textarea value={form.notes} onChange={(event) => onChange((current) => ({ ...current, notes: event.target.value }))} className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-accent" />
        </label>
        <div className="flex justify-end gap-3 md:col-span-2">
          <button type="button" onClick={onClose} className="rounded-2xl bg-cloud px-5 py-3 text-sm font-medium text-ink">Cancel</button>
          <button type="submit" className="rounded-2xl bg-accent px-5 py-3 text-sm font-medium text-white">Save Reservation</button>
        </div>
      </form>
    </Modal>
  );
}

function WorkflowModal({ record, form, onClose, onSubmit, onChange }: Readonly<{
  record: ReservationRecord;
  form: WorkflowFormState;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: React.Dispatch<React.SetStateAction<WorkflowFormState | null>>;
}>) {
  return (
    <Modal title={`Workflow: ${record.reservationNumber}`} onClose={onClose}>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <SelectField label="Reservation Status" name="reservationStatus" value={form.reservationStatus} onChange={onChange} options={reservationStatusOptions.map((item) => ({ label: item, value: item }))} />
        <SelectField label="Workflow Status" name="workflowStatus" value={form.workflowStatus} onChange={onChange} options={workflowStatusOptions.map((item) => ({ label: item, value: item }))} />
        <SelectField label="Payment Status" name="paymentStatus" value={form.paymentStatus} onChange={onChange} options={paymentStatusOptions.map((item) => ({ label: item, value: item }))} />
        <Field label="Updated By" name="updatedBy" value={form.updatedBy} onChange={onChange} />
        <label className="block text-sm text-ink md:col-span-2">
          <span className="mb-2 block font-medium">Approval Notes</span>
          <textarea value={form.notes} onChange={(event) => onChange((current) => ({ ...(current ?? form), notes: event.target.value }))} className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-accent" />
        </label>
        <div className="flex justify-end gap-3 md:col-span-2">
          <button type="button" onClick={onClose} className="rounded-2xl bg-cloud px-5 py-3 text-sm font-medium text-ink">Cancel</button>
          <button type="submit" className="rounded-2xl bg-accent px-5 py-3 text-sm font-medium text-white">Update Workflow</button>
        </div>
      </form>
    </Modal>
  );
}

function ConvertModal({ record, form, onClose, onSubmit, onChange }: Readonly<{
  record: ReservationRecord;
  form: ConvertFormState;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: React.Dispatch<React.SetStateAction<ConvertFormState | null>>;
}>) {
  return (
    <Modal title={`Convert ${record.reservationNumber} to Lease`} onClose={onClose}>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <Field label="Lease Number" name="leaseNumber" value={form.leaseNumber} onChange={onChange} />
        <SelectField label="Lease Type" name="leaseType" value={form.leaseType} onChange={onChange} options={leaseTypeOptions.map((item) => ({ label: item, value: item }))} />
        <Field label="Start Date" name="startDate" type="date" value={form.startDate} onChange={onChange} />
        <Field label="End Date" name="endDate" type="date" value={form.endDate} onChange={onChange} />
        <Field label="Created By" name="createdBy" value={form.createdBy} onChange={onChange} />
        <label className="block text-sm text-ink md:col-span-2">
          <span className="mb-2 block font-medium">Lease Notes</span>
          <textarea value={form.notes} onChange={(event) => onChange((current) => ({ ...(current ?? form), notes: event.target.value }))} className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-accent" />
        </label>
        <div className="rounded-2xl bg-cloud p-4 text-sm text-steel md:col-span-2">
          {record.customerName} · {record.propertyName} · {record.unitCode} · {formatMoney(record.quotedRent, record.currency)}
        </div>
        <div className="flex justify-end gap-3 md:col-span-2">
          <button type="button" onClick={onClose} className="rounded-2xl bg-cloud px-5 py-3 text-sm font-medium text-ink">Cancel</button>
          <button type="submit" className="rounded-2xl bg-accent px-5 py-3 text-sm font-medium text-white">Create Lease Draft</button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ title, children, onClose }: Readonly<{ title: string; children: React.ReactNode; onClose: () => void }>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold text-ink">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-xl bg-cloud px-3 py-2 text-sm text-ink">Close</button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text" }: Readonly<{
  label: string;
  name: string;
  value: string;
  onChange: React.Dispatch<React.SetStateAction<Record<string, string> | null>> | React.Dispatch<React.SetStateAction<Record<string, string>>>;
  type?: string;
}>) {
  return (
    <label className="block text-sm text-ink">
      <span className="mb-2 block font-medium">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange((current: Record<string, string> | null) => ({ ...(current ?? {}), [name]: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-accent" />
    </label>
  );
}

function SelectField({ label, name, value, options, onChange }: Readonly<{
  label: string;
  name: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: React.Dispatch<React.SetStateAction<Record<string, string> | null>> | React.Dispatch<React.SetStateAction<Record<string, string>>>;
}>) {
  return (
    <label className="block text-sm text-ink">
      <span className="mb-2 block font-medium">{label}</span>
      <select value={value} onChange={(event) => onChange((current: Record<string, string> | null) => ({ ...(current ?? {}), [name]: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-accent">
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function Select({ value, options, placeholder, onChange }: Readonly<{ value: string; options: string[]; placeholder: string; onChange: (value: string) => void }>) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent">
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
}

function Badge({ label }: Readonly<{ label: string }>) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeTone(label)}`}>{label}</span>;
}
