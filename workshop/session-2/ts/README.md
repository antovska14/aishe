# Session 2: CLI with Redis Caching - TypeScript Setup

## Prerequisites

Before starting, ensure you have:

1. **Completed Session 1**: Understanding of the basic CLI implementation
2. **AISHE Server Running**: The AISHE server must be accessible
3. **Redis Server Running**: A Redis instance must be available
   - Local: `redis://localhost:6379`
   - Or use a remote Redis instance in the cloud
4. **Node.js 20+**: Required for this project

## Your Task

- [ ] Implement the TODO comments inside the `getCacheKey`, `getFromCache`, and `setToCache` functions in [starter.ts](./starter.ts)

## Project Setup

### Install Dependencies

```bash
cd workshop/session-2/ts
npm install
```

This will install:

- `redis@5.11.0` - Redis client for Node.js
- `tsx` - TypeScript execution engine

### Start Redis (if not already running)

**Using Docker:**

```bash
docker run -d -p 6379:6379 redis:latest
```

**Verify Redis is running:**

```bash
redis-cli ping
# Should return: PONG
```

## Running the CLI with Caching

```bash
export AISHE_SERVER_URL=http://localhost:8000
export REDIS_URL=redis://localhost:6379

# Run the CLI
npm run start
# Input some question (e.g. "What is Redis?")

# Run the same question again - should be instant (cached)
npm run start
# Input some question (e.g. "What is Redis?")
```

### Inspect Redis Cache

```bash
# Connect to Redis CLI
redis-cli

# List all keys
KEYS *

# Get a cached value (replace with actual hash)
GET "aishe:question:a1b2c3d4e5f6..."

# Check TTL (time to live)
TTL "aishe:question:a1b2c3d4e5f6..."

# Clear all cache
FLUSHDB
```

## Key Concepts

### Simple Caching Strategy

- **Cache Key**: Question text (exact match)
- **Cache Value**: Complete API response
- **TTL**: Time-to-live for cache entries (e.g., 1 hour)
- **Hit**: Question found in cache -> return immediately
- **Miss**: Question not in cache -> call API, store result

## Troubleshooting

### Redis Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**

1. Ensure Redis is running: `redis-cli ping`
2. Check Redis URL: `echo $REDIS_URL`
3. Verify port is not blocked: `telnet localhost 6379`

### Cache Not Working

**Check if Redis is storing data:**

```bash
redis-cli
> KEYS *
> GET "your-cache-key"
```

**Clear cache and try again:**

```bash
redis-cli FLUSHDB
```
