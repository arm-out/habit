<script lang="ts">
	import type { LeaderboardRow, LongestStreakRow } from '$lib/supabase.js';
	import { Chart } from 'chart.js/auto';
	import ChartDataLabels from 'chartjs-plugin-datalabels';
	import { onMount } from 'svelte';

	type Row = {
		name: string;
		posts_created: number;
		color: string;
	};

	const colors = {
		arm: '#888EB2',
		rak: '#A3B288',
		bron: '#7dd3fc',
		eden: '#f9a8d4'
	};

	export let data;

	let winNav: any;
	let isInWebAppiOS;
	let isInWebAppChrome;
	let extraPadding: string;

	let leaderboardCanvas: HTMLCanvasElement;
	let streakCanvas: HTMLCanvasElement;

	onMount(() => {
		winNav = window.navigator;
		isInWebAppiOS = winNav === true;
		isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;
		extraPadding = isInWebAppiOS || isInWebAppChrome ? 'pb-8' : '';

		Chart.register(ChartDataLabels);

		new Chart(leaderboardCanvas, {
			type: 'bar',
			data: {
				labels: data.leaderboard.map((row: LeaderboardRow) => row.name),
				datasets: [
					{
						data: data.leaderboard.map((row: LeaderboardRow) => row.posts_created),
						backgroundColor: data.leaderboard.map((row: LeaderboardRow) => row.color)
					}
				]
			},
			options: {
				indexAxis: 'y',
				scales: {
					x: {
						display: false,
						beginAtZero: true,
						grid: {
							display: false
						}
					},
					y: {
						grid: {
							display: false
						}
					}
				},
				plugins: {
					legend: {
						display: false
					},
					datalabels: {
						color: '#000', // Set the color of the labels
						anchor: 'end', // Position labels at the end of the bars
						align: 'left', // Align labels to the right (for a 'y' indexAxis)
						formatter: function (value, context) {
							if (value > 0) {
								return value;
							} else {
								return '';
							}
						}
					}
				}
			}
		});

		new Chart(streakCanvas, {
			type: 'polarArea',
			data: {
				labels: data.longestStreak.map((row: LongestStreakRow) => row.name),
				datasets: [
					{
						data: data.longestStreak.map((row: LongestStreakRow) => row.longest_streak),
						backgroundColor: data.longestStreak.map(
							(row: LongestStreakRow) => colors[row.name as keyof typeof colors]
						)
					}
				]
			},
			options: {
				// remove grid
				scales: {
					r: {
						display: false,
						grid: {
							display: false
						}
					}
				},
				plugins: {
					datalabels: {
						color: '#000', // Set the color of the labels
						formatter: function (value, context) {
							if (value > 0) {
								return value;
							} else {
								return '';
							}
						}
					}
				}
			}
		});
	});
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

	<h2 class="text-slate-500 text-3xl font-semibold">{data.month}</h2>

	<div class="pr-4">
		<canvas bind:this={leaderboardCanvas}></canvas>
	</div>

	<h2 class="text-slate-500 text-3xl font-semibold">Longest Streaks</h2>

	<div>
		<canvas bind:this={streakCanvas}></canvas>
	</div>
</main>
