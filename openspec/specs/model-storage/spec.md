# Model Storage Specification

## Purpose

Define how the system stores models and changes in the D1 database, including upsert operations, active status tracking, and change history queries.

## Requirements

### Requirement: Store model records in D1 database
The system SHALL store model records in the `models` table with all relevant fields.

#### Scenario: Insert new model
- **WHEN** a new free model is detected
- **THEN** the system SHALL insert a record with id, name, description, context_length, pricing_prompt, pricing_completion, architecture, first_seen_at, last_seen_at, and is_active fields
- **AND** first_seen_at and last_seen_at SHALL be set to the current timestamp

#### Scenario: Update existing model
- **WHEN** a model already exists in the database
- **THEN** the system SHALL update the name, description, context_length, pricing_prompt, pricing_completion, architecture, and last_seen_at fields
- **AND** the first_seen_at field SHALL remain unchanged

### Requirement: Support upsert operations
The system SHALL support upsert (insert or update) operations for models.

#### Scenario: Model not in database
- **WHEN** upserting a model that doesn't exist
- **THEN** the system SHALL insert a new record

#### Scenario: Model already in database
- **WHEN** upserting a model that already exists
- **THEN** the system SHALL update the existing record
- **AND** preserve the original first_seen_at timestamp

### Requirement: Track model active status
The system SHALL track whether a model is currently available as free using the is_active flag.

#### Scenario: Active model
- **WHEN** a model is currently available as free
- **THEN** the is_active flag SHALL be true (1)

#### Scenario: Inactive model
- **WHEN** a model has been removed from the free tier
- **THEN** the is_active flag SHALL be false (0)
- **AND** the model SHALL NOT appear in active model queries

### Requirement: Store change records
The system SHALL store change records in the `model_changes` table.

#### Scenario: Record added change
- **WHEN** a model is added
- **THEN** the system SHALL create a change record with change_type='added', model_id, detected_at timestamp, and new_data containing the model JSON

#### Scenario: Record removed change
- **WHEN** a model is removed
- **THEN** the system SHALL create a change record with change_type='removed', model_id, detected_at timestamp, and old_data containing the model JSON

#### Scenario: Record modified change
- **WHEN** a model is modified
- **THEN** the system SHALL create a change record with change_type='modified', model_id, detected_at timestamp, old_data containing the previous model JSON, and new_data containing the updated model JSON

### Requirement: Store architecture as JSON
The system SHALL store the architecture field as a JSON string in the database.

#### Scenario: Architecture with modality
- **WHEN** a model has architecture.modality='text+image'
- **THEN** the stored value SHALL be a JSON string '{"modality":"text+image"}'

#### Scenario: No architecture data
- **WHEN** a model has no architecture field
- **THEN** the stored value SHALL be NULL

### Requirement: Query active models
The system SHALL provide a method to query only active models.

#### Scenario: Get active models
- **WHEN** querying for active models
- **THEN** the system SHALL return only models where is_active=true
- **AND** the results SHALL be ordered by name

#### Scenario: Mixed active/inactive models
- **WHEN** the database contains 50 active and 20 inactive models
- **THEN** the active query SHALL return exactly 50 models

### Requirement: Query model by ID
The system SHALL provide a method to retrieve a single model by its ID.

#### Scenario: Model exists
- **WHEN** querying for a model ID that exists
- **THEN** the system SHALL return the model record

#### Scenario: Model not found
- **WHEN** querying for a model ID that doesn't exist
- **THEN** the system SHALL return NULL

### Requirement: Query change history
The system SHALL provide paginated access to change history.

#### Scenario: Get recent changes
- **WHEN** querying for changes with limit=50, offset=0
- **THEN** the system SHALL return the 50 most recent changes
- **AND** changes SHALL be ordered by detected_at DESC

#### Scenario: Pagination
- **WHEN** querying for changes with limit=50, offset=50
- **THEN** the system SHALL return changes 51-100
- **AND** the results SHALL not overlap with the first page

### Requirement: Include model name in changes
The system SHALL join with the models table to include model names in change queries.

#### Scenario: Change with existing model
- **WHEN** querying changes for a model that exists
- **THEN** the result SHALL include the model_name field

#### Scenario: Change with deleted model
- **WHEN** querying changes for a model that no longer exists
- **THEN** the result SHALL include model_name=NULL

### Requirement: Get last sync timestamp
The system SHALL provide a method to retrieve the timestamp of the most recent sync.

#### Scenario: Previous sync exists
- **WHEN** at least one change has been recorded
- **THEN** the system SHALL return the detected_at timestamp of the most recent change

#### Scenario: No previous sync
- **WHEN** no changes have been recorded
- **THEN** the system SHALL return NULL
