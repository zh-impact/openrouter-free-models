# Model Fetching Specification

## Purpose

Define how the system fetches AI models from the OpenRouter API, filters for free models, and handles errors and retries.

## Requirements

### Requirement: Fetch models from OpenRouter API
The system SHALL fetch all available AI models from the OpenRouter `/api/v1/models` endpoint.

#### Scenario: Successful model fetch
- **WHEN** the system calls the OpenRouter API
- **THEN** the system receives a JSON response containing an array of models
- **AND** each model includes id, name, description, context_length, pricing, and architecture fields

#### Scenario: API returns error
- **WHEN** the OpenRouter API returns a non-200 status code
- **THEN** the system SHALL throw an error with the status code and status text
- **AND** the error message SHALL include "OpenRouter API returned {status}: {statusText}"

#### Scenario: Invalid response format
- **WHEN** the API response does not contain a `data` array
- **THEN** the system SHALL throw an error "Invalid response format from OpenRouter API"

### Requirement: Filter free models
The system SHALL filter the fetched models to include only those with an ID ending with the `:free` suffix.

#### Scenario: Filter free models from all models
- **WHEN** the system has fetched 100 models
- **AND** 25 of those models have IDs ending with `:free`
- **THEN** the system SHALL return exactly 25 models
- **AND** all returned models SHALL have IDs ending with `:free`

#### Scenario: No free models available
- **WHEN** the system fetches models and none have IDs ending with `:free`
- **THEN** the system SHALL return an empty array

### Requirement: Retry with exponential backoff
The system SHALL retry failed fetch attempts with exponential backoff.

#### Scenario: Transient network error
- **WHEN** a fetch attempt fails with a network error
- **THEN** the system SHALL retry after 1 second (2^0 × baseDelay)
- **AND** if the second attempt fails, retry after 2 seconds (2^1 × baseDelay)
- **AND** if the third attempt fails, retry after 4 seconds (2^2 × baseDelay)

#### Scenario: Maximum retries exceeded
- **WHEN** all retry attempts (default: 3) fail
- **THEN** the system SHALL throw the last error
- **AND** the system SHALL stop retrying

### Requirement: Optional API key authentication
The system SHALL support optional API key authentication for OpenRouter requests.

#### Scenario: API key provided
- **WHEN** an API key is provided to the service
- **THEN** the system SHALL include an `Authorization: Bearer {apiKey}` header in requests

#### Scenario: No API key provided
- **WHEN** no API key is provided
- **THEN** the system SHALL send requests without an Authorization header
- **AND** the request SHALL still succeed for public endpoints

### Requirement: Support concurrent requests
The system SHALL handle multiple concurrent fetch requests without data corruption.

#### Scenario: Multiple simultaneous fetches
- **WHEN** three separate processes request model data simultaneously
- **THEN** all three processes SHALL receive the same complete dataset
- **AND** no partial data SHALL be returned to any process
