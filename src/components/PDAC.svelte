<script>
	import { onMount } from 'svelte';
	import { db } from '@/store-db.js'
	import { Router, routes, active, matches, params, query } from 'svelte-hash-router'
	import ActiveLink from './ActiveLink.svelte'





	$: _pdac = () => {
		if (!$active.$$pathname) {
			console.log('[Project.svelte] ❌✨  no pathname...', $params.id);
			return {};
		}
		return $db.pdacs[ $db.current_pdac ];
	}


	$: pdac = _pdac();

	function onAddRepo() {
		db.addRepo(); 
	}

</script>


{#if pdac}
	{ JSON.stringify( pdac ) }
{:else}
<div>No pdac found</div>
{/if}
