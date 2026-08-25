-- Baseline do schema da aplicacao.
--
-- O ambiente development historicamente usava ddl-auto=update, portanto bancos
-- existentes podem ja conter estas tabelas. Os CREATE TABLE IF NOT EXISTS
-- permitem que o Flyway passe a ser a fonte do schema sem quebrar esses bancos.

create table if not exists addresses (
    id uuid primary key,
    address_line varchar(255), cep varchar(255), city varchar(255),
    complement varchar(255), neighborhood varchar(255), number varchar(255),
    state varchar(255), street varchar(255)
);

create table if not exists companies (
    id uuid primary key,
    active boolean not null,
    allowed_radius integer,
    latitude double precision,
    longitude double precision,
    trial_expires_at timestamptz,
    address_id uuid unique references addresses(id),
    cnpj varchar(255), logo_url varchar(255), name varchar(255) not null,
    plan_type varchar(255), slug varchar(255) not null unique,
    theme varchar(255)
);

create table if not exists roles (
    id uuid primary key,
    name varchar(255) not null unique
);

create table if not exists users (
    id uuid primary key,
    active boolean not null,
    address_id uuid unique references addresses(id),
    company_id uuid references companies(id),
    avatar_url varchar(255), email varchar(255) not null,
    function varchar(255), password varchar(255) not null,
    "position" varchar(255), theme varchar(255), username varchar(255) not null
);

create table if not exists user_roles (
    user_id uuid not null references users(id),
    role_id uuid not null references roles(id),
    primary key (user_id, role_id)
);

create table if not exists projects (
    id uuid primary key,
    active boolean not null,
    company_id uuid references companies(id),
    description varchar(255), name varchar(255) not null
);

create table if not exists sectors (
    id uuid primary key,
    max_seats integer,
    company_id uuid references companies(id),
    manager_id uuid references users(id),
    description varchar(255), name varchar(255) not null
);

create table if not exists employees (
    id uuid primary key,
    public_id uuid not null unique,
    active boolean not null,
    company_id uuid references companies(id),
    project_id uuid references projects(id),
    sector_id uuid references sectors(id),
    user_id uuid unique references users(id),
    email varchar(255) not null,
    full_name varchar(255) not null
);

create table if not exists absences (
    id uuid primary key,
    absence_date date not null,
    employee_id uuid not null references employees(id),
    reason varchar(255)
);

create table if not exists work_shifts (
    id uuid primary key,
    employee_id uuid not null references employees(id),
    shift_date date not null,
    start_time time(0) not null,
    end_time time(0) not null,
    version bigint not null,
    notes varchar(255), padrao_escala varchar(255), status varchar(255),
    work_mode varchar(255) not null
);

create table if not exists shift_swap_requests (
    id uuid primary key,
    original_shift_id uuid not null references work_shifts(id),
    requester_id uuid not null references employees(id),
    compensation_date date,
    created_at timestamptz,
    decided_at timestamptz,
    admin_comments varchar(255), comments varchar(255), status varchar(255)
);

create table if not exists contact_messages (
    id uuid primary key,
    sent_at timestamptz,
    email varchar(255), message text, name varchar(255), subject varchar(255)
);

create table if not exists learning_progress (
    id uuid primary key,
    completed boolean not null,
    completion_date timestamptz,
    user_id uuid references users(id),
    module varchar(255), notes text, topic varchar(255)
);

create table if not exists marketing_leads (
    id uuid primary key,
    converted boolean not null,
    marketing_consent_granted boolean not null,
    personal_email boolean not null,
    created_at timestamptz not null,
    last_login_at timestamptz,
    campaign_slug varchar(255), company_name varchar(255),
    company_segment varchar(255), consent_version varchar(255),
    email varchar(255), employee_range varchar(255),
    landing_page_slug varchar(255), lead_status varchar(255),
    name varchar(255), phone varchar(255), recommended_plan varchar(255),
    recommended_template varchar(255), referrer varchar(255), source varchar(255),
    utm_campaign varchar(255), utm_content varchar(255), utm_medium varchar(255),
    utm_source varchar(255), utm_term varchar(255)
);

create table if not exists audit_logs (
    id uuid primary key,
    created_at timestamptz not null,
    company_id uuid references companies(id),
    details varchar(4000), action varchar(255) not null,
    actor varchar(255) not null, entity_id varchar(255),
    entity_type varchar(255) not null
);

create table if not exists ai_usage_logs (
    id uuid primary key,
    credits_consumed integer, tokens_used integer,
    used_at timestamptz not null,
    company_id uuid not null references companies(id),
    user_id uuid not null references users(id),
    feature varchar(255) not null, prompt_ref text
);

create table if not exists invoices (
    id uuid primary key,
    amount numeric(38,2), created_at timestamptz,
    company_id uuid not null references companies(id),
    currency varchar(255), invoice_pdf_url varchar(255), status varchar(255),
    stripe_invoice_id varchar(255)
);

create table if not exists subscriptions (
    id uuid primary key,
    company_id uuid not null unique references companies(id),
    canceled_at timestamptz, created_at timestamptz,
    current_period_end timestamptz, current_period_start timestamptz,
    updated_at timestamptz,
    plan_type varchar(255), status varchar(255),
    stripe_customer_id varchar(255), stripe_subscription_id varchar(255)
);

create table if not exists messages (
    id uuid primary key,
    created_at timestamp not null, decided_at timestamp,
    company_id uuid references companies(id),
    receiver_id uuid references users(id), sender_id uuid references users(id),
    content text not null, metadata text,
    status varchar(255) not null, title varchar(255) not null,
    type varchar(255) not null
);

create table if not exists operational_capacities (
    id uuid primary key,
    active boolean not null, day_of_week integer not null,
    end_time time(0) not null, min_employees_required integer not null,
    start_time time(0) not null,
    company_id uuid not null references companies(id),
    target_id uuid not null, target_type varchar(255) not null
);

create table if not exists password_reset_tokens (
    id uuid primary key,
    expires_at timestamptz not null, used_at timestamptz,
    token_preview varchar(12), user_id uuid not null references users(id),
    token_hash varchar(64) not null unique, token varchar(255) unique
);

create table if not exists team_invitations (
    id uuid primary key,
    active boolean not null, accepted_at timestamptz,
    expires_at timestamptz not null, token_preview varchar(12),
    company_id uuid not null references companies(id),
    invited_by_id uuid not null references users(id),
    token_hash varchar(64) not null unique,
    email varchar(255) not null, role_name varchar(255) not null,
    token varchar(255) unique
);

create table if not exists time_records (
    id uuid primary key,
    latitude double precision, longitude double precision,
    record_time timestamptz not null,
    company_id uuid not null references companies(id),
    user_id uuid not null references users(id),
    device_fingerprint varchar(255), ip_address varchar(255),
    type varchar(255) not null
);

create table if not exists management_edges (
    id uuid primary key,
    active boolean not null, ends_at timestamptz, starts_at timestamptz,
    child_user_id uuid not null references users(id),
    company_id uuid not null references companies(id),
    parent_user_id uuid not null references users(id),
    relation_type varchar(255) not null
);

create table if not exists management_closure (
    id uuid primary key,
    depth integer not null, max_weight_path integer not null,
    ancestor_user_id uuid not null references users(id),
    company_id uuid not null references companies(id),
    descendant_user_id uuid not null references users(id)
);

create table if not exists manager_assignments (
    id uuid primary key,
    active boolean not null, level_weight integer not null,
    ends_at timestamptz, starts_at timestamptz,
    company_id uuid not null references companies(id),
    manager_user_id uuid not null references users(id),
    scope_id uuid not null, role_level varchar(255) not null,
    scope_type varchar(255) not null
);

create table if not exists work_posts (
    id uuid primary key,
    company_id uuid references companies(id),
    project_id uuid references projects(id),
    description varchar(255), name varchar(255) not null
);

create table if not exists schedule_cycles (
    id uuid primary key,
    public_id uuid not null unique,
    business_version integer not null, month integer not null, year integer not null,
    archived_at timestamptz, created_at timestamptz not null,
    published_at timestamptz, updated_at timestamptz not null,
    version bigint not null,
    archived_by_id uuid references users(id),
    company_id uuid not null references companies(id),
    published_by_id uuid references users(id), unit_id uuid,
    status varchar(255) not null, timezone varchar(255) not null
);

create table if not exists schedule_cycle_assignments (
    id uuid primary key,
    public_id uuid not null unique,
    assignment_date date not null, planned_minutes bigint not null,
    version bigint not null,
    company_id uuid not null references companies(id),
    cycle_id uuid not null references schedule_cycles(id),
    employee_id uuid not null references employees(id),
    legend_code varchar(255) not null, legend_impact varchar(255) not null,
    legend_label varchar(255) not null, modality varchar(255) not null
);

create table if not exists schedule_holidays (
    id uuid primary key,
    public_id uuid not null unique,
    holiday_date date not null, version bigint not null,
    company_id uuid not null references companies(id),
    unit_id uuid, name varchar(255) not null, type varchar(255) not null
);

create table if not exists schedule_validation_acknowledgements (
    id uuid primary key,
    public_id uuid not null unique,
    acknowledged_at timestamptz not null, version bigint not null,
    acknowledged_by_id uuid not null references users(id),
    cycle_id uuid not null references schedule_cycles(id),
    alert_id varchar(255) not null, reason varchar(255),
    rule_code varchar(255) not null, severity varchar(255) not null
);

create index if not exists idx_audit_logs_company_created_at
    on audit_logs (company_id, created_at);
create index if not exists idx_management_edges_parent
    on management_edges (company_id, parent_user_id);
create index if not exists idx_management_edges_child
    on management_edges (company_id, child_user_id);
create index if not exists idx_management_closure_ancestor
    on management_closure (company_id, ancestor_user_id);
create index if not exists idx_management_closure_descendant
    on management_closure (company_id, descendant_user_id);
create index if not exists idx_manager_assignments_scope
    on manager_assignments (company_id, scope_type, scope_id, active);
create index if not exists idx_manager_assignments_company_manager_active
    on manager_assignments (company_id, manager_user_id, active);
create index if not exists idx_schedule_cycles_company_period
    on schedule_cycles (company_id, year, month);
create index if not exists idx_schedule_cycle_assignments_cycle_date
    on schedule_cycle_assignments (cycle_id, assignment_date);
create index if not exists idx_schedule_holidays_company_date
    on schedule_holidays (company_id, holiday_date);
create index if not exists idx_schedule_validation_ack_cycle
    on schedule_validation_acknowledgements (cycle_id);
