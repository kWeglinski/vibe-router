

# Vibe Router Data Logging System

## Overview
The optional data logging system captures all questions and responses in a format optimized for future vectorization, while maintaining user control through both configuration and request parameters.

## Features

- **Dual Control Mechanism**: Enable logging via Docker environment variable (`ENABLE_LOGGING=true/false`) or per-request opt-out parameter (`{"log_request": false}`)
- **Structured Data Format**: Stores logs in JSON format with semantic embeddings for both prompts and responses
- **Multiple Storage Backends**: Supports filesystem (default), MongoDB, and PostgreSQL with vector extension
- **Vectorization Readiness**: Data format compatible with Pinecone, Weaviate, and local vector databases
- **Privacy Controls**: Data anonymization options and PII detection/redaction support

## Configuration

### Environment Variables
- `ENABLE_LOGGING=true/false` - Enable or disable logging globally
- `LOGGING_STORAGE=filesystem/mongodb/postgres` - Storage backend
- `LOGGING_PATH=/path/to/logs` - Log storage path (filesystem only)
- `EMBEDDING_MODEL=text-embedding-ada-002` - Embedding model to use
- `LOGGING_RETENTION_DAYS=30` - Data retention period
- `LOGGING_BATCH_SIZE=100` - Batch size for embedding generation

### config.json
```json
{
  "loggingConfig": {
    "enabled": true,
    "storage": "filesystem",
    "path": "./logs",
    "embedding_model": "text-embedding-ada-002",
    "retention_days": 30,
    "batch_size": 100
  }
}
```

## Log Format

```json
{
  "timestamp": "2025-07-18T14:30:00Z",
  "request_id": "unique-uuid-v4",
  "model": "thinker",
  "prompt": "User's input text",
  "parameters": { /* original request parameters */ },
  "response": "Model's output text",
  "metadata": {
    "processing_time_ms": 123,
    "tokens_used": 45,
    "status": "success/error"
  }
}
```

## Endpoints

- `GET /v1/logs/stats` - Read-only endpoint for basic statistics
- `POST /v1/completions` - Accepts `log_request: false` parameter to opt-out of logging

## Implementation Details

- Asynchronous logging to avoid impacting response times
- Configurable batch processing for embeddings generation
- Proper error handling and retry logic for logging failures

## Future Enhancements

- Query interface for logged data
- Custom metadata fields support
- Integration with existing vector databases

