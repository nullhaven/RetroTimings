<script lang="ts">
	interface Props {
		onchange: HTMLInputElement["onchange"];
	}

	const { onchange }: Props = $props();
	let picker: HTMLInputElement;
</script>

<input bind:this={picker} type="file" accept="text/plain" hidden {onchange} />
<button
	class="cursor-pointer rounded-md bg-blue-400 px-4 py-2 text-white transition hover:bg-blue-500"
	onclick={() => picker.click()}>
	Select timings.txt
</button>
