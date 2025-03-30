-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Travel groups are viewable by everyone" ON public.travel_groups;
DROP POLICY IF EXISTS "Users can create travel groups" ON public.travel_groups;
DROP POLICY IF EXISTS "Creators can update their travel groups" ON public.travel_groups;
DROP POLICY IF EXISTS "Group tags are viewable by everyone" ON public.group_tags;
DROP POLICY IF EXISTS "Group creators can manage tags" ON public.group_tags;
DROP POLICY IF EXISTS "Group members are viewable by everyone" ON public.group_members;
DROP POLICY IF EXISTS "Users can join travel groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave travel groups" ON public.group_members;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.group_members;
DROP TABLE IF EXISTS public.group_tags;
DROP TABLE IF EXISTS public.travel_groups;

-- Create travel_groups table
CREATE TABLE IF NOT EXISTS public.travel_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 4,
  budget_range INTEGER NOT NULL DEFAULT 15000,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled'))
);

-- Create group_tags table
CREATE TABLE IF NOT EXISTS public.group_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  travel_group_id UUID REFERENCES public.travel_groups(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(travel_group_id, tag)
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  travel_group_id UUID REFERENCES public.travel_groups(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('creator', 'admin', 'member')),
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'rejected')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(travel_group_id, profile_id)
);

-- Enable Row Level Security
ALTER TABLE public.travel_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Create policies for travel_groups
CREATE POLICY "Travel groups are viewable by everyone"
  ON public.travel_groups
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create travel groups"
  ON public.travel_groups
  FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their travel groups"
  ON public.travel_groups
  FOR UPDATE
  USING (auth.uid() = creator_id);

-- Create policies for group_tags
CREATE POLICY "Group tags are viewable by everyone"
  ON public.group_tags
  FOR SELECT
  USING (true);

CREATE POLICY "Group creators can manage tags"
  ON public.group_tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.travel_groups
      WHERE travel_groups.id = group_tags.travel_group_id
      AND travel_groups.creator_id = auth.uid()
    )
  );

-- Create policies for group_members
CREATE POLICY "Group members are viewable by everyone"
  ON public.group_members
  FOR SELECT
  USING (true);

CREATE POLICY "Users can join travel groups"
  ON public.group_members
  FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can leave travel groups"
  ON public.group_members
  FOR DELETE
  USING (auth.uid() = profile_id);

-- Create function to automatically add creator as group member
CREATE OR REPLACE FUNCTION public.handle_new_travel_group()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_members (travel_group_id, profile_id, role, status)
  VALUES (NEW.id, NEW.creator_id, 'creator', 'accepted');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically add creator as group member
DROP TRIGGER IF EXISTS on_travel_group_created ON public.travel_groups;
CREATE TRIGGER on_travel_group_created
  AFTER INSERT ON public.travel_groups
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_travel_group();

-- Add updated_at trigger to travel_groups
DROP TRIGGER IF EXISTS travel_groups_updated_at ON public.travel_groups;
CREATE TRIGGER travel_groups_updated_at
  BEFORE UPDATE ON public.travel_groups
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.travel_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_tags;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members; 