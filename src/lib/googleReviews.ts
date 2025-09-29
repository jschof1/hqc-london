import { scraper } from "google-maps-review-scraper";
import type { Testimonial } from "../components/TestimonialsSection.types";

const DEFAULT_PLACE_URL =
  process.env.GOOGLE_MAPS_REVIEWS_URL ??
  "https://www.google.com/maps/place/High+Quality+Clean+Ltd/data=!4m2!3m1!1s0x0:0xade47bf255fda541!8m2!3d51.5121205!4d-0.1234477?entry=ttu";

type FetchOptions = {
  url?: string;
  limit?: number;
  fallback?: Testimonial[];
  sortType?: "relevent" | "newest" | "highest_rating" | "lowest_rating";
  pages?: number | "max";
};

type CachedResult = {
  key: string;
  data: Testimonial[];
};

let cachedResult: CachedResult | undefined;

export async function fetchGoogleTestimonials({
  url = DEFAULT_PLACE_URL,
  limit = 8,
  fallback = [],
  sortType = "newest",
  pages = 1,
}: FetchOptions = {}): Promise<Testimonial[]> {
  const normalizedUrl = normalizePlaceUrl(url);
  const cacheKey = [normalizedUrl, limit, sortType, pages].join("|");

  if (cachedResult?.key === cacheKey) {
    return cachedResult.data;
  }

  try {
    const response = await scraper(normalizedUrl, {
      sort_type: sortType,
      pages,
      clean: true,
    });

    if (!response) {
      return fallback;
    }

    const parsedResponse =
      typeof response === "string" ? JSON.parse(response) : response;

    if (!Array.isArray(parsedResponse) || parsedResponse.length === 0) {
      return fallback;
    }

    const testimonials = parsedResponse
      .map(mapReviewToTestimonial)
      .filter(Boolean)
      .slice(0, limit) as Testimonial[];

    if (testimonials.length) {
      cachedResult = {
        key: cacheKey,
        data: testimonials,
      };
      return testimonials;
    }

    return fallback;
  } catch (error) {
    console.error("Failed to fetch Google reviews", error);
    return fallback;
  }
}

function mapReviewToTestimonial(review: any): Testimonial | null {
  if (!review || typeof review !== "object") {
    return null;
  }

  const name = String(review?.author?.name || "Google Reviewer").trim();
  const rating = clampRating(review?.review?.rating);
  const quote = String(
    review?.review?.text || "This reviewer left a rating with no written comment."
  ).trim();

  return {
    name,
    avatar: "",
    avatarAlt: `${name} - Google reviewer`,
    title: formatTitle(rating),
    quote,
    subtitle: "Review from Google Maps",
    rating,
  };
}

function normalizePlaceUrl(url: string): string {
  if (!url) {
    throw new Error("A valid Google Maps place URL is required");
  }

  const queryIndex = url.indexOf("?");
  if (queryIndex === -1) {
    return url;
  }

  const needsSeparator = url[queryIndex - 1] !== "!";
  return needsSeparator
    ? `${url.slice(0, queryIndex)}!${url.slice(queryIndex)}`
    : url;
}

function clampRating(value: unknown): number {
  const numeric = Math.round(Number(value) || 0);
  if (!Number.isFinite(numeric)) {
    return 5;
  }

  return Math.min(Math.max(numeric, 1), 5);
}

function formatTitle(rating: number): string {
  return rating >= 5
    ? "5-Star Google Review"
    : `${rating}-Star Google Review`;
}

function generateAvatarFallback(name: string): string {
  const base = "https://ui-avatars.com/api/";
  const params = new URLSearchParams({
    name,
    background: "0F172A",
    color: "FFFFFF",
  });

  return `${base}?${params.toString()}`;
}

