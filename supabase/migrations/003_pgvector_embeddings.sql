-- ====================================================================
-- Milestone 5: pgvector Embeddings Infrastructure
-- Run this in Supabase Dashboard → SQL Editor
-- REVIEWABLE — inspect before executing
-- ====================================================================

-- 1. Ensure pgvector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the record_embeddings table
CREATE TABLE IF NOT EXISTS record_embeddings (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL,
  file_id    UUID NOT NULL,
  chunk_index INT NOT NULL,
  chunk_text  TEXT NOT NULL,
  embedding   vector(1536) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create HNSW index for fast approximate nearest neighbor search
-- Uses cosine distance operator (<=>)
CREATE INDEX IF NOT EXISTS idx_record_embeddings_hnsw
ON record_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 4. Standard B-tree indexes for filtering
CREATE INDEX IF NOT EXISTS idx_record_embeddings_user_id
ON record_embeddings (user_id);

CREATE INDEX IF NOT EXISTS idx_record_embeddings_file_id
ON record_embeddings (file_id);

-- 5. RLS policies for record_embeddings (users can only access their own)
ALTER TABLE record_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own embeddings"
ON record_embeddings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own embeddings"
ON record_embeddings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own embeddings"
ON record_embeddings
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
