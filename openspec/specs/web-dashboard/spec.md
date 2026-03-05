# Web Dashboard Specification

## Purpose

Define the web interface for browsing free models, viewing change history, and manually triggering refreshes.

## Requirements

### Requirement: Display model list
The web dashboard SHALL display a list of current free models with multiple view options.

#### Scenario: Load models page
- **WHEN** a user navigates to the models page
- **THEN** the dashboard SHALL fetch models from /api/models/cached
- **AND** display model cards in a responsive grid layout by default
- **AND** show the total count of models
- **AND** provide a view toggle control to switch between grid and list layouts

#### Scenario: No models available
- **WHEN** no free models are available
- **THEN** the dashboard SHALL display a "No free models found" message

#### Scenario: Switch to list view
- **WHEN** a user selects list view from the view toggle
- **THEN** the dashboard SHALL display models in a vertical list layout
- **AND** maintain all filtering and search functionality

#### Scenario: Switch to grid view
- **WHEN** a user selects grid view from the view toggle
- **THEN** the dashboard SHALL display models in a responsive grid layout
- **AND** maintain all filtering and search functionality

### Requirement: Model card display
Each model SHALL be displayed with key information and interactive elements.

#### Scenario: Model card content
- **WHEN** a model is displayed
- **THEN** the card SHALL show: clickable model name, description, modality badge, context length, prompt price, completion price
- **AND** the model name SHALL be a link to the OpenRouter model page
- **AND** the model ID SHALL be displayed in a code block with a copy button
- **AND** hovering over the model name SHALL show a color change indicating clickability

#### Scenario: Free pricing display
- **WHEN** a model's pricing is 0
- **THEN** the price SHALL be displayed as "Free" in green

#### Scenario: Clickable model name
- **WHEN** a user clicks on the model name
- **THEN** the link SHALL open https://openrouter.ai/models/{model_id} in a new tab
- **AND** the link SHALL include rel="noopener noreferrer" for security
- **AND** only the model name SHALL be clickable, not the entire card

#### Scenario: Model ID copy functionality
- **WHEN** a model is displayed
- **THEN** a copy button SHALL be displayed next to the model ID
- **AND** clicking the button SHALL copy the model ID to clipboard
- **AND** visual feedback SHALL show the copy was successful

### Requirement: Modality badges
Models SHALL display color-coded badges indicating their modality type.

#### Scenario: Text-only model
- **WHEN** a model has modality='text'
- **THEN** the badge SHALL be blue with a text icon

#### Scenario: Text+image model
- **WHEN** a model has modality='text+image'
- **THEN** the badge SHALL be purple with an image icon

#### Scenario: Text+video model
- **WHEN** a model has modality='text+video'
- **THEN** the badge SHALL be pink with a video icon

### Requirement: Search functionality
The dashboard SHALL allow users to search models by name, description, or ID.

#### Scenario: Search by name
- **WHEN** a user types "gpt" in the search box
- **THEN** the dashboard SHALL filter to show only models with "gpt" in the name
- **AND** the search SHALL be case-insensitive

#### Scenario: Search by description
- **WHEN** a user types "fast" in the search box
- **THEN** the dashboard SHALL show models with "fast" in the description

#### Scenario: Search by model ID
- **WHEN** a user searches for "openai/gpt-3.5"
- **THEN** matching models SHALL be displayed

#### Scenario: Clear search
- **WHEN** the search box is cleared
- **THEN** all models SHALL be displayed again

### Requirement: Filter by modality
The dashboard SHALL allow filtering by modality type.

#### Scenario: Filter to text models
- **WHEN** a user selects "text" from the modality filter
- **THEN** only models with modality='text' SHALL be displayed

#### Scenario: Filter to text+image models
- **WHEN** a user selects "text+image" from the modality filter
- **THEN** only models with modality starting with 'text+image' SHALL be displayed

#### Scenario: Show all modalities
- **WHEN** a user selects "All Modalities"
- **THEN** all models SHALL be displayed regardless of modality

### Requirement: Manual refresh
The dashboard SHALL provide a button to manually refresh the model list.

#### Scenario: Refresh button clicked
- **WHEN** a user clicks the Refresh button
- **THEN** the dashboard SHALL call POST /api/models/refresh
- **AND** show a loading state with "Refreshing..."
- **AND** display the updated models when complete
- **AND** show the new "last updated" timestamp

#### Scenario: Refresh during loading
- **WHEN** a refresh is in progress
- **THEN** the Refresh button SHALL be disabled
- **AND** a spinner SHALL be displayed

### Requirement: Last updated display
The dashboard SHALL display the timestamp of the last data update.

#### Scenario: Display last updated
- **WHEN** the models page loads
- **THEN** the dashboard SHALL display "Updated: X ago" where X is a human-readable time difference

#### Scenario: Just now
- **WHEN** the last update was less than 1 minute ago
- **THEN** the display SHALL show "Updated: Just now"

#### Scenario: Hours ago
- **WHEN** the last update was 3 hours ago
- **THEN** the display SHALL show "Updated: 3h ago"

### Requirement: Loading state
The dashboard SHALL display a loading indicator while fetching data.

#### Scenario: Initial load
- **WHEN** the models page is first opened
- **THEN** a spinning loader SHALL be displayed
- **AND** the loader SHALL be removed when data arrives

#### Scenario: Error state
- **WHEN** fetching models fails
- **THEN** an error message SHALL be displayed
- **AND** the error message SHALL explain what went wrong

### Requirement: Responsive grid layout
Model cards SHALL be displayed in responsive layouts with multiple view options.

#### Scenario: Desktop grid view
- **WHEN** the viewport width is >= 1024px AND grid view is selected
- **THEN** the grid SHALL display 3 cards per row

#### Scenario: Tablet grid view
- **WHEN** the viewport width is >= 768px and < 1024px AND grid view is selected
- **THEN** the grid SHALL display 2 cards per row

#### Scenario: Mobile grid view
- **WHEN** the viewport width is < 768px AND grid view is selected
- **THEN** the grid SHALL display 1 card per row

#### Scenario: List view layout
- **WHEN** list view is selected
- **THEN** models SHALL be displayed in a vertical list
- **AND** each item SHALL use full available width
- **AND** model names SHALL be left-aligned
- **AND** category badges SHALL be positioned after model names

### Requirement: Dark mode support
The dashboard SHALL support both light and dark modes.

#### Scenario: System preference
- **WHEN** a user's system is set to dark mode
- **THEN** the dashboard SHALL automatically use dark mode

#### Scenario: Manual toggle
- **WHEN** a user clicks the dark mode toggle button
- **THEN** the dashboard SHALL switch to the opposite mode
- **AND** the preference SHALL persist via CSS class on the HTML element

### Requirement: Navigation
The dashboard SHALL provide navigation between Models and Changes pages.

#### Scenario: Navigate to changes
- **WHEN** a user clicks the "Changes" nav button
- **THEN** the dashboard SHALL display the changes page
- **AND** the nav button SHALL be highlighted

#### Scenario: Navigate to models
- **WHEN** a user clicks the "Models" nav button
- **THEN** the dashboard SHALL display the models page
- **AND** the nav button SHALL be highlighted

### Requirement: Header with branding
The dashboard SHALL display a header with application branding.

#### Scenario: Header display
- **WHEN** the dashboard is loaded
- **THEN** a header SHALL be displayed at the top
- **AND** the header SHALL contain the app name with a logo icon
- **AND** the header SHALL contain navigation buttons
- **AND** the header SHALL contain a dark mode toggle

### Requirement: Footer
The dashboard SHALL display a footer with information about the service.

#### Scenario: Footer display
- **WHEN** the dashboard is loaded
- **THEN** a footer SHALL be displayed at the bottom
- **AND** the footer SHALL contain "OpenRouter Free Models Monitor • Data updated hourly"

### Requirement: Performance
The dashboard SHALL load and render quickly.

#### Scenario: Initial render
- **WHEN** the models page is opened
- **THEN** the page SHALL become interactive within 2 seconds
- **AND** model cards SHALL render without noticeable lag

#### Scenario: Filter performance
- **WHEN** a user filters or searches
- **THEN** the filtered results SHALL appear within 100ms
