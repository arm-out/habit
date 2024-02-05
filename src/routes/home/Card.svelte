<script lang="ts">
	import moment from 'moment-timezone';
	import { onMount } from 'svelte';

	export let name: string;
	export let last_post: string;
	export let streak: number;
	export let tz: string;
	export let last_image: string;
	export let last_caption: string;

	let color = '#6b7280';
	let time = moment.utc().tz(tz);

	$: {
		switch (name) {
			case 'arm':
				color = '#888EB2';
				break;
			case 'rak':
				color = '#A3B288';
				break;
			case 'bron':
				color = '#7dd3fc';
				break;
			case 'eden':
				color = '#f9a8d4';
				break;
		}
	}

	onMount(() => {
		const interval = setInterval(() => {
			time = moment.utc().tz(tz);
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<section
	style={last_image ? `background-image: url(${last_image})` : `background-color: ${color}`}
	class="min-h-[60vh] flex flex-col justify-between rounded-xl p-4 bg-cover bg-center {last_image
		? 'text-white'
		: ''}"
>
	<div class="flex flex-col">
		<h2 class="text-4xl font-semibold">{name}</h2>
		{#if last_caption}
			<h3 class="italic">{last_caption}</h3>
		{/if}
		<p>
			{last_image
				? moment(last_post).tz(tz).format('ddd, DD MMM h:mm A')
				: time.format('ddd, DD MMM h:mm A')}
		</p>
	</div>
	<div class="flex flex-row justify-start items-center">
		<p class="font-semibold text-3xl min-w-[5rem]">{streak}🔥</p>
	</div>
</section>
