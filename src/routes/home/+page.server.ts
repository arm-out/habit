import moment from 'moment-timezone';
import type { PageServerLoad } from './$types';

export type Post = {
	last_caption: string;
	last_image: string;
	last_post: string;
	name: string;
	streak: number;
	tz: string;
};

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data, error } = await supabase.from('users').select('*');
	if (error) {
		throw new Error(error.message);
	}

	const now = moment.utc();

	// sanitize data
	data.forEach((user: Post) => {
		const lastTimestamp = moment.utc(user.last_post);

		const diff = now.diff(lastTimestamp, 'days');

		user.last_image =
			'https://jyjpcrzdbqygrkxvcnpt.supabase.co/storage/v1/object/public/images/' +
			user.last_image +
			'?width=900';

		if (diff >= 2) {
			user.streak = 0;
			user.last_image = '';
		}
	});

	// sort by most recent post
	data.sort((a: Post, b: Post) => {
		// Convert time strings back to moment objects
		const momentA = moment.utc(a.last_post);
		const momentB = moment.utc(b.last_post);

		// Compare the two moments
		if (momentA.isBefore(momentB)) {
			return 1; // Return 1 if a is before b, to sort in descending order
		} else if (momentA.isAfter(momentB)) {
			return -1; // Return -1 if a is after b
		} else {
			return 0; // Return 0 if they are the same time
		}
	});

	return { posts: data };
};
