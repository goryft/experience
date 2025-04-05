-- Drop existing policies if they exist
drop policy if exists "Public access for product images" on storage.objects;
drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Admins can delete images" on storage.objects;

-- Create a bucket for product images if it doesn't exist
insert into storage.buckets (id, name, public)
select 'product-images', 'product-images', true
where not exists (
    select 1 from storage.buckets where id = 'product-images'
);

-- Allow public access to view images
create policy "Public access for product images"
on storage.objects for select
using (bucket_id = 'product-images');

-- Allow authenticated users to upload images
create policy "Authenticated users can upload images"
on storage.objects for insert
with check (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
);

-- Allow admins to delete images
create policy "Admins can delete images"
on storage.objects for delete
using (
    bucket_id = 'product-images'
    and exists (
        select 1 from public.user_profiles
        where user_profiles.id = auth.uid()
        and user_profiles.is_admin = true
    )
); 