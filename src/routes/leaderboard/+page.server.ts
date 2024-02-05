import moment from 'moment-timezone';
import type { PageServerLoad } from './$types';
import type { LeaderboardRow, LongestStreakRow } from '$lib/supabase';

const colors = {
	arm: '#888EB2',
	rak: '#A3B288',
	bron: '#7dd3fc',
	eden: '#f9a8d4'
};

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const now = moment.utc();

	const getLeaderBoard = async () => {
		return supabase.from('leaderboard').select('*').order('posts_created', { ascending: false });
	};

	const getLongestStreak = async () => {
		return supabase.from('users').select('name, longest_streak');
	};

	const payload = await Promise.all([getLeaderBoard(), getLongestStreak()])
		.catch((error) => {
			throw new Error(error.message);
		})
		.then((data) => {
			const leaderboard = data[0].data as LeaderboardRow[];
			const longestStreak = data[1].data as LongestStreakRow[];

			const names = leaderboard.map((row: LeaderboardRow) => row.name);
			for (const name of Object.keys(colors)) {
				if (!names.includes(name)) {
					leaderboard.push({ name, posts_created: 0 });
				}
			}
			// Colors
			for (const row of leaderboard) {
				row.color = colors[row.name as keyof typeof colors];
			}

			return { leaderboard, longestStreak };
		});

	return {
		month: now.format('MMMM'),
		leaderboard: payload.leaderboard,
		longestStreak: payload.longestStreak
	};
};
