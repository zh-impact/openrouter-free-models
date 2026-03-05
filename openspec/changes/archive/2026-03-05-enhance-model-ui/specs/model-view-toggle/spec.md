# Model View Toggle Specification

## ADDED Requirements

### Requirement: View toggle control
The dashboard SHALL provide a control to switch between grid and list view modes.

#### Scenario: Default to grid view
- **WHEN** a user navigates to the models page
- **THEN** the dashboard SHALL display models in grid view by default
- **AND** the grid view button SHALL be visually selected

#### Scenario: Switch to list view
- **WHEN** a user clicks the "List" button
- **THEN** the dashboard SHALL switch to list view
- **AND** models SHALL be displayed in a vertical list layout
- **AND** the list view button SHALL be visually selected

#### Scenario: Switch to grid view
- **WHEN** a user clicks the "Grid" button
- **THEN** the dashboard SHALL switch to grid view
- **AND** models SHALL be displayed in a responsive grid layout
- **AND** the grid view button SHALL be visually selected

### Requirement: View toggle button display
The view toggle control SHALL display two buttons with appropriate icons and labels.

#### Scenario: Button layout
- **WHEN** the view toggle is displayed
- **THEN** it SHALL contain "Grid" and "List" buttons
- **AND** each button SHALL have an appropriate icon
- **AND** the buttons SHALL be grouped together in a toggle container

#### Scenario: Grid button appearance
- **WHEN** the grid button is displayed
- **THEN** it SHALL show a grid icon (2x2 grid layout)
- **AND** it SHALL include the text label "Grid"

#### Scenario: List button appearance
- **WHEN** the list button is displayed
- **THEN** it SHALL show a list icon (horizontal lines)
- **AND** it SHALL include the text label "List"

### Requirement: View toggle button states
The view toggle buttons SHALL have distinct states for selected and unselected.

#### Scenario: Selected button state
- **WHEN** a view button is selected
- **THEN** it SHALL have a solid background color
- **AND** it SHALL have a shadow effect
- **AND** the text SHALL be more prominent

#### Scenario: Unselected button state
- **WHEN** a view button is not selected
- **THEN** it SHALL have a transparent or muted background
- **AND** it SHALL NOT have a shadow effect
- **AND** the text SHALL be muted

#### Scenario: Button hover state
- **WHEN** a user hovers over an unselected view button
- **THEN** the button SHALL show a visual hover effect
- **AND** the cursor SHALL change to pointer

### Requirement: View persistence during session
The selected view mode SHALL persist during the user's session.

#### Scenario: Maintain view mode
- **WHEN** a user switches between pages and returns to models
- **THEN** the previously selected view mode SHALL be maintained
- **AND** the appropriate toggle button SHALL be selected

#### Scenario: Reset on page reload
- **WHEN** a user refreshes the page
- **THEN** the view mode MAY reset to grid view
- **AND** this behavior is acceptable for the initial implementation

### Requirement: List view layout
List view SHALL display models in a vertical, compact format.

#### Scenario: List view item layout
- **WHEN** models are displayed in list view
- **THEN** each model SHALL be displayed as a horizontal card
- **AND** model name SHALL be on the left
- **AND** category badge and external link icon SHALL be on the right
- **AND** description SHALL be below the name
- **AND** metrics (context length, pricing) SHALL be below the description
- **AND** model ID SHALL be at the bottom

#### Scenario: List view spacing
- **WHEN** multiple models are displayed in list view
- **THEN** there SHALL be consistent vertical spacing between items
- **AND** the spacing SHALL be approximately 12px (0.75rem)

### Requirement: Category badge positioning in list view
Category badges SHALL be positioned after model names in list view for better alignment.

#### Scenario: Badge position in list view
- **WHEN** a model is displayed in list view
- **THEN** the category badge SHALL appear after the model name
- **AND** the badge SHALL be aligned to the right side of the card
- **AND** model names SHALL be left-aligned for consistent scanning

#### Scenario: Badge position in grid view
- **WHEN** a model is displayed in grid view
- **THEN** the category badge SHALL appear in the top-right corner of the card
- **AND** the model name SHALL be on the left side

### Requirement: Responsive design
View toggle and layouts SHALL work responsively across device sizes.

#### Scenario: Desktop view toggle
- **WHEN** the viewport width is >= 640px
- **THEN** the view toggle SHALL be displayed horizontally
- **AND** both buttons SHALL be visible side-by-side

#### Scenario: Mobile view toggle
- **WHEN** the viewport width is < 640px
- **THEN** the view toggle SHALL remain functional
- **AND** the buttons SHALL be sized appropriately for touch targets

#### Scenario: List view on mobile
- **WHEN** list view is active on mobile
- **THEN** the layout SHALL adapt to narrow screens
- **AND** model IDs MAY be truncated with ellipsis
