// ─── Enums ────────────────────────────────────────────────────────────────────

export type FootSide = 'L' | 'R' | 'single';

export type ListingCondition =
  | 'new_with_tags'
  | 'new_without_tags'
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor';

export type ListingStatus = 'active' | 'matched' | 'sold';

export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

// ─── Domain Models ────────────────────────────────────────────────────────────

export interface User {
  id: string;            // UUID — mirrors Supabase auth.users.id
  email: string;
  name: string | null;
  avatar_url: string | null;
  foot_size_left: number | null;
  foot_size_right: number | null;
  is_amputee: boolean;
  location: string | null;
  stripe_account_id: string | null;
  created_at: string;    // ISO 8601
}

export interface Listing {
  id: string;            // UUID
  user_id: string;
  shoe_brand: string;
  shoe_model: string;
  size: number;
  foot_side: FootSide;
  condition: ListingCondition;
  price: number;         // dollars.cents (NUMERIC 10,2)
  photos: string[];
  status: ListingStatus;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;            // UUID
  listing_a_id: string;
  listing_b_id: string;
  status: MatchStatus;
  created_at: string;
  updated_at: string;
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateListingBody {
  shoe_brand: string;
  shoe_model: string;
  size: number;
  foot_side: FootSide;
  condition: ListingCondition;
  price: number;
  photos?: string[];
}

export interface UpdateListingBody {
  shoe_brand?: string;
  shoe_model?: string;
  size?: number;
  foot_side?: FootSide;
  condition?: ListingCondition;
  price?: number;
  photos?: string[];
  status?: ListingStatus;
}

export interface UpdateUserBody {
  name?: string;
  avatar_url?: string;
  foot_size_left?: number;
  foot_size_right?: number;
  is_amputee?: boolean;
  location?: string;
}

export interface AuthSignUpBody {
  email: string;
  password: string;
  name?: string;
}

export interface AuthSignInBody {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}
