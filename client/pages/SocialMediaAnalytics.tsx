import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Calendar,
  BarChart3,
  Search,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "../components/theme/ThemeProvider";
import {
  SocialMediaAccount,
  SocialMediaPost,
  SocialMediaAnalytics as SocialMediaAnalyticsType,
  EngagementTrend,
  SocialMediaApiResponse,
} from "@shared/api";

// Remove duplicate interfaces since we're importing from shared/api

const SocialMediaAnalytics: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([]);
  const [newAccount, setNewAccount] = useState({
    platform: "twitter" as const,
    username: "",
  });
  const [recentPosts, setRecentPosts] = useState<SocialMediaPost[]>([]);
  const [analytics, setAnalytics] = useState<SocialMediaAnalyticsType | null>(null);
  const [engagementTrends, setEngagementTrends] = useState<EngagementTrend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
    fetchRecentPosts();
    fetchAnalytics();
    fetchEngagementTrends();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/social-media/accounts");
      const result: SocialMediaApiResponse<SocialMediaAccount[]> = await response.json();

      if (result.success && result.data) {
        setAccounts(result.data);
      } else {
        setError(result.error || "Failed to fetch accounts");
      }
    } catch (error) {
      setError("Failed to fetch accounts");
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const response = await fetch("/api/social-media/posts?limit=20");
      const result: SocialMediaApiResponse<SocialMediaPost[]> = await response.json();

      if (result.success && result.data) {
        setRecentPosts(result.data);
      } else {
        setError(result.error || "Failed to fetch recent posts");
      }
    } catch (error) {
      setError("Failed to fetch recent posts");
      console.error("Error fetching recent posts:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/social-media/analytics");
      const result: SocialMediaApiResponse<SocialMediaAnalyticsType> = await response.json();

      if (result.success && result.data) {
        setAnalytics(result.data);
      } else {
        setError(result.error || "Failed to fetch analytics");
      }
    } catch (error) {
      setError("Failed to fetch analytics");
      console.error("Error fetching analytics:", error);
    }
  };

  const fetchEngagementTrends = async () => {
    try {
      const response = await fetch("/api/social-media/trends?days=30");
      const result: SocialMediaApiResponse<EngagementTrend[]> = await response.json();

      if (result.success && result.data) {
        setEngagementTrends(result.data);
      } else {
        setError(result.error || "Failed to fetch engagement trends");
      }
    } catch (error) {
      setError("Failed to fetch engagement trends");
      console.error("Error fetching engagement trends:", error);
    }
  };

  const platformIcons = {
    twitter: <Twitter className="h-5 w-5" />,
    instagram: <Instagram className="h-5 w-5" />,
    facebook: <Facebook className="h-5 w-5" />,
    youtube: <Youtube className="h-5 w-5" />,
  };

  const platformColors = {
    twitter: "bg-blue-500",
    instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
    facebook: "bg-blue-600",
    youtube: "bg-red-600",
  };

  const handleAddAccount = async () => {
    if (!newAccount.username.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/social-media/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAccount),
      });

      const result: SocialMediaApiResponse<SocialMediaAccount> = await response.json();

      if (result.success && result.data) {
        setAccounts([...accounts, result.data]);
        setNewAccount({ platform: "twitter", username: "" });
        // Refresh analytics after adding account
        fetchAnalytics();
      } else {
        setError(result.error || "Failed to add account");
      }
    } catch (error) {
      setError("Failed to add account");
      console.error("Error adding account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/social-media/accounts/${accountId}`, {
        method: "DELETE",
      });

      const result: SocialMediaApiResponse<null> = await response.json();

      if (result.success) {
        setAccounts(accounts.filter((acc) => acc.id !== accountId));
        // Refresh analytics after removing account
        fetchAnalytics();
      } else {
        setError(result.error || "Failed to remove account");
      }
    } catch (error) {
      setError("Failed to remove account");
      console.error("Error removing account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async (accountId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/social-media/accounts/${accountId}/refresh`, {
        method: "POST",
      });

      const result: SocialMediaApiResponse<SocialMediaAccount> = await response.json();

      if (result.success && result.data) {
        setAccounts(accounts.map((acc) => (acc.id === accountId ? result.data! : acc)));
        // Refresh analytics after updating account
        fetchAnalytics();
      } else {
        setError(result.error || "Failed to refresh account data");
      }
    } catch (error) {
      setError("Failed to refresh account data");
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Social Media Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor and analyze your social media presence across platforms
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center text-red-600 dark:text-red-400">
                <span className="font-medium">Error:</span>
                <span className="ml-2">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add New Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Social Media Account
            </CardTitle>
            <CardDescription>
              Enter a username to start tracking analytics for a social media account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="platform">Platform</Label>
                <select
                  id="platform"
                  value={newAccount.platform}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, platform: e.target.value as any })
                  }
                  className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="twitter">Twitter</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
              <div className="flex-1">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username (without @)"
                  value={newAccount.username}
                  onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleAddAccount}
                disabled={!newAccount.username.trim() || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accounts">Accounts Overview</TabsTrigger>
            <TabsTrigger value="posts">Recent Posts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Accounts Overview Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <Card key={account.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg text-white ${platformColors[account.platform]}`}
                        >
                          {platformIcons[account.platform]}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{account.displayName}</CardTitle>
                          <CardDescription>@{account.username}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {account.verified && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Verified
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAccount(account.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(account.followers)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(account.following)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(account.posts)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Last updated: {formatDate(account.lastUpdated)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRefreshData(account.id)}
                        disabled={isLoading}
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recent Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentPosts.map((post) => {
                const account = accounts.find((acc) => acc.id === post.accountId);
                return (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg text-white ${account ? platformColors[account.platform] : "bg-gray-500"}`}
                          >
                            {account ? (
                              platformIcons[account.platform]
                            ) : (
                              <Twitter className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {account?.displayName || "Unknown Account"}
                            </CardTitle>
                            <CardDescription>@{account?.username || "unknown"}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {post.engagement}% engagement
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>

                      {post.media && post.media.length > 0 && (
                        <div className="mb-4">
                          <img
                            src={post.media[0]}
                            alt="Post media"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Heart className="h-4 w-4" />
                          <span>{formatNumber(post.likes)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <MessageCircle className="h-4 w-4" />
                          <span>{formatNumber(post.comments)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Share2 className="h-4 w-4" />
                          <span>{formatNumber(post.shares)}</span>
                        </div>
                        {post.views && (
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <Eye className="h-4 w-4" />
                            <span>{formatNumber(post.views)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(post.timestamp)}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Followers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics ? formatNumber(analytics.totalFollowers) : "0"}
                  </div>
                  <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics ? formatNumber(analytics.totalPosts) : "0"}
                  </div>
                  <p className="text-xs text-blue-600 mt-1">+8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics ? analytics.avgEngagement.toFixed(1) : "0"}%
                  </div>
                  <p className="text-xs text-purple-600 mt-1">+3% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Reach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics ? formatNumber(analytics.totalReach) : "0"}
                  </div>
                  <p className="text-xs text-orange-600 mt-1">+15% from last month</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
                <CardDescription>Track your social media performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                    <p>Engagement chart will be displayed here</p>
                    <p className="text-sm">Connect to analytics APIs to see real data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SocialMediaAnalytics;
