<script lang="ts">
	import moment from 'moment-timezone';
	import { onMount } from 'svelte';
	import Modal from './Modal.svelte';
	import { nanoid } from 'nanoid';
	import { toast } from '@zerodevx/svelte-toast';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	let posts = data.posts;

	type Post = null | {
		last_caption: string;
		last_image: string;
		last_post: string;
		name: string;
		streak: number;
		tz: string;
	};

	let armTime = moment.utc().tz('America/Los_Angeles');
	let rakTime = moment.utc().tz('Europe/Dublin');

	let armStreak = 0;
	let rakStreak = 0;

	let armInput: HTMLInputElement;
	let rakInput: HTMLInputElement;
	let preview: HTMLImageElement;
	let reader: FileReader;
	let file: File | null;
	let showModal = false;
	let currUser = '';
	let caption = '';
	let filetype = '';

	let armPost: Post = null;
	let rakPost: Post = null;

	armPost = posts.find((post: Post) => post!.name === 'arm' && post!.last_image);
	rakPost = posts.find((post: Post) => post!.name === 'rak' && post!.last_image);

	$: {
		armStreak = armPost ? armPost.streak : 0;
		rakStreak = rakPost ? rakPost.streak : 0;
	}

	function onChange(user: string) {
		currUser = user;
		file = user === 'arm' ? armInput.files![0] : rakInput.files![0];

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
		switch (e.detail.user) {
			case 'arm':
				if (armStreak === 0) {
					armStreak = 1;
				} else {
					const prevDate = moment(armPost!.last_post).tz(armPost!.tz).date();
					const currDate = moment.utc().tz(armPost!.tz).date();

					if (prevDate != currDate) {
						armStreak++;
					}
				}
				armPost = {
					last_image: reader.result as string,
					last_caption: e.detail.caption,
					last_post: moment.utc().format(),
					streak: armStreak,
					name: 'arm',
					tz: 'America/Los_Angeles'
				};
				break;
			case 'rak':
				if (rakStreak === 0) {
					rakStreak = 1;
				} else {
					const prevDate = moment(rakPost!.last_post).tz(rakPost!.tz).date();
					const currDate = moment.utc().tz(rakPost!.tz).date();

					if (prevDate != currDate) {
						rakStreak++;
					}
				}
				rakPost = {
					last_image: reader.result as string,
					last_caption: e.detail.caption,
					last_post: moment.utc().format(),
					streak: rakStreak,
					name: 'rak',
					tz: 'Europe/Dublin'
				};
				break;
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
			streak: e.detail.user === 'arm' ? armStreak : rakStreak,
			tz: e.detail.user === 'arm' ? 'America/Los_Angeles' : 'Europe/Dublin',
			last_post: now,
			last_image: path,
			last_caption: e.detail.caption
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

		const interval = setInterval(() => {
			armTime = moment.utc().tz('America/Los_Angeles');
			rakTime = moment.utc().tz('Europe/Dublin');
		}, 1000);

		winNav = window.navigator;
		isInWebAppiOS = winNav === true;
		isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;
		extraPadding = isInWebAppiOS || isInWebAppChrome ? 'pb-8' : '';

		return () => {
			clearInterval(interval);
		};
	});

	// const handleSignOut = async () => {
	// 	await supabase.auth.signOut();
	// };
</script>

<main class="h-[100dvh] flex flex-col max-w-[35rem] p-2 gap-2 {extraPadding}">
	<section
		style={armPost ? `background-image: url(${armPost.last_image})` : 'background-color: #888EB2'}
		class="h-full flex flex-col justify-between rounded-xl p-4 bg-cover bg-center {armPost
			? 'text-white'
			: ''}"
	>
		<div class="flex flex-col">
			<h2 class="text-4xl font-semibold">arm</h2>
			{#if armPost && armPost.last_caption}
				<h3 class="italic">{armPost.last_caption}</h3>
			{/if}
			<p>
				{armPost
					? moment(armPost.last_post).tz(armPost.tz).format('ddd, DD MMM h:mm A')
					: armTime.format('ddd, DD MMM h:mm A')}
			</p>
		</div>
		<div class="flex flex-row justify-between items-center">
			<p class="font-semibold text-3xl min-w-[5rem]">{armStreak}🔥</p>
			<label class="cursor-pointer bg-white py-1 px-4 rounded-full text-slate-600">
				<input
					bind:this={armInput}
					on:change={() => onChange('arm')}
					accept="image/*"
					type="file"
					class="hidden"
				/>
				Update
			</label>
		</div>
	</section>

	<section
		style={rakPost ? `background-image: url(${rakPost.last_image})` : 'background-color: #A3B288'}
		class="h-full flex flex-col justify-between rounded-xl p-4 bg-center bg-cover {rakPost
			? 'text-white'
			: ''}"
	>
		<div class="flex flex-col">
			<h2 class="text-4xl font-semibold">rak</h2>
			{#if rakPost && rakPost.last_caption}
				<h3 class="italic">{rakPost.last_caption}</h3>
			{/if}
			<p>
				{rakPost
					? moment(rakPost.last_post).tz(rakPost.tz).format('ddd, DD MMM h:mm A')
					: rakTime.format('ddd, DD MMM h:mm A')}
			</p>
		</div>
		<div class="flex flex-row justify-between items-center">
			<p class="font-semibold text-3xl min-w-[5rem]">{rakStreak}🔥</p>
			<label class="cursor-pointer bg-white py-1 px-4 rounded-full text-slate-600">
				<input
					bind:this={rakInput}
					on:change={() => onChange('rak')}
					accept="image/*"
					type="file"
					class="hidden"
				/>
				Update
			</label>
		</div>
	</section>
</main>

<Modal bind:showModal on:post={handlePost} user={currUser} {caption}>
	<div>
		<h2 class="text-2xl font-bold">Upload Image</h2>
		<img bind:this={preview} src="" alt="Preview" class="py-2" />
		<input
			bind:value={caption}
			type="text"
			placeholder="Caption"
			class="border-b-2 w-full focus:outline-none"
		/>
	</div>
</Modal>
