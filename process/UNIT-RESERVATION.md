# Reservation, Lease, and Unit Availability Instructions

## Important
- Keep changes scoped to Reservation, Lease, Unit Availability, and shared availability services directly required by those workflows.
- Do not refactor unrelated modules, layouts, routes, shared components, database structures, or workflows.
- Preserve the CoreConnect-aligned module structure, service layer ownership, and MyBatis XML mapper approach.

---

# Unit Selection Functional Requirements

## Objective
Support one-unit and multi-unit transactions for both New Reservation and New Lease through the same unit-selection UI.

Core rules:

- one Customer per document
- one Property per document
- one Currency per document
- one selected unit is treated as Single Unit
- multiple selected units are treated as Multi-Unit
- multi-unit selections must remain within the selected Property
- selected units may belong to the same Tower or different Towers under the selected Property
- add units manually from a modal/popup
- remove units manually from the selected units grid
- prevent duplicate, inactive, unavailable, already reserved, and already leased units

---

# Property, Tower, and Unit Flow

The flow for New Reservation and New Lease is:

```text
Select Period
-> Select Currency
-> Select Property
-> Open Unit Selection Modal
-> Search available Units
-> Add Unit
-> Selected Units Grid
```

Rules:

- Property
  - list only Properties with available units for the selected reservation or lease period
  - selection is maintained at document/header level
  - selected units cannot mix Properties
- Tower
  - load only available Towers for the selected Property and period
  - Tower is an optional unit-search filter inside the modal
  - list only Towers with available units for the selected period
- Unit
  - load/search from the modal after Period, Currency, and Property are selected
  - filter by selected period and unit availability status
  - validate availability again while adding

---

# Unit Selection Modal

Do not display all available units in a large default selection list or grid.

Users must manually search and add units one by one into the selected units grid.

## Search/Add Area

- Unit search input
- optional Tower filter
- optional Floor filter
- optional Unit Type filter
- optional Area range filter
- optional Rent Range filter
- Add Unit action for each search match

## Selected Units Grid

Columns:

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
- Remove action

## Consolidated Totals

- Total Units
- Total Area
- Total Benchmark Rent
- Total Negotiated Rent
- Total Variance Amount
- Average Variance %
- Total Deposit
- Total Charges

## Rent and Variance Rules

- Rent Frequency is selected per unit.
- Benchmark Rent is system-maintained from available unit pricing.
- Negotiated Rent is editable in Reservation and Lease.
- Header rent amount is the consolidated negotiated rent.
- Current backend persistence stores negotiated rent in the existing per-unit `rent` field. Benchmark and variance values are UI-calculated until dedicated persistence fields are added.

```text
Variance Amount = Negotiated Rent - Benchmark Rent
Variance % = (Variance Amount / Benchmark Rent) * 100
```

---

# Availability and Occupancy Rules

Availability must consider:

- selected reservation or lease start date
- selected reservation or lease end date
- lease fit-out start date when defined
- unit availability status
- inactive units
- overlapping active reservations
- overlapping active leases
- units already selected in the current transaction

Validation errors must be explicit and must prevent submission.

Occupancy and inventory rules:

- Total Units comes from master unit inventory only.
- Creating lease records must not increase total unit count.
- Occupied Units comes from unit occupancy status.
- Vacant Units = Total Units - Occupied Units.
- Lease creation/update may update unit occupancy status, but must not create unit inventory.

Fit-out and free-period rules:

- Fit-Out period occurs before lease start date.
- A unit becomes unavailable from Fit-Out Start if fit-out is defined.
- Free Period is included inside the lease duration.
- A unit becomes available only after the effective lease end date.
- Lease save validation must reject fit-out dates after lease start and free-period dates outside the lease duration.

---

# Unit Availability Workspace

Route:

```text
/property-management/unit-availability
```

Purpose:

- search unit availability across properties and towers
- view current and future lease/reservation occupancy
- show the availability timeline for leasing decisions

Filters:

- Property
- Building/Tower
- Unit
- Occupancy Status
- Availability Period
- Lease Period
- Date Range

Display:

- Property
- Building/Tower
- Unit No
- Unit Type
- Area
- Current Occupancy Status
- Current Lease Period
- Future Reserved/Leased Periods
- Available From
- Available To
- Fit-Out Period
- Free Period
- Tenant Details when occupied

Timeline:

```text
Fit-Out -> Lease -> Free Period inclusion -> Lease End
```

---

# Reservation Search Screen

The broader Reservation search screen may support filters including:

- Property
- Property Type
- Unit Type
- Location
- Area Range
- Budget / Rent Range
- Lease Type
- Availability Date
- Furnished / Non-Furnished
- Floor
- Number of Seats / Capacity (if applicable)

For multi-unit transaction entry, this broad search must not replace the manual property/tower/unit add flow.

---

# Search Result Listing

After search, display available units matching criteria where that screen is used.

## Result Card/Grid May Display

- Unit Number
- Floor
- Unit Type
- Area (Sq.ft / Sq.m)
- Availability Status
- Available From Date
- Monthly Rent
- Security Deposit
- Maintenance Charges
- CAM Charges
- Parking Charges (if applicable)
- Minimum Lease Duration
- Fit-Out Period
- Notice Period
- Escalation Terms
- Furnishing Status
- Amenities
- Parking Availability
- Unit Images (if available)

---

# Reservation Actions

Each search result should support:

- View Full Details
- Reserve Unit
- Download Proposal (optional placeholder)
- Compare Units (optional placeholder)

---

# Reservation Flow

## Step 1 — Search Units
User searches using filters or follows the property/tower/unit manual add flow.

## Step 2 — View Available Units
System displays only available units.

## Step 3 — Select Unit
User adds one or more units from the modal. One selected unit is Single Unit; multiple selected units are Multi-Unit.

## Step 4 — Reservation Form
Reservation form should capture:

- Customer / Lead
- Property
- Currency
- Reservation Date
- Reservation Expiry Date
- Proposed Lease Start Date
- Proposed Lease End Date
- selected units grid with per-unit rent frequency and negotiated rent
- Deposit
- Remarks / Notes

---

# Reservation Validation Rules

- Only units with status AVAILABLE can be reserved.
- Reserved units should not appear in availability search.
- Reservation expiry should automatically release units if not converted.
- Prevent double reservation for the same unit.
- Prevent duplicate units in the same reservation transaction.
- Prevent multi-property unit selection in a multi-unit reservation.
- Validate mandatory reservation fields on the client before calling backend services.

---

# Lease Validation Rules

- Only units with status AVAILABLE can be leased.
- Already leased or reserved units must not be available for overlapping lease periods.
- Prevent duplicate units in the same lease transaction.
- Prevent multi-property unit selection in a multi-unit lease.
- Multi-unit lease totals must match the selected units grid.
- Validate mandatory lease fields on the client before calling backend services.

---

# Reservation Statuses

Support statuses:

- Draft
- Reserved
- Expired
- Cancelled
- Converted to Lease

---

# UI Requirements

## Reservation Listing
Provide:

- Search
- Filters
- Pagination
- Sorting
- Status indicators

## Reservation Details
Display:

- Property details
- Unit details
- Reservation terms
- Customer details
- Reservation history

---

# Backend Requirements

Develop only Reservation, Lease, Unit Availability, and shared availability APIs/services required by the unit-selection and availability workflows.

## APIs Required

### Availability Search
- Search available units
- Apply filter criteria
- Return unit + property + lease terms
- Accept selected period, property, tower, and optional unit search text
- Exclude inactive, already reserved, and already leased units for overlapping periods

### Reservation APIs
- Create reservation
- Update reservation
- Cancel reservation
- Expire reservation
- Convert reservation to lease

### Lease APIs
- Create lease
- Update lease
- Add/remove lease units where supported by the transaction model
- Validate selected units before lease creation or update

---

# Database Scope

Only create/update tables directly required for:

- Reservation Header
- Reservation Unit Mapping
- Reservation Status Tracking
- Lease Header
- Lease Unit Mapping
- Unit availability query support

Do not modify unrelated modules.

---

# Frontend Scope

Develop or update only:

- Reservation Search Screen
- Available Unit Listing
- Reservation Form
- Reservation Detail Screen
- Reservation List Screen
- Lease Form
- Lease Detail Screen
- Lease List Screen where selected-unit behavior is displayed

Do not modify unrelated screens/modules.

---

# UX Expectations

- Fast unit search experience
- Clean property/unit cards
- Easy comparison of rent and area
- Mobile responsive layouts
- Modern leasing/reservation workflow

---

# Final Constraint

Strictly avoid:
- Changing existing architecture
- Refactoring unrelated modules
- Modifying global navigation
- Altering other business workflows
- Updating unrelated APIs/services

Only implement and enhance Reservation, Lease, and shared unit availability behavior required by this unit-selection flow.
