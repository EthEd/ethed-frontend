/**
 * Centralized metrics configuration for EthEd platform
 * Single source of truth for all platform statistics
 */

export interface PlatformMetrics {
  // Community Page Stats
  developers: number;
  countries: number;
  courses: number;
  nftsMinted: number;
  hackathons: number;
  sponsors: number;
  
  // Home/Learn Page Stats
  lessonsCompleted: number;
  nftBadgesMinted: number;
  ensIdentitiesReserved: number;
  fasterCompletionPercent: number;
}

/**
 * Platform metrics starting at 1 for fresh launch
 * All marketing numbers are centralized here for consistency
 */
export const metrics: PlatformMetrics = {
  // Community Page Stats
  developers: 1,
  countries: 1,
  courses: 1,
  nftsMinted: 1,
  hackathons: 1,
  sponsors: 1,
  
  // Home/Learn Page Stats
  lessonsCompleted: 1,
  nftBadgesMinted: 1,
  ensIdentitiesReserved: 1,
  fasterCompletionPercent: 1,
};

/**
 * Format metrics for display with appropriate suffixes
 */
export const formatMetric = (value: number, suffix: string = ""): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M${suffix}`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K${suffix}`;
  } else {
    return `${value}${suffix}`;
  }
};

/**
 * Get formatted display strings for common metrics
 */
export const getFormattedMetrics = () => ({
  developers: `${formatMetric(metrics.developers)}+ Developers`,
  countries: `${formatMetric(metrics.countries)}+ Countries`,
  courses: `${formatMetric(metrics.courses)}+ Courses`,
  nftsMinted: `${formatMetric(metrics.nftsMinted)}+ NFTs`,
  hackathons: `${formatMetric(metrics.hackathons)}+ Hackathons`,
  sponsors: `${formatMetric(metrics.sponsors)}+ Sponsors`,
  lessonsCompleted: `${formatMetric(metrics.lessonsCompleted)}+ Lessons Completed`,
  nftBadgesMinted: `${formatMetric(metrics.nftBadgesMinted)}+ NFT Badges Minted`,
  ensIdentitiesReserved: `${formatMetric(metrics.ensIdentitiesReserved)}+ ENS Identities Reserved`,
  fasterCompletionPercent: `${metrics.fasterCompletionPercent}% Faster Completion w/ Buddy`,
});