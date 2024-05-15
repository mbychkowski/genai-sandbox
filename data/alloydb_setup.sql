-- google_ml_integration extension installation
CREATE EXTENSION google_ml_integration;

-- pgvector extension installation
CREATE EXTENSION vector;

-- create vector_store table
CREATE TABLE vector_store (id bigserial PRIMARY KEY, embeddings vector(768));

-- Grant permission for database users to execute the embedding function
GRANT EXECUTE ON FUNCTION embedding TO postgres;