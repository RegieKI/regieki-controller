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

<div class="cross">
{#if ready}
	{#if $db.mode == 'director'}
		<Director />
	{:else if $db.mode == 'manager'}
		<Overview />
	{/if}
{/if}
</div>

<style global lang="sass" >
@import '../../sassis/src/_index.sass'
@import './colors'

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
		$sidebar: 220px
		$header: 40px
		$subheader: 40px
		input, textarea, select
			padding-left: 0.8em
			padding-right: 0.8em
		.sidebar
			+fixed
			+width-height($sidebar, 100vh)
		.router
			+fixed
			+top-left(0px, $sidebar)
			+width-height( calc(100% - #{$sidebar}), 80vh)
			overflow: auto
		.konsole
			+fixed
			+top-left(80vh, $sidebar)
			+width-height( calc(100% - #{$sidebar}), 20vh)
			overflow: auto
		.panel-tree, .panel-diff, .panel-history
			overflow: auto
			max-height: calc( 100vh - #{$header + $subheader} )

		select, input, textarea
			&.wait
				+bg( $blue-200 )
				color: $blue-900
			&.act
				+bg( $green-a200 )
				color: $light-green-900
			&.button
				+bg( $orange-200 )
				color: $orange-900
			&.liebe 
				background-color: $deep-purple-700
				color: $deep-purple-100
			&.trauer
				background-color: $blue-800
				color: $blue-100
			&.wut
				background-color: $red-800
				color: $red-100
			&.freude
				background-color: $yellow-900
				color: $yellow-100
			&.uberraschung
				background-color: $cyan-a700
				color: $cyan-a100
			&.verachtung
				background-color: $light-green-800
				color: $light-green-100
			&.angst
				background-color: $blue-grey-600
				color: $blue-grey-100


</style>