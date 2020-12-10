<script>

export let loading;
export let playing;
export let className = ''
export let style
export let pathClasses = ''

$: c = className

</script>

<svg 
	class={className}
	on:click
	{style}
	viewBox="0 0 100 100">
	{#if loading}

		<g class="spinner" >
			<circle class="stroke {pathClasses}" transform="scale(1.8)" transform-origin="50 50" cx="50" cy="50" r="20" fill="none" stroke="black" stroke-width="10%" />
		</g>
	{:else if playing}

		<polyline class="fill {pathClasses}" transform="translate(10,0)" points="0,10 30,10 30,90, 0,90" fill="black" />
		<polyline class="fill {pathClasses}" transform="translate(60,0)" points="0,10 30,10 30,90, 0,90" fill="black" />
	{:else}
		<polyline class="fill {pathClasses}" transform="translate(5,0)" points="0,0 90,50 0,100" fill="black" />
	{/if}
</svg>