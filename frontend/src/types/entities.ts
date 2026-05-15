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
  quotedRent: number;
  currency: string;
  depositAmount: number;
  createdBy: string;
  createdDate: string;
  convertedLeaseId: number | null;
  convertedLeaseNumber: string | null;
  notes: string | null;
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
