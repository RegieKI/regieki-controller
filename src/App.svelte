<script lang="ts">
import Director from '@/director/Director.svelte'
import DirectorMenu from '@/director/Menu.svelte'
import Overview from '@/components/Overview.svelte'
import PDACMenu from '@/components/Sidebar.svelte'
import Sidebar from '@/components/Sidebar.svelte'
import { onMount } from 'svelte';
import { db } from '@/store-db.js'

onMount(async () => {
	db.load();
	window.callbacks = {}
	// osc = new OSC()

	// osc.on('open', onOscOpen)
});

function onOscOpen( e ) {
	// console.log('OSC OPENEED!')
}

let mode = 'director'

</script>


{#if $db.state > 0}

	<nav class="vh100 overflow-auto sidebar p1 flex flex-column justify-between">
	  <h2 class:filled={ mode == 'director' } on:click={ e => mode = 'director' } class="mb1 pb1 bright f2">Direktor</h2>
	  <h2 class:filled={ mode == 'manager' } on:click={ e => mode = 'manager' } class="mb1 pb1 bright f2">PDACs</h2>
		{#if mode == 'director'}
			<DirectorMenu />
		{:else if mode == 'manager'}
			<PDACMenu />
		{/if}
	</nav>
	<div class="router">
		{#if mode == 'director'}
			<Director />
		{:else if mode == 'manager'}
			<Overview />
		{/if}
	</div>
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
			padding: 1em
		.panel-tree, .panel-diff, .panel-history
			overflow: auto
			max-height: calc( 100vh - #{$header + $subheader} )




</style>