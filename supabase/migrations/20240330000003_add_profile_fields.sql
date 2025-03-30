-- Add travel_interests and languages columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS travel_interests text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}'; 