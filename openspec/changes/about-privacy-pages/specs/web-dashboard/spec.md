# Web Dashboard Specification (Delta)

## Purpose

This is a DELTA spec for the Web Dashboard capability, documenting modifications to the footer requirement to include navigation links.

## MODIFIED Requirements

### Requirement: Footer
The dashboard SHALL display a footer with service information and navigation links.

#### Scenario: Footer display with service info
- **WHEN** the dashboard is loaded
- **THEN** a footer SHALL be displayed at the bottom
- **AND** the footer SHALL contain "OpenRouter Free Models Monitor"
- **AND** the footer SHALL contain "Data updated hourly"

#### Scenario: Footer navigation links
- **WHEN** the footer is displayed
- **THEN** the footer SHALL contain an "About" navigation link
- **AND** the footer SHALL contain a "Privacy Policy" navigation link
- **AND** both links SHALL use React Router's NavLink component
- **AND** the links SHALL enable client-side navigation without page reload

#### Scenario: Footer link active state
- **WHEN** a user is on the About page
- **THEN** the "About" footer link SHALL display active state styling
- **AND** the "Privacy Policy" link SHALL not display active state styling

#### Scenario: Footer link active state on Privacy page
- **WHEN** a user is on the Privacy Policy page
- **THEN** the "Privacy Policy" footer link SHALL display active state styling
- **AND** the "About" link SHALL not display active state styling

#### Scenario: Footer link styling
- **WHEN** the footer is displayed
- **THEN** navigation links SHALL use hover effects
- **AND** navigation links SHALL be color-coded to indicate interactivity
- **AND** active links SHALL be visually distinct from inactive links

#### Scenario: Footer responsive layout
- **WHEN** the footer is viewed on a mobile device (< 768px)
- **THEN** the footer content SHALL be stacked vertically
- **AND** navigation links SHALL be vertically arranged

#### Scenario: Footer desktop layout
- **WHEN** the footer is viewed on a desktop (>= 768px)
- **THEN** the footer content SHALL be horizontally arranged
- **AND** navigation links SHALL be separated by appropriate spacing
