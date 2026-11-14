import { RequestHandler } from "express";

// Mock data for demonstration - in production, these would be real API calls
const mockAccounts = [
  {
    id: "1",
    platform: "twitter",
    username: "icas_university",
    displayName: "ICAS University",
    followers: 12500,
    following: 850,
    posts: 1240,
    verified: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "2",
    platform: "instagram",
    username: "icas_life",
    displayName: "ICAS Student Life",
    followers: 8900,
    following: 1200,
    posts: 456,
    verified: false,
    lastUpdated: new Date().toISOString(),
  },
];

const mockPosts = [
  {
    id: "1",
    accountId: "1",
    content:
      "Exciting news! Our new research center is opening next month. Join us for the grand opening ceremony! 🎉",
    media: ["https://via.placeholder.com/400x300"],
    likes: 234,
    comments: 45,
    shares: 67,
    views: 1200,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    engagement: 8.2,
  },
  {
    id: "2",
    accountId: "1",
    content:
      "Beautiful campus during sunset. There's something magical about studying here ✨ #ICASLife",
    media: ["https://via.placeholder.com/400x300"],
    likes: 189,
    comments: 23,
    shares: 34,
    views: 890,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    engagement: 6.8,
  },
  {
    id: "3",
    accountId: "2",
    content: "Student life at ICAS is amazing! Here are some highlights from this week 📸",
    media: ["https://via.placeholder.com/400x300"],
    likes: 156,
    comments: 12,
    shares: 28,
    views: 650,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    engagement: 5.4,
  },
];

// Interface for social media account data
interface SocialMediaAccount {
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

// Interface for post data
interface Post {
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

// Get all tracked accounts
export const getAccounts: RequestHandler = (req, res) => {
  try {
    res.json({
      success: true,
      data: mockAccounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch accounts",
    });
  }
};

// Add a new social media account
export const addAccount: RequestHandler = (req, res) => {
  try {
    const { platform, username } = req.body;

    if (!platform || !username) {
      return res.status(400).json({
        success: false,
        error: "Platform and username are required",
      });
    }

    // Check if account already exists
    const existingAccount = mockAccounts.find(
      (acc) => acc.platform === platform && acc.username === username,
    );

    if (existingAccount) {
      return res.status(409).json({
        success: false,
        error: "Account already exists",
      });
    }

    // In a real implementation, you would:
    // 1. Validate the username exists on the platform
    // 2. Fetch real account data from the platform's API
    // 3. Store the account in a database

    // For now, we'll create a mock account
    const newAccount: SocialMediaAccount = {
      id: Date.now().toString(),
      platform,
      username,
      displayName: username,
      followers: Math.floor(Math.random() * 50000) + 1000,
      following: Math.floor(Math.random() * 2000) + 100,
      posts: Math.floor(Math.random() * 1000) + 50,
      verified: Math.random() > 0.7,
      lastUpdated: new Date().toISOString(),
    };

    mockAccounts.push(newAccount);

    res.json({
      success: true,
      data: newAccount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to add account",
    });
  }
};

// Remove an account
export const removeAccount: RequestHandler = (req, res) => {
  try {
    const accountId = String(req.params.accountId);

    const accountIndex = mockAccounts.findIndex((acc) => acc.id === accountId);

    if (accountIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Account not found",
      });
    }

    mockAccounts.splice(accountIndex, 1);

    res.json({
      success: true,
      message: "Account removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to remove account",
    });
  }
};

// Get recent posts for all accounts or a specific account
export const getRecentPosts: RequestHandler = (req, res) => {
  try {
    const { accountId, limit = 20 } = req.query;

    let posts = mockPosts;

    // Filter by account if specified
    if (accountId) {
      posts = posts.filter((post) => post.accountId === accountId);
    }

    // Sort by timestamp (newest first) and limit results
    posts = posts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, parseInt(limit as string));

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch recent posts",
    });
  }
};

// Refresh account data
export const refreshAccountData: RequestHandler = (req, res) => {
  try {
    const accountId = String(req.params.accountId);

    const account = mockAccounts.find((acc) => acc.id === accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: "Account not found",
      });
    }

    // In a real implementation, you would:
    // 1. Make API calls to the social media platform
    // 2. Fetch updated follower counts, post counts, etc.
    // 3. Update the account data in the database

    // For now, we'll simulate updating the data
    account.followers += Math.floor(Math.random() * 100) - 50; // Random change
    account.posts += Math.floor(Math.random() * 5);
    account.lastUpdated = new Date().toISOString();

    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to refresh account data",
    });
  }
};

// Get analytics summary
export const getAnalyticsSummary: RequestHandler = (req, res) => {
  try {
    const totalFollowers = mockAccounts.reduce((sum, acc) => sum + acc.followers, 0);
    const totalPosts = mockAccounts.reduce((sum, acc) => sum + acc.posts, 0);
    const totalReach = mockPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    const avgEngagement =
      mockPosts.length > 0
        ? mockPosts.reduce((sum, post) => sum + post.engagement, 0) / mockPosts.length
        : 0;

    const analytics = {
      totalFollowers,
      totalPosts,
      totalReach,
      avgEngagement: Math.round(avgEngagement * 10) / 10,
      totalAccounts: mockAccounts.length,
      platformBreakdown: mockAccounts.reduce(
        (breakdown, acc) => {
          breakdown[acc.platform] = (breakdown[acc.platform] || 0) + 1;
          return breakdown;
        },
        {} as Record<string, number>,
      ),
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics summary",
    });
  }
};

// Get engagement trends (mock data for charts)
export const getEngagementTrends: RequestHandler = (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysCount = parseInt(days as string);

    // Generate mock trend data
    const trends = [];
    for (let i = daysCount; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      trends.push({
        date: date.toISOString().split("T")[0],
        engagement: Math.floor(Math.random() * 10) + 3, // Random between 3-12%
        reach: Math.floor(Math.random() * 1000) + 500, // Random between 500-1500
        posts: Math.floor(Math.random() * 5) + 1, // Random between 1-5 posts
      });
    }

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch engagement trends",
    });
  }
};
