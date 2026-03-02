# Scheduled Sync Specification

## Purpose

Define how the system automatically synchronizes free models on a scheduled basis using Cloudflare Cron triggers.

## Requirements

### Requirement: Hourly scheduled sync
The system SHALL automatically sync free models every hour using Cloudflare Cron triggers.

#### Scenario: Cron trigger fires
- **WHEN** the cron trigger fires at the top of each hour
- **THEN** the system SHALL execute the sync workflow
- **AND** fetch the latest models from OpenRouter
- **AND** detect and save any changes

#### Scenario: Cron schedule
- **WHEN** the cron schedule is configured as "0 * * * *"
- **THEN** the sync SHALL execute at 00:00, 01:00, 02:00, etc. (every hour)

### Requirement: Sync workflow
The scheduled sync SHALL follow a complete workflow from fetch to storage.

#### Scenario: Complete sync workflow
- **WHEN** the sync executes
- **THEN** the system SHALL:
  1. Fetch models from OpenRouter API
  2. Get active models from database
  3. Detect changes between current and previous states
  4. Save all changes to database
  5. Return a summary of changes detected

#### Scenario: Sync with changes
- **WHEN** the sync detects 2 added, 1 removed, and 3 modified models
- **THEN** the system SHALL save all 6 changes
- **AND** return a summary indicating 6 changes detected

#### Scenario: Sync with no changes
- **WHEN** the sync detects no changes
- **THEN** the system SHALL not create any change records
- **AND** return a summary indicating 0 changes detected

### Requirement: Cron endpoint authentication
The cron endpoint SHALL be protected with a secret token.

#### Scenario: Valid cron request
- **WHEN** Cloudflare Cron calls the endpoint with proper authentication
- **THEN** the sync SHALL proceed

#### Scenario: Unauthorized request
- **WHEN** a request without proper authentication calls /cron/sync
- **THEN** the system SHALL respond with HTTP 401
- **AND** the sync SHALL NOT execute

#### Scenario: No secret configured
- **WHEN** no CRON_SECRET environment variable is set
- **THEN** the endpoint SHALL accept unauthenticated requests (for local development)

### Requirement: Error handling
The sync workflow SHALL handle errors gracefully.

#### Scenario: OpenRouter API unavailable
- **WHEN** the OpenRouter API returns an error
- **THEN** the sync SHALL fail with an error message
- **AND** the error SHALL be logged
- **AND** the system SHALL return a 500 status

#### Scenario: Database error
- **WHEN** saving changes to the database fails
- **THEN** the sync SHALL fail with an error message
- **AND** the error SHALL be logged

#### Scenario: Partial failure
- **WHEN** some but not all changes can be saved
- **THEN** the sync SHALL report the error
- **AND** successfully saved changes SHALL remain in the database

### Requirement: Sync response format
The sync endpoint SHALL return a consistent response format.

#### Scenario: Successful sync
- **WHEN** the sync completes successfully
- **THEN** the response SHALL include:
  - success: true
  - timestamp: ISO timestamp of sync
  - models_fetched: number of models fetched
  - changes_detected: number of changes found
  - changes: array of change details

#### Scenario: Failed sync
- **WHEN** the sync fails
- **THEN** the response SHALL include:
  - success: false
  - error: error message

### Requirement: Sync idempotency
The sync workflow SHALL be idempotent and safe to run multiple times.

#### Scenario: Duplicate sync
- **WHEN** the sync runs twice within the same hour
- **AND** no actual changes occurred between runs
- **THEN** the second sync SHALL detect 0 changes
- **AND** no duplicate change records SHALL be created

### Requirement: Timing precision
The sync SHALL execute at consistent intervals.

#### Scenario: Consistent timing
- **WHEN** the system is healthy
- **THEN** syncs SHALL occur approximately 60 minutes apart
- **AND** the variance SHALL be less than 1 minute

### Requirement: Logging
The sync workflow SHALL log key events for monitoring.

#### Scenario: Sync started
- **WHEN** a sync begins
- **THEN** the system SHALL log "Starting model sync"

#### Scenario: Sync completed
- **WHEN** a sync completes
- **THEN** the system SHALL log the number of changes detected

#### Scenario: Sync failed
- **WHEN** a sync fails
- **THEN** the system SHALL log the error details

### Requirement: Resource limits
The sync SHALL complete within Cloudflare Workers CPU time limits.

#### Scenario: Large dataset sync
- **WHEN** syncing 500 models with 100 changes
- **THEN** the sync SHALL complete within the Workers CPU time limit (currently 10 seconds for paid, 30ms for free)

#### Scenario: Timeout handling
- **WHEN** the sync approaches the CPU time limit
- **THEN** the system SHOULD prioritize saving detected changes over complete processing
- **AND** the system SHOULD log a warning about partial completion

### Requirement: Trigger configuration
The cron trigger SHALL be configurable in wrangler.toml.

#### Scenario: Standard configuration
- **WHEN** wrangler.toml contains `crons = ["0 * * * *"]`
- **THEN** the sync SHALL run hourly

#### Scenario: Custom schedule
- **WHEN** the cron schedule is changed to "0 */2 * * *"
- **THEN** the sync SHALL run every 2 hours instead

### Requirement: Manual and scheduled sync coexistence
Both manual refresh and scheduled sync SHALL work correctly when they overlap.

#### Scenario: Manual during scheduled
- **WHEN** a user manually triggers refresh while a scheduled sync is running
- **THEN** both operations SHALL complete independently
- **AND** changes from both SHALL be recorded with accurate timestamps
