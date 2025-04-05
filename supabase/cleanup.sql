-- Drop all policies
drop policy if exists "Categories are viewable by everyone" on public.categories;
drop policy if exists "Categories are manageable by admins" on public.categories;
drop policy if exists "Products are viewable by everyone" on public.products;
drop policy if exists "Products are manageable by admins" on public.products;
drop policy if exists "Product images are viewable by everyone" on public.product_images;
drop policy if exists "Product images are manageable by admins" on public.product_images;
drop policy if exists "Sizes are viewable by everyone" on public.sizes;
drop policy if exists "Sizes are manageable by admins" on public.sizes;
drop policy if exists "Inventory is viewable by everyone" on public.inventory;
drop policy if exists "Inventory is manageable by admins" on public.inventory;
drop policy if exists "User profiles are viewable by the user" on public.user_profiles;
drop policy if exists "User profiles are manageable by admins" on public.user_profiles;

-- Drop storage policies
drop policy if exists "Public access for product images" on storage.objects;
drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Admins can delete images" on storage.objects;

-- Drop all tables
drop table if exists public.inventory cascade;
drop table if exists public.product_images cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.sizes cascade;
drop table if exists public.user_profiles cascade;

-- Drop storage bucket
delete from storage.buckets where id = 'product-images';

-- Clean up auth users
delete from auth.users where email = 'admin@ryft.com';

-- Drop functions and triggers
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user(); 