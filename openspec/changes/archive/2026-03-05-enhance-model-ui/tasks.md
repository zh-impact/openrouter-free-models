# Implementation Tasks

## 1. Setup and Configuration

- [x] 1.1 Add OPENROUTER_BASE_URL constant to packages/shared/src/constants.ts
- [x] 1.2 Create OPENROUTER_MODEL_URL() function for generating model URLs
- [x] 1.3 Export new constants from packages/shared/src/index.ts
- [x] 1.4 Build shared package with updated constants

## 2. ViewToggle Component

- [x] 2.1 Create apps/frontend/src/components/ViewToggle.tsx
- [x] 2.2 Implement grid and list button layout with icons
- [x] 2.3 Add selected/unselected button states with visual styling
- [x] 2.4 Implement hover states for better UX
- [x] 2.5 Define ViewMode type ('grid' | 'list')
- [x] 2.6 Add dark mode support for toggle component

## 3. ModelCard Component Enhancements

- [x] 3.1 Add useState for copy functionality in ModelCard
- [x] 3.2 Implement navigator.clipboard.writeText() for copying model ID
- [x] 3.3 Add copy button with clipboard icon next to model ID
- [x] 3.4 Implement success state with green checkmark icon
- [x] 3.5 Add 2-second timeout for button state restoration
- [x] 3.6 Convert model name to clickable link with OPENROUTER_MODEL_URL
- [x] 3.7 Add target="_blank" and rel="noopener noreferrer" for security
- [x] 3.8 Add hover color change for model name link
- [x] 3.9 Remove card-level click behavior, keep only model name clickable
- [x] 3.10 Add select-all and cursor-text to model ID code block
- [x] 3.11 Implement error handling for copy failures

## 4. ModelList Component Enhancements

- [x] 4.1 Add ViewMode type and viewMode prop to ModelList component
- [x] 4.2 Add useState for copy functionality in ModelListItem
- [x] 4.3 Create ModelListItem component for list view layout
- [x] 4.4 Implement horizontal list item layout with vertical spacing
- [x] 4.5 Position category badge after model name in list view
- [x] 4.6 Add external link icon next to category badge
- [x] 4.7 Implement copy button for model ID in list view
- [x] 4.8 Add success state with green checkmark icon for list view
- [x] 4.9 Convert model name to clickable link in list view
- [x] 4.10 Add truncate and max-width classes for model ID in list view
- [x] 4.11 Implement conditional rendering based on viewMode prop
- [x] 4.12 Maintain consistent styling between grid and list views

## 5. ModelsPage Integration

- [x] 5.1 Add ViewMode state management to ModelsPage
- [x] 5.2 Import ViewToggle component
- [x] 5.3 Integrate ViewToggle component in header section
- [x] 5.4 Pass viewMode prop to ModelList component
- [x] 5.5 Set default view mode to 'grid'
- [x] 5.6 Position ViewToggle next to RefreshButton
- [x] 5.7 Test view switching functionality
- [x] 5.8 Verify all features work in both view modes

## 6. Styling and UX Improvements

- [x] 6.1 Add hover effects for copy button (background color change)
- [x] 6.2 Implement smooth transitions for all interactive elements
- [x] 6.3 Add appropriate cursor styles (pointer for links/buttons)
- [x] 6.4 Ensure touch target sizes are adequate for mobile
- [x] 6.5 Add visual feedback for all clickable elements
- [x] 6.6 Implement proper spacing and alignment in list view
- [x] 6.7 Ensure responsive design works across all screen sizes
- [x] 6.8 Add dark mode support for all new components

## 7. Testing and Validation

- [x] 7.1 Test view toggle functionality (grid ↔ list)
- [x] 7.2 Test copy functionality in grid view
- [x] 7.3 Test copy functionality in list view
- [x] 7.4 Test external links open in new tabs
- [x] 7.5 Test model name hover states in both views
- [x] 7.6 Verify text selection works in non-clickable areas
- [x] 7.7 Test responsive behavior on mobile devices
- [x] 7.8 Verify dark mode compatibility
- [x] 7.9 Test error handling for copy failures
- [x] 7.10 Run frontend build to verify no compilation errors

## 8. Documentation

- [x] 8.1 Document ViewToggle component usage
- [x] 8.2 Document copy button behavior and timeout duration
- [x] 8.3 Document external link security attributes
- [x] 8.4 Update component interface documentation if needed
