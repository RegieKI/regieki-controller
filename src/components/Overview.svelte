<script>

  import { onMount } from 'svelte';
  import { db } from '@/store-db.js'
  import View from '@/components/View.svelte'
	import Sidebar from '@/components/Sidebar.svelte'
</script>

<style>

</style>

<nav class="vh100 overflow-auto sidebar p1 flex flex-column justify-between">
	<Sidebar />
</nav>
<div class="router">
<div class="flex wrap justify-center">
	{#each Object.keys( $db.pdacs ) as k}
		<View pdac={ $db.pdacs[k] } />
	{/each}
</div>
</div>