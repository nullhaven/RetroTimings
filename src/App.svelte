<script lang="ts">
	import { parseTimings, type Report } from "./lib/timings";
	import FileSelectButton from "./components/FileSelectButton.svelte";
	import RecordTable, { type TimePrecision } from "./components/RecordTable.svelte";

	let report: Report | null = $state(null);
	let listeners = $derived.by(
		() => report?.records?.filter((it) => it.source !== "Minecraft") ?? []
	);
	let methods = $derived.by(
		() => report?.records?.filter((it) => it.source === "Minecraft") ?? []
	);

	let precisionCheck = $state(false);
	let precision: TimePrecision = $derived(precisionCheck ? "nanos" : "millis");

	async function onFileSelect(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file != null) report = await parseTimings(file);
	}
</script>

<div class="p-4 flex flex-row gap-2 items-center">
	<FileSelectButton onchange={onFileSelect} />
	{#if report != null}
		<div>
			<input type="checkbox" bind:checked={precisionCheck} />
			<span>Nanosecond precision</span>
		</div>
	{/if}
</div>

{#each listeners as listener}
	{#if listener.timings.length > 0}
		<RecordTable record={listener} timePrecision={precision} />
	{/if}
{/each}
