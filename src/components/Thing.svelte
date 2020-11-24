<script>
	import { onMount } from 'svelte';
	import { db } from '@/store-db.js'
	import { Router, routes, active, matches, params, query } from 'svelte-hash-router'
	import ActiveLink from './ActiveLink.svelte'





	$: _thing = () => {
		if (!$active.$$pathname) {
			console.log('[Project.svelte] ❌✨  no pathname...', $params.id);
			return {};
		}
		return $db.things[ $db.current_thing ];
	}


	$: thing = _thing();

	function onAddRepo() {
		db.addRepo(); 
	}

</script>


{#if thing}
	{ JSON.stringify( thing ) }
{:else}
<div>No thing found</div>
{/if}
