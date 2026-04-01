-- Internal comments per roster person (keyed by stable talent_key from the app).
-- Run via Supabase CLI (`supabase db push`) or paste into SQL Editor.

-- ---------------------------------------------------------------------------
-- talent_comments
-- ---------------------------------------------------------------------------

create table if not exists public.talent_comments (
  id uuid primary key default gen_random_uuid(),
  talent_key text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) > 0 and char_length(body) <= 10000),
  created_at timestamptz not null default now()
);

create index if not exists talent_comments_talent_key_created_idx
  on public.talent_comments (talent_key, created_at desc);

alter table public.talent_comments enable row level security;

create policy "talent_comments_select_authenticated"
  on public.talent_comments for select
  to authenticated
  using (true);

create policy "talent_comments_insert_own"
  on public.talent_comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "talent_comments_update_own"
  on public.talent_comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "talent_comments_delete_own"
  on public.talent_comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- talent_resumes (metadata; files live in storage bucket "resumes")
-- Path convention: {auth.uid()}/{talent_key_hex}/{uuid}_{filename}
-- ---------------------------------------------------------------------------

create table if not exists public.talent_resumes (
  id uuid primary key default gen_random_uuid(),
  talent_key text not null,
  storage_path text not null unique,
  file_name text not null,
  content_type text,
  file_size bigint,
  uploaded_by uuid references auth.users (id) on delete set null,
  uploaded_at timestamptz not null default now()
);

create index if not exists talent_resumes_talent_key_idx
  on public.talent_resumes (talent_key, uploaded_at desc);

alter table public.talent_resumes enable row level security;

create policy "talent_resumes_select_authenticated"
  on public.talent_resumes for select
  to authenticated
  using (true);

create policy "talent_resumes_insert_authenticated"
  on public.talent_resumes for insert
  to authenticated
  with check (auth.uid() = uploaded_by);

create policy "talent_resumes_delete_own"
  on public.talent_resumes for delete
  to authenticated
  using (auth.uid() = uploaded_by);

-- ---------------------------------------------------------------------------
-- Storage: private bucket "resumes"
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

-- SELECT: any signed-in user can download (shared internal roster).
create policy "resumes_object_select_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'resumes');

-- INSERT / DELETE: only inside folder named with the caller's user id (first path segment).
create policy "resumes_object_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resumes'
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );

create policy "resumes_object_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'resumes'
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );

create policy "resumes_object_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resumes'
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );
