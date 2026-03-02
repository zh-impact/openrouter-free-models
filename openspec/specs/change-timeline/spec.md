# Change Timeline Specification

## Purpose

Define how the system displays a chronological history of model changes in the web interface.

## Requirements

### Requirement: Display change history
The change timeline page SHALL display a chronological list of model changes.

#### Scenario: Load changes page
- **WHEN** a user navigates to the changes page
- **THEN** the dashboard SHALL fetch changes from /api/models/changes
- **AND** display changes in a vertical timeline format

#### Scenario: No changes recorded
- **WHEN** no changes have been recorded yet
- **THEN** the dashboard SHALL display "No changes recorded"
- **AND** a message SHALL indicate changes will appear after updates

### Requirement: Timeline item display
Each change SHALL be displayed as a timeline item with visual indicators.

#### Scenario: Added change
- **WHEN** a change has type='added'
- **THEN** the item SHALL have a green circular icon with a plus symbol
- **AND** the badge SHALL say "Added" in green
- **AND** the model name SHALL be displayed

#### Scenario: Removed change
- **WHEN** a change has type='removed'
- **THEN** the item SHALL have a red circular icon with a minus symbol
- **AND** the badge SHALL say "Removed" in red
- **AND** the model name SHALL be displayed

#### Scenario: Modified change
- **WHEN** a change has type='modified'
- **THEN** the item SHALL have a yellow circular icon with a refresh symbol
- **AND** the badge SHALL say "Modified" in yellow
- **AND** the model name SHALL be displayed

### Requirement: Change timestamp
Each timeline item SHALL display when the change was detected.

#### Scenario: Recent change
- **WHEN** a change occurred 5 minutes ago
- **THEN** the item SHALL display a timestamp in a human-readable format (e.g., "Jan 15, 2025, 3:45 PM")

#### Scenario: Old change
- **WHEN** a change occurred weeks ago
- **THEN** the item SHALL still display the full timestamp

### Requirement: Model ID display
Each timeline item SHALL display the model ID.

#### Scenario: Model ID in code block
- **WHEN** a timeline item is displayed
- **THEN** the model ID SHALL be shown in a monospace code block

### Requirement: Vertical timeline connector
Timeline items SHALL be connected with a vertical line.

#### Scenario: Multiple changes
- **WHEN** multiple changes are displayed
- **THEN** a vertical line SHALL connect the items
- **AND** the line SHALL NOT extend beyond the last item

### Requirement: Chronological order
Changes SHALL be displayed with most recent first.

#### Scenario: Order display
- **WHEN** 10 changes are fetched
- **THEN** the first change SHALL be the most recent
- **AND** the last change SHALL be the oldest

### Requirement: Pagination
The timeline SHALL support loading more changes.

#### Scenario: Initial load
- **WHEN** the changes page first loads
- **THEN** the first 50 changes SHALL be displayed

#### Scenario: Load more
- **WHEN** a user clicks "Load More"
- **AND** more changes are available
- **THEN** the next 50 changes SHALL be appended to the timeline
- **AND** the scroll position SHALL be preserved

#### Scenario: No more changes
- **WHEN** all changes have been loaded
- **THEN** the "Load More" button SHALL be hidden

### Requirement: Loading state
The timeline SHALL show a loading indicator while fetching changes.

#### Scenario: Initial load
- **WHEN** the changes page is opened
- **THEN** a spinning loader SHALL be displayed
- **AND** the loader SHALL be replaced by changes when data arrives

#### Scenario: Loading more
- **WHEN** a user clicks "Load More"
- **THEN** the button SHALL show a loading state
- **AND** new changes SHALL be appended when ready

### Requirement: Error state
The timeline SHALL display an error message if fetching fails.

#### Scenario: API error
- **WHEN** fetching changes fails
- **THEN** an error message SHALL be displayed
- **AND** the message SHALL explain that changes could not be loaded

### Requirement: Responsive layout
The timeline SHALL be responsive across screen sizes.

#### Scenario: Desktop view
- **WHEN** the viewport width is >= 768px
- **THEN** timeline items SHALL be horizontally aligned with the icon on the left

#### Scenario: Mobile view
- **WHEN** the viewport width is < 768px
- **THEN** the layout SHALL adapt for smaller screens
- **AND** timeline items SHALL remain readable

### Requirement: Empty state design
The empty state SHALL provide helpful guidance.

#### Scenario: First time user
- **WHEN** no changes exist yet
- **THEN** a friendly message SHALL be displayed
- **AND** the message SHALL indicate that changes will appear after the first sync
- **AND** the message MAY suggest when to expect updates

### Requirement: Page header
The changes page SHALL have a descriptive header.

#### Scenario: Header content
- **WHEN** the changes page is displayed
- **THEN** a header SHALL say "Change History"
- **AND** a subtitle SHALL explain "Track when free models are added, removed, or modified"

### Requirement: Performance
The timeline SHALL render efficiently with many changes.

#### Scenario: Large dataset
- **WHEN** displaying 50 timeline items
- **THEN** the page SHALL render within 1 second
- **AND** scrolling SHALL be smooth
