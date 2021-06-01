<script>
  import { onMount, onDestroy } from 'svelte';
  import { db } from '@/store-db.js'
  import template from '@/types-db.js'
  import axios from 'axios'
  import { API_ERROR, API_SUCCESS, API_TRY, API_VIZ } from '@/types.js'


  const emotions = [
    "angst",
    "freude",
    "liebe",
    "trauer",
    "uberraschung",
    "verachtung",
    "wut"
  ]

  let pdacs = [
    { ip: '10.0.8.206', name: 'purple', waves: [0.5,0.5,0.5,0.5,0.5,0.5,0.5] },
    { ip: '10.0.8.207', name: 'technicolor-dreamcoat', waves: [0.5,0.5,0.5,0.5,0.5,0.5,0.5] },
    { ip: '10.0.8.210', name: 'pdac-stage-01', waves: [0.5,0.5,0.5,0.5,0.5,0.5,0.5] },
    { ip: '10.0.8.211', name: 'pdac-stage-02', waves: [0.5,0.5,0.5,0.5,0.5,0.5,0.5] },
    { ip: '10.0.8.212', name: 'pdac-stage-03', waves: [0.5,0.5,0.5,0.5,0.5,0.5,0.5] },
    { ip: '10.0.8.213', name: 'pdac-stage-04', waves: [0.5,0.5,0.5,0.5,0.5,0.5,0.5] },
    { ip: '10.0.8.214', name: 'pdac-stage-05', waves: [0.5,0.5,0.5,0.5,0.5,0.5,0.5] },
    { ip: '10.0.8.215', name: 'pdac-stage-06', waves: [0.5,0.5,0.5,0.5,0.5,0.5,0.5] },
    { ip: '10.0.8.216', name: 'pdac-stage-07', waves: [0.5,0.5,0.5,0.5,0.5,0.5,0.5] },
    { ip: '10.0.8.217', name: 'pdac-stage-08', waves: [0.5,0.5,0.5,0.5,0.5,0.5,0.5] }
  ]

  const ipc  = require('electron').ipcRenderer;

  let osc = false
  let neu = JSON.parse( JSON.stringify(template.pdac) )
  $: disabled = neu.hostname == '' || neu.ip_address == ''

  onMount(async () => {
    window.requestAnimationFrame( onFrame )
  });

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function onFrame() {


    if (!osc) return window.requestAnimationFrame( onFrame )

    let promises = []

    for( let ii = 0; ii < pdacs.length; ii++) {
      const pdac = pdacs[ii]
      for ( let i = 0; i < pdac.waves.length; i++ ) {
        let w = pdac.waves[i]
        w += random( -1, 1 ) * 0.01
        if (w < 0) w *= -1
        if (w > 1) w = 2 - w 
        pdac.waves[i] = w
      }

      const p = '/' + pdac.name + '/emotion'
      promises.push( 
        promiseIpc
          .send('sendOSC', { path: p, message: pdac.waves } )
          .then((res) => {
            // console.log('[Sidebar.svelte] 🎷 ✅ send OSC')
          })
          .catch((err) => {
            console.log('[Sidebar.svelte] 🎷 ❌ error sending OSC', err.message)
          })
      )
    }

    Promise.all( promises ).finally( res => {
      window.requestAnimationFrame( onFrame )
    })


  }


  function onNew() {
    db.neuPDAC( neu );
    neu = JSON.parse( JSON.stringify(template.pdac) )
  }

  function onRemove(k) {
    console.log('[Sidebar.svelte] 🛑  removing PDAC...', k, $db.current_pdac);
    if (k == $db.current_pdac) window.location.hash = '#/';
    setTimeout( () => db.removePDAC(k), 1);
  }


  function rebootAll() {

    console.log('[Sidebar.svelte] rebooting all...')
    const options = {
    type: 'question',
    buttons: ['Reboot All', 'Cancel'],
        defaultId: 1,
        cancelId: 1,
    title: 'Reboot PDACs',
    detail: 'All PDACs will be rebooted.',
    message: 'Are you sure?'
  }

    return promiseIpc
      .send('showDialogBox', options)
      .then((res, e) => {
        console.log('[Sidebar.svelte] ✅ reboot:', res)
        if (res == 0) {

          Object.keys( $db.pdacs ).forEach( k => {
            const pdac = $db.pdacs[k]
            const apiReboot = 'http://' + pdac.ip_address + ':3000/system/reboot?as=json'
            console.log('[Sidebar.svelte]  rebooting...', pdac.hostname, apiReboot)
            axios.post( apiReboot ).then( r => {
              console.log('[Sidebar.svelte] ✅  rebooted all:', pdac.hostname)
            }).catch( err => {
              console.log('[Sidebar.svelte] ❌  could not reboot:', pdac.hostname)
            })
          })
        }
      })
      .catch((err) => {
        console.log('[Sidebar.svelte] ❌ reboot:', err.message)
      })
  }


  function shutdownAll() {

    console.log('[Sidebar.svelte] shutdown all...')
    const options = {
    type: 'question',
    buttons: ['Shutdown All', 'Cancel'],
        defaultId: 1,
        cancelId: 1,
    title: 'Shutdown PDACs',
    detail: 'All PDACs will be shutdown.',
    message: 'Are you sure?'
  }

    return promiseIpc
      .send('showDialogBox', options)
      .then((res, e) => {
        console.log('[Sidebar.svelte] ✅ shutdown:', res)
        if (res == 0) {

          Object.keys( $db.pdacs ).forEach( k => {
            const pdac = $db.pdacs[k]
            const apiShutdown = 'http://' + pdac.ip_address + ':3000/system/shutdown?as=json'
            console.log('[Sidebar.svelte]  shutdowning...', pdac.hostname, apiShutdown)
            axios.post( apiShutdown ).then( r => {
              console.log('[Sidebar.svelte] ✅  shutdown all:', pdac.hostname)
            }).catch( err => {
              console.log('[Sidebar.svelte] ❌  could not shutdown:', pdac.hostname)
            })
          })
        }
      })
      .catch((err) => {
        console.log('[Sidebar.svelte] ❌ shutdown:', err.message)
      })
  }

  let vizTitle, vizMessage

  function sendAll() {
    Object.keys( window.callbacks ).forEach( k => {
      const cb = window.callbacks[k]
      console.log(k, cb)
      cb( { title: vizTitle || '~', message: vizMessage || '~', type: API_VIZ })
    })
  }

  let views = []

</script>

<style lang="sass">
  input[type=range]
    min-height: 1em
  .wobble
    .dot
      min-height: 1em
      border-radius: 1em
      background: white
      min-width: 1em
</style>

<nav class="sidebar p1 flex flex-column justify-between">
  <div class="pdacs mb1">
    <h2 class="mb1 pb1 bright bb1-solid">PDAC Overview</h2>
    {#each Object.keys( $db.pdacs ) as k}
      <div class="mb04">
        {k}
        <span on:click={() => onRemove(k)}>✖</span>
      </div>
    {/each}
  </div>
  <div class="actions flex flex-column">

    <input type="text" style="border-bottom: none" placeholder="hostname" bind:value={neu.hostname} />
    <input type="text" placeholder="ip address" bind:value={neu.ip_address} />
    <button {disabled} style="border-top: none" on:click={onNew} >add new pdac</button>

    <div class="bright pb1 mb1 mt2 bb1-solid">Visual</div>
    <input class="mt1 mb04" type="text" placeholder="title" bind:value={vizTitle} />
    <input class="mb04" type="text" placeholder="message" bind:value={vizMessage} />
    <button class="mb1" on:click={sendAll} >send to all</button>

    <div class="bright pb1 mb1 mt2 bb1-solid">Actions</div>
    <button class="mt1" on:click={ e => osc = !osc } class:filled={osc}>send test osc to av</button>
    <button class="mt04" on:click={ rebootAll }>reboot all</button>
    <button class="mt04" on:click={ shutdownAll }>shutdown all</button>
  </div>
</nav>