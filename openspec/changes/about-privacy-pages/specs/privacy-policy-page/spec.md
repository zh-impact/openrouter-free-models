# Privacy Policy Page Specification

## Purpose

Define the Privacy Policy page that provides transparency about data collection, processing, and user privacy rights.

## Requirements

### Requirement: Privacy page accessibility
The system SHALL provide a Privacy Policy page accessible at the `/privacy` route.

#### Scenario: Navigate to Privacy page
- **WHEN** a user navigates to `/privacy` in the browser
- **THEN** the Privacy Policy page SHALL be displayed
- **AND** the page SHALL use the main application layout (header and footer)
- **AND** the browser URL SHALL show `/privacy`

#### Scenario: Access via footer link
- **WHEN** a user clicks the "Privacy Policy" link in the footer
- **WHEN** using React Router navigation
- **THEN** the Privacy Policy page SHALL be displayed without full page reload
- **AND** the footer link SHALL show active state styling

### Requirement: Data collection transparency
The Privacy Policy page SHALL clearly disclose what data, if any, is collected by the service.

#### Scenario: Display data collection statement
- **WHEN** the Privacy Policy page is loaded
- **THEN** the page SHALL state what personal data is collected
- **AND** explain the purpose of data collection
- **AND** identify the legal basis for processing (if applicable)

#### Scenario: No personal data collection
- **WHEN** the service does not collect personal data
- **THEN** the page SHALL clearly state "We do not collect personal data"
- **AND** explain that usage is anonymous
- **AND** describe what technical data is logged (e.g., by Cloudflare)

### Requirement: Third-party services disclosure
The Privacy Policy page SHALL disclose all third-party services used by the application.

#### Scenario: OpenRouter API disclosure
- **WHEN** the Privacy Policy page is loaded
- **THEN** the page SHALL mention use of OpenRouter API
- **AND** explain that only public model information is fetched
- **AND** state that no personal data is sent to OpenRouter

#### Scenario: Telegram disclosure
- **WHEN** Telegram subscription is available
- **THEN** the page SHALL explain that chat_id is stored for notifications
- **AND** describe what data is shared with Telegram
- **AND** link to Telegram's privacy policy

#### Scenario: Cloudflare services disclosure
- **WHEN** the Privacy Policy page is loaded
- **THEN** the page SHALL mention Cloudflare Workers, Pages, and D1
- **AND** note that Cloudflare may collect standard access logs
- **AND** link to Cloudflare's privacy policy

#### Scenario: Analytics services (if applicable)
- **WHEN** analytics or tracking services are used
- **THEN** the page SHALL list all analytics providers
- **AND** explain what data is collected
- **AND** provide links to their privacy policies
- **AND** explain how to opt out (if available)

### Requirement: Data usage practices
The Privacy Policy page SHALL explain how collected data is used.

#### Scenario: Telegram data usage
- **WHEN** Telegram subscriptions are enabled
- **THEN** the page SHALL explain that chat_id is used solely for sending notifications
- **AND** state that chat_id is not shared with third parties (except Telegram)
- **AND** describe the notification content (model updates)

#### Scenario: Database storage
- **WHEN** data is stored in D1 database
- **THEN** the page SHALL explain what data is persisted
- **AND** mention data retention policies
- **AND** describe data security measures (if applicable)

### Requirement: User rights
The Privacy Policy page SHALL inform users of their privacy rights.

#### Scenario: Right to access
- **WHEN** the Privacy Policy page is displayed
- **THEN** the page SHALL inform users they can request a copy of their data
- **AND** provide contact information for data requests (if applicable)

#### Scenario: Right to deletion
- **WHEN** users can request data deletion
- **THEN** the page SHALL explain how to request deletion
- **AND** describe the deletion process (e.g., /unsubscribe command for Telegram)
- **AND** state the timeframe for deletion

#### Scenario: Right to unsubscribe
- **WHEN** subscription services are available
- **THEN** the page SHALL explain how to unsubscribe from notifications
- **AND** mention the /unsubscribe Telegram command
- **AND** state that unsubscription is immediate

### Requirement: Data security
The Privacy Policy page SHALL describe measures taken to protect user data.

#### Scenario: Security measures disclosure
- **WHEN** the Privacy Policy page is loaded
- **THEN** the page SHALL describe technical security measures
- **AND** mention encryption in transit (HTTPS)
- **AND** note that data is stored in secure cloud infrastructure (Cloudflare)

### Requirement: Cookies and tracking
The Privacy Policy page SHALL disclose the use of cookies and tracking technologies.

#### Scenario: No cookies statement
- **WHEN** the application does not use cookies
- **THEN** the page SHALL clearly state "We do not use cookies"
- **AND** explain that no tracking cookies are deployed

#### Scenario: Local storage usage
- **WHEN** the application uses browser storage (e.g., dark mode preference)
- **THEN** the page SHALL explain what is stored locally
- **AND** note that this data never leaves the user's browser
- **AND** explain how to clear local data

### Requirement: Data retention
The Privacy Policy page SHALL specify how long data is retained.

#### Scenario: Telegram subscriber retention
- **WHEN** Telegram subscriptions are stored
- **THEN** the page SHALL state how long inactive subscriptions are kept
- **AND** explain that unsubscribing removes data immediately

#### Scenario: Model data retention
- **WHEN** the Privacy Policy page is loaded
- **THEN** the page SHALL explain that model change history is retained
- **AND** note that this is public data from OpenRouter, not user data

### Requirement: Children's privacy
The Privacy Policy page SHALL address the collection of data from children.

#### Scenario: No children's data
- **WHEN** the service is not directed at children
- **THEN** the page SHALL state that the service is not intended for children under 13
- **AND** confirm that no personal data is knowingly collected from children

### Requirement: International data transfers
The Privacy Policy page SHALL disclose if data is transferred internationally.

#### Scenario: Cloudflare infrastructure
- **WHEN** Cloudflare services are used
- **THEN** the page SHALL note that data may be stored in Cloudflare's global infrastructure
- **AND** explain that Cloudflare maintains data centers worldwide

#### Scenario: Telegram data
- **WHEN** Telegram is used for notifications
- **THEN** the page SHALL note that Telegram operates internationally
- **AND** link to Telegram's data processing information

### Requirement: Policy updates
The Privacy Policy page SHALL inform users about how and when the policy may change.

#### Scenario: Update notification
- **WHEN** the Privacy Policy page is displayed
- **THEN** the page SHALL state that the policy may be updated
- **AND** explain that changes will be reflected on this page
- **AND** include a "Last Updated" date

### Requirement: Responsive design
The Privacy Policy page SHALL be responsive across all device sizes.

#### Scenario: Mobile display
- **WHEN** the Privacy Policy page is viewed on a mobile device (< 768px)
- **THEN** content SHALL be displayed in a single column
- **AND** legal text SHALL be readable without horizontal scrolling
- **AND** headings SHALL be appropriately sized for mobile

#### Scenario: Desktop display
- **WHEN** the Privacy Policy page is viewed on a desktop (>= 1024px)
- **THEN** content SHALL be centered with max-width constraint
- **AND** use optimal reading width for legal text

### Requirement: Dark mode support
The Privacy Policy page SHALL support both light and dark themes.

#### Scenario: Dark mode rendering
- **WHEN** dark mode is enabled
- **THEN** the Privacy Policy page SHALL display with dark background
- **AND** all text SHALL remain clearly readable
- **AND** links SHALL be appropriately colored for visibility

#### Scenario: Light mode rendering
- **WHEN** light mode is enabled
- **THEN** the Privacy Policy page SHALL display with light background
- **AND** all text SHALL be clearly readable

### Requirement: Contact information
The Privacy Policy page SHALL provide contact information for privacy inquiries.

#### Scenario: Display contact information
- **WHEN** the Privacy Policy page is loaded
- **THEN** the page SHALL provide a way to contact about privacy concerns
- **AND** include a GitHub repository link (for open source project)
- **OR** include an email address for privacy inquiries

### Requirement: Legal disclaimer
The Privacy Policy page SHALL include appropriate legal disclaimers.

#### Scenario: Disclaimer display
- **WHEN** the Privacy Policy page is displayed
- **THEN** the page SHALL include a disclaimer that this is not legal advice
- **AND** state that the project is an open-source community project
- **AND** encourage users to review the policy periodically

### Requirement: Navigation consistency
The Privacy Policy page SHALL maintain consistency with other pages in the application.

#### Scenario: Header visibility
- **WHEN** the Privacy Policy page is displayed
- **THEN** the application header SHALL be visible at the top
- **AND** all header navigation links SHALL work correctly

#### Scenario: Footer visibility
- **WHEN** the Privacy Policy page is displayed
- **THEN** the application footer SHALL be visible at the bottom
- **AND** the Privacy Policy link SHALL show active state styling
