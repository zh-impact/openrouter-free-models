# Model API Specification

## Purpose

Define the REST API endpoints for accessing model data, including real-time fetching, cached queries, change history, and manual refresh operations.

## Requirements

### Requirement: GET /api/models endpoint
The system SHALL provide an endpoint that returns current free models fetched in real-time from OpenRouter.

#### Scenario: Successful response
- **WHEN** a client sends GET /api/models
- **THEN** the system SHALL respond with HTTP 200
- **AND** the response SHALL include a JSON object with models (array), last_updated (ISO timestamp), and total_count (number) fields

#### Scenario: OpenRouter API error
- **WHEN** the OpenRouter API is unreachable
- **THEN** the system SHALL respond with HTTP 500
- **AND** the response SHALL include an error message

### Requirement: GET /api/models/cached endpoint
The system SHALL provide an endpoint that returns cached free models from the database.

#### Scenario: Successful cached response
- **WHEN** a client sends GET /api/models/cached
- **THEN** the system SHALL respond with HTTP 200
- **AND** the response SHALL include models from the database
- **AND** only active models (is_active=true) SHALL be returned

#### Scenario: Database empty
- **WHEN** no models exist in the database
- **THEN** the system SHALL return an empty models array
- **AND** last_updated SHALL be null or empty string

### Requirement: GET /api/models/:id endpoint
The system SHALL provide an endpoint to retrieve a specific model by ID.

#### Scenario: Model found
- **WHEN** a client sends GET /api/models/openai/gpt-3.5-turbo:free
- **AND** the model exists in the database
- **THEN** the system SHALL respond with HTTP 200
- **AND** the response SHALL include the model's details including first_seen_at and last_seen_at

#### Scenario: Model not found
- **WHEN** a client sends GET /api/models/nonexistent:free
- **AND** the model doesn't exist
- **THEN** the system SHALL respond with HTTP 404
- **AND** the response SHALL include an error message

### Requirement: GET /api/models/changes endpoint
The system SHALL provide an endpoint to retrieve change history with pagination.

#### Scenario: Default pagination
- **WHEN** a client sends GET /api/models/changes
- **THEN** the system SHALL respond with HTTP 200
- **AND** the response SHALL include the first 50 changes
- **AND** the response SHALL include total, limit, and offset fields

#### Scenario: Custom pagination
- **WHEN** a client sends GET /api/models/changes?limit=20&offset=100
- **THEN** the system SHALL return 20 changes starting at offset 100

#### Scenario: Maximum limit enforcement
- **WHEN** a client requests limit=1000
- **AND** the maximum allowed limit is 500
- **THEN** the system SHALL limit results to 500 changes

### Requirement: POST /api/models/refresh endpoint
The system SHALL provide an endpoint to manually trigger a model sync.

#### Scenario: Successful refresh
- **WHEN** a client sends POST /api/models/refresh
- **THEN** the system SHALL fetch models from OpenRouter
- **AND** detect and save any changes
- **AND** respond with HTTP 200
- **AND** the response SHALL include success=true, changes_detected count, and the changes array

#### Scenario: Refresh with no changes
- **WHEN** a client sends POST /api/models/refresh
- **AND** no models have changed
- **THEN** the system SHALL return changes_detected=0 and an empty changes array

#### Scenario: Refresh error
- **WHEN** the refresh operation fails
- **THEN** the system SHALL respond with HTTP 500
- **AND** the response SHALL include success=false and an error message

### Requirement: GET /api/health endpoint
The system SHALL provide a health check endpoint.

#### Scenario: Healthy system
- **WHEN** a client sends GET /api/health
- **AND** the database is connected
- **THEN** the system SHALL respond with HTTP 200
- **AND** the response SHALL include status='healthy', timestamp, version, database='connected', and last_sync timestamp

#### Scenario: Database connection failed
- **WHEN** the database cannot be reached
- **THEN** the system SHALL respond with status='degraded' and database='disconnected'

### Requirement: GET /api/info endpoint
The system SHALL provide an endpoint with application metadata.

#### Scenario: Application info
- **WHEN** a client sends GET /api/info
- **THEN** the system SHALL respond with HTTP 200
- **AND** the response SHALL include name (app name), version, and timestamp

### Requirement: CORS support
The API SHALL support Cross-Origin Resource Sharing for frontend requests.

#### Scenario: Preflight request
- **WHEN** a client sends OPTIONS /api/models
- **THEN** the system SHALL respond with appropriate CORS headers
- **AND** the response SHALL include Access-Control-Allow-Origin

### Requirement: JSON content type
All API responses SHALL use the application/json content type.

#### Scenario: Response headers
- **WHEN** any API endpoint is called
- **THEN** the Content-Type header SHALL be application/json

### Requirement: Error response format
Error responses SHALL follow a consistent format.

#### Scenario: Error response
- **WHEN** an API error occurs
- **THEN** the response SHALL include an error field with a descriptive message
- **AND** the HTTP status code SHALL indicate the error type (4xx/5xx)
