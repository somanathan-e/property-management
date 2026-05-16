"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/layouts/app-shell";
import { apiGet, apiPost, apiPut } from "@/services/api";
import type { PagedResult } from "@/types/api";
import type { AvailableUnitRecord, CustomerRecord, LeaseRecord, LeaseTransactionRecord, LeaseUnitRecord, PropertyRecord, UnitAvailabilityRecord, UnitRecord } from "@/types/entities";

type Option = {
  label: string;
  value: string;
};

type Tone = "accent" | "warn" | "neutral";
type PropertySummary = {
  propertyId: number;
  propertyName: string;
  totalUnits: number;
  occupied: number;
  vacant: number;
  activeLeases: number;
  expiringSoon: number;
  pendingRenewals: number;
  pendingApprovals: number;
  totalRent: number;
  currency: string;
  occupancyPercent: number;
};

type TowerLeaseGroup = {
  towerId: number;
  towerName: string;
  leases: LeaseRecord[];
};

type PropertyLeaseGroup = PropertySummary & {
  leases: LeaseRecord[];
  towers: TowerLeaseGroup[];
};

type TowerOption = {
  id: number;
  propertyId: number;
  towerName: string;
  towerCode: string;
};

type UnitOption = {
  id: number;
  propertyId: number;
  unitName: string;
  unitCode: string;
  unitType: string;
  occupancyStatus: string;
  towerCode: string;
  towerId: number;
};

type LeaseFormState = Record<string, string>;
type TransactionFormState = Record<string, string>;
type UnitTransactionMode = "SINGLE" | "MULTIPLE";
type RentFrequency = "MONTHLY" | "ANNUAL";
type SelectedAvailableUnit = AvailableUnitRecord & {
  rentFrequency: RentFrequency;
  benchmarkRent: number;
  negotiatedRent: number;
};
type UnitSearchFilters = {
  query: string;
  propertyId: string;
  towerId: string;
  startDate: string;
  endDate: string;
  floor: string;
  unitType: string;
  minArea: string;
  maxArea: string;
  minRent: string;
  maxRent: string;
};

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
    rentFrequency: "MONTHLY",
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

function firstMissingField(form: Record<string, string>, fields: { name: string; label: string }[]) {
  return fields.find((field) => !String(form[field.name] ?? "").trim())?.label ?? null;
}

function isDateAfter(left: string, right: string) {
  return Boolean(left && right && left > right);
}

function availableUnitRent(unit: AvailableUnitRecord, rentFrequency: string) {
  return rentFrequency === "ANNUAL" ? unit.monthlyRent * 12 : unit.monthlyRent;
}

function buildSelectedLeaseUnit(unit: AvailableUnitRecord, rentFrequency: RentFrequency = "MONTHLY"): SelectedAvailableUnit {
  const benchmarkRent = availableUnitRent(unit, rentFrequency);
  return {
    ...unit,
    rentFrequency,
    benchmarkRent,
    negotiatedRent: benchmarkRent
  };
}

function availableUnitCharges(unit: AvailableUnitRecord) {
  return unit.maintenanceCharges + unit.camCharges + unit.parkingCharges + Math.round(unit.monthlyRent * 0.05);
}

function leaseUnitVarianceAmount(unit: SelectedAvailableUnit) {
  return unit.negotiatedRent - unit.benchmarkRent;
}

function leaseUnitVariancePercent(unit: SelectedAvailableUnit) {
  return unit.benchmarkRent > 0 ? (leaseUnitVarianceAmount(unit) / unit.benchmarkRent) * 100 : 0;
}

function selectedAvailableUnitTotals(units: SelectedAvailableUnit[]) {
  return units.reduce(
    (totals, unit) => ({
      count: totals.count + 1,
      area: totals.area + unit.area,
      benchmarkRent: totals.benchmarkRent + unit.benchmarkRent,
      negotiatedRent: totals.negotiatedRent + unit.negotiatedRent,
      varianceAmount: totals.varianceAmount + leaseUnitVarianceAmount(unit),
      deposit: totals.deposit + unit.securityDeposit,
      charges: totals.charges + availableUnitCharges(unit)
    }),
    { count: 0, area: 0, benchmarkRent: 0, negotiatedRent: 0, varianceAmount: 0, deposit: 0, charges: 0 }
  );
}

function averageLeaseVariancePercent(units: SelectedAvailableUnit[]) {
  if (units.length === 0) {
    return 0;
  }
  return units.reduce((sum, unit) => sum + leaseUnitVariancePercent(unit), 0) / units.length;
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

function leaseRent(lease: LeaseRecord) {
  return lease.totalRent || lease.rentAmount;
}

function leaseUnitCount(lease: LeaseRecord) {
  return Math.max(lease.totalLeaseUnits || 1, 1);
}

function summarizeProperty(leases: LeaseRecord[], inventoryUnits: UnitRecord[] = []): PropertySummary {
  const firstLease = leases[0];
  const totalUnits = inventoryUnits.length;
  const occupied = inventoryUnits.filter((unit) => unit.occupancyStatus === "OCCUPIED").length;
  const vacant = Math.max(totalUnits - occupied, 0);
  const activeLeases = leases.filter((lease) => lease.leaseStatus === "ACTIVE").length;
  const expiringSoon = leases.filter((lease) => daysTo(lease.endDate) <= 60).length;
  const pendingRenewals = leases.filter((lease) => ["DUE_SOON", "UNDER_REVIEW"].includes(lease.renewalStatus)).length;
  const pendingApprovals = leases.filter((lease) => lease.approvalStatus !== "APPROVED").length;
  const totalRent = leases.reduce((sum, lease) => sum + leaseRent(lease), 0);
  return {
    propertyId: firstLease?.propertyId ?? 0,
    propertyName: firstLease?.propertyName ?? "Unassigned Property",
    totalUnits,
    occupied,
    vacant,
    activeLeases,
    expiringSoon,
    pendingRenewals,
    pendingApprovals,
    totalRent,
    currency: firstLease?.currency ?? "AED",
    occupancyPercent: totalUnits > 0 ? clampPercent((occupied / totalUnits) * 100) : 0
  };
}

function buildPropertyLeaseGroups(leases: LeaseRecord[], units: UnitRecord[] = []): PropertyLeaseGroup[] {
  const grouped = new Map<number, LeaseRecord[]>();
  leases.forEach((lease) => {
    const propertyLeases = grouped.get(lease.propertyId) ?? [];
    propertyLeases.push(lease);
    grouped.set(lease.propertyId, propertyLeases);
  });
  return Array.from(grouped.values())
    .map((propertyLeases) => {
      const towerMap = new Map<number, LeaseRecord[]>();
      propertyLeases.forEach((lease) => {
        const towerLeases = towerMap.get(lease.towerId) ?? [];
        towerLeases.push(lease);
        towerMap.set(lease.towerId, towerLeases);
      });
      const summary = summarizeProperty(propertyLeases, units.filter((unit) => unit.propertyId === propertyLeases[0]?.propertyId));
      return {
        ...summary,
        leases: propertyLeases,
        towers: Array.from(towerMap.values()).map((towerLeases) => ({
          towerId: towerLeases[0]?.towerId ?? 0,
          towerName: towerLeases[0]?.towerName ?? "Unassigned Tower",
          leases: towerLeases
        }))
      };
    })
    .sort((left, right) => left.propertyName.localeCompare(right.propertyName));
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
  const [propertyNavSearch, setPropertyNavSearch] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [collapsedProperties, setCollapsedProperties] = useState<Record<number, boolean>>({});
  const [propertySidebarOpen, setPropertySidebarOpen] = useState(false);
  const [leaseStatus, setLeaseStatus] = useState("");
  const [renewalStatus, setRenewalStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [leaseModalOpen, setLeaseModalOpen] = useState(false);
  const [unitSelectorOpen, setUnitSelectorOpen] = useState(false);
  const [editingLease, setEditingLease] = useState<LeaseRecord | null>(null);
  const [leaseForm, setLeaseForm] = useState<LeaseFormState>(() => buildLeaseForm(null));
  const [leaseFormTab, setLeaseFormTab] = useState<(typeof leaseFormTabs)[number]["id"]>("general");
  const [leaseUnitMode, setLeaseUnitMode] = useState<UnitTransactionMode>("SINGLE");
  const [availableLeaseUnits, setAvailableLeaseUnits] = useState<AvailableUnitRecord[]>([]);
  const [selectedLeaseUnits, setSelectedLeaseUnits] = useState<SelectedAvailableUnit[]>([]);
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
  const [units, setUnits] = useState<UnitRecord[]>([]);
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

  async function searchLeaseUnitsForForm(filters?: Partial<UnitSearchFilters>) {
    try {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("size", "100");
      const startDate = filters?.startDate || leaseForm.startDate || new Date().toISOString().slice(0, 10);
      const endDate = filters?.endDate || leaseForm.endDate || startDate;
      params.set("startDate", startDate);
      params.set("endDate", endDate);
      const propertyId = filters?.propertyId ?? leaseForm.propertyId;
      if (propertyId) {
        params.set("propertyId", propertyId);
      }
      const towerId = filters?.towerId ?? leaseForm.towerId;
      if (towerId) {
        params.set("towerId", towerId);
      }
      if (filters?.query?.trim()) {
        params.set("unitSearch", filters.query.trim());
      }
      if (filters?.floor?.trim()) {
        params.set("floor", filters.floor.trim());
      }
      if (filters?.unitType) {
        params.set("unitType", filters.unitType);
      }
      if (filters?.minArea) {
        params.set("minArea", filters.minArea);
      }
      if (filters?.maxArea) {
        params.set("maxArea", filters.maxArea);
      }
      if (filters?.minRent) {
        params.set("minRent", filters.minRent);
      }
      if (filters?.maxRent) {
        params.set("maxRent", filters.maxRent);
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
      apiGet<PagedResult<UnitRecord>>("/units?size=100"),
      apiGet<PagedResult<CustomerRecord>>("/customers?size=100")
    ]).then(([propertyData, towerData, unitData, customerData]) => {
      setProperties(propertyData.items);
      setTowers(towerData.items);
      setUnits(unitData.items);
      setCustomers(customerData.items);
    });
  }, []);

  const kpis = useMemo(() => {
    const expiring30 = records.filter((record) => daysTo(record.endDate) <= 30).length;
    const expiring60 = records.filter((record) => daysTo(record.endDate) <= 60).length;
    const active = records.filter((record) => record.leaseStatus === "ACTIVE").length;
    const vacant = units.filter((unit) => unit.occupancyStatus === "VACANT").length;
    const pendingApprovals = records.filter((record) => record.approvalStatus !== "APPROVED").length;
    const revenue = records.reduce((sum, record) => sum + leaseRent(record), 0);
    return [
      { label: "Properties", value: String(new Set(records.map((record) => record.propertyId)).size), note: "Grouped portfolios", tone: "neutral" as Tone },
      { label: "Active Leases", value: String(active), note: "Live contractual occupancy", tone: "accent" as Tone },
      { label: "Vacant Units", value: String(vacant), note: "Space requiring action", tone: "warn" as Tone },
      { label: "Expiring 30/60 Days", value: `${expiring30}/${expiring60}`, note: "Near-term watchlist", tone: "warn" as Tone },
      { label: "Pending Approvals", value: String(pendingApprovals), note: "Approval queue", tone: "accent" as Tone },
      { label: "Revenue", value: formatMoney(revenue, records[0]?.currency ?? "AED"), note: "Current page rent", tone: "neutral" as Tone }
    ];
  }, [records, units]);

  const propertyGroups = useMemo(() => buildPropertyLeaseGroups(records, units), [records, units]);
  const visiblePropertyGroups = useMemo(() => {
    const navQuery = propertyNavSearch.trim().toLowerCase();
    return propertyGroups.filter((group) => {
      const matchesSelected = selectedPropertyId ? group.propertyId === selectedPropertyId : true;
      const matchesQuery = navQuery ? group.propertyName.toLowerCase().includes(navQuery) : true;
      return matchesSelected && matchesQuery;
    });
  }, [propertyGroups, propertyNavSearch, selectedPropertyId]);

  const portfolioSummary = useMemo(() => {
    const summaries = propertyGroups.map((group) => summarizeProperty(group.leases, units.filter((unit) => unit.propertyId === group.propertyId)));
    const totalRent = summaries.reduce((sum, summary) => sum + summary.totalRent, 0);
    return {
      totalRent,
      properties: summaries.length,
      currency: summaries[0]?.currency ?? "AED"
    };
  }, [propertyGroups, units]);

  function focusProperty(propertyId: number) {
    setSelectedPropertyId((current) => (current === propertyId ? null : propertyId));
    window.requestAnimationFrame(() => {
      document.getElementById(`lease-property-${propertyId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

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
    setError(null);
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
    if (selectedLeaseUnits.length > 0 && unit.currency !== selectedLeaseUnits[0].currency) {
      setError("Selected units must use the lease currency.");
      return;
    }
    const selectedUnit = buildSelectedLeaseUnit(unit);
    setSelectedLeaseUnits((current) => {
      const nextUnits = [...current, selectedUnit];
      const totals = selectedAvailableUnitTotals(nextUnits);
      setLeaseForm((form) => ({
        ...form,
        propertyId: String(nextUnits[0].propertyId),
        towerId: form.towerId || String(nextUnits[0].towerId),
        unitId: String(nextUnits[0].unitId),
        rentAmount: String(totals.negotiatedRent),
        securityDeposit: String(totals.deposit),
        currency: nextUnits[0].currency
      }));
      return nextUnits;
    });
  }

  function removeLeaseUnit(unit: Pick<AvailableUnitRecord, "unitId">) {
    setSelectedLeaseUnits((current) => {
      const nextUnits = current.filter((item) => item.unitId !== unit.unitId);
      const totals = selectedAvailableUnitTotals(nextUnits);
      setLeaseForm((form) => ({
        ...form,
        unitId: nextUnits[0] ? String(nextUnits[0].unitId) : "",
        propertyId: nextUnits[0] ? String(nextUnits[0].propertyId) : form.propertyId,
        towerId: nextUnits[0] ? String(nextUnits[0].towerId) : form.towerId,
        rentAmount: nextUnits.length > 0 ? String(totals.negotiatedRent) : "",
        securityDeposit: nextUnits.length > 0 ? String(totals.deposit) : "",
        currency: nextUnits[0]?.currency ?? form.currency
      }));
      return nextUnits;
    });
  }

  function updateLeaseUnit(unitId: number, changes: Partial<Pick<SelectedAvailableUnit, "rentFrequency" | "negotiatedRent">>) {
    setSelectedLeaseUnits((current) => {
      const nextUnits = current.map((unit) => {
        if (unit.unitId !== unitId) {
          return unit;
        }
        const rentFrequency = changes.rentFrequency ?? unit.rentFrequency;
        const benchmarkRent = availableUnitRent(unit, rentFrequency);
        const negotiatedRent = changes.negotiatedRent ?? (changes.rentFrequency ? benchmarkRent : unit.negotiatedRent);
        return {
          ...unit,
          rentFrequency,
          benchmarkRent,
          negotiatedRent
        };
      });
      const totals = selectedAvailableUnitTotals(nextUnits);
      setLeaseForm((form) => ({
        ...form,
        rentAmount: nextUnits.length > 0 ? String(totals.negotiatedRent) : "",
        securityDeposit: nextUnits.length > 0 ? String(totals.deposit) : ""
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
    const missingField = firstMissingField(leaseForm, [
      { name: "leaseNumber", label: "Lease Number" },
      { name: "leaseType", label: "Lease Type" },
      { name: "propertyId", label: "Property" },
      { name: "customerId", label: "Customer" },
      { name: "leaseStatus", label: "Lease Status" },
      { name: "renewalStatus", label: "Renewal Status" },
      { name: "requestInitiator", label: "Request Initiator" },
      { name: "createdBy", label: "Created By" },
      { name: "startDate", label: "Start Date" },
      { name: "endDate", label: "End Date" },
      { name: "currency", label: "Currency" },
      { name: "paymentStatus", label: "Payment Status" },
      { name: "occupancyStatus", label: "Occupancy Status" },
      { name: "registrationStatus", label: "Registration Status" },
      { name: "handoverStatus", label: "Handover Status" },
      { name: "settlementStatus", label: "Settlement Status" },
      { name: "approvalStatus", label: "Approval Status" },
      { name: "documentStatus", label: "Document Status" }
    ]);
    if (missingField) {
      setError(`${missingField} is required.`);
      return;
    }
    if (isDateAfter(leaseForm.startDate, leaseForm.endDate)) {
      setError("Lease start date cannot be after lease end date.");
      setLeaseFormTab("period");
      return;
    }
    if (isDateAfter(leaseForm.fitOutPeriodStart, leaseForm.fitOutPeriodEnd)) {
      setError("Fit-out start date cannot be after fit-out end date.");
      setLeaseFormTab("period");
      return;
    }
    if (leaseForm.fitOutPeriodStart && isDateAfter(leaseForm.fitOutPeriodStart, leaseForm.startDate)) {
      setError("Fit-out must start before the lease start date.");
      setLeaseFormTab("period");
      return;
    }
    if (leaseForm.fitOutPeriodEnd && isDateAfter(leaseForm.fitOutPeriodEnd, leaseForm.startDate)) {
      setError("Fit-out must end before the lease start date.");
      setLeaseFormTab("period");
      return;
    }
    if (isDateAfter(leaseForm.freePeriodStart, leaseForm.freePeriodEnd)) {
      setError("Free period start date cannot be after free period end date.");
      setLeaseFormTab("period");
      return;
    }
    if (leaseForm.freePeriodStart && (isDateAfter(leaseForm.startDate, leaseForm.freePeriodStart) || isDateAfter(leaseForm.freePeriodStart, leaseForm.endDate))) {
      setError("Free period must be within the lease duration.");
      setLeaseFormTab("period");
      return;
    }
    if (leaseForm.freePeriodEnd && (isDateAfter(leaseForm.startDate, leaseForm.freePeriodEnd) || isDateAfter(leaseForm.freePeriodEnd, leaseForm.endDate))) {
      setError("Free period must be within the lease duration.");
      setLeaseFormTab("period");
      return;
    }
    const unitsForPayload = selectedLeaseUnits;
    const hasSelectedUnits = unitsForPayload.length > 0;
    if (!editingLease && !hasSelectedUnits) {
      setError("Select at least one available unit for the lease.");
      return;
    }
    if (hasSelectedUnits && new Set(unitsForPayload.map((unit) => unit.unitId)).size !== unitsForPayload.length) {
      setError("Duplicate units are not allowed in the same lease.");
      return;
    }
    if (hasSelectedUnits && unitsForPayload.some((unit) => unit.availabilityStatus !== "AVAILABLE")) {
      setError("Inactive, reserved, or unavailable units cannot be selected.");
      return;
    }
    if (hasSelectedUnits && new Set(unitsForPayload.map((unit) => unit.propertyId)).size > 1) {
      setError("Lease units must belong to one property only.");
      return;
    }
    if (hasSelectedUnits && new Set(unitsForPayload.map((unit) => unit.currency)).size > 1) {
      setError("Lease units must use one currency only.");
      return;
    }
    if (hasSelectedUnits && unitsForPayload.some((unit) => unit.negotiatedRent < 0)) {
      setError("Negotiated rent cannot be negative.");
      return;
    }
    const primaryUnit = unitsForPayload[0];
    const selectedTotals = selectedAvailableUnitTotals(unitsForPayload);
    try {
      const payload = {
        leaseNumber: leaseForm.leaseNumber,
        propertyId: hasSelectedUnits ? primaryUnit.propertyId : Number(leaseForm.propertyId),
        towerId: hasSelectedUnits ? primaryUnit.towerId : Number(leaseForm.towerId),
        unitId: hasSelectedUnits ? primaryUnit.unitId : Number(leaseForm.unitId),
        customerId: Number(leaseForm.customerId),
        leaseType: leaseForm.leaseType,
        leaseStatus: leaseForm.leaseStatus,
        occupancyStatus: leaseForm.occupancyStatus,
        currency: leaseForm.currency,
        rentAmount: hasSelectedUnits ? selectedTotals.negotiatedRent : Number(leaseForm.rentAmount),
        securityDeposit: hasSelectedUnits ? selectedTotals.deposit : Number(leaseForm.securityDeposit),
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
        units: hasSelectedUnits
          ? unitsForPayload.map((unit) => ({
              propertyId: unit.propertyId,
              unitId: unit.unitId,
              unitNumber: unit.unitNumber,
              area: unit.area,
              rent: unit.negotiatedRent,
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
    const missingField = firstMissingField(transactionForm, [
      { name: "transactionStatus", label: "Transaction Status" },
      { name: "createdBy", label: "Created By" },
      { name: "effectiveStartDate", label: "Effective Start Date" },
      { name: "effectiveEndDate", label: "Effective End Date" },
      { name: "reason", label: "Reason" }
    ]);
    if (missingField) {
      setError(`${missingField} is required.`);
      return;
    }
    if (transactionContext.actionType === "TRANSFER" && !transactionForm.targetUnitId) {
      setError("Target Unit is required.");
      return;
    }
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
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 md:px-8 lg:grid-cols-3 xl:grid-cols-6">
            {kpis.map((card) => (
              <MetricCard key={card.label} label={card.label} value={card.value} note={card.note} tone={card.tone} />
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-steel">Lease Workspace</p>
              <h4 className="mt-2 text-2xl font-semibold text-ink">Property-wise lease lifecycle hierarchy</h4>
              <p className="mt-2 text-sm text-steel">
                Renewal, amendment, extension, rent revision, suspension, termination, cancellation, and transfer stay linked to each master lease.
              </p>
            </div>
            <button type="button" onClick={openCreateLease} className="rounded-2xl bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm shadow-blue-300/40">
              Create Lease
            </button>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search lease, tenant, property, or unit"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-white xl:col-span-2"
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
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            {selectedPropertyId ? (
              <button type="button" onClick={() => setSelectedPropertyId(null)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-ink hover:bg-cloud">
                Clear property focus
              </button>
            ) : null}
          </div>
          {message ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        </section>

        <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-6 xl:self-start">
            <button
              type="button"
              onClick={() => setPropertySidebarOpen((value) => !value)}
              className="mb-3 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-ink shadow-sm xl:hidden"
            >
              <span>Property Summary</span>
              <span className="text-xs font-medium text-steel">{propertySidebarOpen ? "Hide" : "Show"}</span>
            </button>
            <div className={`${propertySidebarOpen ? "block" : "hidden"} rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm xl:block`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-steel">Properties</p>
                  <h4 className="mt-2 text-lg font-semibold text-ink">Summary Navigation</h4>
                </div>
                <span className="rounded-full bg-cloud px-3 py-1 text-xs font-medium text-steel">{portfolioSummary.properties}</span>
              </div>
              <input
                value={propertyNavSearch}
                onChange={(event) => setPropertyNavSearch(event.target.value)}
                placeholder="Filter properties"
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-white"
              />
              <div className="mt-4 max-h-[calc(100vh-220px)] space-y-3 overflow-y-auto pr-1">
                {propertyGroups
                  .filter((group) => group.propertyName.toLowerCase().includes(propertyNavSearch.trim().toLowerCase()))
                  .map((group) => (
                    <button
                      key={group.propertyId}
                      type="button"
                      onClick={() => focusProperty(group.propertyId)}
                      className={`w-full rounded-2xl border p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40 ${
                        selectedPropertyId === group.propertyId ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">{group.propertyName}</p>
                          <p className="mt-1 text-xs text-steel">{group.occupancyPercent}% occupied</p>
                        </div>
                        <Badge label={`${group.expiringSoon} exp`} />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-steel">
                        <span>Active: <strong className="text-ink">{group.activeLeases}</strong></span>
                        <span>Vacant: <strong className="text-ink">{group.vacant}</strong></span>
                        <span>Units: <strong className="text-ink">{group.totalUnits}</strong></span>
                        <span>Rent: <strong className="text-ink">{formatMoney(group.totalRent, group.currency)}</strong></span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${group.occupancyPercent}%` }} />
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </aside>

          <div className="space-y-5 min-w-0">
            <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-steel">Grouped Workspace</p>
                <h4 className="mt-2 text-xl font-semibold text-ink">Flat property-level lease list</h4>
              </div>
            </div>
            <div className="mt-5 space-y-5">
              {loading ? (
                <p className="rounded-2xl border border-slate-200 p-6 text-sm text-steel">Loading leases...</p>
              ) : visiblePropertyGroups.length === 0 ? (
                <div className="rounded-2xl bg-cloud p-6 text-sm text-steel">No leases matched the current search and filters.</div>
              ) : (
                visiblePropertyGroups.map((group) => {
                  const collapsed = collapsedProperties[group.propertyId] ?? false;
                  return (
                    <article key={group.propertyId} id={`lease-property-${group.propertyId}`} className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <div className="border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur lg:sticky lg:top-0 lg:z-10 sm:px-5">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                          <button
                            type="button"
                            onClick={() => setCollapsedProperties((current) => ({ ...current, [group.propertyId]: !collapsed }))}
                            className="min-w-0 text-left"
                          >
                            <p className="text-xs uppercase tracking-[0.2em] text-steel">{collapsed ? "Expand" : "Collapse"} Property</p>
                            <h5 className="mt-1 break-words text-lg font-semibold text-ink">{group.propertyName}</h5>
                          </button>
                          <div className="grid w-full min-w-0 grid-cols-2 gap-2 text-xs sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                            <PropertyStat label="Units" value={String(group.totalUnits)} />
                            <PropertyStat label="Occupied" value={String(group.occupied)} />
                            <PropertyStat label="Vacant" value={String(group.vacant)} />
                            <PropertyStat label="Active" value={String(group.activeLeases)} />
                            <PropertyStat label="Expiring" value={String(group.expiringSoon)} />
                            <PropertyStat label="Renewals" value={String(group.pendingRenewals)} />
                            <PropertyStat label="Rent" value={formatMoney(group.totalRent, group.currency)} />
                          </div>
                        </div>
                      </div>
                      {collapsed ? null : (
                        <div className="grid gap-4 bg-slate-50/60 p-3 sm:p-4 lg:p-5">
                          {group.leases.map((lease, index) => (
                            <LeaseHierarchyRow key={lease.id} lease={lease} zebra={index % 2 === 1} onAction={handleLeaseAction} onEdit={openEditLease} />
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
            <div className="mt-5 flex flex-col gap-3 text-sm text-steel sm:flex-row sm:items-center sm:justify-between">
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
            unitSelectorOpen={unitSelectorOpen}
            unitMode={leaseUnitMode}
            onClose={() => {
              setLeaseModalOpen(false);
              setUnitSelectorOpen(false);
              setLeaseUnitMode("SINGLE");
              setSelectedLeaseUnits([]);
            }}
            onSubmit={submitLease}
            onFormChange={setLeaseForm}
            onTabChange={setLeaseFormTab}
            onUnitSelectorOpen={setUnitSelectorOpen}
            onUnitModeChange={(mode) => {
              setLeaseUnitMode(mode);
              if (mode === "SINGLE") {
                setSelectedLeaseUnits([]);
              } else {
                void searchLeaseUnitsForForm({});
              }
            }}
            onSearchUnits={searchLeaseUnitsForForm}
            onAddUnit={addLeaseUnit}
            onRemoveUnit={removeLeaseUnit}
            onUpdateUnit={updateLeaseUnit}
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
    const missingField = firstMissingField(transactionForm, [
      { name: "transactionStatus", label: "Transaction Status" },
      { name: "createdBy", label: "Created By" },
      { name: "effectiveStartDate", label: "Effective Start Date" },
      { name: "effectiveEndDate", label: "Effective End Date" },
      { name: "reason", label: "Reason" }
    ]);
    if (missingField) {
      setError(`${missingField} is required.`);
      return;
    }
    if (transactionContext.actionType === "TRANSFER" && !transactionForm.targetUnitId) {
      setError("Target Unit is required.");
      return;
    }
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
  unitSelectorOpen,
  unitMode,
  onClose,
  onSubmit,
  onFormChange,
  onTabChange,
  onUnitSelectorOpen,
  onUnitModeChange,
  onSearchUnits,
  onAddUnit,
  onRemoveUnit,
  onUpdateUnit
}: Readonly<{
  editingLease: LeaseRecord | null;
  form: LeaseFormState;
  formTab: (typeof leaseFormTabs)[number]["id"];
  properties: PropertyRecord[];
  towers: TowerOption[];
  units: UnitOption[];
  customers: CustomerRecord[];
  availableUnits: AvailableUnitRecord[];
  selectedUnits: SelectedAvailableUnit[];
  unitSelectorOpen: boolean;
  unitMode: UnitTransactionMode;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onFormChange: React.Dispatch<React.SetStateAction<LeaseFormState>>;
  onTabChange: React.Dispatch<React.SetStateAction<(typeof leaseFormTabs)[number]["id"]>>;
  onUnitSelectorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onUnitModeChange: (mode: UnitTransactionMode) => void;
  onSearchUnits: (filters?: Partial<UnitSearchFilters>) => void;
  onAddUnit: (unit: AvailableUnitRecord) => void;
  onRemoveUnit: (unit: Pick<AvailableUnitRecord, "unitId">) => void;
  onUpdateUnit: (unitId: number, changes: Partial<Pick<SelectedAvailableUnit, "rentFrequency" | "negotiatedRent">>) => void;
}>) {
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
  const customerOptions = customers.map((customer) => ({ value: String(customer.id), label: customer.customerName }));
  const totals = selectedAvailableUnitTotals(selectedUnits);
  const averageVariance = averageLeaseVariancePercent(selectedUnits);
  const selectionLabel = selectedUnits.length <= 1 ? "Single Unit" : "Multi-Unit";
  const selectedPropertyId = selectedUnits[0] ? String(selectedUnits[0].propertyId) : form.propertyId;
  const periodSelected = Boolean(form.startDate && form.endDate);
  const filteredPropertyOptions = periodSelected ? availablePropertyOptions : propertyOptions;

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
        <form className="mt-6 space-y-6" onSubmit={onSubmit} noValidate>
          {formTab === "general" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <InputField label="Lease Number" value={form.leaseNumber} onChange={(value) => onFormChange((current) => ({ ...current, leaseNumber: value }))} required />
              <SelectField label="Lease Type" value={form.leaseType} options={toOptions(leaseTypeOptions)} onChange={(value) => onFormChange((current) => ({ ...current, leaseType: value }))} required />
              <SelectField
                label="Property"
                value={selectedPropertyId}
                options={filteredPropertyOptions}
                onChange={(value) => {
                  const propertyUnit = availableUnits.find((unit) => String(unit.propertyId) === value);
                  onFormChange((current) => ({ ...current, propertyId: value, towerId: "", unitId: "", currency: propertyUnit?.currency ?? current.currency }));
                  onSearchUnits({ propertyId: value });
                }}
                required
              />
              <SelectField label="Customer" value={form.customerId} options={customerOptions} onChange={(value) => onFormChange((current) => ({ ...current, customerId: value }))} required />
              <SelectField label="Lease Status" value={form.leaseStatus} options={toOptions(leaseStatusOptions)} onChange={(value) => onFormChange((current) => ({ ...current, leaseStatus: value }))} required />
              <SelectField label="Renewal Status" value={form.renewalStatus} options={toOptions(renewalStatusOptions)} onChange={(value) => onFormChange((current) => ({ ...current, renewalStatus: value }))} required />
              <SelectField label="Request Initiator" value={form.requestInitiator} options={toOptions(requestInitiatorOptions)} onChange={(value) => onFormChange((current) => ({ ...current, requestInitiator: value }))} required />
              <InputField label="Created By" value={form.createdBy} onChange={(value) => onFormChange((current) => ({ ...current, createdBy: value }))} required />
            </div>
          ) : null}
          {formTab === "period" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                label="Start Date"
                type="date"
                value={form.startDate}
                required
                onChange={(value) => {
                  onFormChange((current) => ({ ...current, startDate: value }));
                  if (value && form.endDate) {
                    onSearchUnits({ startDate: value, endDate: form.endDate });
                  }
                }}
              />
              <InputField
                label="End Date"
                type="date"
                value={form.endDate}
                required
                onChange={(value) => {
                  onFormChange((current) => ({ ...current, endDate: value }));
                  if (form.startDate && value) {
                    onSearchUnits({ startDate: form.startDate, endDate: value });
                  }
                }}
              />
              <InputField label="Fit-Out Start" type="date" value={form.fitOutPeriodStart} onChange={(value) => onFormChange((current) => ({ ...current, fitOutPeriodStart: value }))} />
              <InputField label="Fit-Out End" type="date" value={form.fitOutPeriodEnd} onChange={(value) => onFormChange((current) => ({ ...current, fitOutPeriodEnd: value }))} />
              <InputField label="Free Period Start" type="date" value={form.freePeriodStart} onChange={(value) => onFormChange((current) => ({ ...current, freePeriodStart: value }))} />
              <InputField label="Free Period End" type="date" value={form.freePeriodEnd} onChange={(value) => onFormChange((current) => ({ ...current, freePeriodEnd: value }))} />
              <InputField label="Rent Amount" type="number" value={form.rentAmount} onChange={(value) => onFormChange((current) => ({ ...current, rentAmount: value }))} />
              <InputField label="Security Deposit" type="number" value={form.securityDeposit} onChange={(value) => onFormChange((current) => ({ ...current, securityDeposit: value }))} />
              <InputField label="Currency" value={form.currency} onChange={(value) => onFormChange((current) => ({ ...current, currency: value }))} required />
              <SelectField label="Payment Status" value={form.paymentStatus} options={toOptions(paymentOptions)} onChange={(value) => onFormChange((current) => ({ ...current, paymentStatus: value }))} required />
            </div>
          ) : null}
          {formTab === "unit" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 rounded-2xl border border-slate-200">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-steel">Selected Units</p>
                    <p className="mt-1 text-sm font-medium text-ink">{selectionLabel} · {selectedUnits.length} selected</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onUnitSelectorOpen(true);
                      onSearchUnits({});
                    }}
                    disabled={!form.propertyId || !form.startDate || !form.endDate}
                    className="rounded-2xl bg-accent px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Add Unit
                  </button>
                </div>
                <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryValue label="Total Units" value={String(totals.count)} />
                  <SummaryValue label="Total Area" value={`${totals.area.toLocaleString()} sq.ft`} />
                  <SummaryValue label="Total Benchmark Rent" value={formatMoney(totals.benchmarkRent, selectedUnits[0]?.currency ?? form.currency)} />
                  <SummaryValue label="Total Negotiated Rent" value={formatMoney(totals.negotiatedRent, selectedUnits[0]?.currency ?? form.currency)} />
                  <SummaryValue label="Total Variance Amount" value={formatMoney(totals.varianceAmount, selectedUnits[0]?.currency ?? form.currency)} />
                  <SummaryValue label="Average Variance %" value={`${averageVariance.toFixed(2)}%`} />
                  <SummaryValue label="Total Deposit" value={formatMoney(totals.deposit, selectedUnits[0]?.currency ?? form.currency)} />
                  <SummaryValue label="Total Charges" value={formatMoney(totals.charges, selectedUnits[0]?.currency ?? form.currency)} />
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <table className="min-w-[1280px] text-left text-sm">
                    <thead className="sticky top-0 bg-white text-steel">
                      <tr>{["Tower", "Unit", "Area", "Rent Frequency", "Benchmark Rent", "Negotiated Rent", "Variance Amount", "Variance %", "Deposit", "Charges", "Action"].map((label) => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr>
                    </thead>
                    <tbody>
                      {selectedUnits.length === 0 ? (
                        <tr><td colSpan={11} className="px-4 py-6 text-center text-sm text-steel">Select period, currency, property, then add units from the popup.</td></tr>
                      ) : selectedUnits.map((unit) => (
                        <tr key={unit.unitId} className="border-t border-slate-100">
                          <td className="px-4 py-3 text-ink">{unit.towerName}</td>
                          <td className="px-4 py-3 text-steel">{unit.unitNumber}</td>
                          <td className="px-4 py-3 text-steel">{unit.area} {unit.areaUnit}</td>
                          <td className="px-4 py-3">
                            <select value={unit.rentFrequency} onChange={(event) => onUpdateUnit(unit.unitId, { rentFrequency: event.target.value as RentFrequency })} className="w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent">
                              <option value="MONTHLY">Monthly</option>
                              <option value="ANNUAL">Annual</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-steel">{formatMoney(unit.benchmarkRent, form.currency)}</td>
                          <td className="px-4 py-3">
                            <input value={unit.negotiatedRent} type="number" min="0" onChange={(event) => onUpdateUnit(unit.unitId, { negotiatedRent: Number(event.target.value) })} className="w-36 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent" />
                          </td>
                          <td className="px-4 py-3 text-steel">{formatMoney(leaseUnitVarianceAmount(unit), form.currency)}</td>
                          <td className="px-4 py-3 text-steel">{leaseUnitVariancePercent(unit).toFixed(2)}%</td>
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
              <SelectField label="Occupancy Status" value={form.occupancyStatus} options={toOptions(occupancyOptions)} onChange={(value) => onFormChange((current) => ({ ...current, occupancyStatus: value }))} required />
              <SelectField label="Registration Status" value={form.registrationStatus} options={toOptions(registrationOptions)} onChange={(value) => onFormChange((current) => ({ ...current, registrationStatus: value }))} required />
              <SelectField label="Handover Status" value={form.handoverStatus} options={toOptions(handoverOptions)} onChange={(value) => onFormChange((current) => ({ ...current, handoverStatus: value }))} required />
              <SelectField label="Settlement Status" value={form.settlementStatus} options={toOptions(settlementOptions)} onChange={(value) => onFormChange((current) => ({ ...current, settlementStatus: value }))} required />
            </div>
          ) : null}
          {formTab === "fitout" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="Approval Status" value={form.approvalStatus} options={toOptions(approvalOptions)} onChange={(value) => onFormChange((current) => ({ ...current, approvalStatus: value }))} required />
              <SelectField label="Document Status" value={form.documentStatus} options={toOptions(documentOptions)} onChange={(value) => onFormChange((current) => ({ ...current, documentStatus: value }))} required />
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
        {unitSelectorOpen ? (
          <LeaseUnitSelectionModal
            title="Add Lease Units"
            form={form}
            availableUnits={availableUnits}
            selectedUnits={selectedUnits}
            towers={availableTowerOptions.length > 0 ? availableTowerOptions : towerOptions}
            onClose={() => onUnitSelectorOpen(false)}
            onFormChange={onFormChange}
            onSearch={onSearchUnits}
            onAddUnit={onAddUnit}
            onRemoveUnit={onRemoveUnit}
          />
        ) : null}
      </div>
    </div>
  );
}

function LeaseUnitSelectionModal({
  title,
  form,
  availableUnits,
  selectedUnits,
  towers,
  onClose,
  onFormChange,
  onSearch,
  onAddUnit,
  onRemoveUnit
}: Readonly<{
  title: string;
  form: LeaseFormState;
  availableUnits: AvailableUnitRecord[];
  selectedUnits: SelectedAvailableUnit[];
  towers: { label: string; value: string }[];
  onClose: () => void;
  onFormChange: React.Dispatch<React.SetStateAction<LeaseFormState>>;
  onSearch: (filters?: Partial<UnitSearchFilters>) => void;
  onAddUnit: (unit: AvailableUnitRecord) => void;
  onRemoveUnit: (unit: Pick<AvailableUnitRecord, "unitId">) => void;
}>) {
  const [filters, setFilters] = useState<UnitSearchFilters>({
    query: "",
    propertyId: form.propertyId,
    towerId: form.towerId,
    startDate: form.startDate,
    endDate: form.endDate,
    floor: "",
    unitType: "",
    minArea: "",
    maxArea: "",
    minRent: "",
    maxRent: ""
  });
  const selectedUnitIds = useMemo(() => new Set(selectedUnits.map((unit) => unit.unitId)), [selectedUnits]);
  const visibleUnits = availableUnits
    .filter((unit) => unit.availabilityStatus === "AVAILABLE")
    .filter((unit) => String(unit.propertyId) === form.propertyId)
    .filter((unit) => !filters.towerId || String(unit.towerId) === filters.towerId)
    .slice(0, 20);

  function runSearch(nextFilters = filters) {
    onFormChange((current) => ({ ...current, towerId: nextFilters.towerId, unitId: "" }));
    onSearch({ ...nextFilters, propertyId: form.propertyId });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-card">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-steel">Unit Selection</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-steel">Only available units for the selected property and lease period are shown.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl bg-cloud px-3 py-2 text-sm text-ink">Close</button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} placeholder="Search unit" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" />
          <select value={filters.towerId} onChange={(event) => setFilters((current) => ({ ...current, towerId: event.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent">
            <option value="">All available towers</option>
            {towers.map((tower) => <option key={tower.value} value={tower.value}>{tower.label}</option>)}
          </select>
          <input value={filters.floor} onChange={(event) => setFilters((current) => ({ ...current, floor: event.target.value }))} placeholder="Floor" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" />
          <select value={filters.unitType} onChange={(event) => setFilters((current) => ({ ...current, unitType: event.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent">
            <option value="">All unit types</option>
            {["OFFICE", "APARTMENT", "RETAIL"].map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <input value={filters.minArea} onChange={(event) => setFilters((current) => ({ ...current, minArea: event.target.value }))} placeholder="Min area" type="number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" />
          <input value={filters.maxArea} onChange={(event) => setFilters((current) => ({ ...current, maxArea: event.target.value }))} placeholder="Max area" type="number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" />
          <input value={filters.minRent} onChange={(event) => setFilters((current) => ({ ...current, minRent: event.target.value }))} placeholder="Min rent" type="number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" />
          <input value={filters.maxRent} onChange={(event) => setFilters((current) => ({ ...current, maxRent: event.target.value }))} placeholder="Max rent" type="number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" />
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={() => runSearch()} className="rounded-2xl bg-accent px-5 py-3 text-sm font-medium text-white">Search Available Units</button>
        </div>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-steel">
              <tr>{["Tower", "Floor", "Unit", "Type", "Area", "Monthly Benchmark Rent", "Deposit", "Charges", "Action"].map((label) => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr>
            </thead>
            <tbody>
              {visibleUnits.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-steel">No available units matched the current filters.</td></tr>
              ) : visibleUnits.map((unit) => (
                <tr key={unit.unitId} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-ink">{unit.towerName}</td>
                  <td className="px-4 py-3 text-steel">{unit.floor}</td>
                  <td className="px-4 py-3 text-steel">{unit.unitNumber}</td>
                  <td className="px-4 py-3 text-steel">{unit.unitType}</td>
                  <td className="px-4 py-3 text-steel">{unit.area} {unit.areaUnit}</td>
                  <td className="px-4 py-3 text-steel">{formatMoney(availableUnitRent(unit, "MONTHLY"), form.currency)}</td>
                  <td className="px-4 py-3 text-steel">{formatMoney(unit.securityDeposit, unit.currency)}</td>
                  <td className="px-4 py-3 text-steel">{formatMoney(availableUnitCharges(unit), unit.currency)}</td>
                  <td className="px-4 py-3">
                    {selectedUnitIds.has(unit.unitId) ? (
                      <button type="button" onClick={() => onRemoveUnit(unit)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">Remove</button>
                    ) : (
                      <button type="button" onClick={() => onAddUnit(unit)} className="rounded-xl bg-accent px-3 py-2 text-xs font-medium text-white">Add Unit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmit} noValidate>
          <SelectField label="Transaction Status" value={form.transactionStatus} options={toOptions(transactionStatusOptions)} onChange={(value) => onFormChange((current) => ({ ...current, transactionStatus: value }))} required />
          <InputField label="Created By" value={form.createdBy} onChange={(value) => onFormChange((current) => ({ ...current, createdBy: value }))} required />
          <InputField label="Effective Start Date" type="date" value={form.effectiveStartDate} onChange={(value) => onFormChange((current) => ({ ...current, effectiveStartDate: value }))} required />
          <InputField label="Effective End Date" type="date" value={form.effectiveEndDate} onChange={(value) => onFormChange((current) => ({ ...current, effectiveEndDate: value }))} required />
          <InputField label="Revised Rent" type="number" value={form.revisedRentAmount} onChange={(value) => onFormChange((current) => ({ ...current, revisedRentAmount: value }))} />
          <InputField label="Revised Security Deposit" type="number" value={form.revisedSecurityDeposit} onChange={(value) => onFormChange((current) => ({ ...current, revisedSecurityDeposit: value }))} />
          {actionType === "TRANSFER" ? (
            <SelectField label="Target Unit" value={form.targetUnitId} options={units.map((unit) => ({ value: String(unit.id), label: `${unit.unitCode} · ${unit.unitName}` }))} onChange={(value) => onFormChange((current) => ({ ...current, targetUnitId: value }))} required />
          ) : null}
          <InputField label="Reason" value={form.reason} onChange={(value) => onFormChange((current) => ({ ...current, reason: value }))} required />
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

export function UnitAvailabilityWorkspacePage() {
  const [records, setRecords] = useState<UnitAvailabilityRecord[]>([]);
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [towers, setTowers] = useState<TowerOption[]>([]);
  const [filters, setFilters] = useState({
    propertyId: "",
    towerId: "",
    unitSearch: "",
    occupancyStatus: "",
    availabilityPeriod: "",
    leasePeriod: "",
    dateFrom: new Date().toISOString().slice(0, 10),
    dateTo: ""
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const towerOptions = useMemo(
    () => towers.filter((tower) => !filters.propertyId || String(tower.propertyId) === filters.propertyId),
    [filters.propertyId, towers]
  );

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", "12");
    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) {
        params.set(key, value.trim());
      }
    });
    return params.toString();
  }, [filters, page]);

  async function loadAvailability() {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<PagedResult<UnitAvailabilityRecord>>(`/leases/unit-availability?${queryString}`);
      setRecords(result.items);
      setTotal(result.total);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load unit availability");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAvailability();
  }, [queryString]);

  useEffect(() => {
    void Promise.all([
      apiGet<PagedResult<PropertyRecord>>("/properties?size=100"),
      apiGet<PagedResult<TowerOption>>("/towers?size=100")
    ]).then(([propertyData, towerData]) => {
      setProperties(propertyData.items);
      setTowers(towerData.items);
    }).catch((requestError) => {
      setError(requestError instanceof Error ? requestError.message : "Failed to load filters");
    });
  }, []);

  const summary = useMemo(() => {
    const occupied = records.filter((record) => record.currentOccupancyStatus === "OCCUPIED").length;
    const vacant = records.filter((record) => record.currentOccupancyStatus === "VACANT").length;
    const reserved = records.filter((record) => record.currentOccupancyStatus === "RESERVED" || record.timelineStatus === "RESERVED").length;
    const availableNow = records.filter((record) => record.timelineStatus === "AVAILABLE").length;
    return { occupied, vacant, reserved, availableNow };
  }, [records]);

  function updateFilter(name: keyof typeof filters, value: string) {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === "propertyId" ? { towerId: "" } : {})
    }));
  }

  return (
    <AppShell title="Unit Availability Workspace" subtitle="Search current and future unit availability by property, tower, unit, occupancy, and lease period.">
      <div className="space-y-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Available Now" value={String(summary.availableNow)} note="No active block" tone="accent" />
          <MetricCard label="Occupied Units" value={String(summary.occupied)} note="Inventory source" tone="neutral" />
          <MetricCard label="Vacant Units" value={String(summary.vacant)} note="Inventory status" tone="warn" />
          <MetricCard label="Reserved Units" value={String(summary.reserved)} note="Reserved status" tone="neutral" />
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select value={filters.propertyId} onChange={(event) => updateFilter("propertyId", event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent">
              <option value="">All Properties</option>
              {properties.map((property) => <option key={property.id} value={property.id}>{property.propertyName}</option>)}
            </select>
            <select value={filters.towerId} onChange={(event) => updateFilter("towerId", event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent">
              <option value="">All Buildings / Towers</option>
              {towerOptions.map((tower) => <option key={tower.id} value={tower.id}>{tower.towerName}</option>)}
            </select>
            <input value={filters.unitSearch} onChange={(event) => updateFilter("unitSearch", event.target.value)} placeholder="Search unit" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" />
            <select value={filters.occupancyStatus} onChange={(event) => updateFilter("occupancyStatus", event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent">
              <option value="">All Occupancy Statuses</option>
              {occupancyOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <select value={filters.availabilityPeriod} onChange={(event) => updateFilter("availabilityPeriod", event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent">
              <option value="">Any Availability</option>
              <option value="AVAILABLE">Available in Date Range</option>
              <option value="UNAVAILABLE">Unavailable in Date Range</option>
            </select>
            <input value={filters.leasePeriod} onChange={(event) => updateFilter("leasePeriod", event.target.value)} type="date" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" aria-label="Lease period date" />
            <input value={filters.dateFrom} onChange={(event) => updateFilter("dateFrom", event.target.value)} type="date" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" aria-label="Available from" />
            <input value={filters.dateTo} onChange={(event) => updateFilter("dateTo", event.target.value)} type="date" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" aria-label="Available to" />
          </div>
          {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        </section>

        <section className="space-y-4">
          {loading ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-steel">Loading unit availability...</p>
          ) : records.length === 0 ? (
            <div className="rounded-2xl bg-cloud p-6 text-sm text-steel">No units matched the current filters.</div>
          ) : records.map((record) => (
            <UnitAvailabilityCard key={record.unitId} record={record} />
          ))}
        </section>

        <div className="flex flex-col gap-3 text-sm text-steel sm:flex-row sm:items-center sm:justify-between">
          <span>Page {page} · {total} total units</span>
          <div className="flex gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 disabled:opacity-50">
              Previous
            </button>
            <button type="button" disabled={page * 12 >= total} onClick={() => setPage((value) => value + 1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function UnitAvailabilityCard({ record }: Readonly<{ record: UnitAvailabilityRecord }>) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-ink">{record.unitNumber}</h3>
            <Badge label={record.currentOccupancyStatus} />
            <Badge label={record.timelineStatus} />
          </div>
          <p className="mt-1 text-sm text-steel">{record.propertyName} · {record.towerName} · {record.unitType} · {record.area.toLocaleString()} {record.areaUnit}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:min-w-72">
          <SummaryValue label="Available From" value={normalizeDate(record.availableFrom)} />
          <SummaryValue label="Available To" value={normalizeDate(record.availableTo)} />
        </div>
      </div>
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="min-w-0">
          <AvailabilityTimeline record={record} />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <InfoBlock label="Current Lease Period" primary={record.currentLeasePeriod || "-"} secondary={`Tenant ${record.tenantDetails || "-"}`} />
            <InfoBlock label="Future Reserved / Leased Periods" primary={record.futurePeriods || "-"} secondary="Includes reservations and future leases when present" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <InfoBlock label="Fit-Out Period" primary={record.fitOutPeriod || "-"} secondary="Blocks availability before lease start" />
          <InfoBlock label="Free Period" primary={record.freePeriod || "-"} secondary="Included inside lease duration" />
        </div>
      </div>
    </article>
  );
}

function AvailabilityTimeline({ record }: Readonly<{ record: UnitAvailabilityRecord }>) {
  const hasFitOut = Boolean(record.fitOutStart);
  const hasLease = Boolean(record.currentLeaseStart);
  const hasFree = Boolean(record.freePeriodStart);
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid min-h-14 overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-4">
        <TimelineSegment active={hasFitOut} label="Fit-Out" value={hasFitOut ? `${record.fitOutStart} to ${normalizeDate(record.fitOutEnd)}` : "Not defined"} tone="warn" />
        <TimelineSegment active={hasLease} label="Lease Start" value={hasLease ? normalizeDate(record.currentLeaseStart) : "No active lease"} tone="accent" />
        <TimelineSegment active={hasFree} label="Free Period" value={hasFree ? `${record.freePeriodStart} to ${normalizeDate(record.freePeriodEnd)}` : "Included when defined"} tone="neutral" />
        <TimelineSegment active={hasLease} label="Lease End" value={hasLease ? normalizeDate(record.currentLeaseEnd) : normalizeDate(record.availableFrom)} tone="danger" />
      </div>
    </div>
  );
}

function TimelineSegment({ active, label, value, tone }: Readonly<{ active: boolean; label: string; value: string; tone: "accent" | "warn" | "neutral" | "danger" }>) {
  const toneClass = {
    accent: "border-blue-200 bg-blue-50 text-blue-800",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
    neutral: "border-slate-200 bg-white text-slate-700",
    danger: "border-rose-200 bg-rose-50 text-rose-800"
  }[tone];
  return (
    <div className={`border-b p-3 sm:border-b-0 sm:border-r sm:last:border-r-0 ${active ? toneClass : "border-slate-100 bg-slate-50 text-steel"}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em]">{label}</p>
      <p className="mt-1 break-words text-sm font-medium">{value}</p>
    </div>
  );
}

function InputField({
  label,
  type = "text",
  value,
  onChange,
  required = false
}: Readonly<{
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}>) {
  return (
    <label className="block text-sm text-ink">
      <span className="mb-2 block font-medium">{label}{required ? <span className="text-rose-600"> *</span> : null}</span>
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-accent focus:bg-white" />
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
  onChange,
  required = false
}: Readonly<{
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  required?: boolean;
}>) {
  return (
    <label className="block text-sm text-ink">
      <span className="mb-2 block font-medium">{label}{required ? <span className="text-rose-600"> *</span> : null}</span>
      <select required={required} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-accent focus:bg-white">
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

function PropertyStat({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-steel">{label}</p>
      <p className="mt-1 break-words font-semibold text-ink">{value}</p>
    </div>
  );
}

function LeaseHierarchyRow({
  lease,
  zebra,
  onAction,
  onEdit
}: Readonly<{
  lease: LeaseRecord;
  zebra: boolean;
  onAction: (action: string, lease: LeaseRecord) => void;
  onEdit: (lease: LeaseRecord) => void;
}>) {
  const lifecycleActions = [
    { label: "Renewal", action: "Renew Lease", value: lease.renewalStatus },
    { label: "Amendment", action: "Amend Lease", value: lease.latestTransactionType === "AMENDMENT" ? "ACTIVE" : "Available" },
    { label: "Extension", action: "Extend Lease", value: lease.latestTransactionType === "EXTENSION" ? "ACTIVE" : "Available" },
    { label: "Rent Revision", action: "Revise Rent", value: lease.latestTransactionType === "RENT_REVISION" ? "ACTIVE" : "Available" },
    { label: "Suspension", action: "Suspend Lease", value: lease.leaseStatus === "SUSPENDED" ? "ACTIVE" : "Available" },
    { label: "Termination", action: "Terminate Lease", value: lease.leaseStatus === "TERMINATION_REVIEW" ? "ACTIVE" : "Available" },
    { label: "Cancellation", action: "Cancel Lease", value: lease.leaseStatus === "CANCELLED" ? "ACTIVE" : "Available" },
    { label: "Transfer", action: "Lease Transfer", value: lease.latestTransactionType === "TRANSFER" ? "ACTIVE" : "Available" }
  ];
  const menuActions = [
    "View Lease 360",
    "Edit Lease",
    "Renew Lease",
    "Extend Lease",
    "Amend Lease",
    "Revise Rent",
    "Suspend Lease",
    "Terminate Lease",
    "Cancel Lease",
    "Lease Transfer",
    "View History",
    "View Documents",
    "View Audit Trail"
  ];

  return (
    <article className={`rounded-2xl border border-slate-200 p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-5 ${zebra ? "bg-slate-50/80" : "bg-white"}`}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/leases/${lease.id}`} className="break-words text-lg font-semibold text-ink hover:text-accent">
                {lease.leaseNumber}
              </Link>
              <Badge label={lease.leaseStatus} />
              <Badge label={lease.occupancyStatus} />
            </div>
            <p className="mt-1 text-xs text-steel">Parent: {lease.parentLeaseReference ?? "Master Lease"} · v{lease.versionNumber}</p>
          </div>
          <details className="relative w-full sm:w-auto">
            <summary className="flex w-full cursor-pointer list-none items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-ink shadow-sm hover:bg-cloud sm:w-auto">
              More Actions
            </summary>
            <div className="absolute left-0 right-auto z-20 mt-2 grid w-full max-w-[calc(100vw-2rem)] gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-card sm:left-auto sm:right-0 sm:w-60">
              {menuActions.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (label === "Edit Lease") {
                      onEdit(lease);
                    } else {
                      onAction(label, lease);
                    }
                  }}
                  className="rounded-xl px-3 py-2 text-left text-xs font-medium text-ink hover:bg-cloud"
                >
                  {label}
                </button>
              ))}
            </div>
          </details>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <InfoBlock label="Tenant / Unit" primary={lease.customerName} secondary={`${lease.unitCode} · ${lease.towerName}`} />
          <InfoBlock label="Lease Period" primary={`${lease.startDate} to ${lease.endDate}`} secondary={`${Math.max(daysTo(lease.endDate), 0)} days remaining`} />
          <InfoBlock label="Rent" primary={formatMoney(leaseRent(lease), lease.currency)} secondary={`Deposit ${formatMoney(lease.securityDeposit, lease.currency)}`} />
        </div>

        <details className="rounded-2xl border border-slate-200 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-ink">
            <span>Lifecycle Actions</span>
            <span className="text-xs font-medium text-steel">{transactionTitle(lease.latestTransactionType || "LEASE")}</span>
          </summary>
          <div className="border-t border-slate-100 p-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {lifecycleActions.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onAction(item.action, lease)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <p className="text-sm font-semibold text-ink">{item.label}</p>
                  <p className="mt-1 text-xs text-steel">{item.value}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <TimelineNode title="Master Lease" detail={`${lease.leaseNumber} · ${lease.leaseType}`} status={lease.leaseStatus} />
              <TimelineNode title="Renewal" detail={lease.renewalStatus} status={lease.renewalStatus} />
              <TimelineNode title="Approval" detail={lease.approvalStatus} status={lease.approvalStatus} />
              <TimelineNode title="Latest Action" detail={transactionTitle(lease.latestTransactionType || "LEASE")} status={lease.latestTransactionType || "LEASE"} />
            </div>
          </div>
        </details>
      </div>
    </article>
  );
}

function InfoBlock({ label, primary, secondary }: Readonly<{ label: string; primary: string; secondary: string }>) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-steel">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-ink">{primary}</p>
      <p className="mt-1 break-words text-xs text-steel">{secondary}</p>
    </div>
  );
}

function TimelineNode({ title, detail, status }: Readonly<{ title: string; detail: string; status: string }>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs text-steel">{detail}</p>
      <div className="mt-3">
        <Badge label={status} />
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
