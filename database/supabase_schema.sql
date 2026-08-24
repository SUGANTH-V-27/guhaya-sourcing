-- =============================================================================
-- GUHAYA SOURCING - COMPREHENSIVE SUPABASE / POSTGRESQL DATABASE SCHEMA
-- Compatible with Supabase and Standard Self-Hosted PostgreSQL 14+
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. CORE & AUTHENTICATION MODULE
-- =============================================================================

-- User Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE, -- References auth.users(id) in Supabase
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'Merchandiser', -- Admin, Merchandiser, Auditor, FactoryManager, Viewer
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Manufacturing Factories
CREATE TABLE IF NOT EXISTS factories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    location VARCHAR(255),
    address TEXT,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    compliance_grade VARCHAR(10) DEFAULT 'B',
    total_capacity_monthly INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brands
CREATE TABLE IF NOT EXISTS brands (
    id VARCHAR(100) PRIMARY KEY, -- e.g. 'soxo', 'tera', 'astra', 'korva', 'nova', 'sora'
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    country VARCHAR(100) DEFAULT 'United Kingdom',
    primary_contact VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    description TEXT,
    logo_url TEXT,
    total_models INT DEFAULT 0,
    active_orders INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. MODELS & PRODUCTION MODULE
-- =============================================================================

-- Product Models / Styles
CREATE TABLE IF NOT EXISTS models (
    id VARCHAR(100) PRIMARY KEY,
    brand_id VARCHAR(100) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,
    factory_name VARCHAR(255) DEFAULT 'NANDHI FABRICS',
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Shipped', 'In Production', 'Completed'
    days_to_handover INT DEFAULT 0,
    buyer VARCHAR(100),
    department VARCHAR(100),
    subclass VARCHAR(100),
    season VARCHAR(100),
    target_fob NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Orders (PO)
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(100) NOT NULL UNIQUE,
    model_id VARCHAR(100) REFERENCES models(id) ON DELETE CASCADE,
    brand_id VARCHAR(100) REFERENCES brands(id) ON DELETE CASCADE,
    factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,
    buyer VARCHAR(100),
    department VARCHAR(100),
    season VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'USD',
    total_qty INT DEFAULT 0,
    total_amount NUMERIC(14, 2) DEFAULT 0.00,
    order_date DATE,
    delivery_date DATE,
    shipment_mode VARCHAR(50) DEFAULT 'Sea', -- Sea, Air, Express
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Confirmed, In Production, Shipped, Cancelled
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PO Line Items & Size Breakdown Grids
CREATE TABLE IF NOT EXISTS po_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    colorway VARCHAR(100) NOT NULL,
    item_code VARCHAR(100),
    xs_qty INT DEFAULT 0,
    s_qty INT DEFAULT 0,
    m_qty INT DEFAULT 0,
    l_qty INT DEFAULT 0,
    xl_qty INT DEFAULT 0,
    xxl_qty INT DEFAULT 0,
    total_qty INT DEFAULT 0,
    unit_price NUMERIC(10, 2) DEFAULT 0.00,
    total_price NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Production Planning & TNA (Time & Action)
CREATE TABLE IF NOT EXISTS tna_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id VARCHAR(100) NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    po_number VARCHAR(100),
    order_qty INT DEFAULT 0,
    ex_factory_date DATE,
    total_stages INT DEFAULT 0,
    completed_stages INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'On Track', -- 'On Track', 'Delayed', 'Completed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TNA Stage Milestones
CREATE TABLE IF NOT EXISTS tna_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tna_plan_id UUID NOT NULL REFERENCES tna_plans(id) ON DELETE CASCADE,
    stage_name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'Sampling', 'Fabric', 'Trims', 'Production', 'Finishing', 'Inspection'
    planned_start DATE,
    planned_end DATE,
    actual_start DATE,
    actual_end DATE,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Completed', 'Delayed'
    responsible_person VARCHAR(255),
    remarks TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trimming Bill of Materials (BOM)
CREATE TABLE IF NOT EXISTS trimming_boms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id VARCHAR(100) NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    item_type VARCHAR(100) NOT NULL, -- 'Main Label', 'Care Label', 'Hangtag', 'Button', 'Zipper', 'Polybag', 'Carton'
    supplier_name VARCHAR(255),
    specification TEXT,
    color VARCHAR(100),
    size_dimension VARCHAR(100),
    consumption_per_pc NUMERIC(10, 4) DEFAULT 0.0000,
    unit VARCHAR(50) DEFAULT 'PCS', -- PCS, MTR, YARDS, GROSS, SET
    unit_cost NUMERIC(10, 4) DEFAULT 0.0000,
    currency VARCHAR(10) DEFAULT 'USD',
    required_qty NUMERIC(12, 2) DEFAULT 0.00,
    approval_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected', 'Revised'
    proof_image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quality Check (QC) Inspections (Across all 6 inspection stages)
CREATE TABLE IF NOT EXISTS qc_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id VARCHAR(100) NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    inspection_type VARCHAR(100) NOT NULL, -- 'fabric_inspection', 'pre_production', 'first_garment', 'inline_inspection', 'midline_inspection', 'final_inspection'
    factory_name VARCHAR(255),
    inspector_name VARCHAR(255),
    inspection_date DATE NOT NULL,
    total_order_qty INT DEFAULT 0,
    sample_size INT DEFAULT 0,
    aql_level VARCHAR(50) DEFAULT 'AQL 2.5',
    critical_defects INT DEFAULT 0,
    major_defects INT DEFAULT 0,
    minor_defects INT DEFAULT 0,
    result VARCHAR(50) DEFAULT 'Pending', -- 'Passed', 'Failed', 'Pending', 'Conditionally Passed'
    remarks TEXT,
    report_pdf_url TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. BRAND MANAGEMENT SUB-MODULES
-- =============================================================================

-- Brand Summaries
CREATE TABLE IF NOT EXISTS brand_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id VARCHAR(100) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    summary_month VARCHAR(50), -- e.g. '2026-08'
    total_orders INT DEFAULT 0,
    total_pieces INT DEFAULT 0,
    fob_value NUMERIC(14, 2) DEFAULT 0.00,
    on_time_delivery_rate NUMERIC(5, 2) DEFAULT 100.00,
    quality_pass_rate NUMERIC(5, 2) DEFAULT 100.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testing Standards
CREATE TABLE IF NOT EXISTS testing_standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id VARCHAR(100) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    test_category VARCHAR(100) NOT NULL, -- 'Physical Test', 'Color Fastness', 'Chemical Test', 'Garment Stability'
    parameter_name VARCHAR(255) NOT NULL,
    test_method VARCHAR(255), -- ISO 105, AATCC 8, ASTM D3776
    requirement_standard VARCHAR(255) NOT NULL,
    tolerance VARCHAR(100),
    is_mandatory BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Tracker
CREATE TABLE IF NOT EXISTS booking_trackers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id VARCHAR(100) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,
    month_period VARCHAR(50) NOT NULL, -- '2026-08'
    department VARCHAR(100),
    projected_pieces INT DEFAULT 0,
    confirmed_pieces INT DEFAULT 0,
    shipped_pieces INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Factory Capacity Allocations
CREATE TABLE IF NOT EXISTS factory_capacities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id VARCHAR(100) REFERENCES brands(id) ON DELETE SET NULL,
    factory_name VARCHAR(255) NOT NULL,
    total_lines INT DEFAULT 0,
    total_machines INT DEFAULT 0,
    monthly_capacity_pcs INT DEFAULT 0,
    allocated_pcs INT DEFAULT 0,
    utilization_pct NUMERIC(5, 2) DEFAULT 0.00,
    month_period VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courier & Shipments
CREATE TABLE IF NOT EXISTS courier_shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id VARCHAR(100) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    awb_number VARCHAR(100) NOT NULL,
    courier_partner VARCHAR(100) DEFAULT 'DHL', -- DHL, FedEx, UPS, BlueDart
    shipment_type VARCHAR(100) DEFAULT 'Sample', -- 'Sample', 'Fabric Swatch', 'Bulk Accessories', 'Document'
    sender VARCHAR(255),
    recipient VARCHAR(255),
    dispatch_date DATE,
    delivery_date DATE,
    status VARCHAR(50) DEFAULT 'In Transit', -- 'Dispatched', 'In Transit', 'Out for Delivery', 'Delivered'
    tracking_url TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Corrective Action Plan Requests (CAPR) Issue Log
CREATE TABLE IF NOT EXISTS capr_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id VARCHAR(100) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    model_id VARCHAR(100) REFERENCES models(id) ON DELETE SET NULL,
    factory_name VARCHAR(255),
    issue_title VARCHAR(255) NOT NULL,
    issue_description TEXT,
    severity VARCHAR(50) DEFAULT 'Major', -- 'Minor', 'Major', 'Critical'
    root_cause TEXT,
    preventive_action TEXT,
    assigned_to VARCHAR(255),
    target_closure_date DATE,
    closure_date DATE,
    status VARCHAR(50) DEFAULT 'Open', -- 'Open', 'Under Review', 'Closed', 'Reopened'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. AUDIT & COMPLIANCE SUITE
-- =============================================================================

-- Social Compliance Audits
CREATE TABLE IF NOT EXISTS social_compliance_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) DEFAULT 'SOXO',
    address TEXT,
    audit_date DATE NOT NULL,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    auditor_name VARCHAR(255),
    overall_score NUMERIC(5, 2) DEFAULT 0.00,
    grade VARCHAR(10) DEFAULT 'A', -- A, B, C, D, E
    color_rating VARCHAR(50) DEFAULT 'Green', -- 'Green', 'Light Green', 'Orange', 'Red'
    critical_compliant_count INT DEFAULT 17,
    critical_total_count INT DEFAULT 17,
    total_points_possible INT DEFAULT 0,
    total_points_achieved INT DEFAULT 0,
    auditor_remarks TEXT,
    good_practices TEXT,
    critical_issues TEXT,
    status VARCHAR(50) DEFAULT 'Completed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Compliance Checklist Breakdown (11 Sections)
CREATE TABLE IF NOT EXISTS social_compliance_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES social_compliance_audits(id) ON DELETE CASCADE,
    section_no INT NOT NULL,
    section_name VARCHAR(255) NOT NULL,
    score_possible INT DEFAULT 0,
    score_achieved INT DEFAULT 0,
    green_count INT DEFAULT 0,
    light_green_count INT DEFAULT 0,
    orange_count INT DEFAULT 0,
    red_count INT DEFAULT 0,
    black_count INT DEFAULT 0,
    not_applicable_count INT DEFAULT 0,
    checklist_data JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SIR (Special Inspection Report) Findings
CREATE TABLE IF NOT EXISTS sir_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES social_compliance_audits(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    clause VARCHAR(100),
    description TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'Minor', -- 'Minor', 'Major', 'Critical'
    factory_capa TEXT,
    remediation_deadline DATE,
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Technical Audits (Quality Management System)
CREATE TABLE IF NOT EXISTS technical_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) DEFAULT 'SOXO',
    audit_date DATE NOT NULL,
    auditor_name VARCHAR(255),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    factory_address TEXT,
    score_percentage NUMERIC(5, 2) DEFAULT 0.00,
    available_items INT DEFAULT 0,
    missing_items INT DEFAULT 0,
    total_items INT DEFAULT 64,
    rating VARCHAR(50) DEFAULT 'Acceptable', -- 'Good', 'Acceptable', 'Needs Improvement', 'Poor'
    conclusion TEXT,
    sections_data JSONB DEFAULT '[]'::jsonb,
    proof_file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Factory Certifications
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_name VARCHAR(255) NOT NULL,
    certification_type VARCHAR(100) NOT NULL, -- OEKO-TEX, GOTS, BSCI, WRAP, SEDEX, HIGG, ISO 9001
    certificate_number VARCHAR(100) NOT NULL,
    issuing_body VARCHAR(255),
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    scope TEXT,
    notes TEXT,
    pdf_url TEXT,
    status VARCHAR(50) DEFAULT 'Valid', -- 'Valid', 'Expired', 'Expiring Soon'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. COSTING MODULE
-- =============================================================================

-- Costing Sheets
CREATE TABLE IF NOT EXISTS costing_sheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id VARCHAR(100) REFERENCES models(id) ON DELETE SET NULL,
    style_code VARCHAR(100) NOT NULL,
    style_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    season VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'USD',
    order_quantity INT DEFAULT 0,
    fabric_cost NUMERIC(12, 4) DEFAULT 0.0000,
    trims_cost NUMERIC(12, 4) DEFAULT 0.0000,
    cm_cost NUMERIC(12, 4) DEFAULT 0.0000,
    print_embroidery_cost NUMERIC(12, 4) DEFAULT 0.0000,
    wash_finish_cost NUMERIC(12, 4) DEFAULT 0.0000,
    packaging_cost NUMERIC(12, 4) DEFAULT 0.0000,
    commercial_transport_cost NUMERIC(12, 4) DEFAULT 0.0000,
    subtotal_cost NUMERIC(12, 4) DEFAULT 0.0000,
    margin_percentage NUMERIC(6, 2) DEFAULT 15.00,
    margin_amount NUMERIC(12, 4) DEFAULT 0.0000,
    total_fob_price NUMERIC(12, 4) DEFAULT 0.0000,
    target_fob_price NUMERIC(12, 4) DEFAULT 0.0000,
    variance NUMERIC(12, 4) DEFAULT 0.0000,
    status VARCHAR(50) DEFAULT 'Draft', -- 'Draft', 'Submitted', 'Approved', 'Rejected'
    breakdown_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. FINANCE & ACCOUNTING SUITE
-- =============================================================================

-- Company Settings (GSTIN, Bank Details)
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'GUHAYA SOURCING PRIVATE LIMITED',
    gstin VARCHAR(50) DEFAULT '33AABCG1234F1Z5',
    pan VARCHAR(50) DEFAULT 'AABCG1234F',
    address TEXT DEFAULT '12/4 Sourcing Plaza, Textile Hub, Tirupur - 641602, Tamil Nadu, India',
    email VARCHAR(255) DEFAULT 'finance@guhayasourcing.com',
    phone VARCHAR(50) DEFAULT '+91 421 2233445',
    bank_name VARCHAR(255) DEFAULT 'HDFC Bank Ltd',
    account_number VARCHAR(100) DEFAULT '50200012345678',
    ifsc_code VARCHAR(50) DEFAULT 'HDFC0001234',
    branch VARCHAR(255) DEFAULT 'Tirupur Main Branch',
    invoice_prefix VARCHAR(20) DEFAULT 'GS/2026/',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    invoice_type VARCHAR(50) DEFAULT 'Tax Invoice', -- 'Tax Invoice', 'Proforma Invoice', 'Credit Note'
    party_type VARCHAR(50) DEFAULT 'Buyer', -- 'Buyer', 'Factory'
    party_name VARCHAR(255) NOT NULL,
    party_gstin VARCHAR(50),
    party_address TEXT,
    party_email VARCHAR(255),
    invoice_date DATE NOT NULL,
    due_date DATE,
    currency VARCHAR(10) DEFAULT 'INR',
    subtotal NUMERIC(14, 2) DEFAULT 0.00,
    cgst_rate NUMERIC(5, 2) DEFAULT 9.00,
    cgst_amount NUMERIC(14, 2) DEFAULT 0.00,
    sgst_rate NUMERIC(5, 2) DEFAULT 9.00,
    sgst_amount NUMERIC(14, 2) DEFAULT 0.00,
    igst_rate NUMERIC(5, 2) DEFAULT 0.00,
    igst_amount NUMERIC(14, 2) DEFAULT 0.00,
    grand_total NUMERIC(14, 2) DEFAULT 0.00,
    paid_amount NUMERIC(14, 2) DEFAULT 0.00,
    balance_amount NUMERIC(14, 2) DEFAULT 0.00,
    payment_status VARCHAR(50) DEFAULT 'Unpaid', -- 'Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Line Items
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    hsn_code VARCHAR(50),
    quantity NUMERIC(12, 2) DEFAULT 1.00,
    unit VARCHAR(50) DEFAULT 'PCS',
    rate NUMERIC(12, 2) DEFAULT 0.00,
    amount NUMERIC(14, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Factory Ledger Transactions
CREATE TABLE IF NOT EXISTS factory_ledger_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id UUID REFERENCES factories(id) ON DELETE SET NULL,
    factory_name VARCHAR(255) NOT NULL,
    transaction_date DATE NOT NULL,
    reference_no VARCHAR(100), -- PO number, Invoice number, Payment UTR
    description TEXT NOT NULL,
    debit_amount NUMERIC(14, 2) DEFAULT 0.00, -- Amount paid to factory / returns
    credit_amount NUMERIC(14, 2) DEFAULT 0.00, -- Bills / Invoices received from factory
    running_balance NUMERIC(14, 2) DEFAULT 0.00,
    payment_mode VARCHAR(50) DEFAULT 'Bank Transfer', -- NEFT, RTGS, Cheque, Cash
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly Income & Expense Ledgers
CREATE TABLE IF NOT EXISTS monthly_ledgers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month_key VARCHAR(50) NOT NULL UNIQUE, -- e.g. '2026-08'
    total_income NUMERIC(14, 2) DEFAULT 0.00,
    total_expenses NUMERIC(14, 2) DEFAULT 0.00,
    net_savings NUMERIC(14, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income Entries
CREATE TABLE IF NOT EXISTS income_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month_key VARCHAR(50) NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Commission', -- 'Commission', 'Sampling Fee', 'Consulting', 'Service Charge'
    amount NUMERIC(14, 2) DEFAULT 0.00,
    entry_date DATE NOT NULL,
    reference_no VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense Entries
CREATE TABLE IF NOT EXISTS expense_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month_key VARCHAR(50) NOT NULL,
    expense_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Office', -- 'Salaries', 'Rent', 'Travel & Inspection', 'Courier', 'Utilities', 'Software'
    amount NUMERIC(14, 2) DEFAULT 0.00,
    entry_date DATE NOT NULL,
    paid_to VARCHAR(255),
    receipt_url TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commissions
CREATE TABLE IF NOT EXISTS commission_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_brand VARCHAR(100) NOT NULL,
    factory_name VARCHAR(255) NOT NULL,
    order_number VARCHAR(100) NOT NULL,
    order_value NUMERIC(14, 2) DEFAULT 0.00,
    commission_rate_pct NUMERIC(5, 2) DEFAULT 5.00,
    commission_amount NUMERIC(14, 2) DEFAULT 0.00,
    invoice_date DATE,
    payment_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Received', 'Partially Received'
    received_date DATE,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Members
CREATE TABLE IF NOT EXISTS staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_code VARCHAR(50) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(100) DEFAULT 'Merchandising', -- 'Merchandising', 'Quality Assurance', 'Finance', 'Logistics', 'Management'
    date_of_joining DATE,
    phone VARCHAR(50),
    email VARCHAR(255),
    base_salary NUMERIC(12, 2) DEFAULT 0.00,
    hra NUMERIC(12, 2) DEFAULT 0.00,
    allowances NUMERIC(12, 2) DEFAULT 0.00,
    bank_account VARCHAR(100),
    pan_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Present', -- 'Present', 'Absent', 'Half Day', 'Leave', 'Holiday'
    in_time TIME,
    out_time TIME,
    overtime_hours NUMERIC(4, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, attendance_date)
);

-- Monthly Salary Slips
CREATE TABLE IF NOT EXISTS salary_slips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    salary_month VARCHAR(50) NOT NULL, -- e.g. '2026-08'
    working_days INT DEFAULT 26,
    present_days NUMERIC(4, 1) DEFAULT 26.0,
    basic_pay NUMERIC(12, 2) DEFAULT 0.00,
    hra NUMERIC(12, 2) DEFAULT 0.00,
    allowances NUMERIC(12, 2) DEFAULT 0.00,
    overtime_pay NUMERIC(12, 2) DEFAULT 0.00,
    gross_salary NUMERIC(12, 2) DEFAULT 0.00,
    pf_deduction NUMERIC(12, 2) DEFAULT 0.00,
    esi_deduction NUMERIC(12, 2) DEFAULT 0.00,
    tds_deduction NUMERIC(12, 2) DEFAULT 0.00,
    advance_recovery NUMERIC(12, 2) DEFAULT 0.00,
    total_deductions NUMERIC(12, 2) DEFAULT 0.00,
    net_salary NUMERIC(12, 2) DEFAULT 0.00,
    payment_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Processed', 'Paid'
    payment_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, salary_month)
);

-- Salary Advance Payments
CREATE TABLE IF NOT EXISTS advance_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    advance_date DATE NOT NULL,
    amount NUMERIC(12, 2) DEFAULT 0.00,
    repayment_months INT DEFAULT 1,
    monthly_deduction NUMERIC(12, 2) DEFAULT 0.00,
    repaid_amount NUMERIC(12, 2) DEFAULT 0.00,
    balance_amount NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Fully Recovered'
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_models_brand_id ON models(brand_id);
CREATE INDEX IF NOT EXISTS idx_po_model_id ON purchase_orders(model_id);
CREATE INDEX IF NOT EXISTS idx_tna_model_id ON tna_plans(model_id);
CREATE INDEX IF NOT EXISTS idx_boms_model_id ON trimming_boms(model_id);
CREATE INDEX IF NOT EXISTS idx_qc_model_id ON qc_inspections(model_id);
CREATE INDEX IF NOT EXISTS idx_social_audits_date ON social_compliance_audits(audit_date);
CREATE INDEX IF NOT EXISTS idx_tech_audits_date ON technical_audits(audit_date);
CREATE INDEX IF NOT EXISTS idx_certifications_expiry ON certifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_ledger_factory ON factory_ledger_transactions(factory_name);
CREATE INDEX IF NOT EXISTS idx_attendance_staff_date ON attendance_records(staff_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_salary_slips_month ON salary_slips(salary_month);
