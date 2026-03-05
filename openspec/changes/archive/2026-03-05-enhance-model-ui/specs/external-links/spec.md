# External Links Specification

## ADDED Requirements

### Requirement: Model name links to OpenRouter
Model names SHALL be clickable links that navigate to the OpenRouter official model page.

#### Scenario: Grid view model name link
- **WHEN** a user views models in grid view
- **THEN** each model name SHALL be a clickable link
- **AND** the link SHALL point to https://openrouter.ai/models/{model_id}
- **AND** hovering over the name SHALL show a color change

#### Scenario: List view model name link
- **WHEN** a user views models in list view
- **THEN** each model name SHALL be a clickable link
- **AND** the link SHALL point to https://openrouter.ai/models/{model_id}
- **AND** hovering over the name SHALL show a color change

### Requirement: Link behavior
Model name links SHALL open in a new tab with appropriate security attributes.

#### Scenario: New tab behavior
- **WHEN** a user clicks a model name link
- **THEN** the link SHALL open in a new browser tab
- **AND** the original page SHALL remain open

#### Scenario: Security attributes
- **WHEN** a model name link is rendered
- **THEN** it SHALL include target="_blank" for new tab
- **AND** it SHALL include rel="noopener noreferrer" for security

### Requirement: Link visual feedback
Model name links SHALL provide clear visual feedback for interactivity.

#### Scenario: Default link appearance
- **WHEN** a model name link is displayed
- **THEN** it SHALL have the default model name styling
- **AND** it SHALL be visually distinct from non-link text
- **AND** it SHALL use a font weight that indicates clickability

#### Scenario: Hover state
- **WHEN** a user hovers over a model name link
- **THEN** the text color SHALL change to the theme primary color
- **AND** the cursor SHALL change to pointer
- **AND** the transition SHALL be smooth

#### Scenario: Focus state
- **WHEN** a user tabs to a model name link
- **THEN** the link SHALL show a focus indicator
- **AND** the focus state SHALL be visible for accessibility

### Requirement: Scoped click areas
Only model names SHALL be clickable for external links, preserving text selection elsewhere.

#### Scenario: Model name clickability
- **WHEN** a user clicks on the model name
- **THEN** the link SHALL navigate to the OpenRouter model page

#### Scenario: Card body non-clickable
- **WHEN** a user clicks on the card body (not the model name)
- **THEN** no navigation SHALL occur
- **AND** text in the card MAY be selectable

#### Scenario: Model ID non-clickable
- **WHEN** a user clicks on the model ID code block
- **THEN** no navigation SHALL occur
- **AND** the model ID SHALL be selectable for copying

#### Scenario: Description non-clickable
- **WHEN** a user clicks on the model description
- **THEN** no navigation SHALL occur
- **AND** the description text SHALL be selectable

### Requirement: External link indicator
Links to external sites SHALL have appropriate visual indicators.

#### Scenario: External link icon in list view
- **WHEN** in list view
- **THEN** an external link icon SHALL be displayed next to the model name
- **AND** the icon SHALL be aligned with other elements in the header row

#### Scenario: Grid view icon optional
- **WHEN** in grid view
- **THEN** an external link icon is OPTIONAL
- **AND** the hover color change is sufficient indication

### Requirement: URL generation
Links SHALL use consistent URL generation for all models.

#### Scenario: URL format
- **WHEN** generating a link for a model
- **THEN** the URL SHALL be https://openrouter.ai/models/{model_id}
- **AND** the model_id SHALL be URL-encoded if necessary
- **AND** the URL SHALL be consistent across all models

#### Scenario: Special characters in model IDs
- **WHEN** a model ID contains special characters (e.g., /, :)
- **THEN** the URL SHALL still be valid
- **AND** the link SHALL work correctly

### Requirement: Accessibility
External links SHALL be accessible to all users.

#### Scenario: Screen reader announcement
- **WHEN** a screen reader encounters a model name link
- **THEN** it SHALL announce it as a link
- **AND** it MAY announce the destination

#### Scenario: Keyboard navigation
- **WHEN** a user navigates with keyboard
- **THEN** model name links SHALL be focusable
- **AND** Enter or Space SHALL activate the link

#### Scenario: Link text
- **WHEN** a model name link is displayed
- **THEN** the link text SHALL be the model name
- **AND** the link text SHALL clearly indicate the destination

### Requirement: Performance
External links SHALL not impact page performance.

#### Scenario: Link rendering
- **WHEN** model cards are rendered
- **THEN** external links SHALL not significantly increase render time
- **AND** links SHALL be rendered as part of the initial card render

#### Scenario: No premature loading
- **WHEN** model cards are displayed
- **THEN** the browser SHALL not preload external link destinations
- **AND** page load performance SHALL not be affected

### Requirement: Error handling
External links SHALL handle edge cases gracefully.

#### Scenario: Invalid model ID
- **WHEN** a model ID is empty or invalid
- **THEN** the link SHALL still be generated
- **AND** clicking the link MAY result in a 404 on OpenRouter

#### Scenario: OpenRouter site unavailable
- **WHEN** OpenRouter website is down
- **THEN** clicking the link SHALL open a new tab
- **AND** the new tab SHALL show an error (browser default behavior)
- **AND** the original application SHALL not be affected
