import type { Testimonial } from "../components/TestimonialsSection.types";

type FetchOptions = {
  fallback?: Testimonial[];
};

/**
 * Live Google Maps scraping is intentionally not used in the server render path.
 * Cloudflare Pages requests should render immediately with supplied/static
 * testimonials instead of waiting on third-party scraping that may hang or fail.
 */
export async function fetchGoogleTestimonials({
  fallback = [],
}: FetchOptions = {}): Promise<Testimonial[]> {
  return fallback;
}
