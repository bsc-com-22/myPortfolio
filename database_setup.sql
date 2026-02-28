-- ===============================================
-- Blessings Chidazi - Portfolio Supabase Schema
-- ===============================================

-- 1. Create Messages Table
-- Stores contact form submissions from the public website
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL
);

-- Enable RLS (Row Level Security) for Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow ANYONE (anon) to insert a new message (for the contact form)
CREATE POLICY "Allow public inserts" ON public.messages
    FOR INSERT 
    WITH CHECK (true);

-- Allow ONLY AUTHENTICATED users (you, the admin) to view and delete messages
CREATE POLICY "Allow admin to manage messages" ON public.messages
    FOR ALL 
    USING (auth.role() = 'authenticated');


-- 2. Create Projects Table
-- Stores the portfolio projects displayed on the public website and managed in the admin panel
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('design', 'code')), -- distinguish between design and development work
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Design specific fields
    image_url TEXT,
    
    -- Code specific fields
    demo_url TEXT,
    github_url TEXT
);

-- Enable RLS for Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow ANYONE to view the projects (for the public website)
CREATE POLICY "Allow public to view projects" ON public.projects
    FOR SELECT 
    USING (true);

-- Allow ONLY AUTHENTICATED users (you, the admin) to insert, update, or delete projects
CREATE POLICY "Allow admin to manage projects" ON public.projects
    FOR ALL 
    USING (auth.role() = 'authenticated');
