<script>

  import { onMount } from 'svelte';
  import { db } from '@/store-db.js'
  import axios from 'axios'

  export let pdac;
  let refreshing = false
  let trigger = Math.random()
  $: src = 'http://' + pdac.ip_address + ':3000/overview?refresh=' + ( Math.random() + trigger )
  $: ssh = 'pi@' + pdac.ip_address
  $: apiReboot = 'http://' + pdac.ip_address + ':3000/system/reboot?as=json'

  $: cmds = [ 'ssh pi@' + pdac.ip_address, 'ssh pi@' + pdac.hostname ]
  let cmdInput


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
  	console.log(e)
  	console.log(e.target.value)
  	console.log(cmdInput.value, '....')
  	const cmd = e.target.value
  	e.target.value = 'copy'
  	cmdInput.value = cmd
  	cmdInput.select()
  	document.execCommand('copy')
  	console.log('YAY?')
  }
</script>

<style lang="sass">
.view
	flex-grow: 0
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
</style>


<div class="view flex flex-column m04">
	<div class="bright mb04 flex justify-between">
		<div>{pdac.hostname}</div>
		<div>{pdac.ip_address}</div>
	</div>
	<div class="cross relative">
		<svg viewBox="0 0 480 320" class="absolute">
			<line x1="0" y1="0" x2="480" y2="320" />
			<line x1="480" y1="0" x2="0" y2="320" />ssh pi@10.0.8.207
		</svg>
		{#if !refreshing} <iframe class="iframe" {src} /> {/if}
	</div>
	<div class="flex flex-row justify-between align-center mt08">
		<div class="flex flex-row">
			<button 
				class="mr08" 
				on:mousedown={e => { trigger = Math.random(); refreshing = true} }
				on:mouseup={ e => refreshing = false}>refresh</button>
			<button on:click={ reboot }>reboot</button>
		</div>

		<div class="flex flex-row align-center">
			<div class="select relative" style="overflow-hidden">
				<input bind:this={cmdInput} type="text" style="position:absolute;left:-9999px;top:-9999px" />
				<button class="pr2">Copy</button>
				<select class="absolute invisible" style="right:0;top:0" on:change={copy}>
					<option value="copy">copy</option>
					{#each cmds as cmd}
						<option value={cmd}>{cmd}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>
</div>