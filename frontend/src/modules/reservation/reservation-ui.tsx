"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/layouts/app-shell";
import { apiGet, apiPost, apiPut } from "@/services/api";
import type { PagedResult } from "@/types/api";
import type { AvailableUnitRecord, CustomerRecord, LeaseRecord, PropertyRecord, ReservationHistoryRecord, ReservationRecord } from "@/types/entities";

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

const reservationStatusOptions = ["DRAFT", "RESERVED", "EXPIRED", "CANCELLED", "CONVERTED_TO_LEASE"];
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
    proposedLeaseStartDate: record?.proposedLeaseStartDate ?? "",
    proposedLeaseEndDate: record?.proposedLeaseEndDate ?? "",
    rentFrequency: "MONTHLY",
    quotedRent: record ? String(record.quotedRent) : "",
    currency: record?.currency ?? "AED",
    depositAmount: record ? String(record.depositAmount) : "",
    createdBy: record?.createdBy ?? "leasing.user",
    leadName: record?.leadName ?? "",
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
    startDate: record.proposedLeaseStartDate,
    endDate: record.proposedLeaseEndDate,
    createdBy: "leasing.user",
    notes: `Converted from reservation ${record.reservationNumber}`
  };
}

function badgeTone(value: string) {
  const normalized = value.toUpperCase();
  if (["RESERVED", "CONVERTED_TO_LEASE", "APPROVED", "RECEIVED", "AVAILABLE"].includes(normalized)) {
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

function firstMissingField(form: Record<string, string>, fields: { name: string; label: string }[]) {
  return fields.find((field) => !String(form[field.name] ?? "").trim())?.label ?? null;
}

function unitRent(unit: AvailableUnitRecord, rentFrequency: string) {
  return rentFrequency === "ANNUAL" ? unit.monthlyRent * 12 : unit.monthlyRent;
}

function buildSelectedUnit(unit: AvailableUnitRecord, rentFrequency: RentFrequency = "MONTHLY"): SelectedAvailableUnit {
  const benchmarkRent = unitRent(unit, rentFrequency);
  return {
    ...unit,
    rentFrequency,
    benchmarkRent,
    negotiatedRent: benchmarkRent
  };
}

function unitCharges(unit: AvailableUnitRecord) {
  return unit.maintenanceCharges + unit.camCharges + unit.parkingCharges + Math.round(unit.monthlyRent * 0.05);
}

function unitVarianceAmount(unit: SelectedAvailableUnit) {
  return unit.negotiatedRent - unit.benchmarkRent;
}

function unitVariancePercent(unit: SelectedAvailableUnit) {
  return unit.benchmarkRent > 0 ? (unitVarianceAmount(unit) / unit.benchmarkRent) * 100 : 0;
}

function selectedUnitTotals(units: SelectedAvailableUnit[]) {
  return units.reduce(
    (totals, unit) => ({
      count: totals.count + 1,
      area: totals.area + unit.area,
      benchmarkRent: totals.benchmarkRent + unit.benchmarkRent,
      negotiatedRent: totals.negotiatedRent + unit.negotiatedRent,
      varianceAmount: totals.varianceAmount + unitVarianceAmount(unit),
      deposit: totals.deposit + unit.securityDeposit,
      charges: totals.charges + unitCharges(unit)
    }),
    { count: 0, area: 0, benchmarkRent: 0, negotiatedRent: 0, varianceAmount: 0, deposit: 0, charges: 0 }
  );
}

function averageVariancePercent(units: SelectedAvailableUnit[]) {
  if (units.length === 0) {
    return 0;
  }
  return units.reduce((sum, unit) => sum + unitVariancePercent(unit), 0) / units.length;
}

export function ReservationWorkspacePage() {
  const [records, setRecords] = useState<ReservationRecord[]>([]);
  const [availableUnits, setAvailableUnits] = useState<AvailableUnitRecord[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<SelectedAvailableUnit[]>([]);
  const [search, setSearch] = useState("");
  const [availabilityFilters, setAvailabilityFilters] = useState<Record<string, string>>({
    propertyId: "",
    propertyType: "",
    unitType: "",
    location: "",
    minArea: "",
    maxArea: "",
    minRent: "",
    maxRent: "",
    leaseType: "",
    availabilityDate: todayText(),
    furnishingStatus: "",
    floor: "",
    capacity: ""
  });
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
  const [unitSelectorOpen, setUnitSelectorOpen] = useState(false);
  const [reservationForm, setReservationForm] = useState<ReservationFormState>(() => buildReservationForm(null));
  const [reservationUnitMode, setReservationUnitMode] = useState<UnitTransactionMode>("SINGLE");
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

  async function searchAvailableUnits() {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("size", "12");
    Object.entries(availabilityFilters).forEach(([key, value]) => {
      if (value.trim()) {
        params.set(key, value.trim());
      }
    });
    try {
      const result = await apiGet<PagedResult<AvailableUnitRecord>>(`/reservations/available-units?${params.toString()}`);
      setAvailableUnits(result.items);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to search available units");
    }
  }

  async function searchReservationUnitsForForm(filters?: Partial<UnitSearchFilters>) {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("size", "100");
    const startDate = filters?.startDate || reservationForm.proposedLeaseStartDate || reservationForm.reservationDate || todayText();
    const endDate = filters?.endDate || reservationForm.proposedLeaseEndDate || reservationForm.expiryDate || startDate;
    params.set("startDate", startDate);
    params.set("endDate", endDate);
    const propertyId = filters?.propertyId ?? reservationForm.propertyId;
    if (propertyId) {
      params.set("propertyId", propertyId);
    }
    const towerId = filters?.towerId ?? reservationForm.towerId;
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
    try {
      const result = await apiGet<PagedResult<AvailableUnitRecord>>(`/reservations/available-units?${params.toString()}`);
      setAvailableUnits(result.items);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to search available units");
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
    const confirmed = records.filter((record) => record.reservationStatus === "RESERVED").length;
    const converted = records.filter((record) => record.convertedLeaseId != null).length;
    const deposit = records.reduce((sum, record) => sum + record.depositAmount, 0);
    return [
      { label: "Pending Approval", value: String(pendingApproval), note: "Approval queue" },
      { label: "Confirmed", value: String(confirmed), note: "Ready to lease" },
      { label: "Converted", value: String(converted), note: "Lease handoff" },
      { label: "Deposits", value: deposit.toLocaleString(), note: "Captured value" }
    ];
  }, [records]);

  function openCreate(unit?: AvailableUnitRecord) {
    const unitsForReservation = unit ? [buildSelectedUnit(unit)] : selectedUnits;
    const primaryUnit = unitsForReservation[0];
    const formBase = buildReservationForm(null);
    const totals = selectedUnitTotals(unitsForReservation);
    setSelectedUnits(unitsForReservation);
    setReservationUnitMode(unitsForReservation.length > 1 ? "MULTIPLE" : "SINGLE");
    setEditingReservation(null);
    setReservationForm({
      ...formBase,
      propertyId: primaryUnit ? String(primaryUnit.propertyId) : "",
      towerId: primaryUnit ? String(primaryUnit.towerId) : "",
      unitId: primaryUnit ? String(primaryUnit.unitId) : "",
      reservationStatus: primaryUnit ? "RESERVED" : "DRAFT",
      workflowStatus: primaryUnit ? "APPROVED" : "DRAFT",
      quotedRent: primaryUnit ? String(totals.negotiatedRent) : "",
      currency: primaryUnit?.currency ?? "AED",
      depositAmount: primaryUnit ? String(totals.deposit) : "",
      proposedLeaseStartDate: primaryUnit?.availableFromDate ?? "",
      notes: primaryUnit ? `Reservation raised for ${unitsForReservation.length} unit(s).` : ""
    });
    setReservationFormOpen(true);
    setMessage(null);
  }

  function addSelectedUnit(unit: AvailableUnitRecord) {
    setError(null);
    if (unit.availabilityStatus !== "AVAILABLE") {
      setError("Only available units can be selected.");
      return;
    }
    if (selectedUnits.some((item) => item.unitId === unit.unitId)) {
      setError("Duplicate units are not allowed in the same reservation.");
      return;
    }
    if (selectedUnits.length > 0 && selectedUnits[0].propertyId !== unit.propertyId) {
      setError("Multiple-unit reservations can include units from one property only.");
      return;
    }
    if (selectedUnits.length > 0 && unit.currency !== selectedUnits[0].currency) {
      setError("Selected units must use the reservation currency.");
      return;
    }
    const selectedUnit = buildSelectedUnit(unit);
    setSelectedUnits((current) => {
      const nextUnits = [...current, selectedUnit];
      const totals = selectedUnitTotals(nextUnits);
      setReservationForm((form) => ({
        ...form,
        propertyId: String(nextUnits[0].propertyId),
        towerId: form.towerId || String(nextUnits[0].towerId),
        unitId: String(nextUnits[0].unitId),
        quotedRent: String(totals.negotiatedRent),
        depositAmount: String(totals.deposit),
        currency: nextUnits[0].currency
      }));
      return nextUnits;
    });
  }

  function removeSelectedUnit(unit: Pick<AvailableUnitRecord, "unitId">) {
    setSelectedUnits((current) => {
      const nextUnits = current.filter((item) => item.unitId !== unit.unitId);
      const totals = selectedUnitTotals(nextUnits);
      setReservationForm((form) => ({
        ...form,
        propertyId: nextUnits[0] ? String(nextUnits[0].propertyId) : form.propertyId,
        towerId: nextUnits[0] ? String(nextUnits[0].towerId) : form.towerId,
        unitId: nextUnits[0] ? String(nextUnits[0].unitId) : "",
        quotedRent: nextUnits.length > 0 ? String(totals.negotiatedRent) : "",
        depositAmount: nextUnits.length > 0 ? String(totals.deposit) : "",
        currency: nextUnits[0]?.currency ?? form.currency
      }));
      return nextUnits;
    });
  }

  function updateSelectedUnit(unitId: number, changes: Partial<Pick<SelectedAvailableUnit, "rentFrequency" | "negotiatedRent">>) {
    setSelectedUnits((current) => {
      const nextUnits = current.map((unit) => {
        if (unit.unitId !== unitId) {
          return unit;
        }
        const rentFrequency = changes.rentFrequency ?? unit.rentFrequency;
        const benchmarkRent = unitRent(unit, rentFrequency);
        const negotiatedRent = changes.negotiatedRent ?? (changes.rentFrequency ? benchmarkRent : unit.negotiatedRent);
        return {
          ...unit,
          rentFrequency,
          benchmarkRent,
          negotiatedRent
        };
      });
      const totals = selectedUnitTotals(nextUnits);
      setReservationForm((form) => ({
        ...form,
        quotedRent: nextUnits.length > 0 ? String(totals.negotiatedRent) : "",
        depositAmount: nextUnits.length > 0 ? String(totals.deposit) : ""
      }));
      return nextUnits;
    });
  }

  function toggleSelectedUnit(unit: AvailableUnitRecord) {
    setSelectedUnits((current) => {
      if (current.some((item) => item.unitId === unit.unitId)) {
        return current.filter((item) => item.unitId !== unit.unitId);
      }
      if (unit.availabilityStatus !== "AVAILABLE") {
        setError("Only available units can be selected.");
        return current;
      }
      if (current.length > 0 && current[0].propertyId !== unit.propertyId) {
        setError("Multiple-unit reservations can include units from one property only.");
        return current;
      }
      if (unit.currency !== reservationForm.currency) {
        setError("Selected units must use the reservation currency.");
        return current;
      }
      return [...current, buildSelectedUnit(unit)];
    });
  }

  function openEdit(record: ReservationRecord) {
    setEditingReservation(record);
    setReservationUnitMode("SINGLE");
    setSelectedUnits([]);
    setReservationForm(buildReservationForm(record));
    setReservationFormOpen(true);
    setMessage(null);
  }

  function closeForm() {
    setEditingReservation(null);
    setReservationFormOpen(false);
    setReservationUnitMode("SINGLE");
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
    const missingField = firstMissingField(reservationForm, [
      { name: "reservationNumber", label: "Reservation Number" },
      { name: "customerId", label: "Customer" },
      { name: "reservationDate", label: "Reservation Date" },
      { name: "expiryDate", label: "Expiry Date" },
      { name: "proposedLeaseStartDate", label: "Proposed Lease Start Date" },
      { name: "proposedLeaseEndDate", label: "Proposed Lease End Date" },
      { name: "propertyId", label: "Property" },
      { name: "reservationStatus", label: "Reservation Status" },
      { name: "workflowStatus", label: "Workflow Status" },
      { name: "paymentStatus", label: "Payment Status" },
      { name: "currency", label: "Currency" },
      { name: "createdBy", label: "Created By" }
    ]);
    if (missingField) {
      setError(`${missingField} is required.`);
      return;
    }
    const unitsForPayload = selectedUnits;
    const hasSelectedUnits = unitsForPayload.length > 0;
    if (!editingReservation && !hasSelectedUnits) {
      setError("Select at least one available unit for the reservation.");
      return;
    }
    if (hasSelectedUnits && new Set(unitsForPayload.map((unit) => unit.unitId)).size !== unitsForPayload.length) {
      setError("Duplicate units are not allowed in the same reservation.");
      return;
    }
    if (hasSelectedUnits && unitsForPayload.some((unit) => unit.availabilityStatus !== "AVAILABLE")) {
      setError("Inactive, reserved, or unavailable units cannot be selected.");
      return;
    }
    if (hasSelectedUnits && new Set(unitsForPayload.map((unit) => unit.propertyId)).size > 1) {
      setError("Reservation units must belong to one property only.");
      return;
    }
    const primaryUnit = unitsForPayload[0];
    if (hasSelectedUnits && new Set(unitsForPayload.map((unit) => unit.currency)).size > 1) {
      setError("Reservation units must use one currency only.");
      return;
    }
    if (hasSelectedUnits && unitsForPayload.some((unit) => unit.negotiatedRent < 0)) {
      setError("Negotiated rent cannot be negative.");
      return;
    }
    const selectedTotals = selectedUnitTotals(unitsForPayload);
    const payload = {
      reservationNumber: reservationForm.reservationNumber,
      propertyId: hasSelectedUnits ? primaryUnit.propertyId : Number(reservationForm.propertyId),
      towerId: hasSelectedUnits ? primaryUnit.towerId : Number(reservationForm.towerId),
      unitId: hasSelectedUnits ? primaryUnit.unitId : Number(reservationForm.unitId),
      customerId: Number(reservationForm.customerId),
      reservationStatus: reservationForm.reservationStatus,
      workflowStatus: reservationForm.workflowStatus,
      paymentStatus: reservationForm.paymentStatus,
      reservationDate: reservationForm.reservationDate,
      expiryDate: reservationForm.expiryDate,
      proposedLeaseStartDate: reservationForm.proposedLeaseStartDate,
      proposedLeaseEndDate: reservationForm.proposedLeaseEndDate,
      quotedRent: hasSelectedUnits ? selectedTotals.negotiatedRent : Number(reservationForm.quotedRent),
      currency: reservationForm.currency,
      depositAmount: hasSelectedUnits ? selectedTotals.deposit : Number(reservationForm.depositAmount),
      createdBy: reservationForm.createdBy,
      leadName: reservationForm.leadName || null,
      notes: reservationForm.notes || null,
      units: hasSelectedUnits
        ? unitsForPayload.map((unit) => ({
            propertyId: unit.propertyId,
            towerId: unit.towerId,
            unitId: unit.unitId,
            unitNumber: unit.unitNumber,
            unitType: unit.unitType,
            area: unit.area,
            rent: unit.negotiatedRent,
            deposit: unit.securityDeposit,
            tax: unitCharges(unit),
            reservationStatus: reservationForm.reservationStatus
          }))
        : undefined
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
      setSelectedUnits([]);
      await loadReservations();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to save reservation");
    }
  }

  async function applyStatus(record: ReservationRecord, action: "cancel" | "expire") {
    setError(null);
    try {
      await apiPost(`/reservations/${record.id}/${action}`, {
        reservationStatus: action === "cancel" ? "CANCELLED" : "EXPIRED",
        workflowStatus: action === "cancel" ? "CANCELLED" : "EXPIRED",
        paymentStatus: record.paymentStatus,
        updatedBy: "leasing.manager",
        notes: `${action === "cancel" ? "Cancelled" : "Expired"} from reservation workspace.`
      });
      setMessage(`Reservation ${action === "cancel" ? "cancelled" : "expired"} successfully.`);
      await loadReservations();
      await searchAvailableUnits();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : `Failed to ${action} reservation`);
    }
  }

  async function submitWorkflow(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workflowReservation || !workflowForm) {
      return;
    }
    const missingField = firstMissingField(workflowForm, [
      { name: "reservationStatus", label: "Reservation Status" },
      { name: "workflowStatus", label: "Workflow Status" },
      { name: "paymentStatus", label: "Payment Status" },
      { name: "updatedBy", label: "Updated By" }
    ]);
    if (missingField) {
      setError(`${missingField} is required.`);
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
    const missingField = firstMissingField(convertForm, [
      { name: "leaseNumber", label: "Lease Number" },
      { name: "leaseType", label: "Lease Type" },
      { name: "startDate", label: "Start Date" },
      { name: "endDate", label: "End Date" },
      { name: "createdBy", label: "Created By" }
    ]);
    if (missingField) {
      setError(`${missingField} is required.`);
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

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-steel">Search Units</p>
              <h4 className="mt-2 text-2xl font-semibold text-ink">Available unit search</h4>
              <p className="mt-2 text-sm text-steel">Only available units are returned; active leases and open reservations are excluded.</p>
            </div>
            <button type="button" onClick={() => void searchAvailableUnits()} className="rounded-2xl bg-accent px-5 py-3 text-sm font-medium text-white">
              Search Available Units
            </button>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Select
              value={availabilityFilters.propertyId}
              onChange={(value) => setAvailabilityFilters((current) => ({ ...current, propertyId: value }))}
              options={properties.map((property) => String(property.id))}
              labels={Object.fromEntries(properties.map((property) => [String(property.id), property.propertyName]))}
              placeholder="All Properties"
            />
            <Select value={availabilityFilters.propertyType} onChange={(value) => setAvailabilityFilters((current) => ({ ...current, propertyType: value }))} options={["COMMERCIAL", "RESIDENTIAL", "RETAIL"]} placeholder="Property Type" />
            <Select value={availabilityFilters.unitType} onChange={(value) => setAvailabilityFilters((current) => ({ ...current, unitType: value }))} options={["OFFICE", "APARTMENT", "RETAIL"]} placeholder="Unit Type" />
            <input value={availabilityFilters.location} onChange={(event) => setAvailabilityFilters((current) => ({ ...current, location: event.target.value }))} placeholder="Location" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" />
            <input value={availabilityFilters.minArea} onChange={(event) => setAvailabilityFilters((current) => ({ ...current, minArea: event.target.value }))} placeholder="Min Area" type="number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" />
            <input value={availabilityFilters.maxArea} onChange={(event) => setAvailabilityFilters((current) => ({ ...current, maxArea: event.target.value }))} placeholder="Max Area" type="number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" />
            <input value={availabilityFilters.minRent} onChange={(event) => setAvailabilityFilters((current) => ({ ...current, minRent: event.target.value }))} placeholder="Min Rent" type="number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" />
            <input value={availabilityFilters.maxRent} onChange={(event) => setAvailabilityFilters((current) => ({ ...current, maxRent: event.target.value }))} placeholder="Max Rent" type="number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" />
            <Select value={availabilityFilters.leaseType} onChange={(value) => setAvailabilityFilters((current) => ({ ...current, leaseType: value }))} options={leaseTypeOptions} placeholder="Lease Type" />
            <input value={availabilityFilters.availabilityDate} onChange={(event) => setAvailabilityFilters((current) => ({ ...current, availabilityDate: event.target.value }))} type="date" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" />
            <Select value={availabilityFilters.furnishingStatus} onChange={(value) => setAvailabilityFilters((current) => ({ ...current, furnishingStatus: value }))} options={["FURNISHED", "NON_FURNISHED"]} placeholder="Furnishing" />
            <input value={availabilityFilters.floor} onChange={(event) => setAvailabilityFilters((current) => ({ ...current, floor: event.target.value }))} placeholder="Floor" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" />
            <input value={availabilityFilters.capacity} onChange={(event) => setAvailabilityFilters((current) => ({ ...current, capacity: event.target.value }))} placeholder="Seats / Capacity" type="number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent" />
          </div>
          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {availableUnits.map((unit) => (
              <article key={unit.unitId} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-ink">{unit.propertyName}</p>
                    <p className="mt-1 text-sm text-steel">{unit.towerName} · {unit.location} · {unit.propertyType}</p>
                  </div>
                  <Badge label={unit.availabilityStatus} />
                </div>
                <div className="mt-4 grid gap-3 text-sm text-steel sm:grid-cols-2">
                  <Info label="Unit" value={`${unit.unitNumber} · Floor ${unit.floor}`} />
                  <Info label="Type / Area" value={`${unit.unitType} · ${unit.area} ${unit.areaUnit}`} />
                  <Info label="Available From" value={unit.availableFromDate} />
                  <Info label="Rent" value={formatMoney(unit.monthlyRent, unit.currency)} />
                  <Info label="Deposit" value={formatMoney(unit.securityDeposit, unit.currency)} />
                  <Info label="Charges" value={`Maint ${unit.maintenanceCharges}, CAM ${unit.camCharges}`} />
                  <Info label="Lease Terms" value={`${unit.minimumLeaseDuration}, ${unit.noticePeriod} notice`} />
                  <Info label="Fit-Out / Escalation" value={`${unit.fitOutPeriod}, ${unit.escalationTerms}`} />
                  <Info label="Furnishing" value={unit.furnishingStatus} />
                  <Info label="Parking" value={unit.parkingAvailability} />
                </div>
                <p className="mt-4 rounded-2xl bg-cloud p-3 text-xs text-steel">{unit.amenities}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => toggleSelectedUnit(unit)} className="rounded-xl bg-cloud px-3 py-2 text-xs font-medium text-ink">
                    {selectedUnits.some((item) => item.unitId === unit.unitId) ? "Remove" : "Select"}
                  </button>
                  <button type="button" onClick={() => openCreate(unit)} className="rounded-xl bg-accent px-3 py-2 text-xs font-medium text-white">Reserve Unit</button>
                  <button type="button" onClick={() => setMessage(`${unit.unitNumber} proposal placeholder is ready for future document generation.`)} className="rounded-xl bg-cloud px-3 py-2 text-xs font-medium text-ink">Download Proposal</button>
                  <button type="button" onClick={() => setMessage(`${unit.unitNumber} added to comparison placeholder.`)} className="rounded-xl bg-cloud px-3 py-2 text-xs font-medium text-ink">Compare</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {selectedUnits.length > 0 ? (
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-steel">Selected Units</p>
                <h4 className="mt-2 text-xl font-semibold text-ink">Reservation summary grid</h4>
                <p className="mt-2 text-sm text-steel">
                  {selectedUnits.length} units · {selectedUnits.reduce((sum, unit) => sum + unit.area, 0).toLocaleString()} sq.ft · {formatMoney(selectedUnits.reduce((sum, unit) => sum + unit.monthlyRent, 0), selectedUnits[0].currency)}
                </p>
              </div>
              <button type="button" onClick={() => openCreate()} className="rounded-2xl bg-accent px-5 py-3 text-sm font-medium text-white">Reserve Selected Units</button>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-steel">
                  <tr>{["Property", "Unit", "Type", "Area", "Rent", "Deposit", "Tax", "Action"].map((label) => <th key={label} className="pb-3">{label}</th>)}</tr>
                </thead>
                <tbody>
                  {selectedUnits.map((unit) => (
                    <tr key={unit.unitId} className="border-t border-slate-100">
                      <td className="py-3 text-ink">{unit.propertyName}</td>
                      <td className="py-3 text-steel">{unit.unitNumber}</td>
                      <td className="py-3 text-steel">{unit.unitType}</td>
                      <td className="py-3 text-steel">{unit.area} {unit.areaUnit}</td>
                      <td className="py-3 text-steel">{formatMoney(unit.monthlyRent, unit.currency)}</td>
                      <td className="py-3 text-steel">{formatMoney(unit.securityDeposit, unit.currency)}</td>
                      <td className="py-3 text-steel">{formatMoney(Math.round(unit.monthlyRent * 0.05), unit.currency)}</td>
                      <td className="py-3"><button type="button" onClick={() => toggleSelectedUnit(unit)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_380px]">
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-steel">Unit Availability Grid</p>
                <h4 className="mt-2 text-2xl font-semibold text-ink">Search and action reservations</h4>
                <p className="mt-2 text-sm text-steel">The reservation flow follows availability, reservation form, payment details, approval workflow, and confirmation.</p>
              </div>
              <button type="button" onClick={() => openCreate()} className="rounded-2xl bg-accent px-5 py-3 text-sm font-medium text-white">
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
              {availableUnits.slice(0, 5).map((unit) => (
                <div key={unit.unitId} className="rounded-2xl bg-cloud p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{unit.unitNumber}</p>
                      <p className="mt-1 text-xs text-steel">{unit.propertyName} · {unit.area} {unit.areaUnit}</p>
                    </div>
                    <Badge label={unit.availabilityStatus} />
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
                      {["Reservation", "Customer", "Property", "Primary Unit", "Window", "Units", "Rent", "Deposit", "Reservation Status", "Workflow", "Payment", "Converted Lease", "Actions"].map((label) => (
                        <th key={label} className="px-4 py-4 font-medium">{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-t border-slate-100 align-top hover:bg-slate-50/80">
                        <td className="px-4 py-4 font-medium text-ink">
                          <Link href={`/reservations/${record.id}`} className="hover:text-accent">{record.reservationNumber}</Link>
                          <p className="mt-1 text-xs text-steel">{record.createdBy} · {record.createdDate.slice(0, 10)}</p>
                        </td>
                        <td className="px-4 py-4 text-steel">{record.customerName}</td>
                        <td className="px-4 py-4 text-steel">{record.propertyName}</td>
                        <td className="px-4 py-4 text-steel">{record.unitCode} · {record.unitName}</td>
                        <td className="px-4 py-4 text-steel">
                          {record.reservationDate} to {record.expiryDate}
                          <p className="mt-1 text-xs">Lease {record.proposedLeaseStartDate} to {record.proposedLeaseEndDate}</p>
                        </td>
                        <td className="px-4 py-4 text-steel">{record.totalReservedUnits} unit(s), {record.totalReservedArea.toLocaleString()} sq.ft</td>
                        <td className="px-4 py-4 text-steel">{formatMoney(record.totalRentAmount, record.currency)}</td>
                        <td className="px-4 py-4 text-steel">{formatMoney(record.totalDepositAmount, record.currency)}</td>
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
                            <button type="button" onClick={() => void applyStatus(record, "cancel")} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">Cancel</button>
                            <button type="button" onClick={() => void applyStatus(record, "expire")} className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">Expire</button>
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
            availableUnits={availableUnits}
            selectedUnits={selectedUnits}
            unitSelectorOpen={unitSelectorOpen}
            unitMode={reservationUnitMode}
            onClose={closeForm}
            onSubmit={submitReservation}
            onChange={setReservationForm}
            onUnitSelectorOpen={setUnitSelectorOpen}
            onUnitModeChange={(mode) => {
              setReservationUnitMode(mode);
              if (mode === "SINGLE") {
                setSelectedUnits([]);
              } else {
                void searchReservationUnitsForForm({});
              }
            }}
            onSearchUnits={searchReservationUnitsForForm}
            onAddUnit={addSelectedUnit}
            onRemoveUnit={removeSelectedUnit}
            onUpdateUnit={updateSelectedUnit}
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
  availableUnits,
  selectedUnits,
  unitSelectorOpen,
  unitMode,
  onClose,
  onSubmit,
  onChange,
  onUnitSelectorOpen,
  onUnitModeChange,
  onSearchUnits,
  onAddUnit,
  onRemoveUnit,
  onUpdateUnit
}: Readonly<{
  editing: boolean;
  form: ReservationFormState;
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
  onChange: React.Dispatch<React.SetStateAction<ReservationFormState>>;
  onUnitSelectorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onUnitModeChange: (mode: UnitTransactionMode) => void;
  onSearchUnits: (filters?: Partial<UnitSearchFilters>) => void;
  onAddUnit: (unit: AvailableUnitRecord) => void;
  onRemoveUnit: (unit: Pick<AvailableUnitRecord, "unitId">) => void;
  onUpdateUnit: (unitId: number, changes: Partial<Pick<SelectedAvailableUnit, "rentFrequency" | "negotiatedRent">>) => void;
}>) {
  const totals = selectedUnitTotals(selectedUnits);
  const averageVariance = averageVariancePercent(selectedUnits);
  const selectionLabel = selectedUnits.length <= 1 ? "Single Unit" : "Multi-Unit";
  const availableProperties = useMemo(() => {
    const propertyMap = new Map<string, string>();
    availableUnits.forEach((unit) => propertyMap.set(String(unit.propertyId), unit.propertyName));
    return Array.from(propertyMap, ([value, label]) => ({ value, label }));
  }, [availableUnits]);
  const availableTowers = useMemo(() => {
    const towerMap = new Map<string, string>();
    availableUnits
      .filter((unit) => !form.propertyId || String(unit.propertyId) === form.propertyId)
      .forEach((unit) => towerMap.set(String(unit.towerId), unit.towerName));
    return Array.from(towerMap, ([value, label]) => ({ value, label }));
  }, [availableUnits, form.propertyId]);
  const periodSelected = Boolean(form.proposedLeaseStartDate && form.proposedLeaseEndDate);
  const propertyOptions = periodSelected ? availableProperties : properties.map((item) => ({ label: item.propertyName, value: String(item.id) }));
  const towerOptions = availableTowers.length > 0 ? availableTowers : towers.filter((tower) => !form.propertyId || availableUnits.some((unit) => String(unit.towerId) === String(tower.id))).map((item) => ({ label: item.towerName, value: String(item.id) }));
  const selectedPropertyId = selectedUnits[0] ? String(selectedUnits[0].propertyId) : form.propertyId;

  return (
    <Modal title={editing ? "Edit Reservation" : "Create Reservation"} onClose={onClose}>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit} noValidate>
        <Field label="Reservation Number" name="reservationNumber" value={form.reservationNumber} onChange={onChange} required />
        <SelectField label="Customer" name="customerId" value={form.customerId} onChange={onChange} options={customers.map((item) => ({ label: item.customerName, value: String(item.id) }))} required />
        <Field label="Reservation Date" name="reservationDate" type="date" value={form.reservationDate} onChange={onChange} required />
        <Field label="Expiry Date" name="expiryDate" type="date" value={form.expiryDate} onChange={onChange} required />
        <Field
          label="Proposed Lease Start Date"
          name="proposedLeaseStartDate"
          type="date"
          value={form.proposedLeaseStartDate}
          required
          onChange={(updater: React.SetStateAction<ReservationFormState>) => {
            const next = typeof updater === "function" ? updater(form) : updater;
            onChange(next);
            if (next.proposedLeaseStartDate && next.proposedLeaseEndDate) {
              onSearchUnits({ startDate: next.proposedLeaseStartDate, endDate: next.proposedLeaseEndDate });
            }
          }}
        />
        <Field
          label="Proposed Lease End Date"
          name="proposedLeaseEndDate"
          type="date"
          value={form.proposedLeaseEndDate}
          required
          onChange={(updater: React.SetStateAction<ReservationFormState>) => {
            const next = typeof updater === "function" ? updater(form) : updater;
            onChange(next);
            if (next.proposedLeaseStartDate && next.proposedLeaseEndDate) {
              onSearchUnits({ startDate: next.proposedLeaseStartDate, endDate: next.proposedLeaseEndDate });
            }
          }}
        />
        <Field label="Currency" name="currency" value={form.currency} onChange={onChange} required />
        <SelectField
          label="Property"
          name="propertyId"
          value={selectedPropertyId}
          required
          onChange={(updater: React.SetStateAction<ReservationFormState>) => {
            const next = typeof updater === "function" ? updater(form) : updater;
            const propertyUnit = availableUnits.find((unit) => String(unit.propertyId) === next.propertyId);
            onChange((current) => ({ ...current, propertyId: next.propertyId, towerId: "", unitId: "", currency: propertyUnit?.currency ?? current.currency }));
            onSearchUnits({ propertyId: next.propertyId });
          }}
          options={propertyOptions}
        />
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
              disabled={!form.propertyId || !form.proposedLeaseStartDate || !form.proposedLeaseEndDate}
              className="rounded-2xl bg-accent px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add Unit
            </button>
          </div>
            <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
              <Info label="Total Units" value={String(totals.count)} />
              <Info label="Total Area" value={`${totals.area.toLocaleString()} sq.ft`} />
              <Info label="Total Benchmark Rent" value={formatMoney(totals.benchmarkRent, selectedUnits[0]?.currency ?? form.currency)} />
              <Info label="Total Negotiated Rent" value={formatMoney(totals.negotiatedRent, selectedUnits[0]?.currency ?? form.currency)} />
              <Info label="Total Variance Amount" value={formatMoney(totals.varianceAmount, selectedUnits[0]?.currency ?? form.currency)} />
              <Info label="Average Variance %" value={`${averageVariance.toFixed(2)}%`} />
              <Info label="Total Deposit" value={formatMoney(totals.deposit, selectedUnits[0]?.currency ?? form.currency)} />
              <Info label="Total Charges" value={formatMoney(totals.charges, selectedUnits[0]?.currency ?? form.currency)} />
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
                      <td className="px-4 py-3 text-steel">{formatMoney(unitVarianceAmount(unit), form.currency)}</td>
                      <td className="px-4 py-3 text-steel">{unitVariancePercent(unit).toFixed(2)}%</td>
                      <td className="px-4 py-3 text-steel">{formatMoney(unit.securityDeposit, unit.currency)}</td>
                      <td className="px-4 py-3 text-steel">{formatMoney(unitCharges(unit), unit.currency)}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => onRemoveUnit(unit)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
        <SelectField label="Reservation Status" name="reservationStatus" value={form.reservationStatus} onChange={onChange} options={reservationStatusOptions.map((item) => ({ label: item, value: item }))} required />
        <SelectField label="Workflow Status" name="workflowStatus" value={form.workflowStatus} onChange={onChange} options={workflowStatusOptions.map((item) => ({ label: item, value: item }))} required />
        <SelectField label="Payment Status" name="paymentStatus" value={form.paymentStatus} onChange={onChange} options={paymentStatusOptions.map((item) => ({ label: item, value: item }))} required />
        <Field label="Quoted Rent" name="quotedRent" type="number" value={form.quotedRent} onChange={onChange} />
        <Field label="Deposit Amount" name="depositAmount" type="number" value={form.depositAmount} onChange={onChange} />
        <Field label="Created By" name="createdBy" value={form.createdBy} onChange={onChange} required />
        <Field label="Customer / Lead" name="leadName" value={form.leadName} onChange={onChange} />
        <label className="block text-sm text-ink md:col-span-2">
          <span className="mb-2 block font-medium">Notes</span>
          <textarea value={form.notes} onChange={(event) => onChange((current) => ({ ...current, notes: event.target.value }))} className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-accent" />
        </label>
        <div className="flex justify-end gap-3 md:col-span-2">
          <button type="button" onClick={onClose} className="rounded-2xl bg-cloud px-5 py-3 text-sm font-medium text-ink">Cancel</button>
          <button type="submit" className="rounded-2xl bg-accent px-5 py-3 text-sm font-medium text-white">Save Reservation</button>
        </div>
      </form>
      {unitSelectorOpen ? (
        <UnitSelectionModal
          title="Add Reservation Units"
          form={form}
          availableUnits={availableUnits}
          selectedUnits={selectedUnits}
          towers={towerOptions}
          onClose={() => onUnitSelectorOpen(false)}
          onChange={onChange}
          onSearch={onSearchUnits}
          onAddUnit={onAddUnit}
          onRemoveUnit={onRemoveUnit}
        />
      ) : null}
    </Modal>
  );
}

function UnitSelectionModal({
  title,
  form,
  availableUnits,
  selectedUnits,
  towers,
  onClose,
  onChange,
  onSearch,
  onAddUnit,
  onRemoveUnit
}: Readonly<{
  title: string;
  form: ReservationFormState;
  availableUnits: AvailableUnitRecord[];
  selectedUnits: SelectedAvailableUnit[];
  towers: { label: string; value: string }[];
  onClose: () => void;
  onChange: React.Dispatch<React.SetStateAction<ReservationFormState>>;
  onSearch: (filters?: Partial<UnitSearchFilters>) => void;
  onAddUnit: (unit: AvailableUnitRecord) => void;
  onRemoveUnit: (unit: Pick<AvailableUnitRecord, "unitId">) => void;
}>) {
  const [filters, setFilters] = useState<UnitSearchFilters>({
    query: "",
    propertyId: form.propertyId,
    towerId: form.towerId,
    startDate: form.proposedLeaseStartDate,
    endDate: form.proposedLeaseEndDate,
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
    onChange((current) => ({ ...current, towerId: nextFilters.towerId, unitId: "" }));
    onSearch({ ...nextFilters, propertyId: form.propertyId });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-card">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-steel">Unit Selection</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-steel">Only available units for the selected property and period are shown.</p>
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
                  <td className="px-4 py-3 text-steel">{formatMoney(unitRent(unit, "MONTHLY"), form.currency)}</td>
                  <td className="px-4 py-3 text-steel">{formatMoney(unit.securityDeposit, unit.currency)}</td>
                  <td className="px-4 py-3 text-steel">{formatMoney(unitCharges(unit), unit.currency)}</td>
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

function WorkflowModal({ record, form, onClose, onSubmit, onChange }: Readonly<{
  record: ReservationRecord;
  form: WorkflowFormState;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: React.Dispatch<React.SetStateAction<WorkflowFormState | null>>;
}>) {
  return (
    <Modal title={`Workflow: ${record.reservationNumber}`} onClose={onClose}>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit} noValidate>
        <SelectField label="Reservation Status" name="reservationStatus" value={form.reservationStatus} onChange={onChange} options={reservationStatusOptions.map((item) => ({ label: item, value: item }))} required />
        <SelectField label="Workflow Status" name="workflowStatus" value={form.workflowStatus} onChange={onChange} options={workflowStatusOptions.map((item) => ({ label: item, value: item }))} required />
        <SelectField label="Payment Status" name="paymentStatus" value={form.paymentStatus} onChange={onChange} options={paymentStatusOptions.map((item) => ({ label: item, value: item }))} required />
        <Field label="Updated By" name="updatedBy" value={form.updatedBy} onChange={onChange} required />
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
      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit} noValidate>
        <Field label="Lease Number" name="leaseNumber" value={form.leaseNumber} onChange={onChange} required />
        <SelectField label="Lease Type" name="leaseType" value={form.leaseType} onChange={onChange} options={leaseTypeOptions.map((item) => ({ label: item, value: item }))} required />
        <Field label="Start Date" name="startDate" type="date" value={form.startDate} onChange={onChange} required />
        <Field label="End Date" name="endDate" type="date" value={form.endDate} onChange={onChange} required />
        <Field label="Created By" name="createdBy" value={form.createdBy} onChange={onChange} required />
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

function Field({ label, name, value, onChange, type = "text", required = false }: Readonly<{
  label: string;
  name: string;
  value: string;
  onChange: React.Dispatch<React.SetStateAction<Record<string, string> | null>> | React.Dispatch<React.SetStateAction<Record<string, string>>>;
  type?: string;
  required?: boolean;
}>) {
  return (
    <label className="block text-sm text-ink">
      <span className="mb-2 block font-medium">{label}{required ? <span className="text-rose-600"> *</span> : null}</span>
      <input required={required} type={type} value={value} onChange={(event) => onChange((current: Record<string, string> | null) => ({ ...(current ?? {}), [name]: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-accent" />
    </label>
  );
}

function SelectField({ label, name, value, options, onChange, required = false }: Readonly<{
  label: string;
  name: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: React.Dispatch<React.SetStateAction<Record<string, string> | null>> | React.Dispatch<React.SetStateAction<Record<string, string>>>;
  required?: boolean;
}>) {
  return (
    <label className="block text-sm text-ink">
      <span className="mb-2 block font-medium">{label}{required ? <span className="text-rose-600"> *</span> : null}</span>
      <select required={required} value={value} onChange={(event) => onChange((current: Record<string, string> | null) => ({ ...(current ?? {}), [name]: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-accent">
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function Select({ value, options, placeholder, onChange, labels = {} }: Readonly<{ value: string; options: string[]; placeholder: string; onChange: (value: string) => void; labels?: Record<string, string> }>) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-accent">
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>{labels[option] ?? option}</option>
      ))}
    </select>
  );
}

function Badge({ label }: Readonly<{ label: string }>) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeTone(label)}`}>{label}</span>;
}

function Info({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-steel">{label}</p>
      <p className="mt-1 font-medium text-ink">{value}</p>
    </div>
  );
}

export function ReservationDetailPage({ reservationId }: Readonly<{ reservationId: number }>) {
  const [record, setRecord] = useState<ReservationRecord | null>(null);
  const [history, setHistory] = useState<ReservationHistoryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [reservationData, historyData] = await Promise.all([
          apiGet<ReservationRecord>(`/reservations/${reservationId}`),
          apiGet<ReservationHistoryRecord[]>(`/reservations/${reservationId}/history`)
        ]);
        setRecord(reservationData);
        setHistory(historyData);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Failed to load reservation details");
      }
    }

    void load();
  }, [reservationId]);

  if (error) {
    return (
      <AppShell title="Reservation Details" subtitle="Reservation detail and history.">
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
      </AppShell>
    );
  }

  if (!record) {
    return (
      <AppShell title="Reservation Details" subtitle="Reservation detail and history.">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-sm text-steel">Loading reservation details...</div>
      </AppShell>
    );
  }

  return (
    <AppShell title={record.reservationNumber} subtitle="Property, unit, terms, customer, and reservation history.">
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <Link href="/reservations" className="text-sm font-medium text-accent">Back to Reservations</Link>
          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-ink">{record.propertyName} · {record.unitCode}</h3>
              <p className="mt-2 text-sm text-steel">{record.towerName} · {record.customerName} · {record.leadName ?? "No lead linked"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge label={record.reservationStatus} />
              <Badge label={record.paymentStatus} />
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Info label="Reservation Window" value={`${record.reservationDate} to ${record.expiryDate}`} />
            <Info label="Proposed Lease" value={`${record.proposedLeaseStartDate} to ${record.proposedLeaseEndDate}`} />
            <Info label="Negotiated Rent" value={formatMoney(record.quotedRent, record.currency)} />
            <Info label="Deposit" value={formatMoney(record.depositAmount, record.currency)} />
            <Info label="Workflow" value={record.workflowStatus} />
            <Info label="Created By" value={record.createdBy} />
            <Info label="Converted Lease" value={record.convertedLeaseNumber ?? "-"} />
            <Info label="Notes" value={record.notes ?? "-"} />
          </div>
        </section>
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-steel">Reservation History</p>
          <div className="mt-5 space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-steel">No history entries yet.</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="rounded-2xl bg-cloud p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <p className="font-medium text-ink">{item.actionType}: {item.previousStatus ?? "-"} to {item.newStatus}</p>
                    <p className="text-xs text-steel">{item.createdBy ?? "system"} · {item.createdDate.slice(0, 10)}</p>
                  </div>
                  <p className="mt-2 text-sm text-steel">{item.remarks ?? "-"}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
