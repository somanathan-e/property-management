# Reservation Module Enhancement Instructions

## Important
- Do not modify or refactor any other modules, pages, services, APIs, layouts, routes, shared components, database structures, or existing workflows outside the Reservation feature.
- Focus only on the Reservation process and related screens/components/services directly required for reservation functionality.

---

# Reservation Module Functional Requirements

## Objective
Implement the Reservation process where users can search for available units and reserve a selected unit.

The module should:

1. Allow users to search available units.
2. Display matching properties and units.
3. Show detailed unit information.
4. Allow users to proceed with reservation.

---

# Reservation Search Screen

## Search Filters
Provide search filters including:

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

---

# Search Result Listing

After search, display all available units matching the criteria.

## Result Card/Grid Must Display

### Property Information
- Property Name
- Building / Tower Name
- Location
- Property Type

### Unit Information
- Unit Number
- Floor
- Unit Type
- Area (Sq.ft / Sq.m)
- Availability Status
- Available From Date

### Commercial Information
- Monthly Rent
- Security Deposit
- Maintenance Charges
- CAM Charges
- Parking Charges (if applicable)

### Lease Information
- Minimum Lease Duration
- Fit-Out Period
- Notice Period
- Escalation Terms

### Additional Information
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
User searches using filters.

## Step 2 — View Available Units
System displays only available units.

## Step 3 — Select Unit
User selects a unit from the search results.

## Step 4 — Reservation Form
Reservation form should capture:

- Customer / Lead
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

Develop only Reservation-specific backend APIs/services.

## APIs Required

### Availability Search
- Search available units
- Apply filter criteria
- Return unit + property + lease terms

### Reservation APIs
- Create reservation
- Update reservation
- Cancel reservation
- Expire reservation
- Convert reservation to lease

---

# Database Scope

Only create/update tables directly required for:

- Reservation Header
- Reservation Unit Mapping
- Reservation Status Tracking

Do not modify unrelated modules.

---

# Frontend Scope

Develop only:

- Reservation Search Screen
- Available Unit Listing
- Reservation Form
- Reservation Detail Screen
- Reservation List Screen

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

Only implement and enhance the Reservation functionality.