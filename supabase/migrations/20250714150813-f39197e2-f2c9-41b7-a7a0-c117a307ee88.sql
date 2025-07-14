-- Add new columns for duplicate detection
ALTER TABLE public.listings 
ADD COLUMN dup_hash text,
ADD COLUMN duplicate_of_url text;

-- Create unique index on dup_hash, ignoring NULL values
CREATE UNIQUE INDEX idx_listings_dup_hash_unique 
ON public.listings (dup_hash) 
WHERE dup_hash IS NOT NULL;