# Enterprise Property Management System
## Spec-Driven Product and Delivery Specification

---

# 1. Purpose

This specification translates `TECHSTACK.md`, `UI-UX-DESIGN.md`, and `AGENTS.md` into an implementation baseline for the Enterprise Property Management System.

It defines:

- product scope
- module boundaries
- screen requirements
- service and data requirements
- technical constraints
- delivery phases
- acceptance criteria
- definition of done

---

# 2. Product Summary

The PMS is an enterprise-grade platform for managing property portfolios, units, tenants, customers, reservations, leases, sales, billing, collections, operations, governance, notifications, analytics, and integrations.

The system must be:

- CoreConnect-compatible
- modular
- secure
- workflow-driven
- dashboard-centric
- tenant-ready
- auditable
- maintainable

Base application context:

```text
/property-management
```

---

# 3. Technology Constraints

Implementation must comply with `TECHSTACK.md`.

## 3.1 Frontend

- Next.js
- base path `/property-management`
- enterprise SaaS layout from `UI-UX-DESIGN.md`
- left navigation plus top header
- dashboard, workflow, table, tab, timeline, notification, and attachment components

## 3.2 Backend

- Java 17
- Jakarta EE 10
- CoreConnect-compatible WAR packaging
- Maven build
- Apache CXF 4.1.0 SOAP / JAX-WS baseline
- CXF CDI integration
- CXF WS-Security where secured SOAP services are required
- service implementations separated from endpoint adapters

## 3.3 Persistence

- MySQL
- MyBatis 3.5.19
- MyBatis CDI 2.0.2
- MySQL Connector/J 9.2.0
- HikariCP 6.3.0
- XML mapper files under `src/main/resources/com/eba/<module>/mappers/`
- mapper interfaces under `src/main/java/com/eba/<module>/mappers/`

## 3.4 Supporting Stack

- ActiveMQ for asynchronous messaging where required
- Quartz for scheduled jobs
- SolrJ for search-heavy use cases where required
- Apache Tika and Zip4j for document processing
- JasperReports, iText, and OpenPDF for reporting/PDF output
- OpenCSV and JXLS/POI for import/export
- AWS S3 SDK for approved object storage integration
- Hibernate Validator and MapStruct for validation and mapping
- SLF4J and Log4j for logging

REST APIs, JWT, Docker, Nginx, Swagger/OpenAPI, and Kubernetes are future or adapter concerns unless separately approved. They are not the required baseline for this specification.

---

# 4. In Scope

Phase 1 product baseline includes:

- Home Dashboard
- Property Management
- Customer Management
- Commercial Management
- Financial Management
- Operations Management
- Governance Management
- Enterprise Services foundation
- CoreConnect-compatible backend module structure
- MyBatis XML persistence
- MySQL tenant-ready schema
- audit logging foundation
- workflow and approval foundation
- notification foundation
- analytics and integration console foundation
- WAR deployment readiness

---

# 5. Out of Scope for Initial Baseline

Unless approved later, the first baseline does not require:

- native mobile apps
- smart IoT integration
- advanced tenant branding
- Kubernetes deployment
- production-grade external payment gateway integration
- full accounting engine implementation
- fully automated legal notice delivery
- REST/JWT replacement of the CXF SOAP/JAX-WS baseline

---

# 6. Target Users

- system administrators
- property managers
- leasing managers
- CRM users
- tenant/customer service teams
- finance and collections users
- operations and facility teams
- governance and compliance users
- executives

---

# 7. Global Navigation and Screen Model

The frontend must implement the navigation structure from `UI-UX-DESIGN.md`.

Required groups:

- Home Dashboard
- Property Management
- Customer Management
- Commercial Management
- Financial Management
- Operations Management
- Governance Management
- Enterprise Services

The application shell must include:

- logo/product identity
- global search
- notifications
- user profile
- left module navigation
- main content workspace

---

# 8. Functional Requirements

## 8.1 Home Dashboard

The Home Dashboard shall provide:

- Occupancy KPI
- Revenue KPI
- Outstanding KPI
- Maintenance KPI
- Expiring Leases KPI
- portfolio analytics
- revenue trends
- occupancy heatmap
- open work orders
- alerts and pending approvals

Acceptance criteria:

- dashboard loads under `/property-management`
- KPIs are clearly visible in first viewport on desktop
- alerts and approvals are accessible from the dashboard
- dashboard data is sourced through backend services or documented mock/service placeholders during early phases

## 8.2 Property Management

Screens:

- Portfolio Dashboard
- Property Master
- Building & Floor Management
- Unit Master
- Ownership & Legal
- Community & Amenities

Portfolio Dashboard sections:

- Total Properties
- Occupied Units
- Vacant Units
- Revenue by Property
- Property Performance
- Upcoming Expirations

Property Master tabs:

- General Information
- Building Structure
- Amenities
- Financial Setup
- Documents
- Audit Trail

Unit Master layout:

- left panel for building tree, floors, and units
- right panel for unit details, lease status, occupancy, charges, and attachments

Acceptance criteria:

- users can create, update, view, and deactivate property records
- properties support classification, ownership/legal, financial, document, and audit metadata
- units are uniquely identifiable within building/floor/property context
- occupancy and lease status are visible from unit screens

## 8.3 Customer Management

Screens:

- Customer Dashboard
- Tenant Management
- Broker & Agency
- CRM & Leads

Customer Dashboard widgets:

- Active Tenants
- New Customers
- Pending KYC
- Expiring Contracts

Tenant Profile tabs:

- Profile
- Lease History
- Payments
- Complaints
- Documents

Acceptance criteria:

- customer records support profile, KYC, contact, contract, financial, request, and document data
- a customer/tenant can have multiple contacts
- broker and agency data can be associated with leasing demand
- CRM lead data can progress into commercial workflows

## 8.4 Commercial Management

Screens:

- Reservation Management
- Lease Management
- Sales Management

Reservation workflow:

```text
Unit Availability Grid
-> Reservation Form
-> Payment Details
-> Approval Workflow
-> Reservation Confirmation
```

Lease header actions:

- Create Lease
- Renew
- Amend
- Terminate
- Print

Lease tabs:

- Lease Details
- Payment Terms
- Billing Schedule
- Approvals
- Documents
- Audit Logs

Lease workflow states:

- Draft
- Pending Approval
- Approved
- Active
- Expired

Sales Management sections:

- Unit Selection
- Pricing
- Payment Plan
- Installments
- SPA Documents
- Handover Status

Acceptance criteria:

- reservations show unit details, customer summary, and reservation timeline
- lease records can be created against customer and unit inventory
- lease approval status is visible through a workflow sidebar
- lease changes are auditable
- active lease allocation must prevent conflicting occupancy assignment

## 8.5 Financial Management

Screens:

- Billing Dashboard
- Payments & Receivables
- Collections & Recovery
- Accounting Integration

Billing Dashboard widgets:

- Total Invoices
- Due Amount
- Overdue Amount
- Collection %
- VAT Summary

Billing grid columns:

```text
Invoice No | Customer | Property | Amount | Due Date | Status
```

Collections buckets:

- Current Due
- 30 Days
- 60 Days
- 90+ Days
- Legal Escalation

Collections actions:

- Send Reminder
- Call Log
- Escalate
- Legal Notice
- Settlement

Acceptance criteria:

- billing and receivable records are searchable and filterable
- aging buckets expose current and overdue exposure
- collection actions create audit entries
- accounting integration status is visible even if external integration is initially stubbed

## 8.6 Operations Management

Screens:

- Maintenance Dashboard
- Preventive Maintenance
- Facility Management
- Vendor Management
- Inspection & Handover
- Utility Management

Maintenance Dashboard KPIs:

- Open Requests
- SLA Breaches
- In Progress
- Completed Today

Work Order sections:

- Request Info
- Assignment
- SLA
- Execution
- Closure

Inspection and handover process:

```text
Checklist
-> Snagging
-> Photos
-> Approvals
-> Customer Acceptance
-> Closure
```

Acceptance criteria:

- work orders support priority, assignment, SLA, notes, attachments, and closure data
- preventive maintenance can be scheduled
- vendor assignment can be tracked
- inspection and handover workflows preserve approval and audit history

## 8.7 Governance Management

Screens:

- Document Management
- Workflow & Approvals
- Security & Access
- Compliance & Audit

Workflow and Approval layout:

- Pending Tasks
- Approval Queue
- Escalations
- Approval Timeline
- Workflow Designer

Workflow statuses:

- Submitted
- Under Review
- Approved
- Rejected
- Escalated

Security and Access modules:

- User Management
- Role Management
- Permission Matrix
- Login Audit
- Access Requests

Acceptance criteria:

- workflow status is visible and auditable
- approvals can be tracked by task, actor, timestamp, and outcome
- users, roles, permissions, login audit, and access requests are modeled
- documents can be attached to relevant business records

## 8.8 Enterprise Services

Screens:

- Notifications
- Analytics Dashboard
- Integration Console

Analytics dashboard areas:

- Portfolio Analytics
- Financial Analytics
- Occupancy Trends
- Lease Expiry Forecast
- Maintenance Analytics

Analytics filters:

```text
Property | Region | Date | Building | Tenant Type
```

Integration Console columns:

```text
Interface | Status | Last Sync | Errors
```

Acceptance criteria:

- notification events can be generated by lease, approval, maintenance, collection, and system activities
- analytics screens support the documented filter model
- integration console displays interface status, last sync, and error count

---

# 9. Cross-Module Business Rules

- all business records must include audit metadata
- soft delete must be used where applicable
- modules must not duplicate master data ownership
- property, unit, customer, asset, and configuration masters are shared across workflows
- workflow actions must be auditable
- approval-sensitive actions must capture actor, date/time, status, and remarks
- tenant-aware design must be preserved in schema and service design
- service endpoint adapters must not contain business logic

---

# 10. Backend Specification Rules

Mandatory Java module structure:

```text
src/main/java/com/eba/<module>/
 ├── controller/
 ├── domain/
 ├── dto/
 ├── entity/
 ├── mappers/
 ├── service/
 ├── service/impl/
 ├── util/
 ├── validator/
 └── config/
```

Mandatory MyBatis XML structure:

```text
src/main/resources/com/eba/<module>/mappers/
```

Backend requirements:

- Jakarta EE 10 APIs
- CoreConnect-compatible naming
- Apache CXF SOAP/JAX-WS service contracts
- service interfaces and implementations
- MyBatis XML mapper persistence
- validation before persistence
- centralized business error/fault handling
- transaction safety for multi-step business operations
- audit logging for business changes

---

# 11. Data Specification Rules

Database design must follow:

- MySQL compatibility
- snake_case naming
- foreign key integrity
- indexed searchable columns
- tenant-ready design
- soft-delete design
- audit columns on business tables

Mandatory audit fields:

```sql
created_by
created_date
updated_by
updated_date
is_deleted
tenant_id
```

Initial data domains:

- property, building, floor, tower, unit, amenity
- ownership and legal records
- customer, tenant, contact, broker, agency, KYC/document references
- lead and CRM demand records
- reservation, lease, lease_unit, sale
- invoice, payment, receivable, collection action
- work order, preventive maintenance, vendor, inspection, utility
- document, workflow, approval, user, role, permission, audit
- notification, analytics snapshot, integration status

---

# 12. Frontend Specification Rules

The frontend shall:

- use Next.js with `/property-management` base path
- implement the global navigation from `UI-UX-DESIGN.md`
- use left navigation plus top header
- provide search, notifications, alerts, and user profile access
- use KPI tiles, smart tables, tabs, workflow sidebars, timelines, attachment panels, filter panels, and notification center patterns
- keep screens dense, operational, and suitable for repeated ERP use
- support responsive layouts
- avoid unrelated marketing or landing-page screens

Frontend environment:

```env
NEXT_PUBLIC_BASE_PATH=/property-management
```

If a service adapter URL is needed, it must match the approved CoreConnect deployment path for the environment.

---

# 13. Non-Functional Requirements

## 13.1 Security

- authentication required for protected operations
- role and permission checks for governed workflows
- encryption for sensitive credentials/secrets using approved stack utilities
- CXF WS-Security where SOAP service security applies
- security-sensitive operations must be audited

## 13.2 Performance

- dashboard summaries must use optimized queries or aggregates
- list screens must support pagination or equivalent server-side slicing
- searchable fields must be indexed
- MyBatis queries must avoid avoidable full scans
- large import/export jobs should use batch or scheduled processing

## 13.3 Reliability

- multi-step business operations must be transaction-safe
- integration status must expose failures
- scheduled jobs must be idempotent where practical
- service errors must be explicit and support troubleshooting

## 13.4 Maintainability

- module boundaries must remain consistent
- shared logic belongs in common/shared packages only when truly cross-cutting
- service contracts must be stable and documented
- mapping and validation should use approved stack components

## 13.5 Observability

- logging via SLF4J and Log4j
- business audit events queryable by module and record
- integration status visible in Enterprise Services
- scheduled job failures must be logged

---

# 14. Delivery Plan

## Phase 1: Core Foundation

- repository structure alignment
- Next.js base path
- CoreConnect-compatible WAR build baseline
- Jakarta EE/CXF service foundation
- MyBatis configuration and mapper structure
- MySQL connection pooling through HikariCP
- audit model foundation
- common validation and error handling

Exit criteria:

- frontend loads under `/property-management`
- backend WAR builds
- sample service contract executes in the target runtime pattern
- MyBatis mapper round trip works

## Phase 2: Property and Customer Masters

- Property Management screens
- Customer Management screens
- shared property/unit/customer masters
- KYC/document reference foundation
- searchable and paginated smart tables

Exit criteria:

- property hierarchy can be maintained
- unit master shows occupancy/lease status
- customer/tenant profile data is maintainable
- audit metadata is persisted

## Phase 3: Commercial Workflows

- reservation workflow
- lease workflow
- lease approval states
- lease documents and audit logs
- sales management foundation

Exit criteria:

- reservation can progress through approval
- lease can move from draft to active
- lease changes are auditable
- conflicting active unit allocation is prevented

## Phase 4: Finance and Operations

- billing dashboard
- receivables and collections
- accounting integration status
- maintenance dashboard
- work orders
- inspection and handover
- vendor and utility foundations

Exit criteria:

- billing and collections screens expose required KPIs and grids
- work orders support assignment and closure
- inspection process supports checklist to closure

## Phase 5: Governance and Enterprise Services

- document management
- workflow and approvals
- security and access
- compliance and audit
- notifications
- analytics dashboard
- integration console

Exit criteria:

- approval queue and timeline are usable
- permission matrix and login audit are represented
- notifications can be generated from business events
- integration console shows interface status

## Phase 6: Reporting, Hardening, and UAT

- JasperReports-based reporting
- export/import workflows
- performance tuning
- security review
- UAT scenario completion

Exit criteria:

- UAT-critical flows pass
- reports and exports meet acceptance
- deployment package is ready for target environment

---

# 15. Testing Strategy

Required testing:

- service unit tests for business rules
- mapper tests for MyBatis SQL behavior
- validation tests for DTO/request models
- workflow tests for approval and lease state transitions
- authorization tests for governed actions
- frontend tests or manual QA evidence for critical screens
- UAT scenarios for end-to-end workflows

Critical UAT scenarios:

- user access/login
- property creation and hierarchy setup
- unit creation and occupancy status update
- customer/tenant onboarding
- reservation creation and approval
- lease creation and activation
- lease renewal/amendment/termination
- invoice and collection follow-up
- work order creation and closure
- inspection and handover completion
- approval queue processing
- notification visibility
- integration status review

---

# 16. Acceptance Criteria

The first acceptable release must satisfy:

- application runs under `/property-management`
- frontend navigation matches `UI-UX-DESIGN.md`
- backend aligns with `TECHSTACK.md`
- CoreConnect-compatible WAR build is available
- Jakarta EE/CXF service baseline is followed
- MyBatis XML mappers are placed in mandated module paths
- MySQL schema follows audit, soft-delete, tenant-ready, and indexing rules
- property, customer, commercial, financial, operations, governance, and enterprise service foundations are represented
- workflow and approval actions are auditable
- dashboard and smart table screens are usable and responsive
- logging and audit behavior support troubleshooting

---

# 17. Definition of Done

A module is done only when:

- requirements are implemented
- screen structure matches `UI-UX-DESIGN.md`
- service contract is documented
- validation rules are enforced
- MyBatis interface and XML mapper are in the required paths
- audit logging is included
- role/permission assumptions are documented and implemented where applicable
- critical business rules have tests
- UI flow is usable and responsive
- deployment/build configuration is updated if needed

---

# 18. Risks and Controls

Key risks:

- drifting from CoreConnect stack into incompatible frameworks
- inconsistent screen coverage against `UI-UX-DESIGN.md`
- unclear lease, reservation, finance, and operations workflow rules
- weak audit enforcement
- poor query performance on dashboard/table screens
- integration status not visible enough for operations

Controls:

- review implementation against `TECHSTACK.md` before adding dependencies
- review navigation and screens against `UI-UX-DESIGN.md`
- require service/data design before implementing complex workflows
- enforce audit fields and approval logs in tests
- index search-heavy data paths
- expose integration status in Enterprise Services

---

# 19. Implementation Directive

All design and development work must trace to this specification, `AGENTS.md`, `TECHSTACK.md`, and `UI-UX-DESIGN.md`.

Future module documents may add:

- detailed business rules
- DTO/service contract schemas
- SOAP operation inventories
- database entity definitions
- workflow states
- validation rules
- UAT scenarios

They must not override the CoreConnect stack baseline without an explicit update to `TECHSTACK.md`.
