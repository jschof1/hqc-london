export const PRODUCTION_ROBOTS = 'index, follow';
export const DEVELOPMENT_ROBOTS = 'noindex, nofollow';

export function isDevelopmentPreview(): boolean {
  return import.meta.env.HQC_SITE_ENV === 'development';
}

export function getRobotsContent(defaultRobots = PRODUCTION_ROBOTS): string {
  return isDevelopmentPreview() ? DEVELOPMENT_ROBOTS : defaultRobots;
}
