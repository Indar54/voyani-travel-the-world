
-- Create the group_messages table
CREATE TABLE IF NOT EXISTS public.group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_group_id UUID NOT NULL REFERENCES public.travel_groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up RLS policies
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE TRIGGER group_messages_updated_at
  BEFORE UPDATE ON public.group_messages
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- RLS policies
CREATE POLICY "Group messages are viewable by group members"
  ON public.group_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE travel_group_id = group_messages.travel_group_id
      AND profile_id = auth.uid()
      AND status = 'accepted'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.travel_groups
      WHERE id = group_messages.travel_group_id
      AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in groups they're members of"
  ON public.group_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE travel_group_id = group_messages.travel_group_id
      AND profile_id = auth.uid()
      AND status = 'accepted'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.travel_groups
      WHERE id = group_messages.travel_group_id
      AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.group_messages
  FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
  ON public.group_messages
  FOR DELETE
  USING (auth.uid() = sender_id);

CREATE POLICY "Group creators can delete any message in their group"
  ON public.group_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.travel_groups
      WHERE id = group_messages.travel_group_id
      AND creator_id = auth.uid()
    )
  );

-- Enable realtime for group_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
