# Model ID Copy Specification

## Purpose

Define requirements for one-click model ID copying functionality with visual feedback in the web dashboard.

## Requirements

### Requirement: Copy button availability
Each model card and list item SHALL provide a copy button for the model ID.

#### Scenario: Copy button in grid view
- **WHEN** a model is displayed in grid view
- **THEN** a copy button SHALL be displayed next to the model ID
- **AND** the button SHALL be positioned immediately after the model ID code block

#### Scenario: Copy button in list view
- **WHEN** a model is displayed in list view
- **THEN** a copy button SHALL be displayed next to the model ID
- **AND** the button SHALL be positioned immediately after the model ID code block

#### Scenario: Copy button icon
- **WHEN** the copy button is displayed
- **THEN** it SHALL show a clipboard icon
- **AND** the icon SHALL be sized appropriately (approximately 16px)
- **AND** the icon SHALL be gray-colored by default

### Requirement: Copy functionality
Clicking the copy button SHALL copy the model ID to the system clipboard.

#### Scenario: Successful copy
- **WHEN** a user clicks the copy button
- **THEN** the model ID SHALL be copied to the clipboard
- **AND** the button icon SHALL change to a checkmark
- **AND** the checkmark SHALL be green-colored

#### Scenario: Copy button visual feedback
- **WHEN** the copy button is clicked
- **THEN** the icon SHALL change from clipboard to checkmark
- **AND** the color SHALL change from gray to green
- **AND** the button tooltip SHALL change from "Copy model ID" to "Copied!"

#### Scenario: Button state restoration
- **WHEN** 2 seconds have passed after a successful copy
- **THEN** the button icon SHALL change back to clipboard
- **AND** the color SHALL change back to gray
- **AND** the tooltip SHALL change back to "Copy model ID"

### Requirement: Copy button appearance
The copy button SHALL have appropriate styling and hover effects.

#### Scenario: Default button state
- **WHEN** the copy button is displayed
- **THEN** it SHALL have a subtle background or transparent appearance
- **AND** it SHALL have padding for adequate touch target size
- **AND** it SHALL be positioned close to the model ID

#### Scenario: Button hover state
- **WHEN** a user hovers over the copy button
- **THEN** the button background SHALL darken slightly
- **AND** the cursor SHALL change to pointer
- **AND** the icon color MAY become darker

#### Scenario: Button accessibility
- **WHEN** the copy button is displayed
- **THEN** it SHALL have a tooltip explaining its function
- **AND** it SHALL be keyboard accessible
- **AND** it SHALL have appropriate ARIA attributes

### Requirement: Error handling
The copy functionality SHALL gracefully handle errors.

#### Scenario: Clipboard API unavailable
- **WHEN** the navigator.clipboard API is not available
- **THEN** the button SHALL remain visible
- **AND** an error SHALL be logged to the console
- **AND** the user SHALL still be able to manually select and copy the model ID

#### Scenario: Clipboard permission denied
- **WHEN** clipboard write permission is denied
- **THEN** the button SHALL remain visible
- **AND** an error SHALL be logged to the console
- **AND** no visual feedback SHALL be shown

### Requirement: Model ID display
Model IDs SHALL be displayed in a code block for easy identification.

#### Scenario: Code block appearance
- **WHEN** a model ID is displayed
- **THEN** it SHALL be in a monospace font
- **AND** it SHALL have a subtle background color
- **AND** it SHALL be visually distinct from surrounding text

#### Scenario: Model ID truncation
- **WHEN** a model ID is too long for the available space
- **THEN** it SHALL be truncated with ellipsis
- **AND** the full ID SHALL still be copied when the copy button is clicked

### Requirement: Layout consistency
Copy buttons SHALL be consistently positioned across view modes.

#### Scenario: Grid view button position
- **WHEN** in grid view
- **THEN** the copy button SHALL be aligned with the model ID
- **AND** the button SHALL be at the bottom of the card

#### Scenario: List view button position
- **WHEN** in list view
- **THEN** the copy button SHALL be aligned with the model ID
- **AND** the button SHALL be at the bottom of the list item
- **AND** the model ID code block MAY be truncated to fit available space

### Requirement: Performance
Copy functionality SHALL be fast and responsive.

#### Scenario: Copy operation speed
- **WHEN** a user clicks the copy button
- **THEN** the copy operation SHALL complete within 100ms
- **AND** visual feedback SHALL appear immediately

#### Scenario: Multiple rapid copies
- **WHEN** a user rapidly clicks copy on multiple models
- **THEN** each copy SHALL work independently
- **AND** visual feedback SHALL not interfere between buttons
