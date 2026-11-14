/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface MeetingActionItem {
  owner: string;
  task: string;
  due_date?: string;
}

export interface MeetingTimelineEntry {
  timestamp?: string;
  note: string;
}

export interface MeetingSummary {
  title?: string;
  summary: string;
  attendees?: string[];
  agenda?: string[];
  decisions?: string[];
  action_items?: MeetingActionItem[];
  risks?: string[];
  next_steps?: string[];
  timeline?: MeetingTimelineEntry[];
}

export interface DelegateSummaryResponse {
  transcript: string;
  summary: MeetingSummary | string; // string when JSON parsing fails
  modelUsed?: string;
}

// Social Media Analytics Types
export interface SocialMediaAccount {
  id: string;
  platform: "twitter" | "instagram" | "facebook" | "youtube";
  username: string;
  displayName: string;
  followers: number;
  following: number;
  posts: number;
  verified: boolean;
  lastUpdated: string;
}

export interface SocialMediaPost {
  id: string;
  accountId: string;
  content: string;
  media?: string[];
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  timestamp: string;
  engagement: number;
}

export interface SocialMediaAnalytics {
  totalFollowers: number;
  totalPosts: number;
  totalReach: number;
  avgEngagement: number;
  totalAccounts: number;
  platformBreakdown: Record<string, number>;
}

export interface EngagementTrend {
  date: string;
  engagement: number;
  reach: number;
  posts: number;
}

export interface SocialMediaApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
