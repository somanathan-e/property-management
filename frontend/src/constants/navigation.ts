export type NavigationItem = {
  label: string;
  href: string;
  description: string;
};

export type NavigationSection = {
  title: string;
  items: NavigationItem[];
};

export const navigationSections: NavigationSection[] = [
  {
    title: "Dashboard",
    items: [
      { label: "Executive Overview", href: "/dashboard", description: "Portfolio health, occupancy, revenue, and approval signals." },
      { label: "Leasing Metrics", href: "/dashboard/leasing-metrics", description: "Renewal risk, pipeline momentum, and move activity." },
      { label: "Reporting", href: "/dashboard/reporting", description: "Cross-portfolio trends, exports, and executive analytics." }
    ]
  },
  {
    title: "Property Management",
    items: [
      { label: "Properties", href: "/property/properties", description: "Maintain property masters and operating status." },
      { label: "Towers", href: "/property/towers", description: "Organize tower hierarchy within each property." },
      { label: "Units", href: "/property/units", description: "Track unit readiness, occupancy, and inventory status." },
      { label: "Amenities", href: "/property/amenities", description: "Administer shared amenities and facility services." }
    ]
  },
  {
    title: "Lease Management",
    items: [
      { label: "Reservations", href: "/reservations", description: "Run unit reservations, payment capture, approval workflow, and lease conversion." },
      { label: "Leases", href: "/leases", description: "Run lease records, renewals, amendments, and approvals from one workspace." },
      { label: "Unit Availability", href: "/unit-availability", description: "Search current and future unit availability across properties and towers." }
    ]
  },
  {
    title: "CRM",
    items: [
      { label: "Leads", href: "/crm/leads", description: "Capture and qualify early-stage leasing demand." },
      { label: "Opportunities", href: "/crm/opportunities", description: "Monitor pipeline value and deal progression." },
      { label: "Prospects", href: "/crm/prospects", description: "Review qualified prospects approaching lease conversion." }
    ]
  },
  {
    title: "Customers",
    items: [
      { label: "Customers", href: "/customers/customers", description: "Manage customer entities, segments, and account health." },
      { label: "Contacts", href: "/customers/contacts", description: "Maintain customer contacts, roles, and communication channels." }
    ]
  },
  {
    title: "Assets",
    items: [
      { label: "Asset Registry", href: "/assets/asset-registry", description: "Control building and operational asset records." },
      { label: "Building Assets", href: "/assets/building-assets", description: "Review asset distribution by property and site." }
    ]
  },
  {
    title: "Administration",
    items: [
      { label: "Users", href: "/administration/users", description: "Review workforce access, ownership, and role coverage." },
      { label: "Roles", href: "/administration/roles", description: "Define role scope and operating responsibilities." },
      { label: "Permissions", href: "/administration/permissions", description: "Audit permission matrices and control boundaries." },
      { label: "Configurations", href: "/administration/configurations", description: "Maintain system baselines and operational settings." },
      { label: "Tenants", href: "/administration/tenants", description: "Maintain tenant master records and lifecycle status." }
    ]
  }
];
