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

