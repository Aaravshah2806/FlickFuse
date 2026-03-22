export type ContentType = 'movie' | 'series';
export type PrivacySetting = 'public' | 'friends' | 'private';
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';
export type VisibilityLevel = 'public' | 'friends' | 'private';
export type RecommendationStatus = 'pending' | 'accepted' | 'rejected' | 'watched';

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  unique_id: string;
  privacy_setting: PrivacySetting;
  created_at: string;
  updated_at: string;
}

export interface Platform {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
}

export interface Genre {
  id: string;
  name: string;
  created_at: string;
}

export interface Content {
  id: string;
  title: string;
  content_type: ContentType;
  description: string | null;
  poster_url: string | null;
  release_year: number | null;
  platform_id: string | null;
  tmdb_id: number | null;
  created_at: string;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  platform_id: string | null;
  content_id: string | null;
  content_title: string;
  content_type: ContentType;
  watched_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Recommendation {
  id: string;
  user_id: string;
  content_id: string;
  match_score: number;
  reason: string | null;
  status: RecommendationStatus;
  created_at: string;
  content?: Content;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  friend?: Profile;
}

export interface List {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  visibility: VisibilityLevel;
  created_at: string;
  updated_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  content_id: string;
  position: number;
  added_at: string;
  content?: Content;
}

export interface UserPreferences {
  user_id: string;
  preferred_content_types: ContentType[];
  preferred_languages: string[];
  exclude_watched: boolean;
  updated_at: string;
}

export interface TrendingItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

export interface SearchContent {
  id: string;
  title: string;
  poster_url: string | null;
  release_year: number | null;
  content_type: ContentType;
}
