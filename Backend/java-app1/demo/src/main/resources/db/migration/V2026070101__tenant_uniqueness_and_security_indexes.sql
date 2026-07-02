-- noinspection SqlResolveForFile
create extension if not exists pgcrypto;

do $$
begin
    if to_regclass('public.users') is not null then
        alter table users drop constraint if exists uk_user_email;
        update users
        set email = lower(trim(email))
        where email <> lower(trim(email));
        create unique index if not exists uq_users_company_email_ci
            on users (company_id, lower(email));
        create index if not exists idx_users_company_active
            on users (company_id, active);
        create index if not exists idx_users_company_username_ci
            on users (company_id, lower(username));
    end if;
end $$;

do $$
begin
    if to_regclass('public.employees') is not null then
        update employees
        set email = lower(trim(email))
        where email <> lower(trim(email));
        create unique index if not exists uq_employees_company_email_ci
            on employees (company_id, lower(email));
        create index if not exists idx_employees_company_active_name
            on employees (company_id, active, full_name);
        create index if not exists idx_employees_company_sector_active
            on employees (company_id, sector_id, active);
        create index if not exists idx_employees_company_project_active
            on employees (company_id, project_id, active);
    end if;
end $$;

do $$
begin
    if to_regclass('public.team_invitations') is not null then
        alter table team_invitations add column if not exists token_hash varchar(64);
        alter table team_invitations add column if not exists token_preview varchar(12);

        execute $sql$
            update team_invitations
            set token_hash = encode(public.digest(coalesce(token, id::text), 'sha256'), 'hex')
            where token_hash is null or token_hash = ''
        $sql$;

        execute $sql$
            update team_invitations
            set token_preview = right(coalesce(token, id::text), 6)
            where token_preview is null or token_preview = ''
        $sql$;

        alter table team_invitations alter column token drop not null;
        create unique index if not exists uq_team_invitations_token_hash
            on team_invitations (token_hash);
        create index if not exists idx_team_invitations_company_email_active
            on team_invitations (company_id, lower(email), active);
        create index if not exists idx_team_invitations_expires_at
            on team_invitations (expires_at);
    end if;
end $$;

do $$
begin
    if to_regclass('public.password_reset_tokens') is not null then
        alter table password_reset_tokens add column if not exists token_hash varchar(64);
        alter table password_reset_tokens add column if not exists token_preview varchar(12);

        execute $sql$
            update password_reset_tokens
            set token_hash = encode(public.digest(coalesce(token, id::text), 'sha256'), 'hex')
            where token_hash is null or token_hash = ''
        $sql$;

        execute $sql$
            update password_reset_tokens
            set token_preview = right(coalesce(token, id::text), 6)
            where token_preview is null or token_preview = ''
        $sql$;


        alter table password_reset_tokens alter column token drop not null;
        create unique index if not exists uq_password_reset_tokens_token_hash
            on password_reset_tokens (token_hash);
        create index if not exists idx_password_reset_tokens_user_expires
            on password_reset_tokens (user_id, expires_at);
        create index if not exists idx_password_reset_tokens_used_at
            on password_reset_tokens (used_at);
    end if;
end $$;

do $$
begin
    if to_regclass('public.time_records') is not null then
        create index if not exists idx_time_records_user_time
            on time_records (user_id, record_time desc);
    end if;
end $$;

do $$
begin
    if to_regclass('public.schedule_cycles') is not null then
        create unique index if not exists uq_schedule_cycles_active_period
            on schedule_cycles (
                company_id,
                coalesce(unit_id, '00000000-0000-0000-0000-000000000000'::uuid),
                year,
                month
            )
            where status <> 'ARQUIVADO';
    end if;
end $$;

do $$
begin
    if to_regclass('public.schedule_cycle_assignments') is not null then
        create index if not exists idx_schedule_cycle_assignments_cycle_date_employee
            on schedule_cycle_assignments (cycle_id, assignment_date, employee_full_name);
    end if;
end $$;

do $$
begin
    if to_regclass('public.marketing_leads') is not null then
        create index if not exists idx_marketing_leads_created_at
            on marketing_leads (created_at desc);
    end if;
end $$;

do $$
begin
    if to_regclass('public.audit_logs') is not null then
        create index if not exists idx_audit_logs_created_at_brin
            on audit_logs using brin (created_at);
    end if;
end $$;
