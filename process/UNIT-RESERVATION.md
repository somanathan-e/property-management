# Reservation and Lease Unit Selection Instructions

## Important
- Keep changes scoped to Reservation, Lease, and the shared unit availability services directly required by those workflows.
- Do not refactor unrelated modules, layouts, routes, shared components, database structures, or workflows.
- Preserve the CoreConnect-aligned module structure, service layer ownership, and MyBatis XML mapper approach.

---

# Unit Selection Functional Requirements

## Objective
Support Single Unit and Multiple Units flows for both New Reservation and New Lease.

Default mode:

- Single Unit

Multiple Units mode:

- select multiple units in one transaction
- restrict selected units to the same Property
- add units manually one by one
- remove units manually from the selected units grid
- show consolidated Total Area, Total Rent, Total Deposit, and Total Charges
- prevent duplicate, inactive, unavailable, already reserved, and already leased units

---

# Property, Tower, and Unit Flow

The flow for New Reservation and New Lease is:

```text
Select Unit Mode
-> Select Property
-> Load available Towers
-> Select Tower
-> Search available Units
-> Add Unit
-> Selected Units Grid
```

Rules:

- Property
  - list only Properties with available units for the selected reservation or lease period
  - multi-unit selections cannot mix Properties
- Tower
  - load only after Property is selected
  - list only Towers with available units for the selected period
- Unit
  - load/search only after Tower is selected
  - filter by selected period and unit availability status
  - validate availability again while adding

---

# Multiple Units UI

Do not display all available units in a large selection list or grid.

Users must manually search and add units one by one into the selected units grid.

## Search/Add Area

- Property selector
- Tower selector
- Unit search input
- Add Unit action for each search match

## Selected Units Grid

Columns:

- Unit Number
- Floor
- Area
- Rent
- Deposit
- Charges
- Remove action

## Consolidated Totals

- Total Area
- Total Rent
- Total Deposit
- Total Charges

---

# Single Unit UI

Single Unit remains the normal existing flow:

- user selects one available unit
- standard reservation or lease details are entered
- transaction is created against a single primary unit

---

# Availability Rules

Availability must consider:

- selected reservation or lease start date
- selected reservation or lease end date
- unit availability status
- inactive units
- overlapping active reservations
- overlapping active leases
- units already selected in the current transaction

Validation errors must be explicit and must prevent submission.

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
User selects a single unit or adds one or more units manually in Multiple Units mode.

## Step 4 — Reservation Form
Reservation form should capture:

- Customer / Lead
- Unit Mode
- Property
- Tower
- Reservation Date
- Reservation Expiry Date
- Proposed Lease Start Date
- Proposed Lease End Date
- Negotiated Rent
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

---

# Lease Validation Rules

- Only units with status AVAILABLE can be leased.
- Already leased or reserved units must not be available for overlapping lease periods.
- Prevent duplicate units in the same lease transaction.
- Prevent multi-property unit selection in a multi-unit lease.
- Multi-unit lease totals must match the selected units grid.

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

Develop only Reservation, Lease, and shared unit-availability APIs/services required by the unit-selection flow.

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
