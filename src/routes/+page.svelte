<script lang="ts">
	import { goto } from '$app/navigation';
	import { redirect } from '@sveltejs/kit';
	import { onMount } from 'svelte';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	let password: string;

	// onMount(() => {
	// 	if (data.session) {
	// 		goto('/home');
	// 	}
	// });

	const handleSignIn = async () => {
		const { data, error: err } = await supabase.auth.signInWithPassword({
			email: 'arminsuraj@gmail.com',
			password
		});

		if (!err) {
			goto('/home');
		}
	};
</script>

<main class="h-[100dvh] flex flex-col justify-center items-center gap-2">
	<input
		bind:value={password}
		type="password"
		placeholder="Password"
		class="focus:outline-none border rounded-sm placeholder:font-light w-52 p-1"
	/>
	<button on:click={handleSignIn} class="rounded-sm bg-emerald-900 text-white w-52 p-1"
		>Sign In</button
	>
</main>
