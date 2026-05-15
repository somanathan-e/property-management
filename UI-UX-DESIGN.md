# Property Management Solution – Enterprise Navigation & Screen Design Structure

# Global Navigation Structure

```text
Home Dashboard
│
├── Property Management
│   ├── Portfolio Dashboard
│   ├── Property Master
│   ├── Building & Floor Management
│   ├── Unit Master
│   ├── Ownership & Legal
│   └── Community & Amenities
│
├── Customer Management
│   ├── Customer Dashboard
│   ├── Tenant Management
│   ├── Broker & Agency
│   └── CRM & Leads
│
├── Commercial Management
│   ├── Reservation Management
│   ├── Lease Management
│   └── Sales Management
│
├── Financial Management
│   ├── Billing Dashboard
│   ├── Payments & Receivables
│   ├── Collections & Recovery
│   └── Accounting Integration
│
├── Operations Management
│   ├── Maintenance Dashboard
│   ├── Preventive Maintenance
│   ├── Facility Management
│   ├── Vendor Management
│   ├── Inspection & Handover
│   └── Utility Management
│
├── Governance Management
│   ├── Document Management
│   ├── Workflow & Approvals
│   ├── Security & Access
│   └── Compliance & Audit
│
└── Enterprise Services
    ├── Notifications
    ├── Analytics Dashboard
    └── Integration Console
```

# 1. Enterprise Home Dashboard Screen

## Layout Structure

```text
┌─────────────────────────────────────────────────────────────┐
│ Logo | Search | Notifications | User Profile              │
├──────────────┬──────────────────────────────────────────────┤
│ Left Menu    │ Executive KPI Dashboard                     │
│              │                                              │
│ Modules      │ [ Occupancy ] [ Revenue ] [ Outstanding ]   │
│              │ [ Maintenance ] [ Expiring Leases ]         │
│              │                                              │
│              │ Portfolio Analytics                          │
│              │ Revenue Trends                               │
│              │ Occupancy Heatmap                            │
│              │ Open Work Orders                             │
│              │ Alerts & Pending Approvals                   │
└──────────────┴──────────────────────────────────────────────┘
```

# 2. Property Management Screens

## 2.1 Property Portfolio Dashboard

### Sections
- Total Properties
- Occupied Units
- Vacant Units
- Revenue by Property
- Property Performance
- Upcoming Expirations

### Navigation Tabs

```text
Overview | Buildings | Units | Ownership | Documents | Analytics
```

## 2.2 Property Master Screen

```text
Header
----------------------------------------------------
Property Code | Property Name | Status | Actions

Tabs
----------------------------------------------------
General Information
Building Structure
Amenities
Financial Setup
Documents
Audit Trail
```

### Main Form Areas

| Section | Fields |
|---|---|
| General Info | Property Name, Type, Region, Address |
| Classification | Category, Usage Type, Community |
| Ownership | Owner, Legal Entity |
| Financial | Currency, Tax Group |
| Status | Active/Inactive |

## 2.3 Unit Master Screen

### Split Layout

```text
Left Panel
- Building Tree
- Floors
- Units

Right Panel
- Unit Details
- Lease Status
- Occupancy
- Charges
- Attachments
```

# 3. Customer Management Screens

## 3.1 Customer Dashboard

### KPI Widgets
- Active Tenants
- New Customers
- Pending KYC
- Expiring Contracts

### Main Areas

```text
Customer List
Customer Timeline
Communication History
Open Requests
Documents
```

## 3.2 Tenant Profile Screen

### Tabs

```text
Profile | Lease History | Payments | Complaints | Documents
```

### Sections

| Area | Description |
|---|---|
| Personal Details | Name, ID, Contact |
| KYC | Emirates ID, Passport |
| Contracts | Active/Expired Leases |
| Financial | Outstanding, Payments |
| Requests | Maintenance, Complaints |

# 4. Commercial Management Screens

## 4.1 Reservation Management

```text
Select Unit Mode
↓
Select Property
↓
Select Tower
↓
Search and Add Unit(s)
↓
Reservation Form
↓
Payment Details
↓
Approval Workflow
↓
Reservation Confirmation
```

### Side Panels
- Unit Details
- Customer Summary
- Reservation Timeline

### New Reservation Unit Selection

| Mode | Behavior |
|---|---|
| Single Unit | Default flow for one available unit |
| Multiple Units | Manual search-and-add flow for multiple units in one transaction |

Multiple Units rules:

- Select Property first.
- Load only available Towers for the selected Property and period.
- Select Tower before searching for units.
- Search units manually and add units one by one.
- Do not display all available units in a large grid.
- Show selected units in a compact grid with Unit Number, Floor, Area, Rent, Deposit, Charges, and Remove.
- Show consolidated Total Area, Total Rent, Total Deposit, and Total Charges.
- Prevent duplicate units and units that are inactive, unavailable, already reserved, or already leased during the selected period.
- Multi-unit selection is allowed only within the same Property.

## 4.2 Lease Management Screen

### Header Actions

```text
Create Lease | Renew | Amend | Terminate | Print
```

### Tabs

```text
Lease Details
Payment Terms
Billing Schedule
Approvals
Documents
Audit Logs
```

### Workflow Sidebar
- Draft
- Pending Approval
- Approved
- Active
- Expired

### New Lease Unit Selection

New Lease must use the same unit-selection model as New Reservation:

| Mode | Behavior |
|---|---|
| Single Unit | Default flow for one available unit |
| Multiple Units | Manual search-and-add flow for multiple units in one transaction |

The Multiple Units flow must:

- filter Properties, Towers, and Units by lease period and availability
- load Towers only after Property selection
- load/search Units only after Tower selection
- let users add and remove units manually
- keep all selected units within one Property
- show Unit Number, Floor, Area, Rent, Deposit, Charges, and Remove in the selected units grid
- show consolidated Total Area, Total Rent, Total Deposit, and Total Charges
- validate availability again while adding a unit

## 4.3 Sales Management

### Sections
- Unit Selection
- Pricing
- Payment Plan
- Installments
- SPA Documents
- Handover Status

# 5. Financial Management Screens

## 5.1 Billing Dashboard

### Widgets
- Total Invoices
- Due Amount
- Overdue Amount
- Collection %
- VAT Summary

### Main Grid

```text
Invoice No | Customer | Property | Amount | Due Date | Status
```

## 5.2 Collections & Recovery

### Kanban Layout

```text
Current Due
30 Days
60 Days
90+ Days
Legal Escalation
```

### Action Panel
- Send Reminder
- Call Log
- Escalate
- Legal Notice
- Settlement

# 6. Operations Management Screens

## 6.1 Maintenance Dashboard

### KPI Tiles
- Open Requests
- SLA Breaches
- In Progress
- Completed Today

### Layout

```text
Work Order Queue
Maintenance Calendar
Technician Assignment
Map View
```

## 6.2 Work Order Screen

### Sections

| Section | Details |
|---|---|
| Request Info | Request Number, Priority |
| Assignment | Technician/Vendor |
| SLA | Response Time |
| Execution | Notes, Attachments |
| Closure | Confirmation |

## 6.3 Inspection & Handover

### Process View

```text
Checklist
↓
Snagging
↓
Photos
↓
Approvals
↓
Customer Acceptance
↓
Closure
```

# 7. Governance Management Screens

## 7.1 Workflow & Approval Screen

### Layout

```text
Pending Tasks
Approval Queue
Escalations
Approval Timeline
Workflow Designer
```

### Workflow Status
- Submitted
- Under Review
- Approved
- Rejected
- Escalated

## 7.2 Security & Access Screen

### Modules
- User Management
- Role Management
- Permission Matrix
- Login Audit
- Access Requests

# 8. Enterprise Services Screens

## 8.1 Analytics Dashboard

### Dashboard Areas
- Portfolio Analytics
- Financial Analytics
- Occupancy Trends
- Lease Expiry Forecast
- Maintenance Analytics

### Filters

```text
Property | Region | Date | Building | Tenant Type
```

## 8.2 Integration Console

### Layout

| Interface | Status | Last Sync | Errors |
|---|---|---|---|
| ERP | Success | 10 mins ago | 0 |
| Payment Gateway | Running | 2 mins ago | 0 |
| Email Service | Warning | 30 mins ago | 2 |

# Common UI Components

| Component | Usage |
|---|---|
| Left Navigation | Module access |
| Top Header | Search, alerts, profile |
| KPI Tiles | Operational visibility |
| Smart Tables | Transactions |
| Tabs | Logical grouping |
| Workflow Sidebar | Approval visibility |
| Timeline Panels | Activity tracking |
| Attachment Panel | Document handling |
| Notification Center | Alerts and reminders |

# Recommended Enterprise UI Style

| Area | Recommendation |
|---|---|
| Style | Modern Enterprise SaaS |
| Layout | Left navigation + top header |
| Theme | Blue/White/Gray |
| Components | Card-based responsive UI |
| Tables | Filterable and exportable |
| Workflow | Visual approval indicators |
| Dashboards | Real-time widgets and charts |
| UX | Minimal clicks with contextual actions |
