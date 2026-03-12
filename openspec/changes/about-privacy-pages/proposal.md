# Proposal: About Page and Privacy Policy Page

## Why

The application footer currently contains placeholder text "About - Privacy Policy" but the corresponding pages don't exist. Users need transparency about:
- What the service does and how it works
- What data is collected and how it's used
- Third-party services involved (OpenRouter API, Telegram, etc.)
- User rights and privacy choices

## What Changes

- Add new `/about` route with an About page
- Add new `/privacy` route with a Privacy Policy page
- Update App.tsx footer with navigation links to these pages using React Router's NavLink
- Create AboutPage component with project description, tech stack information, and acknowledgments
- Create PrivacyPolicyPage component with data collection practices, third-party services, and user rights

## Capabilities

### New Capabilities
- `about-page`: Static informational page describing the OpenRouter Free Models Monitor project, its purpose, architecture, and tech stack
- `privacy-policy-page`: Legal and transparency page explaining data collection, third-party integrations (OpenRouter API, Telegram), and user privacy rights

### Modified Capabilities
- `web-dashboard`: Update footer requirement to include navigation links to About and Privacy Policy pages

## Impact

### Affected Code
- **Frontend routing**: Add two new routes (`/about`, `/privacy`) in App.tsx
- **New components**: Create AboutPage.tsx and PrivacyPolicyPage.tsx in apps/frontend/src/pages/
- **Footer updates**: Replace placeholder text with NavLink components in App.tsx footer
- **Navigation**: Header and navigation will extend to include these pages

### Dependencies
- React Router (already installed)
- TailwindCSS (already installed)

### Non-Goals
- User accounts or authentication for these pages (public access only)
- Dynamic content or database-driven text (static content is sufficient)
- Internationalization/localization (English only initially)

## Success Criteria

- [ ] About page accessible at `/about` with project information
- [ ] Privacy Policy page accessible at `/privacy` with comprehensive privacy information
- [ ] Footer links navigate to respective pages using React Router
- [ ] Both pages are responsive and support dark mode
- [ ] Content is accurate regarding data collection and third-party services
- [ ] Navigation works with browser back/forward buttons
