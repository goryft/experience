-- Create function to check if user is admin
create or replace function auth.is_admin()
returns boolean as $$
begin
  return (
    coalesce(
      current_setting('request.jwt.claims', true)::json->>'role' = 'admin',
      false
    )
    or
    exists (
      select 1 from auth.users
      where id = auth.uid()
      and raw_app_meta_data->>'is_admin' = 'true'
    )
  );
end;
$$ language plpgsql security definer;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create secure schema
create schema if not exists secure;

-- Create tables first
create table if not exists public.categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.products (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    price decimal(10,2) not null,
    category_id uuid references public.categories(id),
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.product_images (
    id uuid primary key default uuid_generate_v4(),
    product_id uuid references public.products(id) on delete cascade,
    image_url text not null,
    is_primary boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.sizes (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    display_order integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.inventory (
    id uuid primary key default uuid_generate_v4(),
    product_id uuid references public.products(id) on delete cascade,
    size_id uuid references public.sizes(id),
    quantity integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(product_id, size_id)
);

create table if not exists public.user_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    is_admin boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Now drop existing policies if they exist
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

-- Enable Row Level Security
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.sizes enable row level security;
alter table public.inventory enable row level security;
alter table public.user_profiles enable row level security;

-- Create policies for categories
create policy "Categories are viewable by everyone"
    on public.categories for select
    using (true);

create policy "Categories are manageable by admins"
    on public.categories for all
    using (auth.is_admin());

-- Create policies for products
create policy "Products are viewable by everyone"
    on public.products for select
    using (true);

create policy "Products are manageable by admins"
    on public.products for all
    using (auth.is_admin());

-- Create policies for product_images
create policy "Product images are viewable by everyone"
    on public.product_images for select
    using (true);

create policy "Product images are manageable by admins"
    on public.product_images for all
    using (auth.is_admin());

-- Create policies for sizes
create policy "Sizes are viewable by everyone"
    on public.sizes for select
    using (true);

create policy "Sizes are manageable by admins"
    on public.sizes for all
    using (auth.is_admin());

-- Create policies for inventory
create policy "Inventory is viewable by everyone"
    on public.inventory for select
    using (true);

create policy "Inventory is manageable by admins"
    on public.inventory for all
    using (auth.is_admin());

-- Create policies for user_profiles
create policy "User profiles are viewable by the user"
    on public.user_profiles for select
    using (auth.uid() = id);

create policy "User profiles are manageable by admins"
    on public.user_profiles for all
    using (auth.is_admin());

-- Drop existing trigger if exists
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.user_profiles (id, email, is_admin)
    values (new.id, new.email, false);
    return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user(); 