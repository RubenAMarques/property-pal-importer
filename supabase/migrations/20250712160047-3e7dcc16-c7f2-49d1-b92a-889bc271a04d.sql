-- Drop the existing INSERT policy that's causing issues
DROP POLICY IF EXISTS "Users can create their own listings" ON public.listings;

-- Create a new, more explicit INSERT policy
CREATE POLICY "Users can create their own listings" 
ON public.listings 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);