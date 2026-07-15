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
  points_balance?: number;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'earned' | 'redeemed' | 'refunded';
  reference_id: string | null;
  description: string | null;
  created_at: string;
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

export interface Booking {
  id: string;
  schedule_id: string;
  user_id: string;
  status: "booked" | "cancelled";
  quantity: number;
  guest_names: string[];
  payment_status: "pending" | "paid" | "failed" | "expired";
  snap_token: string | null;
  order_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithSchedule extends Booking {
  schedules: ScheduleWithVenue;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  venue_id: string | null;
  max_participants: number;
  current_participants: number;
  price: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  created_at: string;
}

export interface EventWithVenue extends Event {
  venues: Venue | null;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: "registered" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "expired";
  snap_token: string | null;
  order_id: string | null;
  created_at: string;
}

export interface EventParticipantWithEvent extends EventParticipant {
  events: EventWithVenue;
}
