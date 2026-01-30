/**
 * TypeScript types for FBLA Engage Supabase Database
 * Generated from schema.sql - Version 2.0
 */

// ============================================================================
// ENUM TYPES
// ============================================================================

export type MediaType = "image" | "video" | "document";
export type ResourceType = "pdf" | "link" | "video";
export type EventLevel = "regional" | "state" | "national";
export type ChatType = "direct" | "group" | "school";
export type ReportTargetType = "post" | "comment" | "student";

// ============================================================================
// JSONB TYPES
// ============================================================================

export interface Award {
  title: string;
  event: string;
  icon: string;
}

// ============================================================================
// DATABASE TABLE TYPES
// ============================================================================

// Schools Table
export interface School {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  email: string | null;
  image: string | null;
  banner: string | null;
  member_count: number;
  established_at: string | null; // ISO timestamp
}

export interface SchoolInsert {
  id?: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  email?: string | null;
  image?: string | null;
  banner?: string | null;
  member_count?: number;
  established_at?: string | null;
}

export interface SchoolUpdate {
  name?: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  email?: string | null;
  image?: string | null;
  banner?: string | null;
  member_count?: number;
  established_at?: string | null;
}

// Students Table
export interface Student {
  id: string; // Matches auth.users.id
  name: string;
  email: string;
  school_id: string | null;
  bio: string | null;
  image: string | null;
  banner: string | null;
  awards: Award[];
  interests: string[];
  follower_count: number;
  following_count: number;
  created_at: string; // ISO timestamp
}

export interface StudentInsert {
  id: string;
  name: string;
  email: string;
  school_id?: string | null;
  bio?: string | null;
  image?: string | null;
  banner?: string | null;
  awards?: Award[];
  interests?: string[];
  follower_count?: number;
  following_count?: number;
  created_at?: string;
}

export interface StudentUpdate {
  name?: string;
  email?: string;
  school_id?: string | null;
  bio?: string | null;
  image?: string | null;
  banner?: string | null;
  awards?: Award[];
  interests?: string[];
  follower_count?: number;
  following_count?: number;
}

// School Roles Table
export interface SchoolRole {
  id: string;
  student_id: string;
  school_id: string;
  role: string;
}

export interface SchoolRoleInsert {
  id?: string;
  student_id: string;
  school_id: string;
  role: string;
}

export interface SchoolRoleUpdate {
  role?: string;
}

// Events Table
export interface Event {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  organizer_id: string | null;
  start_date: string; // ISO timestamp
  end_date: string; // ISO timestamp
  location: string;
  level: EventLevel;
}

export interface EventInsert {
  id?: string;
  title: string;
  description?: string | null;
  image?: string | null;
  organizer_id?: string | null;
  start_date: string;
  end_date: string;
  location: string;
  level: EventLevel;
}

export interface EventUpdate {
  title?: string;
  description?: string | null;
  image?: string | null;
  organizer_id?: string | null;
  start_date?: string;
  end_date?: string;
  location?: string;
  level?: EventLevel;
}

// Event Registrations Table
export interface EventRegistration {
  event_id: string;
  student_id: string;
  created_at: string; // ISO timestamp
}

export interface EventRegistrationInsert {
  event_id: string;
  student_id: string;
  created_at?: string;
}

// Posts Table
export interface Post {
  id: string;
  content: string;
  author_id: string;
  like_count: number;
  comment_count: number;
  created_at: string; // ISO timestamp
}

export interface PostInsert {
  id?: string;
  content: string;
  author_id: string;
  like_count?: number;
  comment_count?: number;
  created_at?: string;
}

export interface PostUpdate {
  content?: string;
  like_count?: number;
  comment_count?: number;
}

// Media Table
export interface Media {
  id: string;
  url: string;
  type: MediaType;
  name: string | null;
  post_id: string;
}

export interface MediaInsert {
  id?: string;
  url: string;
  type: MediaType;
  name?: string | null;
  post_id: string;
}

export interface MediaUpdate {
  url?: string;
  type?: MediaType;
  name?: string | null;
}

// Comments Table
export interface Comment {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  created_at: string; // ISO timestamp
}

export interface CommentInsert {
  id?: string;
  content: string;
  author_id: string;
  post_id: string;
  created_at?: string;
}

export interface CommentUpdate {
  content?: string;
}

// Likes Table
export interface Like {
  user_id: string;
  post_id: string;
  created_at: string; // ISO timestamp
}

export interface LikeInsert {
  user_id: string;
  post_id: string;
  created_at?: string;
}

// Student Follows Table
export interface StudentFollow {
  follower_id: string;
  following_id: string;
}

export interface StudentFollowInsert {
  follower_id: string;
  following_id: string;
}

// Chats Table
export interface Chat {
  id: string;
  type: ChatType;
  name: string | null;
  image: string | null;
  created_by: string | null;
  created_at: string; // ISO timestamp
}

export interface ChatInsert {
  id?: string;
  type?: ChatType;
  name?: string | null;
  image?: string | null;
  created_by?: string | null;
  created_at?: string;
}

export interface ChatUpdate {
  type?: ChatType;
  name?: string | null;
  image?: string | null;
  created_by?: string | null;
}

// Chat Participants Table
export interface ChatParticipant {
  chat_id: string;
  student_id: string;
}

export interface ChatParticipantInsert {
  chat_id: string;
  student_id: string;
}

// Messages Table
export interface Message {
  id: string;
  content: string;
  author_id: string;
  chat_id: string;
  created_at: string; // ISO timestamp
}

export interface MessageInsert {
  id?: string;
  content: string;
  author_id: string;
  chat_id: string;
  created_at?: string;
}

export interface MessageUpdate {
  content?: string;
}

// Chat Requests Table (DM request–accept flow)
export interface ChatRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  updated_at: string;
}

export interface ChatRequestInsert {
  id?: string;
  requester_id: string;
  recipient_id: string;
  status?: "pending" | "accepted" | "declined";
  created_at?: string;
  updated_at?: string;
}

export interface ChatRequestWithRequester extends ChatRequest {
  requester: Student;
}

// Resource Categories Table
export interface ResourceCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export interface ResourceCategoryInsert {
  id?: string;
  name: string;
  description?: string | null;
  icon?: string | null;
}

export interface ResourceCategoryUpdate {
  name?: string;
  description?: string | null;
  icon?: string | null;
}

// Resources Table
export interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: ResourceType;
  url: string | null;
  event_name: string | null; // Links to FBLA event name
  category_id: string | null;
  downloads: number;
  created_at: string; // ISO timestamp
  updated_at: string | null; // ISO timestamp
}

export interface ResourceInsert {
  id?: string;
  title: string;
  description?: string | null;
  type: ResourceType;
  url?: string | null;
  event_name?: string | null;
  category_id?: string | null;
  downloads?: number;
  created_at?: string;
  updated_at?: string | null;
}

export interface ResourceUpdate {
  title?: string;
  description?: string | null;
  type?: ResourceType;
  url?: string | null;
  event_name?: string | null;
  category_id?: string | null;
  downloads?: number;
  updated_at?: string | null;
}

// Notifications Table
export interface Notification {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string; // ISO timestamp
}

export interface NotificationInsert {
  id?: string;
  recipient_id: string;
  title: string;
  message: string;
  is_read?: boolean;
  created_at?: string;
}

export interface NotificationUpdate {
  title?: string;
  message?: string;
  is_read?: boolean;
}

// Reports Table
export interface Report {
  id: string;
  reporter_id: string | null;
  target_type: ReportTargetType;
  target_id: string;
  reason: string | null;
  created_at: string; // ISO timestamp
}

export interface ReportInsert {
  id?: string;
  reporter_id?: string | null;
  target_type: ReportTargetType;
  target_id: string;
  reason?: string | null;
  created_at?: string;
}

export interface ReportUpdate {
  reporter_id?: string | null;
  target_type?: ReportTargetType;
  target_id?: string;
  reason?: string | null;
}

// User Preferences Table
export type ThemeMode = "light" | "dark" | "high-contrast";

export interface UserPreferences {
  id: string;
  student_id: string;
  theme: ThemeMode;
  font_size: "small" | "medium" | "large" | "extra-large";
  high_contrast: boolean;
  reduced_motion: boolean;
  screen_reader_optimized: boolean;
  keyboard_navigation_enhanced: boolean;
  color_blind_mode: "none" | "protanopia" | "deuteranopia" | "tritanopia";
  created_at: string;
  updated_at: string;
}

export interface UserPreferencesInsert {
  id?: string;
  student_id: string;
  theme?: ThemeMode;
  font_size?: "small" | "medium" | "large" | "extra-large";
  high_contrast?: boolean;
  reduced_motion?: boolean;
  screen_reader_optimized?: boolean;
  keyboard_navigation_enhanced?: boolean;
  color_blind_mode?: "none" | "protanopia" | "deuteranopia" | "tritanopia";
}

export interface UserPreferencesUpdate {
  theme?: ThemeMode;
  font_size?: "small" | "medium" | "large" | "extra-large";
  high_contrast?: boolean;
  reduced_motion?: boolean;
  screen_reader_optimized?: boolean;
  keyboard_navigation_enhanced?: boolean;
  color_blind_mode?: "none" | "protanopia" | "deuteranopia" | "tritanopia";
}

// ============================================================================
// RELATIONAL TYPES (with joins)
// ============================================================================

// Post with author and media
export interface PostWithRelations extends Post {
  author: StudentWithRelations;
  media: Media[];
}

// Post with author, media, comments, and likes
export interface PostWithFullRelations extends Post {
  author: Student;
  media: Media[];
  comments: (Comment & { author: Student })[];
  likes: Like[];
}

// Comment with author
export interface CommentWithAuthor extends Comment {
  author: Student;
}

// Student with school
export interface StudentWithSchool extends Student {
  school: School | null;
}

// Student with school and roles
export interface StudentWithRelations extends Student {
  school: School | null;
  school_roles: SchoolRole[];
}

// Event with organizer
export interface EventWithOrganizer extends Event {
  organizer: School | null;
}

// Event with organizer and registrations
export interface EventWithRelations extends Event {
  organizer: School | null;
  registrations: (EventRegistration & { student: Student })[];
}

// Chat with participants and messages
export interface ChatWithRelations extends Chat {
  participants: (ChatParticipant & { student: Student })[];
  messages: (Message & { author: Student })[];
}

// Message with author
export interface MessageWithAuthor extends Message {
  author: Student;
}

// Resource with category
export interface ResourceWithCategory extends Resource {
  category: ResourceCategory | null;
}

// Notification with recipient (optional, usually not needed)
export interface NotificationWithRecipient extends Notification {
  recipient: Student;
}

// ============================================================================
// SUPABASE DATABASE TYPE (for type-safe client)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: School;
        Insert: SchoolInsert;
        Update: SchoolUpdate;
        Relationships: [];
      };
      students: {
        Row: Student;
        Insert: StudentInsert;
        Update: StudentUpdate;
        Relationships: [];
      };
      school_roles: {
        Row: SchoolRole;
        Insert: SchoolRoleInsert;
        Update: SchoolRoleUpdate;
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: EventInsert;
        Update: EventUpdate;
        Relationships: [];
      };
      event_registrations: {
        Row: EventRegistration;
        Insert: EventRegistrationInsert;
        Update: EventRegistrationInsert;
        Relationships: [];
      };
      posts: {
        Row: Post;
        Insert: PostInsert;
        Update: PostUpdate;
        Relationships: [];
      };
      media: {
        Row: Media;
        Insert: MediaInsert;
        Update: MediaUpdate;
        Relationships: [];
      };
      comments: {
        Row: Comment;
        Insert: CommentInsert;
        Update: CommentUpdate;
        Relationships: [];
      };
      likes: {
        Row: Like;
        Insert: LikeInsert;
        Update: LikeInsert;
        Relationships: [];
      };
      student_follows: {
        Row: StudentFollow;
        Insert: StudentFollowInsert;
        Update: StudentFollowInsert;
        Relationships: [];
      };
      chats: {
        Row: Chat;
        Insert: ChatInsert;
        Update: ChatUpdate;
        Relationships: [];
      };
      chat_participants: {
        Row: ChatParticipant;
        Insert: ChatParticipantInsert;
        Update: ChatParticipantInsert;
        Relationships: [];
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: MessageUpdate;
        Relationships: [];
      };
      resource_categories: {
        Row: ResourceCategory;
        Insert: ResourceCategoryInsert;
        Update: ResourceCategoryUpdate;
        Relationships: [];
      };
      resources: {
        Row: Resource;
        Insert: ResourceInsert;
        Update: ResourceUpdate;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
        Relationships: [];
      };
      reports: {
        Row: Report;
        Insert: ReportInsert;
        Update: ReportUpdate;
        Relationships: [];
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: UserPreferencesInsert;
        Update: UserPreferencesUpdate;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      media_type: MediaType;
      resource_type: ResourceType;
      event_level: EventLevel;
      chat_type: ChatType;
      report_target_type: ReportTargetType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
