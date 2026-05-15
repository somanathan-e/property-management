DROP TABLE IF EXISTS prospect;
DROP TABLE IF EXISTS opportunity;
DROP TABLE IF EXISTS lead;
DROP TABLE IF EXISTS contact;
DROP TABLE IF EXISTS amenity;
DROP TABLE IF EXISTS reservation;
DROP TABLE IF EXISTS unit_master;
DROP TABLE IF EXISTS tower;
DROP TABLE IF EXISTS asset;
DROP TABLE IF EXISTS pm_lease_transaction;
DROP TABLE IF EXISTS pm_lease;
DROP TABLE IF EXISTS customer;
DROP TABLE IF EXISTS property;
DROP TABLE IF EXISTS tenant;

CREATE TABLE tenant (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_code VARCHAR(50) NOT NULL UNIQUE,
    tenant_name VARCHAR(120) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE property (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT,
    property_code VARCHAR(50) NOT NULL UNIQUE,
    property_name VARCHAR(150) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_property_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id)
);

CREATE TABLE tower (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT,
    property_id BIGINT NOT NULL,
    tower_code VARCHAR(50) NOT NULL UNIQUE,
    tower_name VARCHAR(150) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_tower_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_tower_property FOREIGN KEY (property_id) REFERENCES property(id)
);

CREATE TABLE unit_master (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT,
    property_id BIGINT NOT NULL,
    tower_id BIGINT NOT NULL,
    unit_code VARCHAR(50) NOT NULL UNIQUE,
    unit_name VARCHAR(150) NOT NULL,
    unit_type VARCHAR(50) NOT NULL,
    occupancy_status VARCHAR(40) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_unit_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_unit_property FOREIGN KEY (property_id) REFERENCES property(id),
    CONSTRAINT fk_unit_tower FOREIGN KEY (tower_id) REFERENCES tower(id)
);

CREATE TABLE amenity (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT,
    property_id BIGINT NOT NULL,
    amenity_code VARCHAR(50) NOT NULL UNIQUE,
    amenity_name VARCHAR(150) NOT NULL,
    category VARCHAR(60) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_amenity_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_amenity_property FOREIGN KEY (property_id) REFERENCES property(id)
);

CREATE TABLE customer (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT,
    customer_code VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(50),
    status VARCHAR(30) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_customer_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id)
);

CREATE TABLE contact (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT,
    customer_id BIGINT NOT NULL,
    contact_code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(50),
    role_title VARCHAR(80) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_contact_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_contact_customer FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE pm_lease (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT,
    lease_number VARCHAR(60) NOT NULL UNIQUE,
    parent_lease_id BIGINT,
    parent_lease_reference VARCHAR(60),
    version_number INT NOT NULL DEFAULT 1,
    property_id BIGINT NOT NULL,
    tower_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    lease_type VARCHAR(40) NOT NULL,
    lease_status VARCHAR(40) NOT NULL,
    occupancy_status VARCHAR(40) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    rent_amount DECIMAL(12,2) NOT NULL,
    security_deposit DECIMAL(12,2) NOT NULL,
    renewal_status VARCHAR(40) NOT NULL,
    request_initiator VARCHAR(40) NOT NULL,
    approval_status VARCHAR(40) NOT NULL,
    document_status VARCHAR(40) NOT NULL,
    payment_status VARCHAR(40) NOT NULL,
    registration_status VARCHAR(40) NOT NULL,
    handover_status VARCHAR(40) NOT NULL,
    settlement_status VARCHAR(40) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    free_period_start DATE,
    free_period_end DATE,
    fit_out_period_start DATE,
    fit_out_period_end DATE,
    created_by VARCHAR(80) NOT NULL,
    notes VARCHAR(1000),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_pm_lease_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_pm_lease_parent FOREIGN KEY (parent_lease_id) REFERENCES pm_lease(id),
    CONSTRAINT fk_pm_lease_property FOREIGN KEY (property_id) REFERENCES property(id),
    CONSTRAINT fk_pm_lease_tower FOREIGN KEY (tower_id) REFERENCES tower(id),
    CONSTRAINT fk_pm_lease_unit FOREIGN KEY (unit_id) REFERENCES unit_master(id),
    CONSTRAINT fk_pm_lease_customer FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE pm_lease_transaction (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT,
    lease_id BIGINT NOT NULL,
    transaction_number VARCHAR(60) NOT NULL UNIQUE,
    transaction_type VARCHAR(40) NOT NULL,
    previous_version_number INT NOT NULL,
    new_version_number INT NOT NULL,
    transaction_status VARCHAR(40) NOT NULL,
    effective_start_date DATE,
    effective_end_date DATE,
    revised_rent_amount DECIMAL(12,2),
    revised_security_deposit DECIMAL(12,2),
    target_unit_id BIGINT,
    reason VARCHAR(200),
    notes VARCHAR(1000),
    created_by VARCHAR(80) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_pm_lease_transaction_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_pm_lease_transaction_lease FOREIGN KEY (lease_id) REFERENCES pm_lease(id),
    CONSTRAINT fk_pm_lease_transaction_unit FOREIGN KEY (target_unit_id) REFERENCES unit_master(id)
);

CREATE TABLE reservation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT,
    reservation_number VARCHAR(60) NOT NULL UNIQUE,
    property_id BIGINT NOT NULL,
    tower_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    reservation_status VARCHAR(40) NOT NULL,
    workflow_status VARCHAR(40) NOT NULL,
    payment_status VARCHAR(40) NOT NULL,
    reservation_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    quoted_rent DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    deposit_amount DECIMAL(12,2) NOT NULL,
    created_by VARCHAR(80) NOT NULL,
    updated_by VARCHAR(80),
    converted_lease_id BIGINT,
    notes VARCHAR(1000),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_reservation_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_reservation_property FOREIGN KEY (property_id) REFERENCES property(id),
    CONSTRAINT fk_reservation_tower FOREIGN KEY (tower_id) REFERENCES tower(id),
    CONSTRAINT fk_reservation_unit FOREIGN KEY (unit_id) REFERENCES unit_master(id),
    CONSTRAINT fk_reservation_customer FOREIGN KEY (customer_id) REFERENCES customer(id),
    CONSTRAINT fk_reservation_converted_lease FOREIGN KEY (converted_lease_id) REFERENCES pm_lease(id)
);

CREATE TABLE asset (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT,
    property_id BIGINT NOT NULL,
    asset_code VARCHAR(50) NOT NULL UNIQUE,
    asset_name VARCHAR(150) NOT NULL,
    category VARCHAR(60) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_asset_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_asset_property FOREIGN KEY (property_id) REFERENCES property(id)
);

CREATE TABLE lead (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT,
    property_id BIGINT NOT NULL,
    lead_code VARCHAR(50) NOT NULL UNIQUE,
    lead_name VARCHAR(150) NOT NULL,
    source VARCHAR(60) NOT NULL,
    status VARCHAR(30) NOT NULL,
    stage VARCHAR(40) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_lead_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_lead_property FOREIGN KEY (property_id) REFERENCES property(id)
);

CREATE TABLE opportunity (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT,
    property_id BIGINT NOT NULL,
    customer_id BIGINT,
    opportunity_code VARCHAR(50) NOT NULL UNIQUE,
    opportunity_name VARCHAR(150) NOT NULL,
    pipeline_stage VARCHAR(50) NOT NULL,
    estimated_value DECIMAL(12,2) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_opportunity_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_opportunity_property FOREIGN KEY (property_id) REFERENCES property(id),
    CONSTRAINT fk_opportunity_customer FOREIGN KEY (customer_id) REFERENCES customer(id)
);

CREATE TABLE prospect (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT,
    property_id BIGINT NOT NULL,
    prospect_code VARCHAR(50) NOT NULL UNIQUE,
    prospect_name VARCHAR(150) NOT NULL,
    interest_type VARCHAR(60) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_prospect_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    CONSTRAINT fk_prospect_property FOREIGN KEY (property_id) REFERENCES property(id)
);

CREATE INDEX idx_property_search ON property(property_name, city, status);
CREATE INDEX idx_tower_search ON tower(tower_name, tower_code, status);
CREATE INDEX idx_unit_search ON unit_master(unit_name, unit_code, occupancy_status, status);
CREATE INDEX idx_amenity_search ON amenity(amenity_name, category, status);
CREATE INDEX idx_customer_search ON customer(customer_name, category, status);
CREATE INDEX idx_contact_search ON contact(full_name, role_title, status);
CREATE INDEX idx_pm_lease_search ON pm_lease(lease_number, lease_status, renewal_status);
CREATE INDEX idx_pm_lease_transaction_search ON pm_lease_transaction(lease_id, transaction_type, transaction_status);
CREATE INDEX idx_reservation_search ON reservation(reservation_number, reservation_status, workflow_status, payment_status);
CREATE INDEX idx_reservation_unit_window ON reservation(unit_id, reservation_date, expiry_date, reservation_status);
CREATE INDEX idx_asset_search ON asset(asset_name, category, status);
CREATE INDEX idx_lead_search ON lead(lead_name, source, status, stage);
CREATE INDEX idx_opportunity_search ON opportunity(opportunity_name, pipeline_stage, status);
CREATE INDEX idx_prospect_search ON prospect(prospect_name, interest_type, status);

INSERT INTO tenant (tenant_code, tenant_name, status) VALUES
('TN-001', 'Enterprise Holdings', 'ACTIVE'),
('TN-002', 'BlueRock Assets', 'ACTIVE');

INSERT INTO property (tenant_id, property_code, property_name, property_type, city, status) VALUES
(1, 'PR-001', 'Harbor Point', 'COMMERCIAL', 'Dubai', 'ACTIVE'),
(1, 'PR-002', 'Park Lane Residences', 'RESIDENTIAL', 'Abu Dhabi', 'ACTIVE'),
(2, 'PR-003', 'City Square Retail', 'RETAIL', 'Doha', 'ACTIVE');

INSERT INTO tower (tenant_id, property_id, tower_code, tower_name, status) VALUES
(1, 1, 'TW-001', 'Harbor North Tower', 'ACTIVE'),
(1, 2, 'TW-002', 'Park Lane Tower A', 'ACTIVE'),
(2, 3, 'TW-003', 'City Square Retail Block', 'ACTIVE');

INSERT INTO unit_master (tenant_id, property_id, tower_id, unit_code, unit_name, unit_type, occupancy_status, status) VALUES
(1, 1, 1, 'A-1203', 'Suite A-1203', 'OFFICE', 'OCCUPIED', 'ACTIVE'),
(1, 2, 2, 'B-0811', 'Apartment B-0811', 'APARTMENT', 'RESERVED', 'ACTIVE'),
(2, 3, 3, 'R-011', 'Retail Pod R-011', 'RETAIL', 'VACANT', 'ACTIVE'),
(1, 1, 1, 'A-1401', 'Suite A-1401', 'OFFICE', 'VACANT', 'ACTIVE'),
(2, 3, 3, 'R-018', 'Retail Pod R-018', 'RETAIL', 'VACANT', 'ACTIVE');

INSERT INTO amenity (tenant_id, property_id, amenity_code, amenity_name, category, status) VALUES
(1, 1, 'AM-001', 'Executive Lounge', 'COMMON_AREA', 'ACTIVE'),
(1, 2, 'AM-002', 'Residents Gym', 'FITNESS', 'ACTIVE'),
(2, 3, 'AM-003', 'Loading Dock', 'OPERATIONS', 'ACTIVE');

INSERT INTO customer (tenant_id, customer_code, customer_name, category, email, phone, status) VALUES
(1, 'CU-001', 'Sunrise Retail Holdings', 'CORPORATE', 'ops@sunrise.example', '+971-555-1203', 'ACTIVE'),
(1, 'CU-002', 'Apex Family Offices', 'PRIVATE', 'contact@apex.example', '+971-555-0811', 'ACTIVE'),
(2, 'CU-003', 'Metro Foods', 'CORPORATE', 'leasing@metrofoods.example', '+974-555-2201', 'PENDING');

INSERT INTO contact (tenant_id, customer_id, contact_code, full_name, email, phone, role_title, status) VALUES
(1, 1, 'CT-001', 'Nadia Kareem', 'nadia@sunrise.example', '+971-555-2211', 'Leasing Manager', 'ACTIVE'),
(1, 2, 'CT-002', 'Omar Hussain', 'omar@apex.example', '+971-555-7788', 'Principal Contact', 'ACTIVE'),
(2, 3, 'CT-003', 'Sara Bello', 'sara@metrofoods.example', '+974-555-0021', 'Operations Lead', 'ACTIVE');

INSERT INTO pm_lease (
    tenant_id, lease_number, parent_lease_id, parent_lease_reference, version_number, property_id, tower_id, unit_id, customer_id,
    lease_type, lease_status, occupancy_status, currency, rent_amount, security_deposit, renewal_status,
    request_initiator, approval_status, document_status, payment_status, registration_status, handover_status, settlement_status,
    start_date, end_date, free_period_start, free_period_end, fit_out_period_start, fit_out_period_end, created_by, notes
) VALUES
(1, 'LS-2026-001', NULL, NULL, 1, 1, 1, 1, 1, 'COMMERCIAL', 'ACTIVE', 'OCCUPIED', 'AED', 18500.00, 37000.00, 'NOT_DUE', 'AGENT', 'APPROVED', 'SIGNED', 'RECEIVED', 'UPDATED', 'COMPLETED', 'NOT_REQUIRED', DATE '2026-01-01', DATE '2026-12-31', DATE '2026-01-01', DATE '2026-01-15', DATE '2026-01-16', DATE '2026-02-15', 'system', 'Main office lease for Harbor Point.'),
(1, 'LS-2026-002', NULL, NULL, 2, 2, 2, 2, 2, 'RESIDENTIAL', 'ACTIVE', 'OCCUPIED', 'AED', 9600.00, 15000.00, 'RENEWED', 'TENANT', 'APPROVED', 'SIGNED', 'RECEIVED', 'UPDATED', 'COMPLETED', 'NOT_REQUIRED', DATE '2026-03-01', DATE '2027-02-28', NULL, NULL, NULL, NULL, 'leasing.manager', 'Renewed residential lease.'),
(2, 'LS-2026-003', NULL, NULL, 1, 3, 3, 3, 3, 'RETAIL', 'ACTIVE', 'VACANT', 'QAR', 14200.00, 22000.00, 'DUE_SOON', 'AGENT', 'APPROVED', 'SIGNED', 'RECEIVED', 'UPDATED', 'SCHEDULED', 'NOT_REQUIRED', DATE '2026-05-20', DATE '2027-05-19', DATE '2026-05-20', DATE '2026-05-31', DATE '2026-06-01', DATE '2026-06-30', 'system', 'Retail lease pending move-in handover.'),
(1, 'LS-2026-004', NULL, NULL, 3, 1, 1, 1, 1, 'COMMERCIAL', 'SUSPENDED', 'OCCUPIED', 'AED', 19800.00, 39000.00, 'NOT_DUE', 'TENANT', 'INTERNAL_REVIEW', 'DRAFT', 'PARTIAL', 'PENDING', 'IN_PROGRESS', 'PENDING', DATE '2026-06-01', DATE '2027-05-31', NULL, NULL, NULL, NULL, 'portfolio.ops', 'Lease with active variation history.'),
(1, 'LS-2026-005', NULL, NULL, 1, 2, 2, 2, 2, 'RESIDENTIAL', 'TERMINATION_REVIEW', 'OCCUPIED', 'AED', 9400.00, 15000.00, 'NOT_DUE', 'TENANT', 'FINANCE_REVIEW', 'DRAFT', 'PENDING', 'NOT_REQUIRED', 'NOT_STARTED', 'IN_PROGRESS', DATE '2025-07-01', DATE '2026-06-30', NULL, NULL, NULL, NULL, 'collections.user', 'Tenant requested early termination.'),
(2, 'LS-2026-006', NULL, NULL, 1, 3, 3, 3, 3, 'RETAIL', 'ACTIVE', 'VACANT', 'QAR', 13800.00, 22000.00, 'NOT_DUE', 'OWNER', 'LEGAL_REVIEW', 'DRAFT', 'PENDING', 'NOT_REQUIRED', 'NOT_STARTED', 'IN_PROGRESS', DATE '2025-09-01', DATE '2026-08-31', NULL, NULL, NULL, NULL, 'asset.manager', 'Owner initiated commercial review.');

INSERT INTO pm_lease_transaction (
    tenant_id, lease_id, transaction_number, transaction_type, previous_version_number, new_version_number, transaction_status,
    effective_start_date, effective_end_date, revised_rent_amount, revised_security_deposit, target_unit_id, reason, notes, created_by
) VALUES
(1, 2, 'REN-0001', 'RENEWAL', 1, 2, 'APPROVED', DATE '2026-03-01', DATE '2027-02-28', 9600.00, 15000.00, NULL, 'Annual renewal approved', 'Renewal completed against parent lease.', 'leasing.manager'),
(1, 4, 'AMD-0001', 'AMENDMENT', 1, 2, 'APPROVED', NULL, NULL, 19800.00, 39000.00, NULL, 'Commercial clause revision', 'Added revised operating terms.', 'portfolio.ops'),
(1, 4, 'SUS-0001', 'SUSPENSION', 2, 3, 'IN_REVIEW', NULL, NULL, NULL, NULL, NULL, 'Temporary operational hold', 'Suspension pending final approval.', 'portfolio.ops'),
(1, 5, 'TER-0001', 'TERMINATION', 1, 1, 'IN_REVIEW', NULL, DATE '2026-06-30', NULL, NULL, NULL, 'Early relocation request', 'Termination review raised by tenant.', 'collections.user'),
(2, 6, 'REV-0001', 'RENT_REVISION', 1, 1, 'SUBMITTED', DATE '2026-01-01', NULL, 14500.00, NULL, NULL, 'Market alignment', 'Revision submitted for owner review.', 'asset.manager');

INSERT INTO reservation (
    tenant_id, reservation_number, property_id, tower_id, unit_id, customer_id, reservation_status, workflow_status,
    payment_status, reservation_date, expiry_date, quoted_rent, currency, deposit_amount, created_by, updated_by,
    converted_lease_id, notes
) VALUES
(1, 'RSV-2026-001', 1, 1, 4, 1, 'PENDING_APPROVAL', 'SUBMITTED', 'PARTIAL', DATE '2026-07-01', DATE '2026-07-15', 17200.00, 'AED', 10000.00, 'leasing.user', 'leasing.user', NULL, 'Reservation awaiting portfolio approval.'),
(2, 'RSV-2026-002', 3, 3, 5, 3, 'CONFIRMED', 'APPROVED', 'RECEIVED', DATE '2026-08-01', DATE '2026-08-20', 12800.00, 'QAR', 12000.00, 'leasing.user', 'leasing.manager', NULL, 'Confirmed retail reservation ready for lease conversion.');

INSERT INTO asset (tenant_id, property_id, asset_code, asset_name, category, status) VALUES
(1, 1, 'AS-001', 'Chiller Plant 01', 'HVAC', 'ACTIVE'),
(1, 2, 'AS-002', 'Fire Panel North Wing', 'SAFETY', 'ACTIVE'),
(2, 3, 'AS-003', 'Retail Escalator Unit 2', 'VERTICAL_TRANSPORT', 'MAINTENANCE');

INSERT INTO lead (tenant_id, property_id, lead_code, lead_name, source, status, stage) VALUES
(1, 1, 'LD-001', 'North Star Group', 'WEBSITE', 'OPEN', 'QUALIFIED'),
(1, 2, 'LD-002', 'Urban Nest', 'BROKER', 'OPEN', 'INITIAL_REVIEW'),
(2, 3, 'LD-003', 'Fresh Basket', 'REFERRAL', 'NURTURING', 'NEGOTIATION');

INSERT INTO opportunity (tenant_id, property_id, customer_id, opportunity_code, opportunity_name, pipeline_stage, estimated_value, status) VALUES
(1, 1, 1, 'OP-001', 'Harbor Expansion Opportunity', 'PROPOSAL', 250000.00, 'ACTIVE'),
(1, 2, 2, 'OP-002', 'Residential Renewal Opportunity', 'NEGOTIATION', 115000.00, 'ACTIVE'),
(2, 3, 3, 'OP-003', 'Retail Fit-Out Opportunity', 'QUALIFIED', 98000.00, 'OPEN');

INSERT INTO prospect (tenant_id, property_id, prospect_code, prospect_name, interest_type, status) VALUES
(1, 1, 'PS-001', 'Crescent Advisors', 'OFFICE_LEASE', 'QUALIFIED'),
(1, 2, 'PS-002', 'Maple Residency Group', 'RESIDENTIAL_LEASE', 'SHORTLISTED'),
(2, 3, 'PS-003', 'QuickMart Franchise', 'RETAIL_LEASE', 'NEW');
