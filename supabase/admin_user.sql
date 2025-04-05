-- First, disable the trigger temporarily to prevent automatic profile creation
alter table auth.users disable trigger on_auth_user_created;

-- Delete existing admin user if exists (delete from profiles first due to foreign key)
delete from public.user_profiles where email = 'admin@ryft.com';
delete from auth.users where email = 'admin@ryft.com';

-- Create a default admin user
-- Email: admin@ryft.com
-- Password: Admin123!

-- Generate a new UUID for the admin user
do $$
declare
    admin_id uuid := gen_random_uuid();
begin
    -- Insert into auth.users with the specific UUID
    insert into auth.users (
        instance_id,
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token,
        aud,
        role
    ) values (
        '00000000-0000-0000-0000-000000000000',
        admin_id,
        'admin@ryft.com',
        crypt('Admin123!', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"],"is_admin":true}',
        '{"is_admin":true}',
        now(),
        now(),
        '',
        '',
        '',
        '',
        'authenticated',
        'authenticated'
    );

    -- Insert into user_profiles with the same UUID
    insert into public.user_profiles (id, email, is_admin)
    values (admin_id, 'admin@ryft.com', true);

    -- Update the user's metadata to include admin role
    update auth.users 
    set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb,
        raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'::jsonb
    where id = admin_id;
end $$;

-- Re-enable the trigger
alter table auth.users enable trigger on_auth_user_created; 