# Enterprise Property Management System
## Global Architecture, Technical Design & Development Standards

---

# Document Information

| Item | Value |
|---|---|
| Document Name | `AGENTS.md` |
| Product | Enterprise Property Management System |
| Architecture Style | CoreConnect-aligned modular enterprise architecture |
| Frontend | Next.js |
| Backend | Jakarta EE 10 |
| Backend Artifact | CoreConnect-compatible WAR |
| Integration/API Style | Apache CXF SOAP / JAX-WS baseline |
| Persistence | MyBatis XML mappers |
| Database | MySQL |
| Build Tool | Maven |
| Base Context Path | `/property-management` |
| Primary References | `TECHSTACK.md`, `UI-UX-DESIGN.md`, `SPEC.md` |

---

# 1. Product Vision

The Enterprise Property Management System (PMS) manages the lifecycle of commercial and residential property operations in a CoreConnect-compatible enterprise stack.

The platform provides:

- property portfolio management
- building, floor, tower, and unit management
- tenant and customer lifecycle management
- reservation, lease, and sales workflows
- billing, receivables, collections, and accounting handoff visibility
- maintenance, facility, vendor, inspection, handover, and utility operations
- document, workflow, approval, access, compliance, and audit governance
- notifications, analytics, and integration monitoring
- tenant-ready and SaaS-ready data foundations

---

# 2. Source of Truth

Implementation must follow these repository documents:

- `TECHSTACK.md`: mandatory runtime, backend, dependency, build, and deployment stack
- `UI-UX-DESIGN.md`: mandatory navigation, screen structure, component expectations, and enterprise UI model
- `AGENTS.md`: global architecture and engineering standards
- `SPEC.md`: execution scope, functional requirements, acceptance criteria, and delivery baseline

When documents conflict, use this priority:

1. `TECHSTACK.md` for technical stack and dependency choices
2. `UI-UX-DESIGN.md` for navigation and screen layout
3. `SPEC.md` for implementation scope and acceptance criteria
4. `AGENTS.md` for global architectural standards

---

# 3. Mandated Technology Stack

The backend must align to CoreConnect and `TECHSTACK.md`.

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Jakarta EE 10 |
| Java | 17 |
| Artifact | WAR |
| Group ID | `com.eba` |
| Core artifact baseline | `coreConnect` |
| Integration/API | Apache CXF 4.1.0 SOAP / JAX-WS |
| Persistence | MyBatis 3.5.19 |
| MyBatis CDI | 2.0.2 |
| Database | MySQL |
| JDBC Driver | MySQL Connector/J 9.2.0 |
| Connection Pool | HikariCP 6.3.0 |
| Messaging | ActiveMQ 6.1.4 |
| Scheduling | Quartz 2.5.0 |
| Search | SolrJ 9.8.1 |
| Document Processing | Apache Tika 2.9.2, Zip4j 2.11.5 |
| Reporting/PDF | JasperReports 7.0.0, iText 5.5.13.4, OpenPDF 1.3.40 |
| File Processing | OpenCSV 5.10, JXLS Reader 2.1.0, JXLS POI 3.0.0 |
| Cloud Storage | AWS S3 SDK 1.12.782 |
| Validation | Hibernate Validator 8.0.2.Final |
| Mapping | MapStruct 1.6.3 |
| Utilities | Gson, Commons Lang, Joda-Time, ICU4J |
| Security Utilities | Jasypt, CXF WS-Security |
| Logging | SLF4J 2.1.0-alpha1, Log4j 3.0.0-alpha1 |
| Build | Maven |

REST endpoints, JWT, Docker, Nginx, Swagger/OpenAPI, and Kubernetes are not the baseline mandated stack unless introduced as an approved adapter or future deployment layer. Do not design first-pass backend modules around Spring Boot conventions.

---

# 4. Global Context Path

The application must run under:

```text
/property-management
```

Frontend routes must use the Next.js base path:

```js
basePath: "/property-management"
```

Backend services must be deployable under the same application context in the CoreConnect WAR/container environment.

Local development adapters must also preserve this context path. The current Docker/Nginx development wrapper exposes:

```text
http://localhost/property-management
http://localhost/property-management/api/v1
```

These adapters are allowed for local verification only; they must not move business logic out of module service classes or replace the CoreConnect WAR/CXF baseline.

---

# 5. High-Level Architecture

```text
+----------------------------------------------------------+
|                    Next.js Frontend                      |
| Left Navigation | Top Header | Dashboards | Workflows    |
+-------------------------------|--------------------------+
                                |
                                v
+----------------------------------------------------------+
|               Jakarta EE 10 CoreConnect WAR              |
| Apache CXF SOAP/JAX-WS Services | CDI | Validation       |
+-------------------------------|--------------------------+
                                |
                                v
+----------------------------------------------------------+
|                MyBatis XML Mapper Layer                  |
| Module mapper interfaces + XML result maps/dynamic SQL   |
+-------------------------------|--------------------------+
                                |
                                v
+----------------------------------------------------------+
|                         MySQL                            |
| Tenant-ready, audited, indexed, soft-delete data model    |
+----------------------------------------------------------+
```

---

# 6. Frontend Architecture

## 6.1 Objectives

The frontend must:

- look like a modern enterprise SaaS/ERP platform
- use left navigation plus top header
- be dashboard-centric
- support search, alerts, notifications, and user profile access in the top header
- support dense operational workflows without marketing-style landing pages
- support large tables with filters and export-ready layouts
- use reusable module components
- remain responsive across desktop, tablet, and practical mobile widths

## 6.2 Folder Structure

```text
src/
 ├── app/
 ├── modules/
 ├── components/
 ├── layouts/
 ├── services/
 ├── hooks/
 ├── store/
 ├── constants/
 ├── utils/
 ├── styles/
 ├── middleware/
 └── types/
```

## 6.3 Global Navigation

Navigation must follow `UI-UX-DESIGN.md`.

```text
Home Dashboard

Property Management
 ├── Portfolio Dashboard
 ├── Property Master
 ├── Building & Floor Management
 ├── Unit Master
 ├── Ownership & Legal
 └── Community & Amenities

Customer Management
 ├── Customer Dashboard
 ├── Tenant Management
 ├── Broker & Agency
 └── CRM & Leads

Commercial Management
 ├── Reservation Management
 ├── Lease Management
 └── Sales Management

Financial Management
 ├── Billing Dashboard
 ├── Payments & Receivables
 ├── Collections & Recovery
 └── Accounting Integration

Operations Management
 ├── Maintenance Dashboard
 ├── Preventive Maintenance
 ├── Facility Management
 ├── Vendor Management
 ├── Inspection & Handover
 └── Utility Management

Governance Management
 ├── Document Management
 ├── Workflow & Approvals
 ├── Security & Access
 └── Compliance & Audit

Enterprise Services
 ├── Notifications
 ├── Analytics Dashboard
 └── Integration Console
```

## 6.4 Core UI Components

| Component | Usage |
|---|---|
| Left Navigation | Module access |
| Top Header | Search, alerts, profile |
| KPI Tiles | Operational visibility |
| Smart Tables | Transaction and master lists |
| Tabs | Logical grouping inside records |
| Workflow Sidebar | Approval and lifecycle status |
| Timeline Panels | Activity and audit tracking |
| Attachment Panel | Document handling |
| Notification Center | Alerts and reminders |
| Filter Panel | Search-heavy and report pages |
| Modal/Dialog | Confirmations and focused tasks |
| Drawer Form | Quick create/edit workflows |

## 6.5 Visual Standards

- modern enterprise SaaS style
- blue, white, and gray theme
- clean card-based responsive UI
- filterable and exportable tables
- visual workflow indicators
- real-time dashboard widgets where backend support exists
- minimal clicks with contextual actions
- professional typography and consistent spacing
- entry forms must visibly mark mandatory fields
- entry forms must validate mandatory fields before calling backend services

## 6.6 Commercial Unit Selection UI

New Reservation and New Lease must use the same unit-selection model.

Document/header rules:

- one Customer
- one Property
- one Currency
- selected period before unit search
- one selected unit is Single Unit
- multiple selected units are Multi-Unit
- multi-unit selections must stay within the selected Property
- units may be from the same Tower or different Towers under the selected Property

Unit selection must happen through a popup/modal:

- search available units manually
- optional filters: Tower, Floor, Unit Type, Area, Rent Range
- show only units available for the selected Property, period, and availability status
- add/remove units manually
- prevent duplicate units
- validate live availability before adding

Selected Units Grid:

- Tower
- Unit
- Area
- Rent Frequency
- Benchmark Rent
- Negotiated Rent
- Variance Amount
- Variance %
- Deposit
- Charges

Consolidated Summary:

- Total Units
- Total Area
- Total Benchmark Rent
- Total Negotiated Rent
- Total Variance Amount
- Average Variance %
- Total Deposit
- Total Charges

Rent and variance rules:

```text
Variance Amount = Negotiated Rent - Benchmark Rent
Variance % = (Variance Amount / Benchmark Rent) * 100
```

The current backend schema persists negotiated unit rent in the existing `rent` column. Benchmark rent, rent frequency, and variance are UI-calculated values unless a future schema change explicitly adds dedicated persistence fields.

---

# 7. Backend Architecture

## 7.1 Backend Objectives

The backend must:

- align with CoreConnect naming and deployment conventions
- use Jakarta EE 10 APIs
- package as a WAR
- expose Apache CXF SOAP/JAX-WS service contracts as the baseline integration style
- use CDI-compatible service wiring where applicable
- use MyBatis mapper interfaces and XML mapper files
- keep business logic out of service endpoint/controller classes
- support transaction-safe service operations
- preserve module ownership under `com.eba.<module>`

## 7.2 Package Structure

Every backend module must follow this structure unless a documented CoreConnect convention requires a narrower module:

```text
src/main/java/com/eba/<module>/
 ├── controller/      # endpoint/service adapter classes where used
 ├── domain/          # business models and aggregate concepts
 ├── dto/             # service/API transfer objects
 ├── entity/          # persistence-facing entities
 ├── mappers/         # MyBatis mapper interfaces
 ├── service/         # business interfaces
 ├── service/impl/    # business implementations
 ├── util/            # module utilities
 ├── validator/       # module validation
 └── config/          # module-local configuration
```

Shared code may exist under `com.eba.common`, but it must not take ownership away from module packages.

## 7.3 MyBatis Structure

Mapper interfaces:

```text
src/main/java/com/eba/<module>/mappers/
```

Mapper XML files:

```text
src/main/resources/com/eba/<module>/mappers/
```

MyBatis standards:

- XML-based mappers
- ResultMap definitions for non-trivial projections
- reusable SQL fragments
- dynamic SQL for optional filters
- pagination support
- batch operations where appropriate
- indexed query paths for search-heavy screens
- snake_case database naming with clear Java mapping

## 7.4 CoreConnect Dependency Standards

Use versions from `TECHSTACK.md`. Do not independently upgrade Jakarta, CXF, MyBatis, MySQL Connector/J, HikariCP, ActiveMQ, Quartz, JasperReports, logging, validation, or build plugins without updating `TECHSTACK.md` first.

---

# 8. Service and Integration Standards

Baseline service style:

- Apache CXF SOAP / JAX-WS
- CXF CDI integration
- CXF HTTP transport
- CXF WS-Security where secured SOAP services are required

Service contracts must:

- use stable request/response DTOs
- validate inbound data before business execution
- return explicit business errors
- separate endpoint adapter concerns from service implementation
- document operation purpose, request fields, response fields, faults, and authorization assumptions

If REST APIs are added later, they must be treated as adapters over the same service layer rather than a separate business implementation.

---

# 9. Security Architecture

Security must align with CoreConnect and `TECHSTACK.md`.

Required capabilities:

- authentication and access control for protected business operations
- role and permission model
- password or secret encryption using approved security utilities such as Jasypt
- CXF WS-Security for secured SOAP integrations where applicable
- login/access audit logging
- approval-action audit logging
- data-change audit logging

Security design must not assume JWT as the only authentication mechanism unless a REST adapter is explicitly approved.

---

# 10. Database Architecture

Database: MySQL.

Connection pooling: HikariCP.

Database standards:

- snake_case naming
- foreign key integrity
- indexed searchable columns
- tenant-ready schema design
- soft delete strategy
- audit columns on business tables

Standard audit columns:

```sql
created_by
created_date
updated_by
updated_date
is_deleted
tenant_id
```

Primary data areas:

| Area | Example Tables |
|---|---|
| Property | property, building, floor, tower, unit, amenity, ownership/legal records |
| Customer | customer, tenant, contact, broker, agency, KYC/document references |
| Commercial | reservation, lease, lease_unit, sale, approval workflow records |
| Financial | invoice, payment, receivable, collection activity, accounting sync references |
| Operations | work_order, preventive_maintenance, vendor, inspection, utility account |
| Governance | document, workflow, approval, user, role, permission, audit |
| Enterprise Services | notification, integration status, analytics snapshots |

---

# 11. Module Architecture

## 11.1 Property Management

Screens:

- Portfolio Dashboard
- Property Master
- Building & Floor Management
- Unit Master
- Ownership & Legal
- Community & Amenities

Core requirements:

- property hierarchy and classification
- building/floor/unit structure
- occupancy and lease status visibility
- ownership and legal metadata
- amenity and community management
- documents and audit trail

## 11.2 Customer Management

Screens:

- Customer Dashboard
- Tenant Management
- Broker & Agency
- CRM & Leads

Core requirements:

- active tenants and customer KPIs
- KYC/document references
- customer timeline and communication history
- customer-to-lease association
- broker and agency referral support
- CRM lead progression into commercial workflows

## 11.3 Commercial Management

Screens:

- Reservation Management
- Lease Management
- Sales Management

Core workflows:

```text
Period -> Currency -> Property -> Unit Selection Modal -> Search/Add Unit(s) -> Reservation -> Payment Details -> Approval Workflow -> Confirmation
```

```text
Draft -> Pending Approval -> Approved -> Active -> Expired
```

Lease screen actions:

- Create Lease
- Renew
- Amend
- Terminate
- Print

Reservation and lease unit-selection standards:

- Reservation and Lease use the same modal-based unit-selection UI.
- Customer, Property, and Currency are document/header-level selections.
- One selected unit is Single Unit; multiple selected units are Multi-Unit.
- Multi-unit transactions are restricted to the selected Property.
- Selected units may belong to the same Tower or different Towers under the selected Property.
- Property, Tower, and Unit availability must be filtered by the selected reservation or lease period.
- Unit selection must happen through a modal with manual search and optional Tower, Floor, Unit Type, Area, and Rent Range filters.
- Do not show all available units in a large default selection grid for transaction entry.
- Selected unit grids must include Tower, Unit, Area, Rent Frequency, Benchmark Rent, Negotiated Rent, Variance Amount, Variance %, Deposit, Charges, and Remove.
- Forms must show Total Units, Total Area, Total Benchmark Rent, Total Negotiated Rent, Total Variance Amount, Average Variance %, Total Deposit, and Total Charges.
- Duplicate, inactive, unavailable, already reserved, and already leased units must be rejected before submission.

Lease tabs:

- Lease Details
- Payment Terms
- Billing Schedule
- Approvals
- Documents
- Audit Logs

## 11.4 Financial Management

Screens:

- Billing Dashboard
- Payments & Receivables
- Collections & Recovery
- Accounting Integration

Core requirements:

- invoice grid
- due and overdue amount visibility
- collection percentage
- VAT summary where applicable
- aging buckets: Current Due, 30 Days, 60 Days, 90+ Days, Legal Escalation
- reminder, call log, escalation, legal notice, and settlement actions

## 11.5 Operations Management

Screens:

- Maintenance Dashboard
- Preventive Maintenance
- Facility Management
- Vendor Management
- Inspection & Handover
- Utility Management

Core requirements:

- open requests, SLA breaches, in-progress, completed-today KPIs
- work order queue
- maintenance calendar
- technician/vendor assignment
- inspection checklist, snagging, photos, approvals, customer acceptance, closure

## 11.6 Governance Management

Screens:

- Document Management
- Workflow & Approvals
- Security & Access
- Compliance & Audit

Core requirements:

- pending tasks
- approval queue
- escalations
- approval timeline
- workflow designer
- user management
- role management
- permission matrix
- login audit
- access requests

## 11.7 Enterprise Services

Screens:

- Notifications
- Analytics Dashboard
- Integration Console

Core requirements:

- portfolio, financial, occupancy, lease expiry, and maintenance analytics
- filters by property, region, date, building, and tenant type
- interface status grid with last sync and error counts
- notification rules for approvals, lease events, maintenance events, collections, and system alerts

---

# 12. Reporting, Documents, Search, and Jobs

Use the stack from `TECHSTACK.md`:

- JasperReports for report templates
- iText/OpenPDF for PDF output where approved
- Apache Tika and Zip4j for document processing
- OpenCSV/JXLS/POI for import/export workflows
- SolrJ for search-heavy use cases where database search is insufficient
- Quartz for scheduled jobs
- ActiveMQ for asynchronous messaging where needed
- AWS S3 SDK for approved object storage integrations

Reports compiled from `.jrxml` to `.jasper` must follow CoreConnect conventions.

---

# 13. Deployment Architecture

Baseline deployment:

- backend deployed as a CoreConnect-compatible WAR
- runtime container supplies Jakarta EE and related provided-scope libraries
- Maven builds the deployable artifact
- Maven `apache` profile is the production assembly profile

Build configuration from `TECHSTACK.md`:

| Setting | Value |
|---|---|
| Final WAR Name | `coreConnect` |
| Compiler Source | 17 |
| Compiler Target | 17 |
| Development Mode | true |

Docker, Nginx, and Kubernetes may be added only as project-specific deployment wrappers or future platform work; they are not the baseline deployment architecture in `TECHSTACK.md`.

---

# 14. Logging, Monitoring, and Audit

Logging:

- SLF4J
- Log4j
- levels: INFO, WARN, ERROR, DEBUG

Audit events must track:

- user login and access events
- lease and reservation changes
- approval actions
- financial actions
- maintenance and inspection closure
- document changes
- security and configuration changes

Operational monitoring should be designed so metrics can later be surfaced through enterprise monitoring tools.

---

# 15. Coding Standards

- preserve CoreConnect naming, layering, and module ownership
- no business logic in endpoint/controller adapter classes
- service interfaces required for business operations
- constructor injection or CoreConnect-approved CDI injection
- validation before persistence
- centralized error/fault handling
- audit tracking mandatory for business changes
- mapper XML and mapper interfaces must remain in mandated paths
- use structured parsers/APIs for file processing instead of ad hoc parsing
- keep frontend screens aligned to `UI-UX-DESIGN.md`
- do not introduce new frameworks that conflict with `TECHSTACK.md`

---

# 16. Future Scalability

Future expansion may include:

- mobile applications
- visitor management
- smart IoT integration
- advanced tenant branding
- Kubernetes deployment
- additional REST adapters
- advanced SaaS isolation and tenant-specific configuration

These future items must not compromise the CoreConnect-compatible baseline.

---

# 17. Conclusion

This document defines the global architecture for the Enterprise Property Management System. All implementation must align with the CoreConnect technical stack in `TECHSTACK.md` and the enterprise navigation/screen model in `UI-UX-DESIGN.md`.
