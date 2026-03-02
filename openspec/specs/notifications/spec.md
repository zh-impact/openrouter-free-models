# Notifications Specification

## Purpose

Define how the system sends notifications when model changes are detected, including email and webhook delivery channels.

## Requirements

### Requirement: Send change notifications
The system SHALL send notifications when model changes are detected.

#### Scenario: Changes detected
- **WHEN** a sync detects changes to free models
- **AND** notifications are enabled
- **THEN** the system SHALL send a notification with a summary of changes

#### Scenario: No changes detected
- **WHEN** a sync detects no changes
- **THEN** the system SHALL NOT send any notifications

### Requirement: Notification summary format
Notifications SHALL include a structured summary of changes.

#### Scenario: Summary with mixed changes
- **WHEN** 2 models added, 1 removed, and 1 modified
- **THEN** the notification SHALL include:
  - "New Free Models (2):" section listing added model names
  - "Removed Free Models (1):" section listing removed model names
  - "Modified Free Models (1):" section listing modified model names
  - Detection timestamp

#### Scenario: Summary with only additions
- **WHEN** only new models were added
- **THEN** the notification SHALL include only the "New Free Models" section

### Requirement: Email notifications
The system SHALL support sending email notifications via Resend.

#### Scenario: Send email
- **WHEN** email notifications are enabled
- **AND** changes are detected
- **THEN** the system SHALL send an email to the configured recipient
- **AND** the email subject SHALL be "OpenRouter Free Models Update" (or custom)
- **AND** the email body SHALL contain the change summary

#### Scenario: Email configuration
- **WHEN** email notifications are enabled
- **THEN** the system SHALL require:
  - RESEND_API_KEY environment variable
  - NOTIFICATION_EMAIL environment variable with recipient address

#### Scenario: Email send failure
- **WHEN** sending the email fails
- **THEN** the system SHALL log the error
- **AND** continue without failing the sync operation

### Requirement: Webhook notifications
The system SHALL support sending webhook notifications to HTTP endpoints.

#### Scenario: Send webhook
- **WHEN** webhook notifications are enabled
- **AND** changes are detected
- **THEN** the system SHALL POST a JSON payload to the configured webhook URL
- **AND** the payload SHALL include summary and timestamp fields

#### Scenario: Webhook with custom headers
- **WHEN** custom headers are configured for the webhook
- **THEN** the system SHALL include those headers in the POST request

#### Scenario: Webhook failure
- **WHEN** the webhook returns a non-2xx status
- **THEN** the system SHALL log the error
- **AND** continue without failing the sync operation

### Requirement: Multi-channel notifications
The system SHALL support multiple notification channels simultaneously.

#### Scenario: Email and webhook
- **WHEN** both email and webhook are enabled
- **THEN** the system SHALL attempt to send both
- **AND** a failure in one channel SHALL NOT prevent the other

#### Scenario: All channels fail
- **WHEN** all enabled notification channels fail
- **THEN** the system SHALL still mark the sync as successful
- **AND** log the notification failures

### Requirement: Notification configuration
Notifications SHALL be configurable via environment variables.

#### Scenario: Enable notifications
- **WHEN** notification configuration has enabled=true
- **THEN** notifications SHALL be sent for detected changes

#### Scenario: Disable notifications
- **WHEN** notification configuration has enabled=false
- **THEN** NO notifications SHALL be sent, even if channels are configured

### Requirement: Notification content
The notification SHALL provide sufficient context for recipients.

#### Scenario: Model names
- **WHEN** listing changed models
- **THEN** the notification SHALL include human-readable model names (not just IDs)

#### Scenario: Detection time
- **WHEN** a notification is sent
- **THEN** it SHALL include an ISO 8601 timestamp of when changes were detected

#### Scenario: Actionable information
- **WHEN** new models are added
- **THEN** the notification SHALL include enough information for recipients to try the models

### Requirement: Notification tracking
The system SHALL track notification delivery status.

#### Scenario: Successful notification
- **WHEN** a notification is sent successfully
- **THEN** the system SHALL create a notification record with status='sent'
- **AND** include the sent_at timestamp

#### Scenario: Failed notification
- **WHEN** a notification fails to send
- **THEN** the system SHALL create a notification record with status='failed'
- **AND** include the error_message

### Requirement: Notification retry policy
The system SHALL NOT retry failed notifications to avoid spam.

#### Scenario: First attempt fails
- **WHEN** sending a notification fails
- **THEN** the system SHALL NOT retry
- **AND** the notification record SHALL have status='failed'

#### Scenario: Next sync
- **WHEN** the next scheduled sync runs
- **THEN** NEW changes SHALL trigger new notifications
- **AND** the system SHALL NOT retry previous failed notifications

### Requirement: Rate limiting
The system SHALL implement rate limiting for notification channels.

#### Scenario: Multiple syncs in quick succession
- **WHEN** multiple syncs occur within a short period
- **AND** each sync detects changes
- **THEN** the system SHALL send a notification for each sync
- **AND** the recipient may receive multiple emails (this is expected behavior)

### Requirement: Notification opt-out
Users SHALL be able to disable notifications entirely.

#### Scenario: Notifications disabled
- **WHEN** notification configuration has enabled=false
- **THEN** NO notification records SHALL be created
- **AND** NO external calls SHALL be made to notification services

### Requirement: Webhook payload format
Webhook payloads SHALL follow a consistent structure.

#### Scenario: Standard webhook payload
- **WHEN** sending a webhook notification
- **THEN** the JSON payload SHALL include:
  - summary: string containing the change summary
  - timestamp: ISO 8601 timestamp
  - changes: array of change objects with model_id, change_type, model_name

### Requirement: Security for webhooks
Webhook URLs SHALL be handled securely.

#### Scenario: Webhook URL in environment
- **WHEN** a webhook URL is configured
- **THEN** the URL SHALL be read from environment variables
- **AND** the URL SHALL NOT be exposed in API responses
- **AND** the URL SHALL NOT be logged

### Requirement: Notification template
Email notifications SHALL use a clear, readable template.

#### Scenario: Email body format
- **WHEN** an email notification is sent
- **THEN** the body SHALL be plain text with clear section headers
- **AND** model names SHALL be listed with bullet points
- **AND** sections SHALL be separated by blank lines
