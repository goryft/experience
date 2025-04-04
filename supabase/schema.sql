-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create products table
create table products (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    price decimal(10,2) not null,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create sizes table
create table sizes (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create product_sizes table (junction table for products and sizes)
create table product_sizes (
    product_id uuid references products(id) on delete cascade,
    size_id uuid references sizes(id) on delete cascade,
    stock_quantity integer not null default 0,
    primary key (product_id, size_id)
);

-- Create cart table
create table cart (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    product_id uuid references products(id) on delete cascade,
    size_id uuid references sizes(id) on delete cascade,
    quantity integer not null default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, product_id, size_id)
);

-- Create orders table
create table orders (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    status text not null default 'pending',
    total_amount decimal(10,2) not null,
    shipping_address jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order_items table
create table order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references orders(id) on delete cascade,
    product_id uuid references products(id) on delete cascade,
    size_id uuid references sizes(id) on delete cascade,
    quantity integer not null,
    price decimal(10,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_profiles table
create table user_profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    full_name text,
    phone_number text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table products enable row level security;
alter table sizes enable row level security;
alter table product_sizes enable row level security;
alter table cart enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table user_profiles enable row level security;

-- Products policies
create policy "Products are viewable by everyone"
    on products for select
    using (true);

create policy "Products are editable by admin"
    on products for all
    using (auth.role() = 'authenticated' and auth.uid() in (
        select id from auth.users where raw_user_meta_data->>'role' = 'admin'
    ));

-- Cart policies
create policy "Users can view their own cart"
    on cart for select
    using (auth.uid() = user_id);

create policy "Users can manage their own cart"
    on cart for all
    using (auth.uid() = user_id);

-- Orders policies
create policy "Users can view their own orders"
    on orders for select
    using (auth.uid() = user_id);

create policy "Users can create their own orders"
    on orders for insert
    with check (auth.uid() = user_id);

-- User profiles policies
create policy "Users can view their own profile"
    on user_profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on user_profiles for update
    using (auth.uid() = id);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.user_profiles (id)
    values (new.id);
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user(); 