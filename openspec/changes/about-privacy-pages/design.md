# Design: About Page and Privacy Policy Page

## Context

The OpenRouter Free Models Monitor currently has placeholder text "About - Privacy Policy" in the footer. These pages are essential for transparency and trust. The application already uses React Router for navigation (Models, Changes, Subscribe pages), making it straightforward to add two new routes.

**Current State:**
- Footer in `App.tsx` displays static placeholder text
- React Router v7 already configured with BrowserRouter
- Existing pages follow a consistent pattern in `apps/frontend/src/pages/`
- TailwindCSS for styling with dark mode support

**Constraints:**
- No backend changes required (static content only)
- Must maintain consistency with existing page layouts
- No authentication needed (public pages)
- Minimal dependencies (React Router and TailwindCSS already installed)

## Goals / Non-Goals

**Goals:**
- Create two new static pages that integrate seamlessly with existing routing and styling
- Provide comprehensive information about the project and privacy practices
- Maintain responsive design and dark mode support across all viewports
- Enable proper navigation from footer with active state highlighting

**Non-Goals:**
- Content management system or database-driven text
- Multi-language support
- User-specific or personalized content
- Backend API endpoints for page content
- Complex interactivity beyond basic navigation

## Decisions

### 1. Component Structure: Separate Page Components

**Decision:** Create `AboutPage.tsx` and `PrivacyPolicyPage.tsx` as separate functional components in `apps/frontend/src/pages/`.

**Rationale:**
- Consistent with existing architecture (ModelsPage, ChangesPage, SubscribePage)
- Each page is independently maintainable and testable
- Clear separation of concerns
- Easy to extend with additional pages in the future

**Alternatives Considered:**
- Single component with content prop: Rejected because pages serve different purposes and have distinct content structures
- Dynamic route with content slug: Over-engineering for static content

### 2. Footer Navigation: NavLink with Active States

**Decision:** Replace placeholder text with React Router's `NavLink` components to enable client-side routing with active state styling.

**Rationale:**
- Consistent with existing Header navigation pattern
- No full page reloads (SPA experience)
- Automatic active state highlighting when on About/Privacy pages
- Works with browser back/forward buttons

**Alternatives Considered:**
- Regular `<a>` tags: Would cause full page reloads
- Button-based navigation: Less semantic and breaks expected link behavior

### 3. Content Approach: Static Hard-Coded Content

**Decision:** Hard-code all page content directly in React components rather than fetching from an API or CMS.

**Rationale:**
- Pages are informational and change infrequently
- No need for editorial workflow or dynamic updates
- Faster page loads (no network requests)
- Simpler deployment and maintenance
- Content is version-controlled with the codebase

**Alternatives Considered:**
- Markdown files with frontmatter: Adds complexity for minimal benefit
- CMS integration: Over-engineering for two simple pages

### 4. Styling: Consistent Page Layout Pattern

**Decision:** Follow the existing page layout pattern used by other pages (container with max-width, proper spacing, dark mode support).

**Rationale:**
- Visual consistency across the application
- Reuses existing TailwindCSS utility classes
- Responsive breakpoints already established
- Dark mode implementation is proven

**Implementation Pattern:**
```tsx
<div className="max-w-3xl mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold">Page Title</h1>
  {/* Content sections with proper spacing */}
</div>
```

### 5. Route Configuration: Explicit Route Definitions

**Decision:** Add explicit `<Route>` components in `App.tsx` for `/about` and `/privacy`.

**Rationale:**
- Clear and explicit routing configuration
- Easy to see all routes in one place
- Consistent with existing route definitions
- Type-safe with TypeScript

**Route Setup:**
```tsx
<Route path="/about" element={<AboutPage />} />
<Route path="/privacy" element={<PrivacyPolicyPage />} />
```

## Risks / Trade-offs

### Risk: Content Accuracy Drift
**Risk:** Privacy policy and about information become outdated as the project evolves.
**Mitigation:** Add a "Last Updated" date to both pages; review content quarterly or when major features are added.

### Risk: Legal Compliance
**Risk:** Privacy policy may not meet all legal requirements for different jurisdictions.
**Mitigation:** Include clear disclaimer that this is an open-source project; focus on transparency about actual data practices rather than legal guarantees.

### Trade-off: Static vs. Dynamic Content
**Trade-off:** Hard-coded content is simpler to maintain but requires code deployment for updates.
**Decision:** Acceptable trade-off given infrequent changes; benefits of simplicity and version control outweigh flexibility of dynamic content.

### Trade-off: Footer Layout Complexity
**Trade-off:** Adding links to footer may increase visual complexity on mobile viewports.
**Mitigation:** Use responsive design to adjust footer layout (stack links vertically on mobile, horizontal on desktop).

## Migration Plan

### Phase 1: Create Page Components
1. Create `apps/frontend/src/pages/AboutPage.tsx`
2. Create `apps/frontend/src/pages/PrivacyPolicyPage.tsx`
3. Write comprehensive content for both pages

### Phase 2: Update Routing
1. Add routes to `App.tsx` Routes section
2. Import new page components

### Phase 3: Update Footer
1. Replace placeholder text with NavLink components
2. Add proper styling for footer links
3. Test responsive layout

### Phase 4: Testing
1. Verify navigation works from footer
2. Test browser back/forward functionality
3. Validate dark mode rendering
4. Check responsive behavior on mobile/tablet/desktop
5. Ensure no TypeScript errors

### Rollback Strategy
If issues arise, simply revert the footer to placeholder text and remove the new route definitions. No database changes or backend modifications mean zero rollback risk.

## Open Questions

None. The design is straightforward with no outstanding technical decisions.

## Data Flow

```
User clicks footer link
    ↓
NavLink click handler
    ↓
React Router updates URL
    ↓
App.tsx Routes matches new path
    ↓
Corresponding page component renders
    ↓
Page content displayed with proper styling
```

## Component Hierarchy

```
App.tsx
├── Header (existing)
├── Routes
│   ├── / (ModelsPage) - existing
│   ├── /models (ModelsPage) - existing
│   ├── /changes (ChangesPage) - existing
│   ├── /subscribe (SubscribePage) - existing
│   ├── /about (AboutPage) - NEW
│   └── /privacy (PrivacyPolicyPage) - NEW
└── Footer (updated with NavLinks)
    ├── About link - NEW
    └── Privacy Policy link - NEW
```
