<script>

import PlayIcon from '@/components/PlayIcon.svelte'

export let entry
export let active = false

export function run() {

}


// function megaEvent() {

// 	Object.keys( data[mega] ).forEach( idx => {
// 		const cell = data[mega][idx]

// 		if (cell || cell != '') {

// 			const fun = getFunctionByIndex(idx)
// 			const name = fun?.dest?.name

// 			try {

// 				log('🦾 processing line:', name, fun.dest[ $db.production ? 'url' : 'test'], fun.item.url, cell)

// 				if (fun.dest.type == 'osc') {

// 					const msg = fun.item.url + cell
// 					const path = msg.split(' ')[0]
// 					const value = msg.split(' ')[1] || '';
// 					const url = fun.dest[ $db.production ? 'url' : 'test']
// 					const obj = { url, path, value }
// 					log('⚡️-----> sending osc:', url, path, value)

// 					promiseIpc.send( 'oscClientSend', obj ).then( res => {
// 						log('🎼 ✅  success sending OSC:', url, path, value)
// 					}).catch(err => {
// 						log('🎼 ❌  error sending OSC:', url, path, value)
// 					})

// 				} else if ( fun.dest.type == 'sockets' ) {

// 					const key = fun.item.url
// 					const j = {
// 						type: 'viz',
// 						message: 'Automatische'
// 					}
// 					j[key] = cell
// 					sockets[ name ].send( JSON.stringify( j ) )
// 					log('🌐 ✅  success sending SOCKETS:', key, cell, j.message)
// 				}

// 			} catch(err) {

// 				log('❌  error sending message:', fun, cell, err.message)
// 			}
// 		}

// 	})

// }

</script>



<tr height="30px">
	{#each entry as td, i}
		<td class="strong br1-solid bb1-solid" >


			{#if td.cmd.url == 'play'}


				<div 
					class="p0-4 m0"
					class:filled={ false } 
					class:alert={ false }
					class:success={ false }
					class:ok={ false }>
					<PlayIcon 
						style=""
						loading={false} 
						className="w10px h10px" 
						playing={ true } />
				</div>
			{:else if td.cmd.url == 'order'}

					<div 
						class={`p0-4 t2-99 l2-99 pointer `}
						on:click={ e => setChunk(idx) }>
						↕
					</div>
			{:else if td.cmd.url == 'delete'}

					<div 
						class={`p0-4 t2-99 l2-99 pointer `}>
						X
					</div>

			{:else if td.cmd.opts }
				<div class="select flex grow h100pc" >
					<select 
						class={` b0-solid ${td.value} pr2`} 
						bind:value={ td.value } class:filled={ td.value } >
						<option></option>
						<option disabled>---</option>
						{#each td.cmd.opts as o}
							<option value={o} name={o}>{o}</option>
						{/each}
					</select>
				</div>
			{:else if typeof(td.cmd.value) == 'number' }
				<input 
					class={`h100pc b1-solid w60px m0 ${ td.cmd.name }`} 
					type="number" bind:value={ td.value } />
			{:else}
				<input 
					class={`h100pc b1-solid w120px m0 ${ td.cmd.name }`} 
					type="text" bind:value={ td.value } />
			{/if}
		</td>
	{/each}
</tr>



<style lang="sass">
table
	th, td, th div, td div
		white-space: nowrap
tbody
	td, tr
		max-height: 30px
		height: 30px
		min-height: 30px
	tr:nth-child(even)
		background: rgba(255,255,255,0.02)
	thead, thead tr, thead tr, td
		position: relative
		z-index: 9

</style>