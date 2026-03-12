# About Page Specification

## Purpose

Define the About page that provides comprehensive information about the OpenRouter Free Models Monitor project.

## Requirements

### Requirement: About page accessibility
The system SHALL provide an About page accessible at the `/about` route.

#### Scenario: Navigate to About page
- **WHEN** a user navigates to `/about` in the browser
- **THEN** the About page SHALL be displayed
- **AND** the page SHALL use the main application layout (header and footer)
- **AND** the browser URL SHALL show `/about`

#### Scenario: Access via footer link
- **WHEN** a user clicks the "About" link in the footer
- **WHEN** using React Router navigation
- **THEN** the About page SHALL be displayed without full page reload
- **AND** the footer link SHALL show active state styling

### Requirement: Project description
The About page SHALL display a comprehensive description of the project.

#### Scenario: Display project overview
- **WHEN** the About page is loaded
- **THEN** the page SHALL display the project name "OpenRouter Free Models Monitor"
- **AND** a brief description of the project's purpose
- **AND** information about monitoring OpenRouter's free AI model offerings

#### Scenario: Display project purpose
- **WHEN** the About page is loaded
- **THEN** the page SHALL explain that it tracks free models on OpenRouter
- **AND** mention the change detection and notification features
- **AND** include the update frequency (hourly)

### Requirement: Technical information
The About page SHALL display information about the technology stack.

#### Scenario: Display tech stack
- **WHEN** the About page is loaded
- **THEN** the page SHALL list the frontend technologies (React, Vite, TypeScript, TailwindCSS)
- **AND** list the backend technologies (Hono, Cloudflare Workers)
- **AND** list the database (Cloudflare D1)

#### Scenario: Display architecture
- **WHEN** the About page is loaded
- **THEN** the page SHALL describe the serverless architecture
- **AND** mention automated hourly syncing with OpenRouter API
- **AND** mention the notification system (Telegram)

### Requirement: Data sources
The About page SHALL be transparent about data sources.

#### Scenario: Display OpenRouter API information
- **WHEN** the About page is loaded
- **THEN** the page SHALL state that data comes from OpenRouter's public API
- **AND** include a link to OpenRouter's website (https://openrouter.ai)
- **AND** clarify that this is an unofficial monitoring project

### Requirement: Acknowledgments
The About page SHALL acknowledge the OpenRouter project and related services.

#### Scenario: Display acknowledgments
- **WHEN** the About page is loaded
- **THEN** the page SHALL acknowledge OpenRouter for providing the API
- **AND** mention Cloudflare for hosting (Workers, Pages, D1)
- **AND** include links to respective services

### Requirement: Source code information
The About page SHALL provide information about the open-source nature of the project.

#### Scenario: Display repository link
- **WHEN** the About page is displayed
- **THEN** the page SHALL include a link to the source code repository
- **AND** mention that the project is open source
- **AND** encourage contributions and feedback

### Requirement: Responsive design
The About page SHALL be responsive across all device sizes.

#### Scenario: Mobile display
- **WHEN** the About page is viewed on a mobile device (< 768px)
- **THEN** content SHALL be displayed in a single column
- **AND** text SHALL be readable without horizontal scrolling
- **AND** spacing SHALL be adjusted for smaller screens

#### Scenario: Tablet display
- **WHEN** the About page is viewed on a tablet (>= 768px and < 1024px)
- **THEN** content SHALL use appropriate max-width
- **AND** maintain readability with optimal line length

#### Scenario: Desktop display
- **WHEN** the About page is viewed on a desktop (>= 1024px)
- **THEN** content SHALL be centered with max-width constraint
- **AND** use optimal reading width (approximately 65-80 characters per line)

### Requirement: Dark mode support
The About page SHALL support both light and dark themes.

#### Scenario: Dark mode rendering
- **WHEN** dark mode is enabled
- **THEN** the About page SHALL display with dark background
- **AND** text SHALL be light-colored for readability
- **AND** all content SHALL be clearly visible

#### Scenario: Light mode rendering
- **WHEN** light mode is enabled
- **THEN** the About page SHALL display with light background
- **AND** text SHALL be dark-colored for readability

### Requirement: Last updated date
The About page SHALL display when the page content was last updated.

#### Scenario: Display last updated
- **WHEN** the About page is loaded
- **THEN** the page SHALL display a "Last Updated" date
- **AND** the date SHALL reflect when the content was last modified

### Requirement: Navigation consistency
The About page SHALL maintain consistency with other pages in the application.

#### Scenario: Header visibility
- **WHEN** the About page is displayed
- **THEN** the application header SHALL be visible at the top
- **AND** all header navigation links SHALL work correctly

#### Scenario: Footer visibility
- **WHEN** the About page is displayed
- **THEN** the application footer SHALL be visible at the bottom
- **AND** the About link SHALL show active state styling
