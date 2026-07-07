export interface IgDailyRow {
    date: string;
    followers: number;
    impressions: number;
    reach: number;
}

export interface IgMediaRow {
    id: string;
    caption: string;
    mediaType: string;
    mediaProductType: string;
    mediaUrl: string;
    thumbnailUrl: string;
    permalink: string;
    timestamp: string;
    likeCount: number;
    commentsCount: number;
}

export interface IgReelRow {
    id: string;
    caption: string;
    thumbnailUrl: string;
    permalink: string;
    timestamp: string;
    likeCount: number;
    commentsCount: number;
    plays: number;
    reach: number;
    saved: number;
    shares: number;
}

export interface IgOverviewResponse {
    connected: boolean;
    username: string | null;
    errorMessage: string | null;
    followersCount: number;
    followsCount: number;
    mediaCount: number;
    impressions: number;
    reach: number;
    profileViews: number;
    websiteClicks: number;
    totalLikes: number;
    totalComments: number;
    followersGained: number;
    followersLost: number;
    dailyTrend: IgDailyRow[];
    recentMedia: IgMediaRow[];
}

export interface IgStatusResponse {
    configured: boolean;
    connected: boolean;
    authUrl: string;
    username: string;
    igUserId: string;
}

export interface IgPostRow {
    id: string;
    caption: string;
    mediaType: string;
    mediaUrl: string;
    permalink: string;
    timestamp: string;
    likeCount: number;
    commentsCount: number;
    impressions: number;
    reach: number;
    saved: number;
    shares: number;
}
