<script lang="ts">
import Router from 'svelte-hash-router'
import Sidebar from './components/Sidebar.svelte'
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

</script>


{#if $db.state > 0}
	<Sidebar /> 
	<div class="router"><Router /></div>
{/if}



<style global lang="sass" >
@import '../../sassis/sassis.sass'
@import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@200;300;400;500;600;700;800;900&display=swap')



@import '../../sassis/terminal-theme.sass'

html 
	+terminal-theme

html
	$sidebar: 200px
	$header: 40px
	$subheader: 40px
	.sidebar
		+bg($bg-alt)
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