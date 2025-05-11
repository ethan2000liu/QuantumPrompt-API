-- Allow anyone to insert into users (for dev/testing)
CREATE POLICY "Allow insert for all" ON public.users
  FOR INSERT
  USING (true); 