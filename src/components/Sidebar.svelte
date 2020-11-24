<script>
  import { onMount } from 'svelte';
  import { db } from '@/store-db.js'

  const ipc  = require('electron').ipcRenderer;

  let name = "";

  onMount(async () => {
    // console.log($db, db);
  });
  function onNew() {
    db.neuThing( name );
  }

  function onRemove(k) {
    console.log('[Sidebar.svelte] 🛑  removing Thing...', k, $db.current_thing);
    if (k == $db.current_thing) window.location.hash = '#/';
    setTimeout( () => db.removeThing(k), 1);
  }


</script>

<style>

</style>

<nav class="sidebar p1">
  <h2>Things</h2>
  <input type="text" bind:value={name} />
  <button on:click={onNew} >create new</button>
  <div class="Things">
    {#each Object.keys( $db.things ) as k}
      <div>
        <a href={`#/Thing/${k}/changes`}>{k}</a> 
        <span on:click={() => onRemove(k)}>✖</span>
      </div>
    {/each}
  </div>
</nav>