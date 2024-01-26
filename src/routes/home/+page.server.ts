import moment from 'moment-timezone';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data, error } = await supabase.from('users').select('*');
	if (error) {
		throw new Error(error.message);
	}

	const now = moment.utc();

	// sanitize data
	data.forEach((user) => {
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

	console.log(data);
	return { posts: data };
};
