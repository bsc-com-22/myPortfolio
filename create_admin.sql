-- ===============================================
-- Create Admin User Direct SQL Execution
-- Note: Replace 'admin@blessingschidazi.com' and 'SecurePass123!' 
-- with your actual desired dashboard admin credentials.
-- ===============================================

-- We use crypt() for the password so it resolves securely inside Supabase
-- Ensure you have the 'pgcrypto' extension enabled in Supabase if it isn't automatically
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
)
VALUES (
    -- You can generate an ID or let it auto-generate, defining explicitly for safety mappings
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@blessingschidazi.com', -- <--- 1. Change your email here
    crypt('SecurePass123!', gen_salt('bf')), -- <--- 2. Change your password here
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    FALSE,
    'authenticated'
)
-- Optionally log you in instantly based off matching email logic
ON CONFLICT (email) DO NOTHING;

-- Because identities mapping is required by Supabase Auth v2
-- Replace the UUID in SELECT id with your email to correctly map to auth.identities
INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(), 
    id, 
    email, 
    format('{"sub":"%s","email":"%s"}', id, email)::jsonb, 
    'email', 
    now(), 
    now(), 
    now()
FROM 
    auth.users 
WHERE 
    email = 'admin@blessingschidazi.com'  -- <--- Must match the email entered above
ON CONFLICT DO NOTHING;
