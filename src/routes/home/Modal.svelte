<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let showModal: boolean;
	export let caption: string;

	let dialog: HTMLDialogElement;
	let selectInput: HTMLSelectElement;

	$: if (dialog && showModal) dialog.showModal();

	const dispatch = createEventDispatcher();

	function submit() {
		if (selectInput.value === 'none') {
			alert('Please select your name');
			return;
		}

		dispatch('post', { user: selectInput.value, caption });
		dialog.close();
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<slot />
		<label for="cars">Who are you:</label>
		<select id="cars" name="cars" bind:this={selectInput}>
			<option value="none"></option>
			<option value="arm">Armin</option>
			<option value="bron">Bronte</option>
			<option value="eden">Eden</option>
			<option value="rak">Rachel</option>
		</select>
		<div class="pt-4 flex flex-row gap-2">
			<button on:click={submit} class="border border-black rounded text-white bg-black p-1"
				>Submit</button
			>
			<button on:click={() => dialog.close()} class="border border-red-400 rounded text-red-500 p-1"
				>Cancel</button
			>
		</div>
	</div>
</dialog>

<style>
	dialog {
		max-width: 90vw;
		border-radius: 0.2em;
		border: none;
		padding: 0;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	button {
		display: block;
	}
</style>
