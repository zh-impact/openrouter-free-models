# Change Detection Specification

## Purpose

Define how the system detects and categorizes changes to the free model catalog by comparing current and previous model states.

## Requirements

### Requirement: Compare current and previous model states
The system SHALL compare the current list of free models against the previous state to detect changes.

#### Scenario: New models detected
- **WHEN** a model exists in the current list but not in the previous state
- **THEN** the system SHALL classify it as "added"
- **AND** the change record SHALL include the full model data in `new_data`

#### Scenario: Removed models detected
- **WHEN** a model exists in the previous state but not in the current list
- **THEN** the system SHALL classify it as "removed"
- **AND** the change record SHALL include the full model data in `old_data`

#### Scenario: Modified models detected
- **WHEN** a model exists in both states but has different field values
- **THEN** the system SHALL classify it as "modified"
- **AND** the change record SHALL include both `old_data` and `new_data`

#### Scenario: No changes detected
- **WHEN** all models are identical between current and previous states
- **THEN** the system SHALL return an empty diff result

### Requirement: Compare all model fields
The system SHALL compare the following fields for change detection: name, description, context_length, pricing_prompt, pricing_completion, and architecture.

#### Scenario: Name change detected
- **WHEN** a model's name field changes
- **THEN** the system SHALL detect a modification

#### Scenario: Pricing change detected
- **WHEN** a model's pricing_prompt or pricing_completion changes
- **THEN** the system SHALL detect a modification

#### Scenario: Context length change detected
- **WHEN** a model's context_length changes
- **THEN** the system SHALL detect a modification

#### Scenario: Architecture change detected
- **WHEN** a model's architecture field changes
- **THEN** the system SHALL detect a modification

#### Scenario: Timestamp ignored
- **WHEN** only timestamp fields differ between models
- **THEN** the system SHALL NOT detect a modification

### Requirement: Handle model deactivation
When a model is removed from the free tier, the system SHALL mark it as inactive rather than deleting it.

#### Scenario: Model removed from free tier
- **WHEN** a free model is no longer returned by OpenRouter
- **THEN** the system SHALL set the model's `is_active` flag to false
- **AND** the model record SHALL remain in the database
- **AND** the change type SHALL be "removed"

### Requirement: Generate change IDs
The system SHALL generate unique IDs for each change record.

#### Scenario: Change ID generation
- **WHEN** creating a change record
- **THEN** the system SHALL generate a unique ID combining timestamp and UUID
- **AND** the ID SHALL be sortable chronologically

### Requirement: Support efficient comparison
The system SHALL use Map-based indexing for O(n) comparison complexity.

#### Scenario: Large dataset comparison
- **WHEN** comparing 500 previous models against 500 current models
- **THEN** the comparison SHALL complete in under 100ms
- **AND** the system SHALL use O(n) time complexity

### Requirement: Return structured diff result
The system SHALL return a structured diff result containing added, removed, and modified arrays.

#### Scenario: Mixed changes
- **WHEN** comparing states with 2 added, 3 removed, and 1 modified model
- **THEN** the result SHALL contain arrays with exactly those counts
- **AND** each array SHALL contain the full model objects
