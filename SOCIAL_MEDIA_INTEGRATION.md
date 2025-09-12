# Social Media Analytics Integration Guide

This guide explains how to integrate real social media APIs with the Social Media Analytics feature.

## Current Implementation

The Social Media Analytics feature is currently implemented with mock data. To connect to real social media platforms, you'll need to integrate with their respective APIs.

## Supported Platforms

The system is designed to support:
- **Twitter/X** - Twitter API v2
- **Instagram** - Instagram Basic Display API / Instagram Graph API
- **Facebook** - Facebook Graph API
- **YouTube** - YouTube Data API v3

## API Integration Steps

### 1. Twitter/X Integration

#### Setup
1. Create a Twitter Developer account
2. Create a new app in the Twitter Developer Portal
3. Generate API keys and bearer token
4. Add environment variables to your `.env` file:

```env
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
```

#### Implementation
Update `server/routes/social-media-analytics.ts`:

```typescript
import { TwitterApi } from 'twitter-api-v2';

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
});

export const addTwitterAccount = async (username: string) => {
  try {
    const user = await twitterClient.v2.userByUsername(username);
    const tweets = await twitterClient.v2.userTimeline(user.data.id, {
      max_results: 10,
      'tweet.fields': ['public_metrics', 'created_at']
    });

    return {
      id: user.data.id,
      platform: 'twitter',
      username: user.data.username,
      displayName: user.data.name,
      followers: user.data.public_metrics?.followers_count || 0,
      following: user.data.public_metrics?.following_count || 0,
      posts: user.data.public_metrics?.tweet_count || 0,
      verified: user.data.verified || false,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    throw new Error('Failed to fetch Twitter account data');
  }
};
```

### 2. Instagram Integration

#### Setup
1. Create a Facebook Developer account
2. Create a new app and add Instagram Basic Display product
3. Generate access tokens
4. Add environment variables:

```env
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_ACCESS_TOKEN=your_access_token
```

#### Implementation
```typescript
export const addInstagramAccount = async (username: string) => {
  try {
    const response = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count,followers_count,follows_count&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`);
    const data = await response.json();

    return {
      id: data.id,
      platform: 'instagram',
      username: data.username,
      displayName: data.username,
      followers: data.followers_count || 0,
      following: data.follows_count || 0,
      posts: data.media_count || 0,
      verified: false,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    throw new Error('Failed to fetch Instagram account data');
  }
};
```

### 3. YouTube Integration

#### Setup
1. Create a Google Cloud project
2. Enable YouTube Data API v3
3. Create credentials (API key or OAuth 2.0)
4. Add environment variables:

```env
YOUTUBE_API_KEY=your_api_key
```

#### Implementation
```typescript
export const addYouTubeAccount = async (channelId: string) => {
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${process.env.YOUTUBE_API_KEY}`);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const channel = data.items[0];
      return {
        id: channel.id,
        platform: 'youtube',
        username: channel.snippet.customUrl || channel.snippet.title,
        displayName: channel.snippet.title,
        followers: parseInt(channel.statistics.subscriberCount) || 0,
        following: 0, // YouTube doesn't provide following count
        posts: parseInt(channel.statistics.videoCount) || 0,
        verified: false,
        lastUpdated: new Date().toISOString()
      };
    }
    throw new Error('Channel not found');
  } catch (error) {
    throw new Error('Failed to fetch YouTube channel data');
  }
};
```

## Database Integration

### Recommended Database Schema

```sql
-- Social Media Accounts Table
CREATE TABLE social_media_accounts (
  id VARCHAR(255) PRIMARY KEY,
  platform ENUM('twitter', 'instagram', 'facebook', 'youtube') NOT NULL,
  username VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  posts_count INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_platform_username (platform, username)
);

-- Social Media Posts Table
CREATE TABLE social_media_posts (
  id VARCHAR(255) PRIMARY KEY,
  account_id VARCHAR(255) NOT NULL,
  content TEXT,
  media_urls JSON,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  posted_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES social_media_accounts(id) ON DELETE CASCADE
);

-- Analytics Summary Table
CREATE TABLE analytics_summary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  followers_count INT DEFAULT 0,
  posts_count INT DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  reach_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES social_media_accounts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_account_date (account_id, date)
);
```

## Rate Limiting and Caching

### Rate Limiting
Most social media APIs have rate limits. Implement proper rate limiting:

```typescript
import rateLimit from 'express-rate-limit';

const socialMediaRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/social-media', socialMediaRateLimit);
```

### Caching
Implement caching to reduce API calls:

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

export const getCachedAccountData = async (accountId: string) => {
  const cached = cache.get(accountId);
  if (cached) {
    return cached;
  }

  const data = await fetchAccountData(accountId);
  cache.set(accountId, data);
  return data;
};
```

## Error Handling

Implement comprehensive error handling:

```typescript
export const handleSocialMediaError = (error: any, platform: string) => {
  if (error.status === 401) {
    return 'Authentication failed. Please check your API credentials.';
  } else if (error.status === 403) {
    return 'Access forbidden. Check your API permissions.';
  } else if (error.status === 429) {
    return 'Rate limit exceeded. Please try again later.';
  } else if (error.status === 404) {
    return `${platform} account not found.`;
  } else {
    return `Failed to fetch ${platform} data. Please try again.`;
  }
};
```

## Security Considerations

1. **API Keys**: Store API keys securely in environment variables
2. **Rate Limiting**: Implement proper rate limiting to avoid API abuse
3. **Data Validation**: Validate all incoming data from social media APIs
4. **Error Messages**: Don't expose sensitive information in error messages
5. **HTTPS**: Always use HTTPS for API communications

## Testing

Create comprehensive tests for your integrations:

```typescript
describe('Social Media Analytics', () => {
  test('should fetch Twitter account data', async () => {
    const mockData = { /* mock Twitter API response */ };
    jest.spyOn(twitterClient.v2, 'userByUsername').mockResolvedValue(mockData);
    
    const result = await addTwitterAccount('testuser');
    expect(result.platform).toBe('twitter');
    expect(result.username).toBe('testuser');
  });

  test('should handle API errors gracefully', async () => {
    jest.spyOn(twitterClient.v2, 'userByUsername').mockRejectedValue(new Error('API Error'));
    
    await expect(addTwitterAccount('invaliduser')).rejects.toThrow('Failed to fetch Twitter account data');
  });
});
```

## Deployment

1. **Environment Variables**: Ensure all API keys are set in production
2. **Database**: Set up your database with the required schema
3. **Monitoring**: Implement monitoring for API usage and errors
4. **Backup**: Set up regular backups of your analytics data

## Next Steps

1. Choose which social media platforms to integrate first
2. Set up developer accounts and obtain API credentials
3. Implement the database schema
4. Update the API routes with real integrations
5. Add proper error handling and rate limiting
6. Test thoroughly before deploying to production

## Resources

- [Twitter API Documentation](https://developer.twitter.com/en/docs)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [YouTube Data API](https://developers.google.com/youtube/v3)
