export type Option = {
  label: string;
  value: string;
};

export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  options?: Option[];
  referenceEndpoint?: string;
  referenceLabel?: string;
  referenceValue?: string;
};

export type EntityConfig = {
  title: string;
  subtitle: string;
  endpoint: string;
  columns: { key: string; label: string }[];
  fields: FieldConfig[];
  query?: string;
};

export const entityConfigs: Record<string, EntityConfig> = {
  "/property/properties": {
    title: "Properties",
    subtitle: "Maintain property masters, classifications, and operating status.",
    endpoint: "/properties",
    columns: [
      { key: "propertyCode", label: "Code" },
      { key: "propertyName", label: "Property" },
      { key: "propertyType", label: "Type" },
      { key: "city", label: "City" },
      { key: "status", label: "Status" }
    ],
    fields: [
      { name: "propertyCode", label: "Property Code", type: "text" },
      { name: "propertyName", label: "Property Name", type: "text" },
      { name: "propertyType", label: "Property Type", type: "select", options: [{ label: "Commercial", value: "COMMERCIAL" }, { label: "Residential", value: "RESIDENTIAL" }, { label: "Retail", value: "RETAIL" }] },
      { name: "city", label: "City", type: "text" },
      { name: "status", label: "Status", type: "select", options: [{ label: "Active", value: "ACTIVE" }, { label: "Inactive", value: "INACTIVE" }] }
    ]
  },
  "/property/towers": {
    title: "Towers",
    subtitle: "Maintain tower structures and their alignment to each property.",
    endpoint: "/towers",
    columns: [
      { key: "towerCode", label: "Code" },
      { key: "towerName", label: "Tower" },
      { key: "propertyCode", label: "Property" },
      { key: "status", label: "Status" }
    ],
    fields: [
      { name: "propertyId", label: "Property", type: "select", referenceEndpoint: "/properties?size=100", referenceLabel: "propertyName", referenceValue: "id" },
      { name: "towerCode", label: "Tower Code", type: "text" },
      { name: "towerName", label: "Tower Name", type: "text" },
      { name: "status", label: "Status", type: "select", options: [{ label: "Active", value: "ACTIVE" }, { label: "Inactive", value: "INACTIVE" }] }
    ]
  },
  "/property/units": {
    title: "Units",
    subtitle: "Track unit inventory, occupancy posture, and readiness for leasing.",
    endpoint: "/units",
    columns: [
      { key: "unitCode", label: "Code" },
      { key: "unitName", label: "Unit" },
      { key: "towerCode", label: "Tower" },
      { key: "occupancyStatus", label: "Occupancy" },
      { key: "status", label: "Status" }
    ],
    fields: [
      { name: "propertyId", label: "Property", type: "select", referenceEndpoint: "/properties?size=100", referenceLabel: "propertyName", referenceValue: "id" },
      { name: "towerId", label: "Tower", type: "select", referenceEndpoint: "/towers?size=100", referenceLabel: "towerName", referenceValue: "id" },
      { name: "unitCode", label: "Unit Code", type: "text" },
      { name: "unitName", label: "Unit Name", type: "text" },
      { name: "unitType", label: "Unit Type", type: "select", options: [{ label: "Office", value: "OFFICE" }, { label: "Apartment", value: "APARTMENT" }, { label: "Retail", value: "RETAIL" }] },
      { name: "occupancyStatus", label: "Occupancy Status", type: "select", options: [{ label: "Occupied", value: "OCCUPIED" }, { label: "Vacant", value: "VACANT" }, { label: "Reserved", value: "RESERVED" }] },
      { name: "status", label: "Status", type: "select", options: [{ label: "Active", value: "ACTIVE" }, { label: "Inactive", value: "INACTIVE" }] }
    ]
  },
  "/property/amenities": {
    title: "Amenities",
    subtitle: "Maintain shared amenity records and facility support coverage.",
    endpoint: "/amenities",
    columns: [
      { key: "amenityCode", label: "Code" },
      { key: "amenityName", label: "Amenity" },
      { key: "propertyCode", label: "Property" },
      { key: "category", label: "Category" },
      { key: "status", label: "Status" }
    ],
    fields: [
      { name: "propertyId", label: "Property", type: "select", referenceEndpoint: "/properties?size=100", referenceLabel: "propertyName", referenceValue: "id" },
      { name: "amenityCode", label: "Amenity Code", type: "text" },
      { name: "amenityName", label: "Amenity Name", type: "text" },
      { name: "category", label: "Category", type: "text" },
      { name: "status", label: "Status", type: "select", options: [{ label: "Active", value: "ACTIVE" }, { label: "Inactive", value: "INACTIVE" }] }
    ]
  },
  "/customers/customers": {
    title: "Customers",
    subtitle: "Manage customer accounts, segmentation, and relationship status.",
    endpoint: "/customers",
    columns: [
      { key: "customerCode", label: "Code" },
      { key: "customerName", label: "Customer" },
      { key: "category", label: "Category" },
      { key: "email", label: "Email" },
      { key: "status", label: "Status" }
    ],
    fields: [
      { name: "customerCode", label: "Customer Code", type: "text" },
      { name: "customerName", label: "Customer Name", type: "text" },
      { name: "category", label: "Category", type: "select", options: [{ label: "Corporate", value: "CORPORATE" }, { label: "Private", value: "PRIVATE" }] },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "status", label: "Status", type: "select", options: [{ label: "Active", value: "ACTIVE" }, { label: "Pending", value: "PENDING" }] }
    ]
  },
  "/customers/contacts": {
    title: "Contacts",
    subtitle: "Maintain linked customer contacts, roles, and communication channels.",
    endpoint: "/contacts",
    columns: [
      { key: "contactCode", label: "Code" },
      { key: "fullName", label: "Contact" },
      { key: "customerCode", label: "Customer" },
      { key: "roleTitle", label: "Role" },
      { key: "status", label: "Status" }
    ],
    fields: [
      { name: "customerId", label: "Customer", type: "select", referenceEndpoint: "/customers?size=100", referenceLabel: "customerName", referenceValue: "id" },
      { name: "contactCode", label: "Contact Code", type: "text" },
      { name: "fullName", label: "Full Name", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "roleTitle", label: "Role Title", type: "text" },
      { name: "status", label: "Status", type: "select", options: [{ label: "Active", value: "ACTIVE" }, { label: "Inactive", value: "INACTIVE" }] }
    ]
  },
  "/assets/asset-registry": {
    title: "Asset Registry",
    subtitle: "Track asset ownership, category, and property linkage.",
    endpoint: "/assets",
    columns: [
      { key: "assetCode", label: "Code" },
      { key: "assetName", label: "Asset" },
      { key: "propertyCode", label: "Property" },
      { key: "category", label: "Category" },
      { key: "status", label: "Status" }
    ],
    fields: [
      { name: "assetCode", label: "Asset Code", type: "text" },
      { name: "assetName", label: "Asset Name", type: "text" },
      { name: "propertyId", label: "Property", type: "select", referenceEndpoint: "/properties?size=100", referenceLabel: "propertyName", referenceValue: "id" },
      { name: "category", label: "Category", type: "text" },
      { name: "status", label: "Status", type: "select", options: [{ label: "Active", value: "ACTIVE" }, { label: "Maintenance", value: "MAINTENANCE" }] }
    ]
  },
  "/administration/tenants": {
    title: "Tenants",
    subtitle: "Maintain tenant master records, status, and operating context.",
    endpoint: "/tenants",
    columns: [
      { key: "tenantCode", label: "Code" },
      { key: "tenantName", label: "Tenant" },
      { key: "status", label: "Status" }
    ],
    fields: [
      { name: "tenantCode", label: "Tenant Code", type: "text" },
      { name: "tenantName", label: "Tenant Name", type: "text" },
      { name: "status", label: "Status", type: "select", options: [{ label: "Active", value: "ACTIVE" }, { label: "Inactive", value: "INACTIVE" }] }
    ]
  },
  "/crm/leads": {
    title: "Leads",
    subtitle: "Capture leasing leads and monitor qualification progress.",
    endpoint: "/leads",
    columns: [
      { key: "leadCode", label: "Code" },
      { key: "leadName", label: "Lead" },
      { key: "propertyCode", label: "Property" },
      { key: "source", label: "Source" },
      { key: "stage", label: "Stage" }
    ],
    fields: [
      { name: "propertyId", label: "Property", type: "select", referenceEndpoint: "/properties?size=100", referenceLabel: "propertyName", referenceValue: "id" },
      { name: "leadCode", label: "Lead Code", type: "text" },
      { name: "leadName", label: "Lead Name", type: "text" },
      { name: "source", label: "Source", type: "select", options: [{ label: "Website", value: "WEBSITE" }, { label: "Broker", value: "BROKER" }, { label: "Referral", value: "REFERRAL" }] },
      { name: "status", label: "Status", type: "select", options: [{ label: "Open", value: "OPEN" }, { label: "Nurturing", value: "NURTURING" }, { label: "Closed", value: "CLOSED" }] },
      { name: "stage", label: "Stage", type: "select", options: [{ label: "Initial Review", value: "INITIAL_REVIEW" }, { label: "Qualified", value: "QUALIFIED" }, { label: "Negotiation", value: "NEGOTIATION" }] }
    ]
  },
  "/crm/opportunities": {
    title: "Opportunities",
    subtitle: "Track active opportunities, pipeline stage, and forecast value.",
    endpoint: "/opportunities",
    columns: [
      { key: "opportunityCode", label: "Code" },
      { key: "opportunityName", label: "Opportunity" },
      { key: "propertyCode", label: "Property" },
      { key: "pipelineStage", label: "Stage" },
      { key: "status", label: "Status" }
    ],
    fields: [
      { name: "propertyId", label: "Property", type: "select", referenceEndpoint: "/properties?size=100", referenceLabel: "propertyName", referenceValue: "id" },
      { name: "customerId", label: "Customer", type: "select", referenceEndpoint: "/customers?size=100", referenceLabel: "customerName", referenceValue: "id" },
      { name: "opportunityCode", label: "Opportunity Code", type: "text" },
      { name: "opportunityName", label: "Opportunity Name", type: "text" },
      { name: "pipelineStage", label: "Pipeline Stage", type: "select", options: [{ label: "Qualified", value: "QUALIFIED" }, { label: "Proposal", value: "PROPOSAL" }, { label: "Negotiation", value: "NEGOTIATION" }] },
      { name: "estimatedValue", label: "Estimated Value", type: "number" },
      { name: "status", label: "Status", type: "select", options: [{ label: "Open", value: "OPEN" }, { label: "Active", value: "ACTIVE" }, { label: "Closed", value: "CLOSED" }] }
    ]
  },
  "/crm/prospects": {
    title: "Prospects",
    subtitle: "Monitor qualified prospects before negotiation and lease conversion.",
    endpoint: "/prospects",
    columns: [
      { key: "prospectCode", label: "Code" },
      { key: "prospectName", label: "Prospect" },
      { key: "propertyCode", label: "Property" },
      { key: "interestType", label: "Interest" },
      { key: "status", label: "Status" }
    ],
    fields: [
      { name: "propertyId", label: "Property", type: "select", referenceEndpoint: "/properties?size=100", referenceLabel: "propertyName", referenceValue: "id" },
      { name: "prospectCode", label: "Prospect Code", type: "text" },
      { name: "prospectName", label: "Prospect Name", type: "text" },
      { name: "interestType", label: "Interest Type", type: "text" },
      { name: "status", label: "Status", type: "select", options: [{ label: "New", value: "NEW" }, { label: "Qualified", value: "QUALIFIED" }, { label: "Shortlisted", value: "SHORTLISTED" }] }
    ]
  }
};
