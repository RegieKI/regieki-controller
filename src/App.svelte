<script lang="ts">
import Director from '@/director/Director.svelte'
import Overview from '@/components/Overview.svelte'
import { onMount } from 'svelte';
import { db } from '@/store-db.js'

let ready
onMount(async () => {
	db.load().then( e => ready = true )
	window.callbacks = {}
});

</script>

{#if ready}
	{#if $db.mode == 'director'}
		<Director />
	{:else if $db.mode == 'manager'}
		<Overview />
	{/if}
{/if}

<style global lang="sass" >
@import '../../sassis/src/_index.sass'

html
	+reset
	+terminal-structure
	+terminal-code( false )
	+shorthand
	font-family: monospace

	body

		+reset
		+shorthand
		+terminal-theme
		+fontsize( 11px )
		+bg( hsl( 0,0%,10%) )
		*, select, input 
			font-family: monospace
		$sidebar: 200px
		$header: 40px
		$subheader: 40px
		input, textarea, select
			padding-left: 0.8em
			padding-right: 0.8em
		.sidebar
			+fixed
			+width-height($sidebar, 100vh)
			border-right: 1px solid mono(15%)
		.router
			+fixed
			+top-left(0px, $sidebar)
			+width-height( calc(100% - #{$sidebar}), 100vh)
			overflow: auto
		.panel-tree, .panel-diff, .panel-history
			overflow: auto
			max-height: calc( 100vh - #{$header + $subheader} )




</style>