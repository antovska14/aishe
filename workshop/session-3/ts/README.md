# Session 3: Semantic Caching with LangCache - TypeScript Setup

This directory contains the TypeScript implementation for Session 3 of the AISHE workshop, which implements semantic caching using Redis LangCache.

## Prerequisites

Before starting, ensure you have:

1. **Completed Sessions 1 & 2**: Understanding of basic CLI and simple caching
2. **AISHE Server Running**: The AISHE server must be accessible
3. **Node.js 20+**: Required for this project

## Your Task

- [ ] Implement the TODO comments inside the `getFromCache` and `saveToCache` functions in [starter.ts](./starter.ts)

## Project Setup

### 1. Install Dependencies

```bash
cd workshop/session-3/ts
npm install
```

This will install:

- `@redis-ai/langcache` - Semantic caching library for Redis
- `tsx` - TypeScript execution engine

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit the `.env` file with your LangCache credentials:

```bash
# .env file - update these values
AISHE_SERVER_URL=http://localhost:8000
LANGCACHE_API_KEY=YOUR_API_KEY
LANGCACHE_CACHE_ID=YOUR_CACHE_ID
LANGCACHE_SERVER_URL=https://aws-us-east-1.langcache.redis.io
```

## Running the CLI with Semantic Caching

```bash
cd workshop/session-3/ts
npm run start
# Input some question (e.g. "What is Redis?")
```

Reference solution:

```bash
cd workshop/session-3/ts
npm run solution
# Input some question (e.g. "What is Redis?")
```

### Inspect LangCache in Redis

```bash
# Connect to Redis CLI
redis-cli -h <CLOUD_DB_HOST> -p <CLOUD_DB_PORT> -a <CLOUD_DB_PASSWORD>

# List LangCache indexes
FT._LIST

# Search for cached embeddings
FT.SEARCH langcache:index "*"

# Clear cache
FLUSHDB
```

## Key Concepts

### Semantic Caching Strategy

- **Embeddings**: Convert questions to vector representations
- **Similarity Search**: Find semantically similar questions
- **Threshold**: Configurable similarity score (0.0-1.0)
- **Hit**: Similar question found -> return cached answer
- **Miss**: No similar question -> call API, store with embedding

### How It Works

1. **Question arrives** -> "What is Redis?"
2. **Generate embedding** -> [0.123, 0.456, 0.789, ...]
3. **Search cache** -> Find similar embeddings
4. **Check threshold** -> Similarity > 0.85?
5. **Cache hit** -> Return cached answer
6. **Cache miss** -> Call API, cache with embedding

## Troubleshooting

### LangCache Import Error

```
Error: Cannot find package '@redis-ai/langcache'
```

**Solution:**

```bash
npm install
```

## Performance Comparison

### Session 1 (No Cache)

- Every request calls API
- Response time: ~2-5 seconds
- Cost: High (every request)

### Session 2 (Simple Cache)

- Only exact matches cached
- Cache hit rate: ~20-30%
- Response time: <10ms (cached)

### Session 3 (Semantic Cache)

- Semantic matches cached
- Cache hit rate: ~70-90%
- Response time: <50ms (cached)
- Cost savings: 70-90%
