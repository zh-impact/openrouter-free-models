/**
 * Social Media Meta Tags Configuration
 *
 * Provides default and page-specific meta tag configurations for
 * Open Graph (Facebook, LinkedIn) and Twitter Card meta tags.
 */

/**
 * Social media meta tag configuration interface
 */
export interface SocialMetaConfig {
  /** Page title */
  title: string;
  /** Page description for social sharing */
  description: string;
  /** Share image URL (relative or absolute) */
  image: string;
  /** Canonical page URL */
  url?: string;
  /** Site name for og:site_name */
  siteName?: string;
  /** Content type for og:type (default: "website") */
  type?: string;
}

/**
 * Default social meta tags configuration
 * Used as fallback for pages without custom configuration
 */
export const DEFAULT_META: SocialMetaConfig = {
  title: 'OpenRouter Free Models Monitor',
  description: 'Monitor free AI models on OpenRouter with real-time tracking and complete change history',
  image: '/images/og-default.png',
  url: 'https://openrouter-free-models.pages.dev',
  siteName: 'OpenRouter Free Models',
  type: 'website',
};

/**
 * Page-specific social media meta tags configuration
 * Overrides DEFAULT_META for specific routes
 */
export const PAGE_META: Record<string, Partial<SocialMetaConfig>> = {
  '/': DEFAULT_META,

  '/models': {
    title: 'Free AI Models - OpenRouter Monitor',
    description: 'Browse all available free AI models including Google Gemini, Anthropic Claude, and more',
  },

  '/about': {
    title: 'About - OpenRouter Free Models Monitor',
    description: 'Learn about the purpose, architecture, and usage of OpenRouter Free Models Monitor',
  },

  '/privacy-policy': {
    title: 'Privacy Policy - OpenRouter Free Models',
    description: 'Privacy policy and data handling information for OpenRouter Free Models Monitor',
  },
};
