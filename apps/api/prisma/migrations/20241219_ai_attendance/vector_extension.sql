-- Habilitar extensão pgvector para embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Criar índice IVFFlat para busca semântica (após popular alguns embeddings)
-- 1536 dimensões para text-embedding-3-small
CREATE INDEX IF NOT EXISTS idx_kbchunk_emb
  ON "KBChunk" USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
