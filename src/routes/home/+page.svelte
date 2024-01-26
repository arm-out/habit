<script lang="ts">
	import moment, { type Moment } from 'moment-timezone';
	import { onMount } from 'svelte';
	import Modal from './Modal.svelte';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	type Post = null | {
		image: string;
		caption: string;
		time: string;
	};

	let armTime = moment.utc().tz('America/Los_Angeles').format('ddd, DD MMM h:mm A');
	let rakTime = moment.utc().tz('Europe/Dublin').format('ddd, DD MMM h:mm A');

	let armStreak = 0;
	let rakStreak = 0;

	$: console.log(showModal);

	let reader: FileReader;
	let armInput: HTMLInputElement;
	let rakInput: HTMLInputElement;
	let preview: HTMLImageElement;
	let showModal = false;
	let currUser = '';
	let caption = '';

	let armPost: Post = null;
	let rakPost: Post = null;

	function onChange(user: string) {
		currUser = user;
		let file = user === 'arm' ? armInput.files![0] : rakInput.files![0];

		if (file) {
			reader.addEventListener('load', function () {
				preview.setAttribute('src', reader.result as string);
			});
			reader.readAsDataURL(file);
			showModal = true;
			return;
		}
	}

	function handlePost(e: CustomEvent) {
		switch (e.detail.user) {
			case 'arm':
				armPost = {
					image: reader.result as string,
					caption: e.detail.caption,
					time: moment.utc().tz('America/Los_Angeles').format('ddd, DD MMM h:mm A')
				};
				armStreak++;
				break;
			case 'rak':
				rakPost = {
					image: reader.result as string,
					caption: e.detail.caption,
					time: moment.utc().tz('Europe/Dublin').format('ddd, DD MMM h:mm A')
				};
				rakStreak++;
				break;
		}

		showModal = false;
		caption = '';
	}

	onMount(() => {
		reader = new FileReader();
		// handleSignOut();

		const interval = setInterval(() => {
			armTime = moment.utc().tz('America/Los_Angeles').format('ddd, DD MMM h:mm A');
			rakTime = moment.utc().tz('Europe/Dublin').format('ddd, DD MMM h:mm A');
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});

	const handleSignOut = async () => {
		await supabase.auth.signOut();
	};
</script>

<main class="h-[100dvh] flex flex-col max-w-[35rem] p-2 gap-2">
	<section
		style={armPost
			? `background-image: url(${armPost.image})`
			: 'background-color: rgb(248 113 113)'}
		class="h-full flex flex-col justify-between rounded-xl p-4 bg-cover {armPost
			? 'text-white'
			: ''}"
	>
		<div class="flex flex-col">
			<h2 class="text-4xl font-semibold">arm</h2>
			<h3>{armPost ? armPost.time : armTime}</h3>
		</div>
		<div class="flex flex-row justify-between items-center">
			<p class="font-semibold text-3xl min-w-[5rem]">{armStreak}🔥</p>
			{#if armPost}
				<p class="italic">{armPost.caption}</p>
			{:else}
				<label class="cursor-pointer bg-white py-1 px-4 rounded-full">
					<input
						bind:this={armInput}
						on:change={() => onChange('arm')}
						accept="image/*"
						type="file"
						class="hidden"
					/>
					Update
				</label>
			{/if}
		</div>
	</section>
	<section
		style={rakPost
			? `background-image: url(${rakPost.image})`
			: 'background-color: rgb(129 140 248)'}
		class="h-full flex flex-col justify-between rounded-xl p-4 bg-cover bg-center {rakPost
			? 'text-white'
			: ''}"
	>
		<div class="flex flex-col">
			<h2 class="text-4xl font-semibold">rak</h2>
			<h3>{rakPost ? rakPost.time : rakTime}</h3>
		</div>
		<div class="flex flex-row justify-between items-center">
			<p class="font-semibold text-3xl min-w-[5rem]">{rakStreak}🔥</p>
			{#if rakPost}
				<p class="italic">{rakPost.caption}</p>
			{:else}
				<label class="cursor-pointer bg-white py-1 px-4 rounded-full">
					<input
						bind:this={rakInput}
						on:change={() => onChange('rak')}
						accept="image/*"
						type="file"
						class="hidden"
					/>
					Update
				</label>
			{/if}
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
