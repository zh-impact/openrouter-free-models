import { useEffect } from 'react';
import { updateMetaTag } from '../utils/metaTags';

/**
 * Props for the MetaUpdater component
 */
export interface MetaProps {
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Share image URL */
  image?: string;
  /** Canonical page URL */
  url?: string;
}

/**
 * MetaUpdater Component
 *
 * Dynamically updates social media meta tags when route changes.
 * This component doesn't render anything visible - it only updates
 * the document head with Open Graph and Twitter Card meta tags.
 *
 * @example
 * ```tsx
 * <Route path="/about" element={<AboutPage />} />
 *   handle={{
 *     element: <MetaUpdater
 *       title="About Us"
 *       description="Learn about our project"
 *     />
 *   }}
 * />
 * ```
 */
export function MetaUpdater({ title, description, image, url }: MetaProps) {
  useEffect(() => {
    if (title) {
      document.title = title;
      updateMetaTag('og:title', title);
      updateMetaTag('twitter:title', title);
    }

    if (description) {
      updateMetaTag('og:description', description);
      updateMetaTag('twitter:description', description);
    }

    if (image) {
      updateMetaTag('og:image', image);
      updateMetaTag('twitter:image', image);
    }

    if (url) {
      updateMetaTag('og:url', url);
    } else {
      // Use current URL if not provided
      updateMetaTag('og:url', window.location.href);
    }
  }, [title, description, image, url]);

  // This component doesn't render anything
  return null;
}
