"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/layouts/app-shell";
import { apiGet, apiPost, apiPut } from "@/services/api";
import type { PagedResult } from "@/types/api";
import type { AvailableUnitRecord, CustomerRecord, LeaseRecord, LeaseTransactionRecord, LeaseUnitRecord, PropertyRecord } from "@/types/entities";

type Option = {
  label: string;
  value: string;
};

type Tone = "accent" | "warn" | "neutral";

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
};

type LeaseFormState = Record<string, string>;
type TransactionFormState = Record<string, string>;
type UnitTransactionMode = "SINGLE" | "MULTIPLE";

const leaseStatusOptions = ["ACTIVE", "PENDING_APPROVAL", "SUSPENDED", "TERMINATION_REVIEW", "CANCELLED"];
const renewalStatusOptions = ["NOT_DUE", "DUE_SOON", "UNDER_REVIEW", "RENEWED", "EXTENDED"];
const leaseTypeOptions = ["COMMERCIAL", "RESIDENTIAL", "RETAIL"];
const occupancyOptions = ["OCCUPIED", "VACANT", "RESERVED"];
const approvalOptions = ["DRAFT", "INTERNAL_REVIEW", "FINANCE_REVIEW", "LEGAL_REVIEW", "APPROVED"];
const documentOptions = ["DRAFT", "SHARED", "SIGNED"];
const paymentOptions = ["PENDING", "PARTIAL", "RECEIVED"];
const registrationOptions = ["PENDING", "UPDATED", "NOT_REQUIRED"];
const handoverOptions = ["NOT_STARTED", "SCHEDULED", "IN_PROGRESS", "COMPLETED"];
const settlementOptions = ["NOT_REQUIRED", "PENDING", "IN_PROGRESS", "COMPLETED"];
const requestInitiatorOptions = ["AGENT", "TENANT", "OWNER"];
const transactionStatusOptions = ["SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED"];

const leaseFormTabs = [
  { id: "general", label: "Lease General Info" },
  { id: "period", label: "Lease Period" },
  { id: "unit", label: "Unit Information" },
  { id: "fitout", label: "Free / Fit-Out Period" }
] as const;

const detailTabs = [
  { id: "summary", label: "Lease Summary" },
  { id: "tenant", label: "Tenant Details" },
  { id: "property", label: "Property & Unit Details" },
  { id: "financials", label: "Financials" },
  { id: "charges", label: "Charges & Billing" },
  { id: "documents", label: "Documents" },
  { id: "renewals", label: "Renewal History" },
  { id: "amendments", label: "Amendment History" },
  { id: "revisions", label: "Revision History" },
  { id: "workflow", label: "Workflow History" },
  { id: "audit", label: "Audit Trail" }
] as const;

const transactionActions = [
  { key: "renew", label: "Renew Lease", type: "RENEWAL" },
  { key: "extend", label: "Extend Lease", type: "EXTENSION" },
  { key: "expand", label: "Expand Lease", type: "EXPANSION" },
  { key: "contract", label: "Contract Lease", type: "CONTRACTION" },
  { key: "amend", label: "Amend Lease", type: "AMENDMENT" },
  { key: "revise", label: "Revise Rent", type: "RENT_REVISION" },
  { key: "suspend", label: "Suspend Lease", type: "SUSPENSION" },
  { key: "resume", label: "Resume Lease", type: "RESUME" },
  { key: "terminate", label: "Terminate Lease", type: "TERMINATION" },
  { key: "cancel", label: "Cancel Lease", type: "CANCELLATION" },
  { key: "transfer", label: "Lease Transfer", type: "TRANSFER" }
] as const;

function buildLeaseForm(record?: LeaseRecord | null): LeaseFormState {
  return {
    leaseNumber: record?.leaseNumber ?? "",
    propertyId: record ? String(record.propertyId) : "",
    towerId: record ? String(record.towerId) : "",
    unitId: record ? String(record.unitId) : "",
    customerId: record ? String(record.customerId) : "",
    leaseType: record?.leaseType ?? "COMMERCIAL",
    leaseStatus: record?.leaseStatus ?? "ACTIVE",
    occupancyStatus: record?.occupancyStatus ?? "OCCUPIED",
    currency: record?.currency ?? "AED",
    rentAmount: record ? String(record.rentAmount) : "",
    securityDeposit: record ? String(record.securityDeposit) : "",
    renewalStatus: record?.renewalStatus ?? "NOT_DUE",
    requestInitiator: record?.requestInitiator ?? "AGENT",
    approvalStatus: record?.approvalStatus ?? "DRAFT",
    documentStatus: record?.documentStatus ?? "DRAFT",
    paymentStatus: record?.paymentStatus ?? "PENDING",
    registrationStatus: record?.registrationStatus ?? "PENDING",
    handoverStatus: record?.handoverStatus ?? "NOT_STARTED",
    settlementStatus: record?.settlementStatus ?? "NOT_REQUIRED",
    startDate: record?.startDate ?? "",
    endDate: record?.endDate ?? "",
    freePeriodStart: record?.freePeriodStart ?? "",
    freePeriodEnd: record?.freePeriodEnd ?? "",
    fitOutPeriodStart: record?.fitOutPeriodStart ?? "",
    fitOutPeriodEnd: record?.fitOutPeriodEnd ?? "",
    createdBy: record?.createdBy ?? "leasing.user",
    notes: record?.notes ?? ""
  };
}

function buildTransactionForm(actionType: string, lease: LeaseRecord): TransactionFormState {
  return {
    transactionType: actionType,
    transactionStatus: "SUBMITTED",
    effectiveStartDate: actionType === "RENEWAL" ? lease.startDate : "",
    effectiveEndDate: lease.endDate,
    revisedRentAmount: String(lease.rentAmount),
    revisedSecurityDeposit: String(lease.securityDeposit),
    targetUnitId: "",
    reason: "",
    notes: "",
    createdBy: "leasing.user"
  };
}

function normalizeDate(value: string | null) {
  return value && value !== "null" ? value : "-";
}

function formatMoney(value: number, currency: string) {
  return `${currency} ${value.toLocaleString()}`;
}

function availableUnitCharges(unit: AvailableUnitRecord) {
  return unit.maintenanceCharges + unit.camCharges + unit.parkingCharges + Math.round(unit.monthlyRent * 0.05);
}

function selectedAvailableUnitTotals(units: AvailableUnitRecord[]) {
  return units.reduce(
    (totals, unit) => ({
      area: totals.area + unit.area,
      rent: totals.rent + unit.monthlyRent,
      deposit: totals.deposit + unit.securityDeposit,
      charges: totals.charges + availableUnitCharges(unit)
    }),
    { area: 0, rent: 0, deposit: 0, charges: 0 }
  );
}

function formatNumber(value: number) {
  return value.toLocaleString();
}

function daysTo(dateText: string) {
  const today = new Date();
  const end = new Date(dateText);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function daysBetween(startText: string, endText: string) {
  const start = new Date(startText);
  const end = new Date(endText);
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function leaseProgress(lease: LeaseRecord) {
  const elapsed = daysBetween(lease.startDate, new Date().toISOString());
  const total = daysBetween(lease.startDate, lease.endDate);
  return clampPercent((elapsed / total) * 100);
}

function leaseRiskLabel(lease: LeaseRecord) {
  const remaining = daysTo(lease.endDate);
  if (["CANCELLED", "SUSPENDED", "TERMINATION_REVIEW"].includes(lease.leaseStatus)) {
    return "Critical";
  }
  if (remaining <= 30 || ["DUE_SOON", "UNDER_REVIEW"].includes(lease.renewalStatus)) {
    return "Watch";
  }
  return "Stable";
}

function riskTone(label: string) {
  if (label === "Critical") {
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-100";
  }
  if (label === "Watch") {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  }
  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
}

function transactionTitle(type: string) {
  return type.replaceAll("_", " ");
}

function badgeTone(label: string) {
  const normalized = label.toUpperCase();
  if (["ACTIVE", "APPROVED", "COMPLETED", "RENEWED", "RECEIVED", "OCCUPIED"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  }
  if (["PENDING_APPROVAL", "UNDER_REVIEW", "DUE_SOON", "IN_REVIEW", "PARTIAL", "SCHEDULED", "IN_PROGRESS", "TERMINATION_REVIEW"].includes(normalized)) {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  }
  if (["CANCELLED", "REJECTED", "SUSPENDED", "VACANT"].includes(normalized)) {
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-100";
  }
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function toOptions(values: string[]): Option[] {
  return values.map((value) => ({ value, label: value }));
}

export function LeaseWorkspacePage() {
  const router = useRouter();
  const [records, setRecords] = useState<LeaseRecord[]>([]);
  const [search, setSearch] = useState("");
  const [leaseStatus, setLeaseStatus] = useState("");
  const [renewalStatus, setRenewalStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [leaseModalOpen, setLeaseModalOpen] = useState(false);
  const [editingLease, setEditingLease] = useState<LeaseRecord | null>(null);
  const [leaseForm, setLeaseForm] = useState<LeaseFormState>(() => buildLeaseForm(null));
  const [leaseFormTab, setLeaseFormTab] = useState<(typeof leaseFormTabs)[number]["id"]>("general");
  const [leaseUnitMode, setLeaseUnitMode] = useState<UnitTransactionMode>("SINGLE");
  const [availableLeaseUnits, setAvailableLeaseUnits] = useState<AvailableUnitRecord[]>([]);
  const [selectedLeaseUnits, setSelectedLeaseUnits] = useState<AvailableUnitRecord[]>([]);
  const [transactionContext, setTransactionContext] = useState<{ lease: LeaseRecord; actionType: string } | null>(null);
  const [transactionForm, setTransactionForm] = useState<TransactionFormState>(() =>
    buildTransactionForm("RENEWAL", {
      id: 0,
      leaseNumber: "",
      propertyId: 0,
      propertyName: "",
      towerId: 0,
      towerName: "",
      unitId: 0,
      unitName: "",
      leaseType: "",
      leaseStatus: "",
      occupancyStatus: "",
      rentAmount: 0,
      currency: "AED",
      securityDeposit: 0,
      totalLeaseUnits: 0,
      totalLeaseArea: 0,
      totalRent: 0,
      totalDeposit: 0,
      totalCharges: 0,
      renewalStatus: "",
      parentLeaseId: null,
      parentLeaseReference: null,
      versionNumber: 1,
      createdBy: "",
      createdDate: "",
      customerId: 0,
      customerName: "",
      unitCode: "",
      requestInitiator: "",
      approvalStatus: "",
      documentStatus: "",
      paymentStatus: "",
      registrationStatus: "",
      handoverStatus: "",
      settlementStatus: "",
      startDate: "",
      endDate: "",
      freePeriodStart: null,
      freePeriodEnd: null,
      fitOutPeriodStart: null,
      fitOutPeriodEnd: null,
      notes: null,
      latestTransactionType: ""
    })
  );
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [towers, setTowers] = useState<TowerOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", "8");
    if (search.trim()) {
      params.set("q", search.trim());
    }
    if (leaseStatus) {
      params.set("leaseStatus", leaseStatus);
    }
    if (renewalStatus) {
      params.set("renewalStatus", renewalStatus);
    }
    return params.toString();
  }, [leaseStatus, page, renewalStatus, search]);

  async function loadWorkspace() {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<PagedResult<LeaseRecord>>(`/leases?${queryString}`);
      setRecords(result.items);
      setTotal(result.total);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load leases");
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableLeaseUnits() {
    try {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("size", "100");
      params.set("availabilityDate", new Date().toISOString().slice(0, 10));
      const result = await apiGet<PagedResult<AvailableUnitRecord>>(`/reservations/available-units?${params.toString()}`);
      setAvailableLeaseUnits(result.items);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load available units");
    }
  }

  async function searchLeaseUnitsForForm(unitSearch = "") {
    try {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("size", "100");
      const startDate = leaseForm.startDate || new Date().toISOString().slice(0, 10);
      const endDate = leaseForm.endDate || startDate;
      params.set("startDate", startDate);
      params.set("endDate", endDate);
      if (leaseForm.propertyId) {
        params.set("propertyId", leaseForm.propertyId);
      }
      if (leaseForm.towerId) {
        params.set("towerId", leaseForm.towerId);
      }
      if (unitSearch.trim()) {
        params.set("unitSearch", unitSearch.trim());
      }
      const result = await apiGet<PagedResult<AvailableUnitRecord>>(`/reservations/available-units?${params.toString()}`);
      setAvailableLeaseUnits(result.items);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to search available units");
    }
  }

  useEffect(() => {
    void loadWorkspace();
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
    const expiring = records.filter((record) => daysTo(record.endDate) <= 60).length;
    const active = records.filter((record) => record.leaseStatus === "ACTIVE").length;
    const renewalDue = records.filter((record) => record.renewalStatus === "DUE_SOON" || record.renewalStatus === "UNDER_REVIEW").length;
    const vacant = records.filter((record) => record.occupancyStatus === "VACANT").length;
    return [
      { label: "Active Leases", value: String(active), note: "Live contractual occupancy", tone: "accent" as Tone },
      { label: "Expiring Soon", value: String(expiring), note: "60-day watchlist", tone: "warn" as Tone },
      { label: "Renewal Due", value: String(renewalDue), note: "Commercial action required", tone: "accent" as Tone },
      { label: "Vacant Occupancy", value: String(vacant), note: "Space requiring action", tone: "neutral" as Tone }
    ];
  }, [records]);

  function openCreateLease() {
    setEditingLease(null);
    setLeaseForm(buildLeaseForm(null));
    setLeaseFormTab("general");
    setLeaseUnitMode("SINGLE");
    setSelectedLeaseUnits([]);
    setLeaseModalOpen(true);
    setMessage(null);
  }

  function openEditLease(lease: LeaseRecord) {
    setEditingLease(lease);
    setLeaseForm(buildLeaseForm(lease));
    setLeaseFormTab("general");
    setLeaseUnitMode("SINGLE");
    setSelectedLeaseUnits([]);
    setLeaseModalOpen(true);
    setMessage(null);
  }

  function addLeaseUnit(unit: AvailableUnitRecord) {
    if (unit.availabilityStatus !== "AVAILABLE") {
      setError("Only available units can be selected.");
      return;
    }
    if (selectedLeaseUnits.some((item) => item.unitId === unit.unitId)) {
      setError("Duplicate units are not allowed in the same lease.");
      return;
    }
    if (selectedLeaseUnits.length > 0 && selectedLeaseUnits[0].propertyId !== unit.propertyId) {
      setError("Multiple-unit leases can include units from one property only.");
      return;
    }
    const nextUnits = [...selectedLeaseUnits, unit];
    const totals = selectedAvailableUnitTotals(nextUnits);
    setSelectedLeaseUnits(nextUnits);
    setLeaseForm((current) => ({
      ...current,
      propertyId: String(nextUnits[0].propertyId),
      towerId: current.towerId || String(nextUnits[0].towerId),
      unitId: String(nextUnits[0].unitId),
      rentAmount: String(totals.rent),
      securityDeposit: String(totals.deposit),
      currency: nextUnits[0].currency
    }));
  }

  function removeLeaseUnit(unit: AvailableUnitRecord) {
    setSelectedLeaseUnits((current) => {
      const nextUnits = current.filter((item) => item.unitId !== unit.unitId);
      const totals = selectedAvailableUnitTotals(nextUnits);
      setLeaseForm((form) => ({
        ...form,
        unitId: nextUnits[0] ? String(nextUnits[0].unitId) : "",
        rentAmount: nextUnits.length > 0 ? String(totals.rent) : form.rentAmount,
        securityDeposit: nextUnits.length > 0 ? String(totals.deposit) : form.securityDeposit
      }));
      return nextUnits;
    });
  }

  function openTransaction(lease: LeaseRecord, actionType: string) {
    setTransactionContext({ lease, actionType });
    setTransactionForm(buildTransactionForm(actionType, lease));
    setMessage(null);
  }

  async function submitLease(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const multiUnitSelected = leaseUnitMode === "MULTIPLE";
    const unitsForPayload = multiUnitSelected ? selectedLeaseUnits : [];
    if (multiUnitSelected && unitsForPayload.length === 0) {
      setError("Select at least one available unit for a multiple-unit lease.");
      return;
    }
    if (multiUnitSelected && new Set(unitsForPayload.map((unit) => unit.unitId)).size !== unitsForPayload.length) {
      setError("Duplicate units are not allowed in the same lease.");
      return;
    }
    if (multiUnitSelected && unitsForPayload.some((unit) => unit.availabilityStatus !== "AVAILABLE")) {
      setError("Inactive, reserved, or unavailable units cannot be selected.");
      return;
    }
    if (multiUnitSelected && new Set(unitsForPayload.map((unit) => unit.propertyId)).size > 1) {
      setError("Multiple-unit leases can include units from one property only.");
      return;
    }
    const primaryMultiUnit = unitsForPayload[0];
    const multiTotals = selectedAvailableUnitTotals(unitsForPayload);
    try {
      const payload = {
        leaseNumber: leaseForm.leaseNumber,
        propertyId: multiUnitSelected ? primaryMultiUnit.propertyId : Number(leaseForm.propertyId),
        towerId: multiUnitSelected ? primaryMultiUnit.towerId : Number(leaseForm.towerId),
        unitId: multiUnitSelected ? primaryMultiUnit.unitId : Number(leaseForm.unitId),
        customerId: Number(leaseForm.customerId),
        leaseType: leaseForm.leaseType,
        leaseStatus: leaseForm.leaseStatus,
        occupancyStatus: leaseForm.occupancyStatus,
        currency: leaseForm.currency,
        rentAmount: multiUnitSelected ? multiTotals.rent : Number(leaseForm.rentAmount),
        securityDeposit: multiUnitSelected ? multiTotals.deposit : Number(leaseForm.securityDeposit),
        renewalStatus: leaseForm.renewalStatus,
        requestInitiator: leaseForm.requestInitiator,
        approvalStatus: leaseForm.approvalStatus,
        documentStatus: leaseForm.documentStatus,
        paymentStatus: leaseForm.paymentStatus,
        registrationStatus: leaseForm.registrationStatus,
        handoverStatus: leaseForm.handoverStatus,
        settlementStatus: leaseForm.settlementStatus,
        startDate: leaseForm.startDate,
        endDate: leaseForm.endDate,
        freePeriodStart: leaseForm.freePeriodStart || null,
        freePeriodEnd: leaseForm.freePeriodEnd || null,
        fitOutPeriodStart: leaseForm.fitOutPeriodStart || null,
        fitOutPeriodEnd: leaseForm.fitOutPeriodEnd || null,
        createdBy: leaseForm.createdBy,
        notes: leaseForm.notes,
        units: multiUnitSelected
          ? unitsForPayload.map((unit) => ({
              propertyId: unit.propertyId,
              unitId: unit.unitId,
              unitNumber: unit.unitNumber,
              area: unit.area,
              rent: unit.monthlyRent,
              additionalCharges: unit.maintenanceCharges + unit.camCharges + unit.parkingCharges,
              deposit: unit.securityDeposit,
              tax: Math.round(unit.monthlyRent * 0.05),
              fitOutPeriod: unit.fitOutPeriod,
              unitLeaseStatus: leaseForm.leaseStatus
            }))
          : undefined
      };
      if (editingLease) {
        await apiPut(`/leases/${editingLease.id}`, payload);
        setMessage("Lease updated successfully.");
      } else {
        await apiPost("/leases", payload);
        setMessage("Lease created successfully.");
      }
      setLeaseModalOpen(false);
      setSelectedLeaseUnits([]);
      setLeaseUnitMode("SINGLE");
      await loadWorkspace();
      await loadAvailableLeaseUnits();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to save lease");
    }
  }

  async function submitTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!transactionContext) {
      return;
    }
    setError(null);
    try {
      await apiPost(`/leases/${transactionContext.lease.id}/transactions`, {
        transactionType: transactionForm.transactionType,
        transactionStatus: transactionForm.transactionStatus,
        effectiveStartDate: transactionForm.effectiveStartDate || null,
        effectiveEndDate: transactionForm.effectiveEndDate || null,
        revisedRentAmount: transactionForm.revisedRentAmount ? Number(transactionForm.revisedRentAmount) : null,
        revisedSecurityDeposit: transactionForm.revisedSecurityDeposit ? Number(transactionForm.revisedSecurityDeposit) : null,
        targetUnitId: transactionForm.targetUnitId ? Number(transactionForm.targetUnitId) : null,
        reason: transactionForm.reason || null,
        notes: transactionForm.notes || null,
        createdBy: transactionForm.createdBy
      });
      setTransactionContext(null);
      setMessage(`${transactionTitle(transactionForm.transactionType)} submitted successfully.`);
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to submit lease action");
    }
  }

  function handleLeaseAction(action: string, lease: LeaseRecord) {
    const transactionAction = transactionActions.find((entry) => entry.label === action);
    if (action === "View Lease 360") {
      router.push(`/leases/${lease.id}`);
      return;
    }
    if (action === "Edit Lease") {
      openEditLease(lease);
      return;
    }
    if (action === "View History") {
      router.push(`/leases/${lease.id}?tab=workflow`);
      return;
    }
    if (action === "View Documents") {
      router.push(`/leases/${lease.id}?tab=documents`);
      return;
    }
    if (action === "View Audit Trail") {
      router.push(`/leases/${lease.id}?tab=audit`);
      return;
    }
    if (transactionAction) {
      openTransaction(lease, transactionAction.type);
    }
  }

  return (
    <AppShell title="Lease Management" subtitle="Unified workspace for master leases, renewals, lifecycle actions, and linked transactions.">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#0f1c30_0%,#173152_56%,#1e5eff_130%)] px-6 py-6 text-white md:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/60">PropManager Enterprise Suite</p>
                <h3 className="mt-3 text-3xl font-semibold">Lease Operations Control Center</h3>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">
                  Monitor master leases, launch linked subprocess actions, and manage expiring contracts, occupancies, and approvals from one operating screen.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryChip label="Portfolio Lead" value="Ramesh Kumar" />
                <SummaryChip label="Workspace" value="Lease Operations" />
                <SummaryChip label="Records" value={String(total)} />
                <SummaryChip label="Control Mode" value="Master Lease" />
              </div>
            </div>
          </div>
          <div className="grid gap-4 px-6 py-5 md:grid-cols-2 xl:grid-cols-4 md:px-8">
            {kpis.map((card) => (
              <MetricCard key={card.label} label={card.label} value={card.value} note={card.note} tone={card.tone} />
            ))}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_320px]">
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-steel">Lease Workspace</p>
                <h4 className="mt-2 text-2xl font-semibold text-ink">Search, filter, and action master leases</h4>
                <p className="mt-2 text-sm text-steel">
                  Renewal, extension, amendment, rent revision, suspension, termination, cancellation, and transfer stay connected to the original lease.
                </p>
              </div>
              <button type="button" onClick={openCreateLease} className="rounded-2xl bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm shadow-blue-300/40">
                Create Lease
              </button>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search lease, tenant, property, or unit"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-white"
              />
              <select
                value={leaseStatus}
                onChange={(event) => {
                  setLeaseStatus(event.target.value);
                  setPage(1);
                }}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-white"
              >
                <option value="">All Lease Statuses</option>
                {leaseStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={renewalStatus}
                onChange={(event) => {
                  setRenewalStatus(event.target.value);
                  setPage(1);
                }}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-white"
              >
                <option value="">All Renewal Statuses</option>
                {renewalStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => void loadWorkspace()} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:bg-cloud">
                Refresh Workspace
              </button>
            </div>
            {message ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
            {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-steel">Operational Focus</p>
            <div className="mt-4 space-y-3">
              <FocusLine label="Expiring In 60 Days" value={kpis[1]?.value ?? "0"} />
              <FocusLine label="Renewals Under Review" value={String(records.filter((record) => record.renewalStatus === "UNDER_REVIEW").length)} />
              <FocusLine label="Pending Approvals" value={String(records.filter((record) => record.approvalStatus !== "APPROVED").length)} />
              <FocusLine label="Latest Transactions" value={String(records.filter((record) => record.latestTransactionType !== "LEASE").length)} />
            </div>
          </article>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-steel">Master Lease Register</p>
              <h4 className="mt-2 text-xl font-semibold text-ink">Lease records with embedded lifecycle actions</h4>
            </div>
            <span className="rounded-full bg-cloud px-3 py-1 text-xs font-medium text-steel">{total} lease records</span>
          </div>
          <div className="mt-6 rounded-[24px] border border-slate-200">
            {loading ? (
              <p className="p-6 text-sm text-steel">Loading leases...</p>
            ) : records.length === 0 ? (
              <div className="rounded-[24px] bg-cloud p-6 text-sm text-steel">No leases matched the current search and filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[1400px] text-left text-sm">
                  <thead className="bg-slate-50 text-steel">
                    <tr>
                      {["Lease Number", "Property", "Building / Tower", "Unit", "Tenant", "Lease Type", "Start Date", "End Date", "Lease Status", "Occupancy Status", "Rent Amount", "Currency", "Security Deposit", "Renewal Status", "Parent Lease Reference", "Version Number", "Created By", "Created Date", "Actions"].map((label) => (
                        <th key={label} className="px-4 py-4 font-medium">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((lease) => (
                      <tr key={lease.id} className="border-t border-slate-100 align-top transition hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-ink">
                          <Link href={`/leases/${lease.id}`} className="hover:text-accent">
                            {lease.leaseNumber}
                          </Link>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-steel">{lease.latestTransactionType}</p>
                        </td>
                        <td className="px-4 py-4 text-steel">{lease.propertyName}</td>
                        <td className="px-4 py-4 text-steel">{lease.towerName}</td>
                        <td className="px-4 py-4 text-steel">{lease.unitCode}</td>
                        <td className="px-4 py-4 text-steel">{lease.customerName}</td>
                        <td className="px-4 py-4 text-steel">{lease.leaseType}</td>
                        <td className="px-4 py-4 text-steel">{lease.startDate}</td>
                        <td className="px-4 py-4 text-steel">{lease.endDate}</td>
                        <td className="px-4 py-4">
                          <Badge label={lease.leaseStatus} />
                        </td>
                        <td className="px-4 py-4">
                          <Badge label={lease.occupancyStatus} />
                        </td>
                        <td className="px-4 py-4 text-steel">{lease.rentAmount.toLocaleString()}</td>
                        <td className="px-4 py-4 text-steel">{lease.currency}</td>
                        <td className="px-4 py-4 text-steel">{lease.securityDeposit.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <Badge label={lease.renewalStatus} />
                        </td>
                        <td className="px-4 py-4 text-steel">{lease.parentLeaseReference ?? "-"}</td>
                        <td className="px-4 py-4 text-steel">{lease.versionNumber}</td>
                        <td className="px-4 py-4 text-steel">{lease.createdBy}</td>
                        <td className="px-4 py-4 text-steel">{lease.createdDate.slice(0, 10)}</td>
                        <td className="px-4 py-4">
                          <details className="relative">
                            <summary className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-ink shadow-sm">Actions</summary>
                            <div className="absolute right-0 z-10 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-card">
                              {["View Lease 360", "Edit Lease", "Renew Lease", "Extend Lease", "Expand Lease", "Contract Lease", "Amend Lease", "Revise Rent", "Suspend Lease", "Resume Lease", "Terminate Lease", "Cancel Lease", "Lease Transfer", "View History", "View Documents", "View Audit Trail"].map((label) => (
                                <button key={label} type="button" onClick={() => handleLeaseAction(label, lease)} className="block w-full rounded-xl px-3 py-2 text-left text-xs text-ink hover:bg-cloud">
                                  {label}
                                </button>
                              ))}
                            </div>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="mt-5 flex items-center justify-between text-sm text-steel">
            <span>Page {page} · {total} total leases</span>
            <div className="flex gap-2">
              <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 disabled:opacity-50">
                Previous
              </button>
              <button type="button" disabled={page * 8 >= total} onClick={() => setPage((value) => value + 1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </section>

        {leaseModalOpen ? (
          <LeaseFormModal
            editingLease={editingLease}
            form={leaseForm}
            formTab={leaseFormTab}
            properties={properties}
            towers={towers}
            units={units}
            customers={customers}
            availableUnits={availableLeaseUnits}
            selectedUnits={selectedLeaseUnits}
            unitMode={leaseUnitMode}
            onClose={() => {
              setLeaseModalOpen(false);
              setLeaseUnitMode("SINGLE");
              setSelectedLeaseUnits([]);
            }}
            onSubmit={submitLease}
            onFormChange={setLeaseForm}
            onTabChange={setLeaseFormTab}
            onUnitModeChange={(mode) => {
              setLeaseUnitMode(mode);
              if (mode === "SINGLE") {
                setSelectedLeaseUnits([]);
              } else {
                void searchLeaseUnitsForForm();
              }
            }}
            onSearchUnits={searchLeaseUnitsForForm}
            onAddUnit={addLeaseUnit}
            onRemoveUnit={removeLeaseUnit}
          />
        ) : null}

        {transactionContext ? (
          <TransactionModal
            actionType={transactionContext.actionType}
            form={transactionForm}
            lease={transactionContext.lease}
            units={units}
            onClose={() => setTransactionContext(null)}
            onFormChange={setTransactionForm}
            onSubmit={submitTransaction}
          />
        ) : null}
      </div>
    </AppShell>
  );
}

export function LeaseDetailPage({ leaseId }: Readonly<{ leaseId: number }>) {
  const searchParams = useSearchParams();
  const [lease, setLease] = useState<LeaseRecord | null>(null);
  const [leaseUnits, setLeaseUnits] = useState<LeaseUnitRecord[]>([]);
  const [transactions, setTransactions] = useState<LeaseTransactionRecord[]>([]);
  const [tab, setTab] = useState<(typeof detailTabs)[number]["id"]>((searchParams.get("tab") as (typeof detailTabs)[number]["id"]) ?? "summary");
  const [transactionContext, setTransactionContext] = useState<{ lease: LeaseRecord; actionType: string } | null>(null);
  const [transactionForm, setTransactionForm] = useState<TransactionFormState | null>(null);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadDetails() {
    try {
      const [leaseData, leaseUnitData, transactionData, unitData] = await Promise.all([
        apiGet<LeaseRecord>(`/leases/${leaseId}`),
        apiGet<LeaseUnitRecord[]>(`/leases/${leaseId}/units`),
        apiGet<LeaseTransactionRecord[]>(`/leases/${leaseId}/transactions`),
        apiGet<PagedResult<UnitOption>>("/units?size=100")
      ]);
      setLease(leaseData);
      setLeaseUnits(leaseUnitData);
      setTransactions(transactionData);
      setUnits(unitData.items);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load lease details");
    }
  }

  useEffect(() => {
    void loadDetails();
  }, [leaseId]);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (requestedTab && detailTabs.some((entry) => entry.id === requestedTab)) {
      setTab(requestedTab as (typeof detailTabs)[number]["id"]);
    }
  }, [searchParams]);

  if (error) {
    return (
      <AppShell title="Lease Details" subtitle="Master lease profile with operational and audit visibility.">
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
      </AppShell>
    );
  }

  if (!lease) {
    return (
      <AppShell title="Lease Details" subtitle="Master lease profile with operational and audit visibility.">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-sm text-steel">Loading lease details...</div>
      </AppShell>
    );
  }

  const renewalHistory = transactions.filter((transaction) => transaction.transactionType === "RENEWAL" || transaction.transactionType === "EXTENSION");
  const amendmentHistory = transactions.filter((transaction) =>
    ["AMENDMENT", "ADDENDUM", "EXPANSION", "CONTRACTION", "TRANSFER"].includes(transaction.transactionType)
  );
  const revisionHistory = transactions.filter((transaction) => transaction.transactionType === "RENT_REVISION");
  const remainingDays = daysTo(lease.endDate);
  const progress = leaseProgress(lease);
  const riskLabel = leaseRiskLabel(lease);
  const totalRent = lease.totalRent || lease.rentAmount;
  const totalDeposit = lease.totalDeposit || lease.securityDeposit;
  const annualizedRent = totalRent * 12;
  const lifecycleSteps = [
    { label: "Approval", value: lease.approvalStatus },
    { label: "Documents", value: lease.documentStatus },
    { label: "Payment", value: lease.paymentStatus },
    { label: "Registration", value: lease.registrationStatus },
    { label: "Handover", value: lease.handoverStatus },
    { label: "Settlement", value: lease.settlementStatus }
  ];
  const primaryActions = [transactionActions[0], transactionActions[1], transactionActions[4], transactionActions[5], transactionActions[8], transactionActions[10]];

  async function submitTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!transactionContext || !transactionForm) {
      return;
    }
    const activeLease = transactionContext.lease;
    try {
      await apiPost(`/leases/${activeLease.id}/transactions`, {
        transactionType: transactionForm.transactionType,
        transactionStatus: transactionForm.transactionStatus,
        effectiveStartDate: transactionForm.effectiveStartDate || null,
        effectiveEndDate: transactionForm.effectiveEndDate || null,
        revisedRentAmount: transactionForm.revisedRentAmount ? Number(transactionForm.revisedRentAmount) : null,
        revisedSecurityDeposit: transactionForm.revisedSecurityDeposit ? Number(transactionForm.revisedSecurityDeposit) : null,
        targetUnitId: transactionForm.targetUnitId ? Number(transactionForm.targetUnitId) : null,
        reason: transactionForm.reason || null,
        notes: transactionForm.notes || null,
        createdBy: transactionForm.createdBy
      });
      setTransactionContext(null);
      setTransactionForm(null);
      await loadDetails();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to submit lease action");
    }
  }

  return (
    <AppShell title="Lease 360" subtitle="Master lease profile spanning customer, unit, financial, document, workflow, and audit context.">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#102033_0%,#1b3a60_52%,#2f74ff_130%)] px-6 py-6 text-white md:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <Link href="/leases" className="text-sm text-white/70 transition hover:text-white">
                  ← Back to Leases
                </Link>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <h3 className="text-3xl font-semibold">{lease.leaseNumber}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskTone(riskLabel)}`}>{riskLabel}</span>
                </div>
                <p className="mt-3 text-sm text-white/75">{lease.propertyName} · {lease.towerName} · {lease.totalLeaseUnits || 1} units · {lease.customerName}</p>
                <div className="mt-6 max-w-3xl">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/55">
                    <span>Lease term progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryChip label="Lease Status" value={lease.leaseStatus} />
                <SummaryChip label="Renewal" value={lease.renewalStatus} />
                <SummaryChip label="Days Remaining" value={String(remainingDays)} />
                <SummaryChip label="Portfolio Value" value={formatMoney(annualizedRent, lease.currency)} />
              </div>
            </div>
          </div>
          <div className="px-6 py-5 md:px-8">
            <div className="flex flex-wrap gap-2">
              {primaryActions.map((action) => (
                <button
                  key={action.type}
                  type="button"
                  onClick={() => {
                    setTransactionContext({ lease, actionType: action.type });
                    setTransactionForm(buildTransactionForm(action.type, lease));
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-cloud"
                >
                  {action.label}
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MetricCard label="Lease Units" value={String(lease.totalLeaseUnits || 1)} note={`${formatNumber(lease.totalLeaseArea || 0)} sq.ft`} tone="neutral" />
              <MetricCard label="Monthly Rent" value={formatMoney(totalRent, lease.currency)} note="Consolidated rent" tone="accent" />
              <MetricCard label="Security Deposit" value={formatMoney(totalDeposit, lease.currency)} note="Held deposit" tone="neutral" />
              <MetricCard label="Renewal" value={lease.renewalStatus} note="Renewal signal" tone="warn" />
              <MetricCard label="Version" value={String(lease.versionNumber)} note="Controlled revision" tone="neutral" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-steel">360 Snapshot</p>
                <h3 className="mt-2 text-xl font-semibold text-ink">Commercial, tenant, and space context</h3>
              </div>
              <Badge label={lease.occupancyStatus} />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Lease360Panel title="Tenant" rows={[["Name", lease.customerName], ["Initiator", lease.requestInitiator], ["Payment", lease.paymentStatus]]} />
              <Lease360Panel title="Space" rows={[["Property", lease.propertyName], ["Tower", lease.towerName], ["Units", String(lease.totalLeaseUnits || leaseUnits.length || 1)]]} />
              <Lease360Panel title="Term" rows={[["Start", lease.startDate], ["End", lease.endDate], ["Remaining", `${remainingDays} days`]]} />
              <Lease360Panel title="Financials" rows={[["Rent", formatMoney(totalRent, lease.currency)], ["Deposit", formatMoney(totalDeposit, lease.currency)], ["Annualized", formatMoney(annualizedRent, lease.currency)]]} />
              <Lease360Panel title="Controls" rows={[["Approval", lease.approvalStatus], ["Documents", lease.documentStatus], ["Registration", lease.registrationStatus]]} />
              <Lease360Panel title="Lineage" rows={[["Parent", lease.parentLeaseReference ?? "-"], ["Version", `v${lease.versionNumber}`], ["Created", lease.createdDate.slice(0, 10)]]} />
            </div>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-steel">Lifecycle</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">Operational readiness</h3>
            <div className="mt-6 space-y-3">
              {lifecycleSteps.map((step) => (
                <div key={step.label} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-steel">{step.label}</span>
                  <Badge label={step.value} />
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2 rounded-[22px] bg-slate-50 p-2">
            {detailTabs.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setTab(entry.id)}
                className={["rounded-2xl px-4 py-2 text-sm font-medium transition", tab === entry.id ? "bg-white text-ink shadow-sm" : "text-steel hover:bg-white"].join(" ")}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          {tab === "summary" ? (
            <InfoGrid
              title="Lease Summary"
              rows={[
                ["Lease Number", lease.leaseNumber],
                ["Lease Type", lease.leaseType],
                ["Lease Status", lease.leaseStatus],
                ["Renewal Status", lease.renewalStatus],
                ["Start Date", lease.startDate],
                ["End Date", lease.endDate],
                ["Created By", lease.createdBy],
                ["Created Date", lease.createdDate.slice(0, 10)]
              ]}
            />
          ) : null}
          {tab === "tenant" ? (
            <InfoGrid
              title="Tenant Details"
              rows={[
                ["Tenant", lease.customerName],
                ["Request Initiator", lease.requestInitiator],
                ["Approval Status", lease.approvalStatus],
                ["Document Status", lease.documentStatus],
                ["Payment Status", lease.paymentStatus],
                ["Registration Status", lease.registrationStatus]
              ]}
            />
          ) : null}
          {tab === "property" ? (
            <div className="space-y-6">
              <InfoGrid
                title="Property & Unit Details"
                rows={[
                  ["Property", lease.propertyName],
                  ["Tower", lease.towerName],
                  ["Total Units", String(lease.totalLeaseUnits || leaseUnits.length || 1)],
                  ["Total Area", `${formatNumber(lease.totalLeaseArea || 0)} sq.ft`],
                  ["Occupancy Status", lease.occupancyStatus],
                  ["Parent Lease Reference", lease.parentLeaseReference ?? "-"]
                ]}
              />
              <LeaseUnitBreakdown units={leaseUnits} currency={lease.currency} />
            </div>
          ) : null}
          {tab === "financials" ? (
            <InfoGrid
              title="Financials"
              rows={[
                ["Total Rent", formatMoney(totalRent, lease.currency)],
                ["Total Deposit", formatMoney(totalDeposit, lease.currency)],
                ["Total Charges", formatMoney(lease.totalCharges || 0, lease.currency)],
                ["Currency", lease.currency],
                ["Settlement Status", lease.settlementStatus],
                ["Handover Status", lease.handoverStatus],
                ["Notes", lease.notes ?? "-"]
              ]}
            />
          ) : null}
          {tab === "charges" ? (
            <InfoGrid
              title="Charges & Billing"
              rows={[
                ["Payment Status", lease.paymentStatus],
                ["Document Status", lease.documentStatus],
                ["Approval Status", lease.approvalStatus],
                ["Renewal Status", lease.renewalStatus],
                ["Free Period Start", normalizeDate(lease.freePeriodStart)],
                ["Free Period End", normalizeDate(lease.freePeriodEnd)],
                ["Fit-Out Start", normalizeDate(lease.fitOutPeriodStart)],
                ["Fit-Out End", normalizeDate(lease.fitOutPeriodEnd)]
              ]}
            />
          ) : null}
          {tab === "documents" ? (
            <HistoryTable
              title="Documents"
              subtitle="Document activity follows the master lease and its linked transaction notes."
              items={transactions.map((transaction) => ({
                primary: transaction.transactionNumber,
                secondary: transaction.transactionType,
                meta: `${transaction.transactionStatus} · ${transaction.createdDate.slice(0, 10)}`,
                detail: transaction.notes ?? transaction.reason ?? "Primary lease document pack updated."
              }))}
              emptyMessage="No document-related activity recorded yet."
            />
          ) : null}
          {tab === "renewals" ? <TransactionHistory title="Renewal History" items={renewalHistory} /> : null}
          {tab === "amendments" ? <TransactionHistory title="Amendment History" items={amendmentHistory} /> : null}
          {tab === "revisions" ? <TransactionHistory title="Revision History" items={revisionHistory} /> : null}
          {tab === "workflow" ? <TransactionHistory title="Workflow History" items={transactions} /> : null}
          {tab === "audit" ? (
            <HistoryTable
              title="Audit Trail"
              subtitle="Chronological ledger of lease and transaction events."
              items={[
                {
                  primary: "LEASE_CREATED",
                  secondary: lease.createdBy,
                  meta: lease.createdDate.slice(0, 10),
                  detail: `Lease ${lease.leaseNumber} created at version ${lease.versionNumber}.`
                },
                ...transactions.map((transaction) => ({
                  primary: transaction.transactionType,
                  secondary: transaction.createdBy,
                  meta: transaction.createdDate.slice(0, 10),
                  detail: `${transaction.transactionNumber} moved from v${transaction.previousVersionNumber} to v${transaction.newVersionNumber}.`
                }))
              ]}
              emptyMessage="No audit events available."
            />
          ) : null}
        </section>

        {transactionContext && transactionForm ? (
          <TransactionModal
            actionType={transactionContext.actionType}
            form={transactionForm}
            lease={lease}
            units={units}
            onClose={() => {
              setTransactionContext(null);
              setTransactionForm(null);
            }}
            onFormChange={(updater) => {
              setTransactionForm((current) => {
                const base = current ?? buildTransactionForm(transactionContext.actionType, lease);
                return typeof updater === "function" ? updater(base) : updater;
              });
            }}
            onSubmit={submitTransaction}
          />
        ) : null}
      </div>
    </AppShell>
  );
}

function LeaseFormModal({
  editingLease,
  form,
  formTab,
  properties,
  towers,
  units,
  customers,
  availableUnits,
  selectedUnits,
  unitMode,
  onClose,
  onSubmit,
  onFormChange,
  onTabChange,
  onUnitModeChange,
  onSearchUnits,
  onAddUnit,
  onRemoveUnit
}: Readonly<{
  editingLease: LeaseRecord | null;
  form: LeaseFormState;
  formTab: (typeof leaseFormTabs)[number]["id"];
  properties: PropertyRecord[];
  towers: TowerOption[];
  units: UnitOption[];
  customers: CustomerRecord[];
  availableUnits: AvailableUnitRecord[];
  selectedUnits: AvailableUnitRecord[];
  unitMode: UnitTransactionMode;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onFormChange: React.Dispatch<React.SetStateAction<LeaseFormState>>;
  onTabChange: React.Dispatch<React.SetStateAction<(typeof leaseFormTabs)[number]["id"]>>;
  onUnitModeChange: (mode: UnitTransactionMode) => void;
  onSearchUnits: (unitSearch?: string) => void;
  onAddUnit: (unit: AvailableUnitRecord) => void;
  onRemoveUnit: (unit: AvailableUnitRecord) => void;
}>) {
  const [unitSearch, setUnitSearch] = useState("");
  const propertyOptions = properties.map((property) => ({ value: String(property.id), label: property.propertyName }));
  const availablePropertyOptions = useMemo(() => {
    const propertyMap = new Map<string, string>();
    availableUnits.forEach((unit) => propertyMap.set(String(unit.propertyId), unit.propertyName));
    return Array.from(propertyMap, ([value, label]) => ({ value, label }));
  }, [availableUnits]);
  const towerOptions = towers.map((tower) => ({ value: String(tower.id), label: tower.towerName }));
  const availableTowerOptions = useMemo(() => {
    const towerMap = new Map<string, string>();
    availableUnits
      .filter((unit) => !form.propertyId || String(unit.propertyId) === form.propertyId)
      .forEach((unit) => towerMap.set(String(unit.towerId), unit.towerName));
    return Array.from(towerMap, ([value, label]) => ({ value, label }));
  }, [availableUnits, form.propertyId]);
  const unitOptions = units.map((unit) => ({ value: String(unit.id), label: `${unit.unitCode} · ${unit.unitName}` }));
  const customerOptions = customers.map((customer) => ({ value: String(customer.id), label: customer.customerName }));
  const totals = selectedAvailableUnitTotals(selectedUnits);
  const selectedUnitIds = useMemo(() => new Set(selectedUnits.map((unit) => unit.unitId)), [selectedUnits]);
  const unitMatches = availableUnits
    .filter((unit) => !form.propertyId || String(unit.propertyId) === form.propertyId)
    .filter((unit) => !form.towerId || String(unit.towerId) === form.towerId)
    .filter((unit) => unitSearch.trim().length === 0 || unit.unitNumber.toLowerCase().includes(unitSearch.trim().toLowerCase()))
    .slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-5xl rounded-[28px] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-steel">Lease Workspace</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">{editingLease ? "Edit Lease" : "Create Lease"}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl bg-cloud px-3 py-2 text-sm text-ink">
            Close
          </button>
        </div>
        {!editingLease ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-2">
            <div className="grid gap-2 sm:grid-cols-2">
              {(["SINGLE", "MULTIPLE"] as UnitTransactionMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onUnitModeChange(mode)}
                  className={["rounded-xl px-4 py-3 text-sm font-medium", unitMode === mode ? "bg-white text-accent shadow-sm" : "text-steel hover:bg-white"].join(" ")}
                >
                  {mode === "SINGLE" ? "Single Unit" : "Multiple Units"}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2 rounded-[22px] bg-slate-50 p-2">
          {leaseFormTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={["rounded-2xl px-4 py-2 text-sm font-medium", formTab === tab.id ? "bg-white text-ink shadow-sm" : "text-steel hover:bg-white"].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <form className="mt-6 space-y-6" onSubmit={onSubmit}>
          {formTab === "general" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <InputField label="Lease Number" value={form.leaseNumber} onChange={(value) => onFormChange((current) => ({ ...current, leaseNumber: value }))} />
              <SelectField label="Lease Type" value={form.leaseType} options={toOptions(leaseTypeOptions)} onChange={(value) => onFormChange((current) => ({ ...current, leaseType: value }))} />
              <SelectField label="Property" value={form.propertyId} options={unitMode === "MULTIPLE" && !editingLease ? (availablePropertyOptions.length > 0 ? availablePropertyOptions : propertyOptions) : propertyOptions} onChange={(value) => onFormChange((current) => ({ ...current, propertyId: value, towerId: unitMode === "MULTIPLE" ? "" : current.towerId, unitId: unitMode === "MULTIPLE" ? "" : current.unitId }))} />
              <SelectField label="Customer" value={form.customerId} options={customerOptions} onChange={(value) => onFormChange((current) => ({ ...current, customerId: value }))} />
              <SelectField label="Lease Status" value={form.leaseStatus} options={toOptions(leaseStatusOptions)} onChange={(value) => onFormChange((current) => ({ ...current, leaseStatus: value }))} />
              <SelectField label="Renewal Status" value={form.renewalStatus} options={toOptions(renewalStatusOptions)} onChange={(value) => onFormChange((current) => ({ ...current, renewalStatus: value }))} />
              <SelectField label="Request Initiator" value={form.requestInitiator} options={toOptions(requestInitiatorOptions)} onChange={(value) => onFormChange((current) => ({ ...current, requestInitiator: value }))} />
              <InputField label="Created By" value={form.createdBy} onChange={(value) => onFormChange((current) => ({ ...current, createdBy: value }))} />
            </div>
          ) : null}
          {formTab === "period" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <InputField label="Start Date" type="date" value={form.startDate} onChange={(value) => onFormChange((current) => ({ ...current, startDate: value }))} />
              <InputField label="End Date" type="date" value={form.endDate} onChange={(value) => onFormChange((current) => ({ ...current, endDate: value }))} />
              <InputField label="Rent Amount" type="number" value={form.rentAmount} onChange={(value) => onFormChange((current) => ({ ...current, rentAmount: value }))} />
              <InputField label="Security Deposit" type="number" value={form.securityDeposit} onChange={(value) => onFormChange((current) => ({ ...current, securityDeposit: value }))} />
              <InputField label="Currency" value={form.currency} onChange={(value) => onFormChange((current) => ({ ...current, currency: value }))} />
              <SelectField label="Payment Status" value={form.paymentStatus} options={toOptions(paymentOptions)} onChange={(value) => onFormChange((current) => ({ ...current, paymentStatus: value }))} />
            </div>
          ) : null}
          {formTab === "unit" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {unitMode === "SINGLE" || editingLease ? (
                <>
                  <SelectField label="Tower" value={form.towerId} options={towerOptions} onChange={(value) => onFormChange((current) => ({ ...current, towerId: value }))} />
                  <SelectField label="Unit" value={form.unitId} options={unitOptions} onChange={(value) => onFormChange((current) => ({ ...current, unitId: value }))} />
                </>
              ) : (
                <div className="md:col-span-2 rounded-2xl border border-slate-200">
                  <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-3">
                    <SelectField
                      label="Tower"
                      value={form.towerId}
                      options={availableTowerOptions.length > 0 ? availableTowerOptions : towerOptions}
                      onChange={(value) => {
                        onFormChange((current) => ({ ...current, towerId: value, unitId: "" }));
                        setUnitSearch("");
                        setTimeout(() => onSearchUnits(""), 0);
                      }}
                    />
                    <label className="block text-sm text-ink md:col-span-2">
                      <span className="mb-2 block font-medium">Search Unit</span>
                      <div className="flex gap-2">
                        <input
                          value={unitSearch}
                          onChange={(event) => setUnitSearch(event.target.value)}
                          placeholder="Unit number"
                          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
                        />
                        <button type="button" onClick={() => onSearchUnits(unitSearch)} className="rounded-2xl bg-accent px-4 py-3 text-sm font-medium text-white">
                          Search
                        </button>
                      </div>
                    </label>
                  </div>
                  {unitMatches.length > 0 ? (
                    <div className="border-b border-slate-200 p-4">
                      <div className="grid gap-2 md:grid-cols-2">
                        {unitMatches.map((unit) => (
                          <div key={unit.unitId} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-ink">{unit.unitNumber}</p>
                              <p className="mt-1 text-xs text-steel">{unit.towerName} · Floor {unit.floor} · {unit.area} {unit.areaUnit}</p>
                            </div>
                            <button type="button" disabled={selectedUnitIds.has(unit.unitId)} onClick={() => onAddUnit(unit)} className="rounded-xl bg-accent px-3 py-2 text-xs font-medium text-white disabled:opacity-40">
                              Add Unit
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
                    <SummaryValue label="Total Area" value={`${totals.area.toLocaleString()} sq.ft`} />
                    <SummaryValue label="Total Rent" value={formatMoney(totals.rent, selectedUnits[0]?.currency ?? form.currency)} />
                    <SummaryValue label="Total Deposit" value={formatMoney(totals.deposit, selectedUnits[0]?.currency ?? form.currency)} />
                    <SummaryValue label="Total Charges" value={formatMoney(totals.charges, selectedUnits[0]?.currency ?? form.currency)} />
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="sticky top-0 bg-white text-steel">
                        <tr>{["Unit Number", "Floor", "Area", "Rent", "Deposit", "Charges", "Action"].map((label) => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr>
                      </thead>
                      <tbody>
                        {selectedUnits.length === 0 ? (
                          <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-steel">Search and add units one by one.</td></tr>
                        ) : selectedUnits.map((unit) => (
                          <tr key={unit.unitId} className="border-t border-slate-100">
                            <td className="px-4 py-3 text-ink">{unit.unitNumber}</td>
                            <td className="px-4 py-3 text-steel">{unit.floor}</td>
                            <td className="px-4 py-3 text-steel">{unit.area} {unit.areaUnit}</td>
                            <td className="px-4 py-3 text-steel">{formatMoney(unit.monthlyRent, unit.currency)}</td>
                            <td className="px-4 py-3 text-steel">{formatMoney(unit.securityDeposit, unit.currency)}</td>
                            <td className="px-4 py-3 text-steel">{formatMoney(availableUnitCharges(unit), unit.currency)}</td>
                            <td className="px-4 py-3">
                              <button type="button" onClick={() => onRemoveUnit(unit)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <SelectField label="Occupancy Status" value={form.occupancyStatus} options={toOptions(occupancyOptions)} onChange={(value) => onFormChange((current) => ({ ...current, occupancyStatus: value }))} />
              <SelectField label="Registration Status" value={form.registrationStatus} options={toOptions(registrationOptions)} onChange={(value) => onFormChange((current) => ({ ...current, registrationStatus: value }))} />
              <SelectField label="Handover Status" value={form.handoverStatus} options={toOptions(handoverOptions)} onChange={(value) => onFormChange((current) => ({ ...current, handoverStatus: value }))} />
              <SelectField label="Settlement Status" value={form.settlementStatus} options={toOptions(settlementOptions)} onChange={(value) => onFormChange((current) => ({ ...current, settlementStatus: value }))} />
            </div>
          ) : null}
          {formTab === "fitout" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <InputField label="Free Period Start" type="date" value={form.freePeriodStart} onChange={(value) => onFormChange((current) => ({ ...current, freePeriodStart: value }))} />
              <InputField label="Free Period End" type="date" value={form.freePeriodEnd} onChange={(value) => onFormChange((current) => ({ ...current, freePeriodEnd: value }))} />
              <InputField label="Fit-Out Start" type="date" value={form.fitOutPeriodStart} onChange={(value) => onFormChange((current) => ({ ...current, fitOutPeriodStart: value }))} />
              <InputField label="Fit-Out End" type="date" value={form.fitOutPeriodEnd} onChange={(value) => onFormChange((current) => ({ ...current, fitOutPeriodEnd: value }))} />
              <SelectField label="Approval Status" value={form.approvalStatus} options={toOptions(approvalOptions)} onChange={(value) => onFormChange((current) => ({ ...current, approvalStatus: value }))} />
              <SelectField label="Document Status" value={form.documentStatus} options={toOptions(documentOptions)} onChange={(value) => onFormChange((current) => ({ ...current, documentStatus: value }))} />
              <label className="md:col-span-2 block text-sm text-ink">
                <span className="mb-2 block font-medium">Notes</span>
                <textarea
                  value={form.notes}
                  onChange={(event) => onFormChange((current) => ({ ...current, notes: event.target.value }))}
                  className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
                />
              </label>
            </div>
          ) : null}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-2xl bg-cloud px-5 py-3 text-sm font-medium text-ink">
              Cancel
            </button>
            <button type="submit" className="rounded-2xl bg-accent px-5 py-3 text-sm font-medium text-white">
              Save Lease
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TransactionModal({
  actionType,
  form,
  lease,
  units,
  onClose,
  onFormChange,
  onSubmit
}: Readonly<{
  actionType: string;
  form: TransactionFormState;
  lease: LeaseRecord;
  units: UnitOption[];
  onClose: () => void;
  onFormChange: React.Dispatch<React.SetStateAction<TransactionFormState>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-steel">Lease Action</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">{transactionTitle(actionType)}</h3>
            <p className="mt-2 text-sm text-steel">{lease.leaseNumber} · {lease.customerName} · {lease.unitCode}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl bg-cloud px-3 py-2 text-sm text-ink">
            Close
          </button>
        </div>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <SelectField label="Transaction Status" value={form.transactionStatus} options={toOptions(transactionStatusOptions)} onChange={(value) => onFormChange((current) => ({ ...current, transactionStatus: value }))} />
          <InputField label="Created By" value={form.createdBy} onChange={(value) => onFormChange((current) => ({ ...current, createdBy: value }))} />
          <InputField label="Effective Start Date" type="date" value={form.effectiveStartDate} onChange={(value) => onFormChange((current) => ({ ...current, effectiveStartDate: value }))} />
          <InputField label="Effective End Date" type="date" value={form.effectiveEndDate} onChange={(value) => onFormChange((current) => ({ ...current, effectiveEndDate: value }))} />
          <InputField label="Revised Rent" type="number" value={form.revisedRentAmount} onChange={(value) => onFormChange((current) => ({ ...current, revisedRentAmount: value }))} />
          <InputField label="Revised Security Deposit" type="number" value={form.revisedSecurityDeposit} onChange={(value) => onFormChange((current) => ({ ...current, revisedSecurityDeposit: value }))} />
          {actionType === "TRANSFER" ? (
            <SelectField label="Target Unit" value={form.targetUnitId} options={units.map((unit) => ({ value: String(unit.id), label: `${unit.unitCode} · ${unit.unitName}` }))} onChange={(value) => onFormChange((current) => ({ ...current, targetUnitId: value }))} />
          ) : null}
          <InputField label="Reason" value={form.reason} onChange={(value) => onFormChange((current) => ({ ...current, reason: value }))} />
          <label className="md:col-span-2 block text-sm text-ink">
            <span className="mb-2 block font-medium">Notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => onFormChange((current) => ({ ...current, notes: event.target.value }))}
              className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
            />
          </label>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-2xl bg-cloud px-5 py-3 text-sm font-medium text-ink">
              Cancel
            </button>
            <button type="submit" className="rounded-2xl bg-accent px-5 py-3 text-sm font-medium text-white">
              Submit Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({
  label,
  type = "text",
  value,
  onChange
}: Readonly<{
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}>) {
  return (
    <label className="block text-sm text-ink">
      <span className="mb-2 block font-medium">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-accent focus:bg-white" />
    </label>
  );
}

function SummaryValue({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-steel">{label}</p>
      <p className="mt-1 font-medium text-ink">{value}</p>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange
}: Readonly<{
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}>) {
  return (
    <label className="block text-sm text-ink">
      <span className="mb-2 block font-medium">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-accent focus:bg-white">
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Lease360Panel({ title, rows }: Readonly<{ title: string; rows: string[][] }>) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-steel">{title}</p>
      <div className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <span className="text-xs text-steel">{label}</span>
            <span className="max-w-[70%] text-right text-sm font-medium text-ink">{value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function InfoGrid({ title, rows }: Readonly<{ title: string; rows: string[][] }>) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.24em] text-steel">Lease Details</p>
      <h3 className="mt-2 text-xl font-semibold text-ink">{title}</h3>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {rows.map(([label, value]) => (
          <article key={label} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-steel">{label}</p>
            <p className="mt-2 text-sm font-medium text-ink">{value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function LeaseUnitBreakdown({ units, currency }: Readonly<{ units: LeaseUnitRecord[]; currency: string }>) {
  if (units.length === 0) {
    return (
      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm text-steel">
        No lease unit breakdown is recorded for this lease.
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.24em] text-steel">Lease Units</p>
      <h3 className="mt-2 text-xl font-semibold text-ink">Unit Breakdown</h3>
      <div className="mt-6 overflow-hidden rounded-[22px] border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-steel">
            <tr>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium">Area</th>
              <th className="px-4 py-3 font-medium">Rent</th>
              <th className="px-4 py-3 font-medium">Charges</th>
              <th className="px-4 py-3 font-medium">Deposit</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {units.map((unit) => (
              <tr key={unit.id}>
                <td className="px-4 py-3 font-medium text-ink">{unit.unitNumber}</td>
                <td className="px-4 py-3 text-steel">{formatNumber(unit.area)} sq.ft</td>
                <td className="px-4 py-3 text-steel">{formatMoney(unit.rent, currency)}</td>
                <td className="px-4 py-3 text-steel">{formatMoney(unit.additionalCharges, currency)}</td>
                <td className="px-4 py-3 text-steel">{formatMoney(unit.deposit, currency)}</td>
                <td className="px-4 py-3"><Badge label={unit.unitLeaseStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransactionHistory({ title, items }: Readonly<{ title: string; items: LeaseTransactionRecord[] }>) {
  return (
    <HistoryTable
      title={title}
      subtitle="Linked child transactions stay anchored to the master lease and preserve version continuity."
      items={items.map((transaction) => ({
        primary: transaction.transactionNumber,
        secondary: transaction.transactionType,
        meta: `${transaction.transactionStatus} · ${transaction.createdDate.slice(0, 10)}`,
        detail: `${transaction.reason ?? "No reason provided"} · v${transaction.previousVersionNumber} → v${transaction.newVersionNumber}`
      }))}
      emptyMessage="No transactions recorded for this history bucket."
    />
  );
}

function HistoryTable({
  title,
  subtitle,
  items,
  emptyMessage
}: Readonly<{
  title: string;
  subtitle: string;
  items: Array<{ primary: string; secondary: string; meta: string; detail: string }>;
  emptyMessage: string;
}>) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.24em] text-steel">History</p>
      <h3 className="mt-2 text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-steel">{subtitle}</p>
      <div className="mt-6 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl bg-cloud p-4 text-sm text-steel">{emptyMessage}</div>
        ) : (
          items.map((item) => (
            <article key={`${item.primary}-${item.meta}`} className="rounded-[22px] border border-slate-200 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-ink">{item.primary}</p>
                  <p className="text-sm text-steel">{item.secondary}</p>
                </div>
                <span className="rounded-full bg-cloud px-3 py-1 text-xs font-medium text-ink">{item.meta}</span>
              </div>
              <p className="mt-3 text-sm text-steel">{item.detail}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  tone
}: Readonly<{
  label: string;
  value: string;
  note: string;
  tone: Tone;
}>) {
  const toneClass = tone === "accent" ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100" : tone === "warn" ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100" : "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-steel">{label}</p>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${toneClass}`}>{note}</span>
      </div>
      <p className="mt-5 text-3xl font-semibold text-ink">{value}</p>
    </article>
  );
}

function Badge({ label }: Readonly<{ label: string }>) {
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeTone(label)}`}>{label}</span>;
}

function SummaryChip({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <article className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </article>
  );
}

function FocusLine({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-steel">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}
