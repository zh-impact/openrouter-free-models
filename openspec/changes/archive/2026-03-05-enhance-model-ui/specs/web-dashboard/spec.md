# Web Dashboard Specification (Delta)

## MODIFIED Requirements

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
