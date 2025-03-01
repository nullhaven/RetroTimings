<script lang="ts" module>
	export type TimePrecision = "nanos" | "millis";
</script>

<script lang="ts">
	import clsx from "clsx";
	import type { EventTiming, Report } from "../lib/timings";

	type ReportRecord = Report["records"][0];
	type TimePrecision = "nanos" | "millis";

	interface Props {
		record: ReportRecord;
		timePrecision?: TimePrecision;
	}

	const { record, timePrecision = "nanos" }: Props = $props();
	let sortingKey: keyof ReportRecord["timings"][0] = $state("average");
	let timingsOrdered = $derived(record.timings.toSorted((a, b) => b[sortingKey] - a[sortingKey]));
	let title = $derived(typeof record.source === "object" ? record.source.name : record.source);
</script>

<div class="mb-4 p-4">
	<h2 class="mb-2 text-xl">{title}</h2>
	<table class="mb-2 w-full border-2 border-gray-400">
		<thead class="border-b-2 border-gray-400">
			<tr class="border-b-2 border-gray-400 py-2">
				<th class="border-r-2 border-gray-400 py-2">Event</th>
				<th class="border-r-2 border-gray-400 py-2">
					<button
						class="h-full w-full cursor-pointer"
						onclick={() => (sortingKey = "average")}>
						Average
					</button>
				</th>
				<th class="border-r-2 border-gray-400 py-2">
					<button
						class="h-full w-full cursor-pointer"
						onclick={() => (sortingKey = "time")}>
						Total
					</button>
				</th>
				<th class="border-r-2 border-gray-400 py-2">
					<button
						class="h-full w-full cursor-pointer"
						onclick={() => (sortingKey = "count")}>
						Count
					</button>
				</th>
				<th class="border-r-2 border-gray-400 py-2">
					<button
						class="h-full w-full cursor-pointer"
						onclick={() => (sortingKey = "violations")}>
						Violations
					</button>
				</th>
			</tr>
		</thead>
		<tbody>
			{#each timingsOrdered as timing}
				<tr class="border-b-2 border-gray-400 py-2">
					<td class="border-r-2 border-gray-400 px-2">{(timing as EventTiming).name}</td>
					<td class="border-r-2 border-gray-400 px-2">
						{@render time(timing.average)}
					</td>
					<td class="border-r-2 border-gray-400 px-2">
						{@render time(timing.time)}
					</td>
					<td class="border-r-2 border-gray-400 px-2">{timing.count.toLocaleString()}</td>
					<td
						class={clsx("border-r-2 border-gray-400 px-2", {
							"bg-red-300": timing.violations > 0
						})}>
						{timing.violations.toLocaleString()}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<p>{@render time(record.time)} total</p>
</div>

{#snippet time(nanos: number)}
	{#if timePrecision === "millis"}
		{(nanos / 1e6).toFixed(2)} ms
	{:else}
		{nanos.toLocaleString()} ns
	{/if}
{/snippet}
