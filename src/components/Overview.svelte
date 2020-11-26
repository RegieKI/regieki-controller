<script>

  import { onMount } from 'svelte';
  import { db } from '@/store-db.js'
  import View from '@/components/View.svelte'
</script>

<style>

</style>

<div class="flex wrap justify-center">
	{#each Object.keys( $db.pdacs ) as k}
		<View pdac={ $db.pdacs[k] } />
	{/each}
</div>