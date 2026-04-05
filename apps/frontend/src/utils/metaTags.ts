/**
 * Social Meta Tags Utility Functions
 *
 * Provides utilities for dynamically updating Open Graph and Twitter Card meta tags
 * in single-page applications.
 */

/**
 * Updates or creates a meta tag in the document head
 *
 * @param property - The meta tag property (e.g., "og:title") or name (e.g., "twitter:card")
 * @param content - The content value for the meta tag
 */
export function updateMetaTag(property: string, content: string): void {
  // Try to find existing meta tag by property or name
  let element =
    document.querySelector(`meta[property="${property}"]`) ||
    document.querySelector(`meta[name="${property}"]`);

  if (element) {
    // Update existing meta tag
    element.setAttribute('content', content);
  } else {
    // Create new meta tag
    element = document.createElement('meta');
    if (property.startsWith('og:')) {
      element.setAttribute('property', property);
    } else {
      element.setAttribute('name', property);
    }
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
}
