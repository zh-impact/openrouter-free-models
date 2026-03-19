# @openrouter-free-models/free-route-adv

Advanced filtering and routing for OpenRouter free models with multi-condition support, caching, and availability verification.

## Features

- 🔍 **Advanced Filtering**: Filter by provider, modality, context length, and keyword matching
- ⚡ **Smart Caching**: LRU cache with configurable TTL to minimize API calls
- 🔗 **Chain API**: Fluent interface for complex filtering operations
- ✅ **Availability Verification**: Check if models are actually usable before using them
- 🎯 **Provider Aliases**: Built-in and custom provider name aliases
- 🔄 **Error Handling**: Comprehensive error types with actionable suggestions
- 🌐 **Multi-Environment**: Support for browser, Node.js, and Cloudflare Workers

## Installation

```bash
npm install @openrouter-free-models/free-route-adv
# or
pnpm add @openrouter-free-models/free-route-adv
# or
yarn add @openrouter-free-models/free-route-adv
```

## Quick Start

```typescript
import { FreeRouteClient } from '@openrouter-free-models/free-route-adv';

// Initialize client
const client = new FreeRouteClient({
  apiBase: '/api/models', // or 'https://openrouter.ai/api/v1/models'
});

// Filter models
const models = await client.filter({
  providers: ['google', 'anthropic'],
  modality: 'text',
  minContextLength: 32000
});

console.log(`Found ${models.length} free models`);
```

## Usage Examples

### Basic Filtering

```typescript
import { FreeRouteClient } from '@openrouter-free-models/free-route-adv';

const client = new FreeRouteClient();

// Filter by provider
const googleModels = await client.filter({
  providers: ['google']
});

// Filter by modality
const textModels = await client.filter({
  modality: 'text'
});

// Filter by context length
const longContextModels = await client.filter({
  minContextLength: 100000
});

// Filter by keyword
const geminiModels = await client.filter({
  keyword: 'gemini',
  matchStrategy: 'includes'
});
```

### Chain API

```typescript
import { FreeRouteClient } from '@openrouter-free-models/free-route-adv';

const client = new FreeRouteClient();

// Fluent filtering interface
const models = await client
  .filterByProviders(['google', 'anthropic'])
  .filterByModality('text')
  .filterByMinContextLength(32000)
  .filterByKeyword('pro', 'includes')
  .exec();

console.log(models.map(m => m.id));
```

### Cache Configuration

```typescript
import { FreeRouteClient } from '@openrouter-free-models/free-route-adv';

const client = new FreeRouteClient({
  cache: {
    enabled: true,
    ttl: 300000,    // 5 minutes
    maxSize: 100    // Maximum 100 cached entries
  }
});

// Check cache stats
const stats = client.getCacheStats();
console.log(`Cache hits: ${stats.hits}, misses: ${stats.misses}`);

// Force refresh (bypass cache)
const freshModels = await client.forceRefresh();

// Clear cache
client.clearCache();
```

### Error Handling

```typescript
import { FreeRouteClient, NoModelsFoundError } from '@openrouter-free-models/free-route-adv';

const client = new FreeRouteClient({
  emptyResult: {
    throwOnEmpty: true,
    logWarning: true
  }
});

try {
  const models = await client.filter({
    providers: ['nonexistent']
  });
} catch (error) {
  if (error instanceof NoModelsFoundError) {
    console.error('No models found!');
    console.error('Filters used:', error.filters);
    console.error('Suggestions:', error.suggestions);
  }
}
```

### Custom Provider Aliases

```typescript
import { FreeRouteClient } from '@openrouter-free-models/free-route-adv';

const client = new FreeRouteClient({
  aliases: {
    'gpt': 'openai',
    'llama': 'meta'
  }
});

// Now you can use aliases
const models = await client.filter({
  providers: ['gpt', 'llama']
});
```

### Model Availability Verification

```typescript
import { FreeRouteClient } from '@openrouter-free-models/free-route-adv';

const client = new FreeRouteClient({
  verifyAvailability: true // Enable availability checking
});

// Models will be verified before being returned
const models = await client.filter({
  providers: ['google']
});

// Or verify specific models
const availability = await client.verifyModelAvailability('google/gemini-pro');

if (!availability.available) {
  console.log(`Model unavailable: ${availability.reason}`);
  console.log(`Suggestion: ${availability.suggestion}`);
}

// Get alternative models
const alternatives = await client.getAlternatives('google/gemini-pro');
console.log('Alternatives:', alternatives.alternatives.map(m => m.id));
```

## API Reference

### FreeRouteClient

Main client class for interacting with OpenRouter free models.

#### Constructor

```typescript
constructor(options?: ClientOptions)
```

**Options:**
- `apiBase?: string` - Base URL for API endpoint (default: `/api/models`)
- `apiKey?: string` - API key for authentication
- `cache?: CacheOptions` - Cache configuration
- `aliases?: Record<string, string>` - Custom provider aliases
- `retryAttempts?: number` - Number of retry attempts (default: 3)
- `timeout?: number` - Request timeout in ms (default: 30000)
- `emptyResult?: EmptyResultOptions` - Empty result handling
- `verifyAvailability?: boolean | AvailabilityCheckOptions` - Enable availability checking

#### Methods

##### `filter(options?: FilterOptions): Promise<OpenRouterModel[]>`

Filter models based on provided options.

**FilterOptions:**
- `providers?: string[]` - Filter by provider names
- `modality?: string` - Filter by modality type
- `minContextLength?: number` - Minimum context length
- `maxContextLength?: number` - Maximum context length
- `keyword?: string` - Keyword to search for
- `matchStrategy?: 'exact' | 'includes' | 'startsWith' | 'regex'` - Match strategy
- `verifyAvailability?: boolean` - Verify model availability
- `fallbackProvider?: string` - Fallback provider if no matches

##### Chain Methods

- `filterByProviders(providers: string[]): FilterChain`
- `filterByModality(modality: string): FilterChain`
- `filterByKeyword(keyword: string, strategy?: MatchStrategy): FilterChain`

Returns a chainable filter object. Call `.exec()` to execute.

##### Utility Methods

- `getAllModels(): Promise<OpenRouterModel[]>` - Get all free models
- `getModelById(id: string): Promise<OpenRouterModel | null>` - Get specific model
- `getProviders(): Promise<string[]>` - Get all available providers
- `getModalities(): Promise<string[]>` - Get all available modalities
- `verifyModelAvailability(modelId: string): Promise<ModelAvailabilityResult>` - Verify single model
- `verifyModelsAvailability(modelIds: string[]): Promise<Record<string, ModelAvailabilityResult>>` - Verify multiple models
- `getAlternatives(modelId: string): Promise<AlternativeModels>` - Get alternative models

##### Cache Control

- `clearCache(): void` - Clear all cache
- `forceRefresh(): Promise<OpenRouterModel[]>` - Force refresh from API
- `getCacheStats(): CacheStats` - Get cache statistics

### Error Types

#### `FreeRouteClientError`

Base error class for all client errors.

#### `FetchError`

Thrown when API request fails.

```typescript
interface FetchError {
  message: string;
  originalError?: Error;
}
```

#### `RateLimitError`

Thrown when API rate limit is hit.

```typescript
interface RateLimitError extends FetchError {
  retryAfter?: number; // Seconds to wait
}
```

#### `AuthenticationError`

Thrown when authentication fails.

#### `ValidationError`

Thrown when input validation fails.

```typescript
interface ValidationError {
  field?: string; // Field that failed validation
}
```

#### `NoModelsFoundError`

Thrown when filter returns no results and `throwOnEmpty` is true.

```typescript
interface NoModelsFoundError {
  filters: FilterOptions;
  totalModels: number;
  suggestions: string[];
  fallbackAvailable: boolean;
}
```

#### `ModelAvailabilityError`

Thrown when model availability check fails.

## Configuration Reference

### CacheOptions

```typescript
interface CacheOptions {
  enabled: boolean;   // Enable/disable cache
  ttl: number;        // Time-to-live in milliseconds
  maxSize: number;    // Maximum cache entries
}
```

### EmptyResultOptions

```typescript
interface EmptyResultOptions {
  throwOnEmpty?: boolean;      // Throw error on empty results
  fallbackProvider?: string;   // Fallback provider to try
  logWarning?: boolean;        // Log warnings to console
}
```

### AvailabilityCheckOptions

```typescript
interface AvailabilityCheckOptions {
  timeout?: number;           // Verification timeout (ms)
  retryOnError?: boolean;      // Retry on verification errors
  cacheResults?: boolean;      // Cache verification results
}
```

## Advanced Usage

### Using with OpenRouter API Directly

```typescript
const client = new FreeRouteClient({
  apiBase: 'https://openrouter.ai/api/v1/models',
  apiKey: process.env.OPENROUTER_API_KEY
});

const models = await client.filter({
  providers: ['anthropic']
});
```

### Custom Match Strategies

```typescript
// Exact match
const exactModels = await client.filter({
  keyword: 'gemini-pro',
  matchStrategy: 'exact'
});

// Starts with
const prefixModels = await client.filter({
  keyword: 'google/',
  matchStrategy: 'startsWith'
});

// Regex match
const regexModels = await client.filter({
  keyword: 'gemini.*pro',
  matchStrategy: 'regex'
});
```

### Combining Multiple Filters

```typescript
const models = await client.filter({
  providers: ['google', 'anthropic'],
  modality: 'text',
  minContextLength: 32000,
  maxContextLength: 200000,
  keyword: 'pro',
  matchStrategy: 'includes'
});
```

## Environment Support

This package supports multiple environments:

- **Browser**: Uses native `fetch` API
- **Node.js**: Uses native `fetch` (Node 18+) or `node-fetch`
- **Cloudflare Workers**: Uses Workers `fetch` API

## Type Definitions

Full TypeScript support included:

```typescript
import type {
  OpenRouterModel,
  FilterOptions,
  CacheOptions,
  ClientOptions,
  ModelAvailabilityResult,
  // ... more types
} from '@openrouter-free-models/free-route-adv';
```

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Support

- 📖 [Documentation](https://github.com/your-org/openrouter-free-models)
- 🐛 [Issue Tracker](https://github.com/your-org/openrouter-free-models/issues)
- 💬 [Discussions](https://github.com/your-org/openrouter-free-models/discussions)
