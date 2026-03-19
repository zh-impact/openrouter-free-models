# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-19

### Added

#### Core Features
- ✨ Advanced filtering for OpenRouter free models
  - Filter by provider names
  - Filter by modality type (text, text+image, image)
  - Filter by context length range
  - Filter by keyword with multiple match strategies
- ⚡ LRU (Least Recently Used) cache implementation
  - Configurable TTL
  - Maximum size enforcement
  - Cache statistics (hits, misses, size)
- 🔗 Chain API for fluent filtering interface
- ✅ Model availability verification
  - Check if models are actually usable
  - Detect privacy settings requirements
  - Provide alternative model suggestions
- 🎯 Provider alias system with built-in aliases
  - `gemini` → `google`
  - `claude` → `anthropic`
  - `llama` → `meta`
  - `bard` → `google`

#### Client API
- `FreeRouteClient` main class with comprehensive API
- `filter()` method for filtering models
- Chain methods: `filterByProviders()`, `filterByModality()`, `filterByKeyword()`
- Utility methods: `getAllModels()`, `getModelById()`, `getProviders()`, `getModalities()`
- Cache control: `clearCache()`, `forceRefresh()`, `getCacheStats()`
- Availability methods: `verifyModelAvailability()`, `getAlternatives()`

#### Error Handling
- `FreeRouteClientError` - Base error class
- `FetchError` - API request errors
- `RateLimitError` - Rate limit errors with retry-after
- `AuthenticationError` - Authentication failures
- `ValidationError` - Input validation errors
- `NoModelsFoundError` - Empty filter results with suggestions
- `ModelAvailabilityError` - Availability check failures

#### Configuration
- Configurable API endpoint
- API key support for authenticated requests
- Cache configuration (enabled, TTL, max size)
- Custom provider aliases
- Retry attempts configuration
- Request timeout configuration
- Empty result handling (throw, fallback, warnings)
- Availability verification options

#### Environment Support
- ✅ Browser (ESM)
- ✅ Node.js (ESM + CJS)
- ✅ Cloudflare Workers

#### Developer Experience
- 📝 Full TypeScript support with type definitions
- 🧪 Comprehensive test suite (132 tests, 81% coverage)
- 📚 Complete documentation
- 🔍 IntelliSense support for all APIs

#### Testing
- Unit tests for all modules
- Integration tests for client
- Mock utilities for testing
- Test coverage reporting

## [Unreleased]

### Planned Features
- [ ] Additional filter criteria
- [ ] Streaming response support
- [ ] Custom matchers
- [ ] CLI tool
- [ ] Performance optimizations
- [ ] Additional cache strategies

---

## Versioning Strategy

- **Major version (X.0.0)**: Breaking changes
- **Minor version (0.X.0)**: New features (backward compatible)
- **Patch version (0.0.X)**: Bug fixes

## Types of Changes

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security vulnerability fixes
