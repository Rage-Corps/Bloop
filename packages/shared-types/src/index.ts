// Base Media type from database schema
export interface Media {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  pageUrl: string;
  createdAt: string | null; // Always string in API responses
  dateAdded?: string | null;
  duration?: string | null;
  rawDescriptionDiv?: string | null;
}

// Cast member type
export interface CastMember {
  id: string;
  name: string;
  imageUrl?: string | null;
  createdAt: string | null;
}

// Source type from database schema
export interface Source {
  id: string;
  mediaId: string;
  sourceName: string;
  url: string;
  createdAt: string | null; // Always string in API responses
}

// Category type from database schema
export interface Category {
  id: string;
  mediaId: string;
  category: string;
  createdAt: string | null; // Always string in API responses
}

// Media with metadata (sources, categories, and cast)
export interface MediaWithMetadata extends Media {
  sources?: Source[];
  categories?: string[]; // Array of category strings for frontend use
  cast?: string[]; // Array of cast member names for frontend use
}

// API Response types
export interface MediaListResponse {
  data: MediaWithMetadata[];
  total: number;
  limit: number;
  offset: number;
}

export interface CastListResponse {
  data: CastMember[];
  total: number;
}

// Query parameters for media API
export interface MediaQuery {
  limit?: number;
  offset?: number;
  name?: string;
  categories?: string[];
  sources?: string[];
  cast?: string[];
  excludedCategories?: string[];
}

// Create media input
export interface CreateMediaInput {
  name: string;
  description: string;
  thumbnailUrl: string;
  pageUrl: string;
  dateAdded?: string;
  duration?: string;
  rawDescriptionDiv?: string;
  cast?: string[];
  sources?: Array<{
    sourceName: string;
    url: string;
  }>;
  categories?: string[];
}

// Update media input
export interface UpdateMediaInput {
  name?: string;
  description?: string;
  thumbnailUrl?: string;
  pageUrl?: string;
  dateAdded?: string;
  duration?: string;
  rawDescriptionDiv?: string;
  cast?: string[];
}

// Auth types (from better-auth)
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  updatedAt: string;
}

// User Config types
export interface UserPreferences {
  excludedCategories?: string[];
  preferredSource?: string;
  itemsPerPage?: number;
}

export interface UserConfig {
  id: string;
  userId: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

// API Error response
export interface ApiError {
  error: string;
  code?: number;
}

// Watchlist types
export interface WatchlistItem {
  id: string;
  userId: string;
  mediaId: string;
  createdAt: string | null;
}

export interface WatchlistStatus {
  mediaId: string;
  isInWatchlist: boolean;
}
