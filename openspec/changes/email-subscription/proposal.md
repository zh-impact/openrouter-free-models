## Why

Users need a way to stay informed about changes to OpenRouter's free AI models without manually checking the website. Currently, users must visit the dashboard regularly to see new models, removed models, or changes to existing models. This creates friction and users may miss important updates. Email notifications provide a proactive way to keep users engaged and informed about model changes that matter to them.

## What Changes

- **Email subscription system**: Users can subscribe to receive daily digest emails about free model changes
- **Daily digest notifications**: Automated daily emails summarizing added, removed, and modified models
- **Simple opt-in flow**: Single-step subscription without double opt-in confirmation (per user requirements)
- **Unsubscribe functionality**: Tokenized unsubscribe links in every email for easy opt-out
- **Resend integration**: Batch email sending using Resend API for 1000+ subscribers
- **Subscription management**: Database storage of subscribers, email logs, and scheduled notifications
- **Frontend subscription UI**: Web form for email subscription with validation and feedback

## Capabilities

### New Capabilities
- `email-subscription`: Manages user email subscriptions to model change notifications
- `daily-digest`: Generates and sends daily email summaries of model changes
- `unsubscribe`: Handles user unsubscribe requests via tokenized links

### Modified Capabilities
- None (this is a new feature with no changes to existing specs)

## Impact

**Database**:
- New tables: `subscribers`, `subscriptions_log`, `scheduled_notifications`
- Existing tables unchanged

**Backend API**:
- New routes: `/api/subscriptions` (POST), `/api/subscriptions/unsubscribe` (GET), `/api/subscriptions/confirm` (GET), `/api/subscriptions/status` (GET)
- New cron endpoint: `/cron/daily-digest` for scheduled email sending
- New services: `ResendService`, `DigestService`
- Extended `StorageService` with subscription methods

**Frontend**:
- New page: `/subscribe` for email subscription
- New component: `SubscribeForm` for subscription UI
- Updated navigation: Added "订阅" button to header

**Environment Variables**:
- `RESEND_API_KEY`: Required for email sending
- `RESEND_FROM_EMAIL`: Sender email address (optional, has default)
- `BASE_URL`: Base URL for unsubscribe links (optional, has default)

**External Dependencies**:
- Resend API for email delivery
