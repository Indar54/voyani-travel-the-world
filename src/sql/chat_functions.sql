
-- Function to insert a group message and return the result
CREATE OR REPLACE FUNCTION public.insert_group_message(
  p_travel_group_id UUID,
  p_sender_id UUID,
  p_content TEXT
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  INSERT INTO public.group_messages (travel_group_id, sender_id, content)
  VALUES (p_travel_group_id, p_sender_id, p_content)
  RETURNING id INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user has permission to delete a message
CREATE OR REPLACE FUNCTION public.check_message_delete_permission(
  p_message_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_sender_id UUID;
  v_group_id UUID;
  v_creator_id UUID;
BEGIN
  -- Get message details
  SELECT sender_id, travel_group_id INTO v_sender_id, v_group_id
  FROM public.group_messages
  WHERE id = p_message_id;
  
  IF v_sender_id = p_user_id THEN
    -- User is the message sender
    RETURN TRUE;
  END IF;
  
  -- Check if user is the group creator
  SELECT creator_id INTO v_creator_id
  FROM public.travel_groups
  WHERE id = v_group_id;
  
  RETURN v_creator_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get group messages with user info
CREATE OR REPLACE FUNCTION public.get_group_messages(
  p_group_id UUID
) RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'id', m.id,
        'content', m.content,
        'created_at', m.created_at,
        'sender', json_build_object(
          'id', p.id,
          'username', p.username,
          'full_name', p.full_name,
          'avatar_url', p.avatar_url
        )
      )
    )
    FROM public.group_messages m
    JOIN public.profiles p ON m.sender_id = p.id
    WHERE m.travel_group_id = p_group_id
    ORDER BY m.created_at ASC
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
