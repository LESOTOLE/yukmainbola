export type UserRole = "super_admin" | "admin" | "member" | "guest";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  maps_url: string | null;
  image_url: string | null;
  facilities: string[];
  created_at: string;
}

export interface Schedule {
  id: string;
  venue_id: string;
  date: string;
  start_time: string;
  end_time: string;
  max_players: number;
  current_players: number;
  price_per_person: number;
  status: "open" | "full" | "cancelled" | "completed";
  created_at: string;
}

export interface ScheduleWithVenue extends Schedule {
  venues: Venue;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

export interface Testimonial {
  id: string;
  user_id: string;
  content: string;
  rating: number;
  created_at: string;
}

export interface TestimonialWithProfile extends Testimonial {
  profiles: Pick<Profile, "full_name" | "avatar_url">;
}
