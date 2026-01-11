-- Add font_family column to profiles table
ALTER TABLE public.profiles ADD COLUMN font_family text DEFAULT 'Inter';