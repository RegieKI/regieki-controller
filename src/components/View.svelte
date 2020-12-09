<script>

  import { onMount } from 'svelte';
  import { db } from '@/store-db.js'
  import axios from 'axios'
import { API_ERROR, API_SUCCESS, API_TRY, API_VIZ } from '@/types.js'

  export let pdac;
  let refreshing = false
  let trigger = Math.random()
  $: src = 'http://' + pdac.ip_address + ':3000/overview?refresh=' + ( Math.random() + trigger )
  $: ssh = 'pi@' + pdac.ip_address
  $: apiReboot = 'http://' + pdac.ip_address + ':3000/system/reboot?as=json'

  $: cmds = [ 'ssh pi@' + pdac.ip_address, 'ssh pi@' + pdac.hostname ]

  let cmdInput
  let ws = null
  let status = {
  	type: 'ok',
  	message: 'pending'
  }


  onMount( async() => {

      console.log('[View.svelte] 📦 mounted...');
      wsPoll()

  });

  let wsState

  function wsPoll() {
    if (!ws) {
      wsConnect()
    } else if (ws.readyState == ws.CLOSED) {
      console.log('[View.svelte] 👁 🛑  remove CLOSED websocket...');
      ws = null
      window.callbacks[pdac.ip_address] = null
    }

    if (ws) wsState = ws.readyState

    setTimeout( () => {
      wsPoll()
    }, 2000)
  }

  function wsConnect() {
    if (!ws) {
      const url = `ws://${pdac.ip_address}:8765`
      console.log('[View.svelte] 👁 ⚡️  opening websocket...', url)
      ws = new WebSocket(url);
      ws.addEventListener('open', onOpen)
      ws.addEventListener('message', onMessage)
      ws.addEventListener('error', onError)
      ws.addEventListener('close', onClose)
      window.callbacks[pdac.ip_address] = ws
    }
  }

  function onOpen(e) {
    console.log('[View.svelte] 👁 ✅  opened websocket...', e.currentTarget.url)
  }
  function onError(err) {
    console.log('[View.svelte] 👁 ❌  error with websocket...', err)
    ws.close()
  }
  function onClose(err) {
    console.log('[View.svelte] 👁 🛑  closed and delete websockets...')
  }

  function onMessage(e) {
    console.log(`[View.svelte] ${pdac.ip_address} ------> 👁 ✨  received websocket message...\n------------\n`, e.data, '\n------------\n')
  }


  export function reboot() {
    console.log('[View.svelte] rebooting...')
  	const options = {
		type: 'question',
		buttons: ['Reboot', 'Cancel'],
        defaultId: 1,
        cancelId: 1,
		title: 'Reboot',
		detail: 'PDAC will be rebooted.',
		message: 'Are you sure?'
	}

    return promiseIpc
      .send('showDialogBox', options)
      .then((res, e) => {
        console.log('[View.svelte] ✅ reboot:', res)
        if (res == 0) {
        	axios.post( apiReboot ).then( r => {
		  		console.log('[View.svelte] ✅  rebooting:', pdac.hostname)
		  	}).catch( err => {
		  		console.log('[View.svelte] ❌  could not reboot:', pdac.hostname)
		  	})
		}
      })
      .catch((err) => {
        console.log('[View.svelte] ❌ reboot:', err.message)
      })

  }

  function copy( e ) {
  	const cmd = e.target.value
  	e.target.value = 'copy'
  	cmdInput.value = cmd
  	cmdInput.select()
  	document.execCommand('copy')
  }

  let vizOpts = [ 'none', 'liebe', 'trauer', 'wut', 'freude', 'uberraschung', 'verachtung', 'angst' ]
  let vizTitle = 'none'
  let vizMessage = ''
  let vizButton = ''

  export function send( json ) {

    console.log('[View.svelte] 🌐  sending websockets...')
    try {
    	const txt = JSON.stringify( json )
	    ws.send( txt )
	    console.log('[View.svelte] 🌐 ✅  successfully sent message:', txt)
	} catch( err ) {
	    console.log('[View.svelte] 🌐 ❌  couldnt send websockets msg:', err.message)

	}
  }

  function viz() {

    if ( ws ) {
    	let msg = { 
    		title: vizTitle || '~', 
    		message: vizMessage || '~', 
    		type: "viz" }
    	if (vizButton && vizButton != '') msg.button = vizButton
    	send( msg )
    } else {
	    console.log('[View.svelte] 🌐 ❌  websockets doesnt exist?')
    }
  }
</script>

<style lang="sass">
.view
	flex-grow: 0
	max-width: 480px
	.cross
		width: 480px
		height: 320px
		svg
			width: 100%
			height: 100%
			z-index: 0
			line
				stroke: white
				stroke-width: 1px
		.iframe
			position: relative
			z-index: 9
			background: grey
			width: 480px
			height: 320px
			background: transparent
</style>


<div class="view flex flex-column m0-4">
	<div class="cross relative">
		<svg viewBox="0 0 480 320" class="absolute">
			<line x1="0" y1="0" x2="480" y2="320" />
			<line x1="480" y1="0" x2="0" y2="320" />ssh pi@10.0.8.207
		</svg>
		{#if !refreshing} <iframe allowtransparency="true" class="iframe" {src} /> {/if}
	</div>

  <div class="bright mt0-4 flex justify-content-between">
    <div>{pdac.hostname}</div>
    <div>{pdac.ip_address}</div>
    <!-- <div class=" {status.type}">{status.message}</div> -->
  </div>


	<div class="flex flex-row justify-content-between align-center mt0-8">
		<div class="flex flex-row">
			<button 
				class="mr0-8" 
				on:mousedown={e => { trigger = Math.random()} }
				>refresh</button>
			<button on:click={ reboot }>reboot</button>
		</div>

		<div class="flex flex-row align-center">
			<div class="select relative" style="overflow-hidden">
				<input bind:this={cmdInput} type="text" style="position:absolute;left:-9999px;top:-9999px" />
				<button class="pr2">Copy</button>
				<select class=" b1-solid absolute invisible" style="right:0;top:0" on:change={copy}>
					<option value="copy">copy</option>
					{#each cmds as cmd}
						<option value={cmd}>{cmd}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>



	<div class="flex flex-row justify-between align-center mt0-8">
        <div class="flex flex-row">

          <!-- <input class="mr08" type="text" bind:value={vizTitle} placeholder="title" /> -->
        <div class="no-basis select shrink">
          <select class="b1-solid " bind:value={vizTitle} placeholder="title">
            {#each vizOpts as o}
              <option value={o} name={o}>{o}</option>
            {/each}
          </select>
        </div>
        <input style="width:150px" type="text" bind:value={vizMessage} placeholder="message" class="no-basis shrink" />
        <input style="width:150px" type="text" class="no-basis shrink" bind:value={vizButton} placeholder="button" />
        <button class="no-basis" on:click={ viz }>send</button>
      </div>
			<!-- <div class="info">websockets connecting...</div> -->
	</div>
</div>