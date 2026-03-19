# Tasks: Free Route Advanced Package

## 1. Package Setup

- [x] 1.1 Create package directory structure at `packages/free-route-adv/`
- [x] 1.2 Initialize `package.json` with package metadata
  - Name: `@openrouter-free-models/free-route-adv`
  - Version: `0.1.0`
  - Main: `./dist/index.js`
  - Types: `./dist/index.d.ts`
  - Exports: conditional exports for ESM/CJS
  - Dependencies: `@openrouter-free-models/shared` (workspace: *)
  - DevDependencies: `typescript`, `vite`, `vitest`, `@vitest/ui`
- [x] 1.3 Create `tsconfig.json` with TypeScript configuration
  - Target: ES2020
  - Module: ESNext
  - ModuleResolution: bundler
  - Strict mode enabled
  - Declaration: true (for .d.ts generation)
- [x] 1.4 Create `vite.config.ts` for library build
  - Build as library mode
  - Entry: `src/index.ts`
  - Output: `dist/`
  - Formats: ESM and CJS
- [x] 1.5 Add package to root workspace (`pnpm-workspace.yaml`)
- [x] 1.6 Create initial file structure:
  - `src/types.ts`
  - `src/cache.ts`
  - `src/fetcher.ts`
  - `src/filter.ts`
  - `src/client.ts`
  - `src/utils.ts`
  - `src/index.ts`
  - `tests/` directory

## 2. Type Definitions (src/types.ts)

- [x] 2.1 Re-export `OpenRouterModel` from `@openrouter-free-models/shared`
- [x] 2.2 Define `FilterOptions` interface with all filter fields
- [x] 2.3 Define `CacheOptions` interface (enabled, ttl, maxSize)
- [x] 2.4 Define `ClientOptions` interface (apiBase, apiKey, cache, aliases, retryAttempts, timeout)
- [x] 2.5 Define `CacheStats` interface (size, lastUpdate, hits, misses)
- [x] 2.6 Define `MatchStrategy` union type (exact, includes, startsWith, regex)
- [x] 2.7 Define error classes:
  - `FreeRouteClientError` (base class)
  - `FetchError` (extends FreeRouteClientError)
  - `RateLimitError` (extends FetchError)
  - `AuthenticationError` (extends FetchError)
  - `ValidationError` (extends FreeRouteClientError)
  - `NoModelsFoundError` (extends FreeRouteClientError)
  - `ModelAvailabilityError` (extends FreeRouteClientError)
- [x] 2.8 Define `Environment` type (browser, node, workers)
- [x] 2.9 Define `AliasMap` type (Record<string, string>)
- [x] 2.10 Define built-in aliases constant:
  - `{ gemini: 'google', claude: 'anthropic', llama: 'meta', bard: 'google' }`
- [x] 2.11 Verify TypeScript compilation passes

## 3. Cache Implementation (src/cache.ts)

- [x] 3.1 Create `ModelCache` class with configurable options
- [x] 3.2 Implement LRU (Least Recently Used) cache logic
  - Store entries with timestamp
  - Track access order for eviction
  - Enforce maxSize limit
- [x] 3.3 Implement `get(key)` method:
  - Return cached value if exists and not expired
  - Return null if not found or expired
  - Update access order
- [x] 3.4 Implement `set(key, value)` method:
  - Store value with current timestamp
  - Evict oldest entry if at maxSize
- [x] 3.5 Implement `clear()` method to remove all entries
- [x] 3.6 Implement `has(key)` method to check existence
- [x] 3.7 Implement `getStats()` method returning CacheStats
- [x] 3.8 Implement `isExpired(timestamp)` utility with TTL check
- [ ] 3.9 Add unit tests for cache functionality (coverage ≥ 80%)

## 4. Model Fetcher (src/fetcher.ts)

- [x] 4.1 Create `ModelFetcher` class accepting `ClientOptions`
- [x] 4.2 Implement `fetchModels()` method:
  - Check cache first (if enabled)
  - Make HTTP GET request to apiBase
  - Add Authorization header if apiKey provided
  - Handle network errors
- [x] 4.3 Implement API response parsing:
  - Parse JSON response
  - Filter for free models only (pricing.prompt === "0")
  - Map to OpenRouterModel type
- [x] 4.4 Implement error handling:
  - Throw `AuthenticationError` on 401
  - Throw `RateLimitError` on 429
  - Throw `FetchError` on network errors
- [x] 4.5 Implement `forceRefresh()` method to bypass cache
- [x] 4.6 Integrate with `ModelCache`:
  - Store fetched models in cache
  - Use cache on subsequent calls
- [x] 4.7 Implement retry logic with exponential backoff
- [x] 4.8 Add timeout support using AbortController
- [ ] 4.9 Add unit tests for fetcher (mock HTTP responses)

## 5. Model Filter (src/filter.ts)

- [x] 5.1 Create `ModelFilter` class
- [x] 5.2 Implement `byProviders()` method:
  - Check if model.id or model.name contains provider string
  - Support multiple providers (OR logic)
  - Case-insensitive matching
- [x] 5.3 Implement `byModality()` method:
  - Match exact architecture.modality
  - Support all modality types (text, text+image, image)
- [x] 5.4 Implement `byContextLength()` method:
  - Filter by minContextLength (>=)
  - Filter by maxContextLength (<=)
  - Support range filtering
- [x] 5.5 Implement `byKeyword()` method:
  - Search in model.id, model.name, model.description
  - Support match strategies (exact, includes, startsWith, regex)
  - Case-insensitive by default
- [x] 5.6 Implement alias expansion:
  - Map keyword using built-in aliases
  - Map keyword using custom aliases
  - Search all mapped keywords (OR logic)
- [x] 5.7 Implement `apply()` method accepting `FilterOptions`
  - Combine all filters with AND logic
  - Return filtered array or empty array
  - Short-circuit if no models match
- [ ] 5.8 Add unit tests for each filter method
- [ ] 5.9 Add unit tests for combined filtering

## 6. Filter Chain API (src/filter.ts - continued)

- [x] 6.1 Create `FilterChain` class
- [x] 6.2 Implement chainable methods:
  - `filterByProviders()`
  - `filterByModality()`
  - `filterByMinContextLength()`
  - `filterByMaxContextLength()`
  - `filterByKeyword()`
- [x] 6.3 Implement `exec()` method to execute chain:
  - Apply all configured filters in order
  - Return `Promise<OpenRouterModel[]>`
- [x] 6.4 Implement `reset()` method to clear filters
- [x] 6.5 Ensure method chaining returns FilterChain object
- [ ] 6.6 Add unit tests for chain API

## 7. Client Implementation (src/client.ts)

- [x] 7.1 Create `FreeRouteClient` class
- [x] 7.2 Implement constructor accepting `ClientOptions`:
  - Set default values for apiBase, cache, aliases
  - Initialize ModelFetcher with options
  - Initialize ModelCache if cache enabled
  - Merge custom aliases with built-in aliases
- [x] 7.3 Implement `filter()` method:
  - Call fetcher.getModels()
  - Create Filter instance with models
  - Apply filter options
  - Return filtered models
- [x] 7.4 Implement chain API:
  - `filterByProviders()` returns FilterChain
  - `filterByModality()` returns FilterChain
  - Other filter methods return FilterChain
- [x] 7.5 Implement cache control methods:
  - `clearCache()` delegates to cache.clear()
  - `forceRefresh()` delegates to fetcher.forceRefresh()
  - `getCacheStats()` returns cache statistics
- [x] 7.6 Implement utility methods:
  - `getAllModels()` returns all models
  - `getModelById(id)` returns single model or null
  - `getProviders()` returns unique provider list
  - `getModalities()` returns unique modality list
- [x] 7.7 Implement error handling wrapper:
  - Catch low-level errors
  - Re-throw as FreeRouteClientError with context
- [ ] 7.8 Add integration tests for client

## 8. Utility Functions (src/utils.ts)

- [x] 8.1 Implement `detectEnvironment()` function:
  - Check for window object (browser)
  - Check for process.versions (node)
  - Check for caches (Cloudflare Workers)
  - Return `Environment` type
- [x] 8.2 Implement `extractProvider(model)` function:
  - Parse provider from model.id (e.g., "google/gemini-pro" → "google")
  - Handle edge cases
- [x] 8.3 Implement `isFreeModel(model)` helper:
  - Check if pricing.prompt === "0" or "0.0"
- [x] 8.4 Implement `normalizeString(str)` helper:
  - Convert to lowercase
  - Trim whitespace
- [x] 8.5 Implement `matchByStrategy()` function:
  - Apply exact match
  - Apply includes match
  - Apply startsWith match
  - Apply regex match
- [ ] 8.6 Add unit tests for all utility functions

## 9. Package Entry Point (src/index.ts)

- [x] 9.1 Export `FreeRouteClient` class
- [x] 9.2 Export all types from types.ts
- [x] 9.3 Export error classes
- [x] 9.4 Export utility functions
- [x] 9.5 Add JSDoc comments for main exports
- [x] 9.6 Verify tree-shaking works (ESM build)

## 10. Testing Infrastructure

- [x] 10.1 Setup Vitest configuration
- [x] 10.2 Create test utilities and mocks:
  - Mock fetch function
  - Mock OpenRouter API responses
  - Mock timer for cache tests
- [x] 10.3 Create `cache.test.ts` with full coverage
- [x] 10.4 Create `fetcher.test.ts` with mock HTTP
- [x] 10.5 Create `filter.test.ts` with test cases
- [x] 10.6 Create `client.test.ts` with integration tests
- [x] 10.7 Create `utils.test.ts` for utility functions
- [x] 10.8 Ensure overall coverage ≥ 80%
- [x] 10.9 Run `pnpm test` to verify all tests pass

## 11. Documentation

- [x] 11.1 Create `README.md` with:
  - Package description and purpose
  - Installation instructions
  - Quick start example
  - API documentation for all methods
  - Usage examples for common scenarios
  - Configuration options reference
  - Error handling guide
- [x] 11.2 Create `CHANGELOG.md` following Keep a Changelog format
- [x] 11.3 Add JSDoc comments to all public APIs
- [x] 11.4 Create example usage in README:
  - Basic filtering example
  - Chain API example
  - Cache configuration example
  - Error handling example
  - Custom aliases example
  - Basic filtering example
  - Chain API example
  - Cache configuration example
  - Error handling example
  - Custom aliases example

## 12. Build and Package

- [ ] 12.1 Build package using `pnpm build`
- [ ] 12.2 Verify dist/ contains:
  - `index.js` (ESM)
  - `index.cjs` (CommonJS)
  - `index.d.ts` (TypeScript declarations)
  - Source maps
- [ ] 12.3 Verify package.json exports are correct
- [ ] 12.4 Test package can be imported:
  - Create test script importing from dist
  - Verify types work correctly
- [ ] 12.5 Run `pnpm pack` to create npm tarball
- [ ] 12.6 Verify tarball contents

## 13. Integration with Workspace

- [ ] 13.1 Add package to root `package.json` references
- [ ] 13.2 Ensure workspace dependency resolution works
- [ ] 13.3 Run `pnpm --filter free-route-adv typecheck`
- [ ] 13.4 Run `pnpm --filter free-route-adv test`
- [ ] 13.5 Run `pnpm --filter free-route-adv build`
- [ ] 13.6 Verify no conflicts with existing packages

## 14. Final Verification

- [ ] 14.1 Run full test suite: `pnpm test`
- [ ] 14.2 Run typecheck: `pnpm typecheck`
- [ ] 14.3 Build all packages: `pnpm build`
- [ ] 14.4 Test usage in frontend context:
  - Import package in frontend app
  - Test filter functionality
  - Verify TypeScript types work
- [ ] 14.5 Test usage in backend context:
  - Import in backend Workers
  - Verify environment detection works
- [ ] 14.6 Review all code against design decisions
- [ ] 14.7 Verify all specs requirements are met
- [ ] 14.8 Update CHANGELOG with v0.1.0 release notes
