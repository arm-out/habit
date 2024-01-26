<script lang="ts">
	import moment from 'moment-timezone';
	import { onMount } from 'svelte';

	let armTime = moment.utc().tz('America/Los_Angeles').format('ddd, DD MMM h:mm A');
	let rakTime = moment().tz('Europe/Dublin').format('ddd, DD MMM h:mm A');

	onMount(() => {
		const interval = setInterval(() => {
			armTime = moment.utc().tz('America/Los_Angeles').format('ddd, DD MMM h:mm A');
			rakTime = moment().tz('Europe/Dublin').format('ddd, DD MMM h:mm A');
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<main class="h-[100dvh] flex flex-col max-w-[35rem] p-2 gap-2">
	<section class="bg-red-400 h-full flex flex-col justify-between rounded-xl p-4">
		<div class="flex flex-col">
			<h2 class="text-4xl">arm</h2>
			<h3>{armTime}</h3>
		</div>
		<div class="flex flex-row justify-between">
			<p>Streak: 🔥</p>
			<button>Add</button>
		</div>
	</section>
	<section class="bg-indigo-400 h-full flex flex-col justify-between rounded-xl p-4">
		<div class="flex flex-col">
			<h2 class="text-4xl">rak</h2>
			<h3>{rakTime}</h3>
		</div>
		<div class="flex flex-row justify-between">
			<p>Streak: 🔥</p>
			<button>Add</button>
		</div>
	</section>
</main>
