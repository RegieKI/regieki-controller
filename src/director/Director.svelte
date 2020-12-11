<script>
	import dayjs from 'dayjs'
	import { onMount } from 'svelte';
	import { db } from '@/store-db.js'
	import PlayIcon from '@/components/PlayIcon.svelte'
	import frieder from '../frieder.js'
	import DirectorMenu from '@/director/Menu.svelte'

	let data = {}

  	let buttoned = {} // pdac button presses
  	let connected = {} // bool for each dest
  	let sockets = {} // ws destinations


	let TEST = true

	let rows = 360;
	let cols = [ 
		{ type: 'timestamp', cmds: [], name: 'timestamp' },
		{ type: 'gui', cmds: [], name: 'gui' },
		{ type: 'internal', cmds: [{ url: 'condition', value: '' }], name: 'internal' },
		{ ...$db.dests["audio-machine"]},
		{ ...$db.dests["av-machine"]},
		{ ...$db.dests["ai-machine"]},
		{ name: 'pdacs-all', type: 'internal', cmds: [ { url: 'visualise', value: '', opts: ['wait','act','button', 'text'] }, { url: 'time', value: 0 } ] },
		{ ...$db.dests["pdac-stage-01"] },
		{ ...$db.dests["pdac-stage-02"] },
		{ ...$db.dests["pdac-stage-03"] },
		{ ...$db.dests["pdac-stage-04"] },
		{ ...$db.dests["pdac-stage-05"] },
		{ type: 'gui', cmds: [] },
		{ type: 'timestamp', cmds: [], name: 'timestamp' }
	]

	let destCopy = $db.dests

  	let ready = false

  	let doFrieder = true
  	let doRandomPDAC = true

  	let konsole = []

  	function log( a, b, c, d, e ) {
  		let t = new Date().toISOString().substr(11, 8) + ' [Timeline] ' + a
  		const succ = t.indexOf('✅') != -1
  		// if (succ) t += '--------------------\n'
  		t += ' ' + (b || '')
  		t += ' ' + (c || '')
  		t += ' ' + (d || '')
  		t += ' ' + (e || '')
  		// if (succ) t += '\n--------------------'
  		console.log( t )
  		konsole = konsole.concat( [] )
  		konsole.unshift( t )
  		if (konsole.length > 80) konsole.splice( 0, 80 - ( konsole.length - 80 ) )
  	}

	let emotions = [ 'liebe', 'trauer', 'wut', 'freude', 'uberraschung', 'verachtung', 'angst' ]


  	let conditions = {
  		allButtonsPressed: {
  			setup: () => {
  				Object.keys(buttoned).forEach( k => { buttoned[k] = false })
  			},
  			update: () => {
  				let b = true;
  				Object.keys(buttoned).forEach( k => { if ( !buttoned[k] ) b = false } )
  				return b
  			}
  		},
  		allConnected: {
  			setup: () => {
  			},
  			update: () => {
  				let b = true;
  				Object.keys( connected ).forEach( k => { if ( connected[k] != 1 ) b = false })
  				return b
  			}
  		}
  	}

	onMount(async () => {

		db.load().then( e => {
			for ( let i = 0; i < rows; i++)  {
				let ii = 0
				for( let c = 0; c < cols.length; c++) {
					const cmds = cols[c]?.cmds
					const len = cmds?.length || 0
					for( let cc = 0; cc < len; cc++) {
						if (!data[i]) data[i] = {}
						cmds[cc].idx = ii
						ii += 1
					}
				}
			}



			if (doFrieder) {
				frieder.forEach( (p, i) => {
					const k = p[0]
					const v = p[1]
					if ( v == '' ) {
						data[i][1]= k
					} else if ( k == '/scenes') {
						data[i][2]= v
					} else if (k == '/tracks') {
						data[i][3]= v
					}
				})

			}

			if ( doRandomPDAC ) {
				const len = Object.keys( $db.pdacs ).length
				log('---> generating random pdac emotions:', rows, $db.pdacs.length)
				for ( let i = 0; i < rows; i++)  {

					data[i][8] = ['act', 'wait', 'button'][ parseInt( Math.random() * 3 ) ]
					data[i][9] = 10
					for ( let ii = 0; ii < len; ii++ ) {
						const idx = ii + 10
						const emo = emotions[ parseInt( Math.random() *  ( emotions.length + 2 ) ) ] || ''
						data[i][idx] = emo
					}
				}
			}

			Object.keys( $db.pdacs ).forEach( p => buttoned[p] = false )
			Object.keys( $db.dests ).forEach( p => { if (p.type != 'off' ) connected[p] = 0 } )
			window.connected = connected
			window.buttoned = buttoned


			ready = true
		})

		lt = new Date()
		window.requestAnimationFrame( onFrame )

		pollConnections()
	})

	function pollConnections() {

		Object.keys( connected ).forEach( name => {
			const dest = $db.dests[name]
			const url = TEST ? dest.test : dest.url
			if ( connected[name] != 1 && dest.type != 'off' ) {

				log('🚠  reconnecting to...', name, url)
				if (dest.type == 'osc') {

					promiseIpc.send( 'oscClientConnect', { url } ).then( res => {
						log('✅  success connecting to OSC client:', url)
						connected[name] = 1
					}).catch(err => {
						log('❌  error connecting to OSC client:', url, err.message)
						connected[name] = 2
					})
				} else if ( dest.type == 'sockets' ) {
					sockets[name] = new WebSocket(`ws://${url}`);
					sockets[name].addEventListener('open', function() {
						log('✅ opened websockets connection:', name)
						connected[name] = 1
					})
					sockets[name].addEventListener('message', function( e ) {
						log('💌  received:', name, e.data)

						try {
							const j = JSON.parse( e.data )
							if (j.type == 'button') {
								log('💌 ------->  received button press', name)
								buttoned[name] = true
							}
						} catch {
							log('❌ ------->  could not parse', e.data)

						}
					})
					sockets[name].addEventListener('error', function() {
						sockets[name].close()
						connected[name] = 2
					})
					sockets[name].addEventListener('close', function() {
						delete sockets[name]
						connected[name] = 2
					})
				}
			}
		} )

		setTimeout( pollConnections, 2000 )
	}

	function onFrame() {
		const currentSecond = parseInt(mini)
		if (playing) {
			let nt = new Date()
			let d = (nt - lt) / 1000
			lt = nt
			mini += d
		}
		const nowSecond = parseInt(mini)
		if (currentSecond != nowSecond) {
			log('⏰  counting:', nowSecond )
		}
		window.requestAnimationFrame( onFrame )


	}

	let lt;
	let awaitOnly = false
	let playing = false

	function getTimestamp( time ) {
		let d = new Date(Date.parse("1970-01-01T00:00:00+0000"));
		d.setHours(0)
		d.setSeconds( time )
		return dayjs( d ).format('HH:mm:ss')
	}

	let mini = 0
	let mega = 0


	function toggleMegaPlay( i, isPlaying ) {
		
		mega = i
		mini = 0
		if (mega == i) playing = !isPlaying
		if (playing) megaEvent()
	}
	function playFromStart() {
		time = 0
		mega = 0
		mini = 0
		megaEvent()
	}
	function setChunk( i ) {
		mega = i
		mini = 0
	}

	function getFunctionByIndex( idx ) {
		let it = 0
		for (let i = 0; i < cols.length; i++ ) {
			const c = cols[i]
			let len = c.cmds.length
			let nit = it + len
			if ( idx >= it && idx < nit ) {
				return { dest: c, item: c.cmds[ idx - it ] }
			}
			it = nit
		}
	}

	function megaEvent() {

		Object.keys( data[mega] ).forEach( idx => {
			const cell = data[mega][idx]

			if (cell || cell != '') {

				const fun = getFunctionByIndex(idx)
				const name = fun?.dest?.name

				try {

					log('🦾 processing line:', name, fun.dest[ TEST ? 'test' : 'url'], fun.item.url, cell)

					if (fun.dest.type == 'osc') {

						const msg = fun.item.url + cell
						const path = msg.split(' ')[0]
						const value = msg.split(' ')[1] || '';
						const url = fun.dest[ TEST ? 'test' : 'url']
						const obj = { url, path, value }
						log('⚡️-----> sending osc:', url, path, value)

						promiseIpc.send( 'oscClientSend', obj ).then( res => {
							log('🎼 ✅  success sending OSC:', url, path, value)
						}).catch(err => {
							log('🎼 ❌  error sending OSC:', url, path, value)
						})

					} else if ( fun.dest.type == 'sockets' ) {

						const key = fun.item.url
						const j = {
							type: 'viz',
							message: 'Automatische'
						}
						j[key] = cell
						sockets[ name ].send( JSON.stringify( j ) )
						log('🌐 ✅  success sending SOCKETS:', key, cell, j.message)
					}

				} catch(err) {

					log('❌  error sending message:', fun, cell, err.message)
				}
			}

		})

	}

	let router
	let gap = 10


	$: _time = () => {

		if (mini > gap) {
			mega += 1
			mini = mini%gap
			log('running line event...')
			megaEvent()
		}
		return (mega * gap ) + mini
	}
	$: time = _time()
	$: _timestamp = () => getTimestamp( time )
	$: timestamp = _timestamp()


	let tbody
	$: _playhead = () => {
		return ( ( 29.58 / 10 ) * time ) + (tbody?.offsetTop || 0)
	}
	$: playhead = _playhead()


	function saveDB() {
		db.save()
	}

	let awaitingButtons = false
	let statuses = ['connecting', 'connected', 'disconnected']


	function isArray( obj ) {
		if (!obj) return false
		return Array.isArray( obj )
	}
</script>

<style lang="sass">
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

{#if ready}



<nav class="br1-solid vh100 overflow-auto sidebar p1 flex flex-column justify-between">
	<DirectorMenu />
	<div class="p1">

		<!-------------------------------------------------------------------------------------->

		<div class="mb1  cmb0-2">
			<div class="mb1 pb1 bb1-solid bright">Connections</div>
			{#if isArray( Object.keys( destCopy ) ) }
				{#each Object.keys( destCopy ) as name }
					<div class="flex justify-content-between"><div>{name}</div><div class="fade">{destCopy[name].type}</div></div>
					<input type="text" bind:value={ destCopy[name][ TEST ? 'test' : 'url'] } placeholder="url" />
					<div 
						class:ok={ connected[name] == 0}
						class:success={ connected[name] == 1}
						class:error={ connected[name] == 2}>
						{ ( destCopy[name].type == 'off' ) ? 'disabled' : ( statuses[connected[name]] || 'initialising' ) }
					</div>
				{/each}
			{:else} NOT ARRAY {/if}
		</div>

		<!-------------------------------------------------------------------------------------->

		<div class="mb1  cmb0-2">
			<div class="mb1 pb1 bb1-solid bright">Button Events</div>

			{#if isArray( Object.keys( buttoned ) ) }
				{#each Object.keys( buttoned ) as ip}
					<div 
						class:fade={ !awaitingButtons }
						class:success={ awaitingButtons && buttoned[ip] }
						class:error={ awaitingButtons && !buttoned[ip] }
						>
						{ip} {  ( buttoned[ip] ? 'pressed' : ( awaitingButtons ) ? 'awaiting' : 'inactive' ) }
					</div>
				{/each}
			{:else} NOT ARRAY {/if}
		</div>

		<!-------------------------------------------------------------------------------------->
		<div class="fx fx-column">
			<button class="flex grow j-c-center" on:click={saveDB}>save</button>
		</div>
	</div>


</nav>










<div class="router bb1-solid" bind:this={router} >


		<div class="fixed h2em w100 bg t0 l0" />



		<!-------------------------------------------------------------------------------------->

		<table class="relative z1">


			<thead>

				<tr>
					{#if isArray( cols ) }
						{#each cols as c}
							<th class="sticky z99 t0 h2em bg" colspan={ c.cmds?.length }>
								<div class="p0-4">
									<div class="b1-solid" class:b1-solid={ c.type != 'gui' && c.type != 'timestamp' }>
										{#if c.type == 'gui'}
											<PlayIcon on:click={playFromStart} loading={false} className="w1em h1em" {playing} />
										{:else if c.type == 'timestamp'}
											~
										{:else}
											<span class="bright">{c.name}</span>
											<span class="fade">({c.type})</span>
										{/if}
									</div>
								</div>
							</th>
						{/each}
					{:else} NOT ARRAY {/if}
				</tr>


				<!-------------------------------------------------------------------------------------->


				<tr>
					{#if isArray( cols ) }
						{#each cols as c}
							{#if c.type == 'gui'}
								<th class="t2-6 sticky z99 bg">
									<button on:click={ e => awaitOnly = !awaitOnly } class:filled={awaitOnly} class="grow">await</button>
								</th>
							{:else if c.type == 'timestamp'}
								<th class=" t2-6em sticky z99 bg">
									{timestamp}
								</th>
							{:else}
								{#if isArray( c.cmds ) }
									{#each c.cmds as cmd}
										<th class="sticky z99 t2-6 bg"><input type="text" bind:value={cmd.url} /></th>
									{/each}
								{:else} NOT ARRAY {/if}
							{/if}
						{/each}
					{:else} NOT ARRAY {/if}
				</tr>

			</thead>



			<!-------------------------------------------------------------------------------------->



			<tbody padding="mt1 relative" bind:this={tbody}>
				<div 
					class="absolute fill t0 l0 filled w100pc h1px z0" 
					class:ok={!playing}
					class:success={playing}
					style={`transform:translate(0px,${playhead}px)`} />
				{#if isArray( Array(rows) ) }
					{#each Array(rows) as n, idx}


						<tr height="30px">
							{#if isArray( cols ) }
								{#each cols as c}
									{#if c.type == 'gui'}

										<!-------------------------------------------------------------------------------------->

										<td 
											on:click={e => toggleMegaPlay( idx, (idx == mega && playing) ) } 
											class="p0-4 m0"
											class:filled={ idx == mega } 
											class:alert={ idx == mega && awaitingButtons}
											class:success={ idx == mega && playing && !awaitingButtons }
											class:ok={ idx == mega && !playing && !awaitingButtons }>
											<PlayIcon 
												style=""
												loading={false} 
												className="w1em h1em" 
												playing={idx == mega && playing} />
										</td>
									{:else if c.type == 'timestamp'}

										<!-------------------------------------------------------------------------------------->

										<td 
											class={`p0-4 t2-99 l2-99 pointer `}
											on:click={ e => setChunk(idx) } >
											<div>{ getTimestamp(idx * gap ) }</div>
										</td>
									{:else}

										<!-------------------------------------------------------------------------------------->

										{#if isArray( c.cmds ) }
											{#each c.cmds as cmd, i}
												<td class="p0-4 m0 strong" >
													{#if cmd.opts }
														<div class="select flex" >
															<select 
																class={`grow b0-solid ${ data[idx][cmd.idx] }`} 
																bind:value={ data[idx][cmd.idx] } class:filled={ data[idx][cmd.idx] } >
																<option></option>
																<option disabled>---</option>
																{#each cmd.opts as o}
																	<option value={o} name={o}>{o}</option>
																{/each}
															</select>
														</div>
													{:else}
														<input 
															class:filled={ data[idx][cmd.idx] } 
															class={`b0-solid flex m0 ${ data[idx][cmd.idx] }`} 
															type="text" bind:value={ data[idx][cmd.idx] } />
													{/if}
												</td>
											{/each}
										{:else} NOT ARRAY {/if}

										<!-------------------------------------------------------------------------------------->
									{/if}
								{/each}
							{:else} NOT ARRAY {/if}
						</tr>



					{/each}
				{:else} NOT ARRAY {/if}
			</tbody>


		</table>
</div>
<div class="konsole p1">
	{#each konsole as k, i}
		<div class={`log konsole-log-${i}`}>{k}</div>
	{/each}
</div>

{/if}