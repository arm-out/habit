<script lang="ts">
	import moment from 'moment-timezone';
	import { onMount } from 'svelte';
	import Modal from './Modal.svelte';
	import { nanoid } from 'nanoid';
	import { toast } from '@zerodevx/svelte-toast';
	import Card from './Card.svelte';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	let posts = data.posts;

	let input: HTMLInputElement;
	let preview: HTMLImageElement;
	let reader: FileReader;
	let file: File | null;
	let showModal = false;
	let currUser = '';
	let caption = '';
	let filetype = '';

	function onChange() {
		file = input.files![0];

		if (file) {
			filetype = file.type.split('/')[1];
			reader.addEventListener('load', function () {
				preview.setAttribute('src', reader.result as string);
			});
			reader.readAsDataURL(file);
			showModal = true;
			return;
		}
	}

	async function handlePost(e: CustomEvent) {
		let newStreak: number;
		let newTz: string;
		let newLongestStreak: number;

		for (let i = 0; i < posts.length; i++) {
			if (posts[i].name === e.detail.user) {
				if (posts[i].streak === 0) {
					posts[i].streak = 1;
				} else {
					const prevDate = moment(posts[i].last_post).tz(posts[i].tz).date();
					const currDate = moment.utc().tz(posts[i].tz).date();

					if (prevDate != currDate) {
						posts[i].streak++;
					}
				}

				posts[i].last_image = reader.result as string;
				posts[i].last_caption = e.detail.caption;
				posts[i].last_post = moment.utc().format();
				posts[i].longest_streak = Math.max(posts[i].streak, posts[i].longest_streak);

				newStreak = posts[i].streak;
				newTz = posts[i].tz;
				newLongestStreak = posts[i].longest_streak;

				// Move the post to the front of the array
				const postToUpdate = posts.splice(i, 1)[0]; // Remove the post and store it
				posts.unshift(postToUpdate); // Add the removed post to the beginning of the array
				break;
			}
		}

		showModal = false;
		caption = '';
		const now = moment.utc().format();

		// Upload File
		const filename = nanoid(10) + '.' + filetype;
		const path = e.detail.user + '/' + filename;

		let uploadImage = async (path: string, file: File) => {
			return supabase.storage.from('images').upload(path, file!);
		};

		// Upload Post Data
		const postData = {
			name: e.detail.user,
			created_at: now,
			image: path,
			caption: e.detail.caption
		};

		let insertPost = async (postData: any) => {
			return supabase.from('posts').insert(postData);
		};

		const userData = {
			name: e.detail.user,
			streak: newStreak!,
			tz: newTz!,
			last_post: now,
			last_image: path,
			last_caption: e.detail.caption,
			longest_streak: newLongestStreak!
		};

		let updateUser = async (userData: any) => {
			return supabase.from('users').upsert(userData);
		};

		const id = toast.push('Uploading...', {
			theme: {
				'--toastBarHeight': 0
			},
			initial: 0
		});

		await Promise.all([uploadImage(path, file!), insertPost(postData), updateUser(userData)])
			.catch((err) => {
				console.error(err);
				toast.pop(id);
				alert(err);
			})
			.then(() => {
				console.log('finished uploading');
				toast.pop(id);
			});

		file = null;
		filetype = '';
		currUser = '';
		preview.setAttribute('src', '');
	}

	let winNav: any;
	let isInWebAppiOS;
	let isInWebAppChrome;
	let extraPadding: string;

	onMount(() => {
		reader = new FileReader();

		winNav = window.navigator;
		isInWebAppiOS = winNav === true;
		isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;
		extraPadding = isInWebAppiOS || isInWebAppChrome ? 'pb-8' : '';
	});

	// const handleSignOut = async () => {
	// 	await supabase.auth.signOut();
	// };
</script>

<main class="h-[100dvh] flex flex-col max-w-[35rem] p-2 gap-2 overflow-y-scroll {extraPadding}">
	<nav class="py-2 flex flex-row justify-between items-center">
		<a href="/home"
			><h1 class="text-[#78866B] font-extrabold text-4xl inline-block">habitsnap.</h1></a
		>
		<a href="/leaderboard">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="#475569"
				width="1.75rem"
				height="1.75rem"
				class="mr-2"
				viewBox="0 0 24 24"
				><path
					d="M22,7H16.333V4a1,1,0,0,0-1-1H8.667a1,1,0,0,0-1,1v7H2a1,1,0,0,0-1,1v8a1,1,0,0,0,1,1H22a1,1,0,0,0,1-1V8A1,1,0,0,0,22,7ZM7.667,19H3V13H7.667Zm6.666,0H9.667V5h4.666ZM21,19H16.333V9H21Z"
				/></svg
			>
		</a>
	</nav>

	{#each posts as post (post.name)}
		<Card {...post} />
	{/each}
</main>

<label class="cursor-pointer absolute bottom-8 left-[calc(50vw-2.5rem)]">
	<input bind:this={input} type="file" accept="image/*" class="hidden" on:change={onChange} />

	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		fill="#fff"
		width="5rem"
		height="5rem"
		viewBox="0 0 595.021 595.021"
		xml:space="preserve"
	>
		<g>
			<g>
				<g>
					<path
						d="M507.529,87.493c-27.264-27.264-59.022-48.672-94.396-63.635C376.489,8.358,337.588,0.5,297.511,0.5     c-40.078,0-78.979,7.858-115.624,23.358c-35.373,14.961-67.132,36.371-94.395,63.635c-27.264,27.263-48.673,59.022-63.635,94.395     C8.358,218.532,0.5,257.434,0.5,297.511c0,40.077,7.858,78.979,23.358,115.623c14.961,35.373,36.371,67.132,63.635,94.396     c27.263,27.263,59.022,48.672,94.395,63.634c36.645,15.5,75.546,23.358,115.624,23.358c40.077,0,78.979-7.858,115.623-23.358     c35.373-14.961,67.133-36.371,94.396-63.634c27.263-27.264,48.673-59.022,63.634-94.396     c15.499-36.645,23.358-75.546,23.358-115.623c0-40.077-7.858-78.979-23.358-115.624     C556.202,146.515,534.792,114.756,507.529,87.493z M297.511,551.682c-140.375,0-254.171-113.797-254.171-254.171     c0-140.375,113.796-254.171,254.171-254.171c140.374,0,254.171,113.796,254.171,254.171     C551.682,437.885,437.885,551.682,297.511,551.682z"
					/>
					<path
						d="M297.511,595.021c-40.146,0-79.112-7.872-115.818-23.397c-35.433-14.988-67.245-36.434-94.553-63.741     c-27.31-27.31-48.755-59.122-63.742-94.555C7.872,376.623,0,337.656,0,297.511c0-40.145,7.872-79.112,23.397-115.818     c14.987-35.432,36.433-67.245,63.742-94.553c27.308-27.309,59.12-48.755,94.553-63.742C218.399,7.872,257.366,0,297.511,0     c40.146,0,79.112,7.872,115.817,23.397c35.435,14.988,67.247,36.434,94.555,63.742c27.31,27.31,48.755,59.123,63.741,94.553     c15.525,36.706,23.397,75.673,23.397,115.818c0,40.144-7.872,79.11-23.397,115.817c-14.985,35.432-36.432,67.244-63.741,94.555     c-27.31,27.31-59.122,48.755-94.555,63.741C376.623,587.149,337.656,595.021,297.511,595.021z M297.511,1     C257.5,1,218.665,8.845,182.082,24.318c-35.314,14.937-67.02,36.311-94.236,63.528c-27.218,27.217-48.591,58.923-63.528,94.236     C8.845,218.665,1,257.5,1,297.511s7.845,78.847,23.318,115.429c14.936,35.312,36.31,67.019,63.528,94.236     c27.217,27.216,58.922,48.59,94.236,63.526c36.582,15.474,75.417,23.319,115.429,23.319c40.011,0,78.847-7.846,115.429-23.319     c35.312-14.936,67.019-36.309,94.236-63.526c27.219-27.22,48.592-58.925,63.526-94.236     c15.474-36.584,23.319-75.42,23.319-115.429c0-40.011-7.846-78.847-23.319-115.429c-14.935-35.312-36.309-67.017-63.526-94.236     c-27.217-27.216-58.922-48.59-94.236-63.528C376.357,8.845,337.521,1,297.511,1z M297.511,552.182     c-68.025,0-131.979-26.49-180.08-74.592C69.33,429.489,42.84,365.535,42.84,297.511c0-68.025,26.49-131.979,74.591-180.08     S229.486,42.84,297.511,42.84c68.024,0,131.979,26.49,180.079,74.591c48.102,48.101,74.592,112.055,74.592,180.08     c0,68.024-26.49,131.979-74.592,180.079C429.489,525.691,365.535,552.182,297.511,552.182z M297.511,43.84     c-67.758,0-131.46,26.386-179.373,74.298S43.84,229.753,43.84,297.511s26.386,131.46,74.298,179.372     c47.913,47.912,111.615,74.299,179.373,74.299s131.46-26.387,179.372-74.299s74.299-111.614,74.299-179.372     s-26.387-131.46-74.299-179.373C428.971,70.226,365.269,43.84,297.511,43.84z"
					/>
				</g>
			</g>
		</g>
	</svg>
</label>

<Modal bind:showModal on:post={handlePost} {caption}>
	<div class="pb-2">
		<h2 class="text-2xl font-bold">Upload Image</h2>
		<img bind:this={preview} src="" alt="Preview" class="mb-2" />
		<input
			bind:value={caption}
			type="text"
			placeholder="Caption"
			class="border-b-2 w-full focus:outline-none"
		/>
	</div>
</Modal>
