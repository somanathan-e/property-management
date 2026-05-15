export type PropertyRecord = {
  id: number;
  propertyCode: string;
  propertyName: string;
  propertyType: string;
  city: string;
  status: string;
};

export type CustomerRecord = {
  id: number;
  customerCode: string;
  customerName: string;
  category: string;
  email: string;
  phone: string;
  status: string;
};

export type LeaseRecord = {
  id: number;
  leaseNumber: string;
  propertyId: number;
  propertyName: string;
  towerId: number;
  towerName: string;
  unitId: number;
  unitName: string;
  leaseType: string;
  leaseStatus: string;
  occupancyStatus: string;
  rentAmount: number;
  currency: string;
  securityDeposit: number;
  totalLeaseUnits: number;
  totalLeaseArea: number;
  totalRent: number;
  totalDeposit: number;
  totalCharges: number;
  renewalStatus: string;
  parentLeaseId: number | null;
  parentLeaseReference: string | null;
  versionNumber: number;
  createdBy: string;
  createdDate: string;
  customerId: number;
  customerName: string;
  unitCode: string;
  requestInitiator: string;
  approvalStatus: string;
  documentStatus: string;
  paymentStatus: string;
  registrationStatus: string;
  handoverStatus: string;
  settlementStatus: string;
  startDate: string;
  endDate: string;
  freePeriodStart: string | null;
  freePeriodEnd: string | null;
  fitOutPeriodStart: string | null;
  fitOutPeriodEnd: string | null;
  notes: string | null;
  latestTransactionType: string;
};

export type LeaseTransactionRecord = {
  id: number;
  leaseId: number;
  leaseNumber: string;
  transactionNumber: string;
  transactionType: string;
  previousVersionNumber: number;
  newVersionNumber: number;
  transactionStatus: string;
  effectiveStartDate: string | null;
  effectiveEndDate: string | null;
  revisedRentAmount: number | null;
  revisedSecurityDeposit: number | null;
  targetUnitId: number | null;
  targetUnitCode: string | null;
  reason: string | null;
  notes: string | null;
  createdBy: string;
  createdDate: string;
};

export type ReservationRecord = {
  id: number;
  reservationNumber: string;
  propertyId: number;
  propertyName: string;
  towerId: number;
  towerName: string;
  unitId: number;
  unitCode: string;
  unitName: string;
  customerId: number;
  customerName: string;
  reservationStatus: string;
  workflowStatus: string;
  paymentStatus: string;
  reservationDate: string;
  expiryDate: string;
  proposedLeaseStartDate: string;
  proposedLeaseEndDate: string;
  totalReservedUnits: number;
  totalReservedArea: number;
  totalRentAmount: number;
  totalDepositAmount: number;
  quotedRent: number;
  currency: string;
  depositAmount: number;
  createdBy: string;
  createdDate: string;
  convertedLeaseId: number | null;
  convertedLeaseNumber: string | null;
  leadName: string | null;
  notes: string | null;
};

export type ReservationUnitRecord = {
  id: number;
  reservationId: number;
  propertyId: number;
  propertyName: string;
  towerId: number;
  towerName: string;
  unitId: number;
  unitNumber: string;
  unitType: string;
  area: number;
  rent: number;
  deposit: number;
  tax: number;
  reservationStatus: string;
};

export type LeaseUnitRecord = {
  id: number;
  leaseId: number;
  propertyId: number;
  propertyName: string;
  unitId: number;
  unitNumber: string;
  area: number;
  rent: number;
  additionalCharges: number;
  deposit: number;
  tax: number;
  fitOutPeriod: string | null;
  unitLeaseStatus: string;
};

export type AvailableUnitRecord = {
  unitId: number;
  propertyId: number;
  towerId: number;
  propertyName: string;
  towerName: string;
  location: string;
  propertyType: string;
  unitNumber: string;
  floor: string;
  unitType: string;
  area: number;
  areaUnit: string;
  availabilityStatus: string;
  availableFromDate: string;
  monthlyRent: number;
  currency: string;
  securityDeposit: number;
  maintenanceCharges: number;
  camCharges: number;
  parkingCharges: number;
  minimumLeaseDuration: string;
  fitOutPeriod: string;
  noticePeriod: string;
  escalationTerms: string;
  furnishingStatus: string;
  amenities: string;
  parkingAvailability: string;
  imageUrl: string;
};

export type ReservationHistoryRecord = {
  id: number;
  reservationId: number;
  previousStatus: string | null;
  newStatus: string;
  actionType: string;
  remarks: string | null;
  createdBy: string | null;
  createdDate: string;
};

export type AssetRecord = {
  id: number;
  assetCode: string;
  assetName: string;
  propertyId: number;
  propertyCode: string;
  category: string;
  status: string;
};

export type TenantRecord = {
  id: number;
  tenantCode: string;
  tenantName: string;
  status: string;
};

export type DashboardSummary = {
  occupancyPercentage: string;
  revenueSummary: string;
  expiringLeases: number;
  vacantUnits: number;
  pendingApprovals: number;
};
