import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Event = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  location_id?: string;
  responsible_id: string;
  responsible_name?: string;
  work_fronts?: WorkFront[];
  created_at?: string;
}

export type WorkFront = {
  id: string;
  event_id: string;
  name: string;
  description: string;
  created_at?: string;
}

export type Location = {
  id: string;
  name: string;
  address: string;
  created_at?: string;
}

export type UserRole = 'admin' | 'secretary' | 'user';

export type User = {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  created_at?: string;
}

export type ParticipantFeedback = {
  id: string;
  event_id: string;
  name: string;
  email: string;
  enjoyed_art: number;
  enjoyed_food: number;
  enjoyed_group: number;
  enjoyed_conversations: number;
  comments: string;
  created_at?: string;
}

export type OrganizerFeedback = {
  id: string;
  event_id: string;
  organizer_name: string;
  total_expenses: number;
  volunteers: string[];
  challenges: string;
  suggestions: string;
  created_at?: string;
}
