import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

export type LeaderboardRow = {
	name: string;
	posts_created: number;
	color?: string;
};

export type LongestStreakRow = {
	name: string;
	longest_streak: number;
};

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
