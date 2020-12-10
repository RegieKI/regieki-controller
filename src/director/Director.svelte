<script>
	import dayjs from 'dayjs'
	import { onMount } from 'svelte';
	import { db } from '@/store-db.js'
	import PlayIcon from '@/components/PlayIcon.svelte'
	import frieder from '../frieder.js'
	import DirectorMenu from '@/director/Menu.svelte'

	let data = {}

	console.log(promiseIpc)

	let rows = 360;
	let cols = [ 
		{ type: 'timestamp', cmds: [], name: 'timestamp' },
		{ type: 'gui', cmds: [  ], name: 'gui' },
		{ type: 'internal', cmds: [{ url: 'condition', value: '' }], name: 'internal' },
		{ ...$db.dests["audio-machine"], type: 'machine'},
		{ ...$db.dests["av-machine"], type: 'machine'},
		{ ...$db.dests["ai-machine"], type: 'machine'},
		{ ...$db.dests["stage-pdac-01"], type: 'pdac' },
		{ ...$db.dests["stage-pdac-02"], type: 'pdac' },
		{ ...$db.dests["stage-pdac-03"], type: 'pdac' },
		{ ...$db.dests["stage-pdac-04"], type: 'pdac' },
		{ ...$db.dests["stage-pdac-05"], type: 'pdac' },
		{ type: 'gui', cmds: [] }
	]

	let destCopy = $db.dests

  	let ready = false

  	let doFrieder = true

  	let buttoned = {}
  	let connected = {}
  	let sockets = {}


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

			Object.keys( $db.pdacs ).forEach( p => buttoned[p] = false )
			Object.keys( $db.dests ).forEach( p => connected[p] = 0 )
			window.connected = connected
			window.buttoned = buttoned


			ready = true
		})

		lt = new Date()
		window.requestAnimationFrame( onFrame )

		pollConnections()
	})

	let TEST = true

	function pollConnections() {

		Object.keys( connected ).forEach( name => {
			if ( !connected[name] ) {
				const dest = $db.dests[name]
				const url = TEST ? dest.test : dest.url
				if (dest.type == 'osc') {

					promiseIpc.send( 'oscClientConnect', { url: dest.url } ).then( res => {
						console.log('[Director.svelte] ✅  success connecting to OSC client:', dest.url)
						connected[name] = 1
					}).catch(err => {
						console.log('[Director.svelte] ❌  error connecting to OSC client:', dest.url, err.message)
						connected[name] = 2
					})
				} else if ( dest.type == 'sockets' ) {
					sockets[name] = new WebSocket(`ws://${url}`);
					sockets[name].addEventListener('open', function() {
						console.log('[Director.svelte] ✅ opened websockets connection:', name)
						connected[name] = 1
					})
					sockets[name].addEventListener('message', function( e ) {
						console.log('[Director.svelte] 💌  received:', name, e.data)

						try {
							const j = JSON.parse( e.data )
							if (j.type == 'button') {
								console.log('[Director.svelte] 💌 ------->  received button press', name)
								buttoned[name] = true
							}
						} catch {
							console.log('[Director.svelte] ❌ ------->  could not parse', e.data)

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

		if (playing) {
			let nt = new Date()
			let d = (nt - lt) / 1000
			lt = nt
			mini += d
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
	}
	function playFromStart() {
		time = 0
		mega = 0
		mini = 0
	}
	function setChunk( i ) {
		mega = i
		mini = 0
	}

	let router
	let border = '1px solid rgba(255,255,255,0.1)'

	let gap = 10

	$: _time = () => {

		if (mini > gap) {
			mega += 1
			mini = mini%gap
		}
		return (mega * gap ) + mini
	}
	$: time = _time()
	$: _timestamp = () => getTimestamp( time )
	$: timestamp = _timestamp()


	$: _playhead = () => {
		return ( ( 29.58 / 10 ) * time ) + 5
	}
	$: playhead = _playhead()

	let scrollY = 0


	function saveDB() {
		db.save()
	}

	let awaitingButtons = false
	let statuses = ['connecting', 'connected', 'disconnected']
</script>

<style lang="sass">
tbody
	td, tr
		max-height: 30px
		height: 30px
		min-height: 30px

</style>

<nav class="vh100 overflow-auto sidebar p1 flex flex-column justify-between">
	<DirectorMenu />
	<div class="p1">
		<div class="mb1  cmb0-2">
			<div class="mb1 pb1 bb1-solid bright">Connections</div>
			{#each Object.keys( destCopy ) as name }
				<div class="flex justify-content-between"><div>{name}</div><div class="fade">{destCopy[name].type}</div></div>
				<input type="text" bind:value={ destCopy[name][ TEST ? 'test' : 'url'] } placeholder="url" />
				<div 
					class:ok={ connected[name] == 0}
					class:success={ connected[name] == 1}
					class:error={ connected[name] == 2}>
					{statuses[connected[name]] || 'initialising' }
				</div>
			{/each}
		</div>
		<div class="mb1  cmb0-2">
			<div class="mb1 pb1 bb1-solid bright">Buttons</div>
			{#each Object.keys( buttoned ) as ip}
				<div 
					class:fade={ !awaitingButtons }
					class:success={ awaitingButtons && buttoned[ip] }
					class:error={ awaitingButtons && !buttoned[ip] }
					>
					{ip} {  ( buttoned[ip] ? 'pressed' : ( awaitingButtons ) ? 'awaiting' : 'inactive' ) }
				</div>
			{/each}
		</div>
		<button class="flex grow" on:click={saveDB}>save</button>
		<div>{timestamp} </div>
	</div>


</nav>











<div class="router" bind:this={router}  >
	{#if ready}

		<!-------------------------------------------------------------------------------------->


		<div 
			class="absolute fill t0 l0 filled t4em" 
			class:ok={!playing}
			class:success={playing}
			style={`width: 999999px;height:1px;z-index:0;transform:translate(0px,${playhead}px)`} />


		<!-------------------------------------------------------------------------------------->

		<table style="z-index:1" class="relative">
			<thead>

				<tr>
					{#each cols as c}
						<th style="position: sticky" class="t0 h2em bg" colspan={ c.cmds.length }>
							<div class="p0-4">
								<div class="b1-solid" class:b1-solid={ c.type != 'gui' && c.type != 'timestamp' }>
									{#if c.type == 'gui'}
										<PlayIcon on:click={playFromStart} style="" loading={false} className="w1em h1em" {playing} />
									{:else if c.type == 'timestamp'}
										~
									{:else}
										{c.name}
									{/if}
								</div>
							</div>
						</th>
					{/each}
				</tr>


				<!-------------------------------------------------------------------------------------->


				<tr>
					{#each cols as c}
						{#if c.type == 'gui'}
							<th style="position: sticky;top:2.6em" class="bg">
								<button on:click={ e => awaitOnly = !awaitOnly } class:filled={awaitOnly} class="grow">await</button>
							</th>
						{:else if c.type == 'timestamp'}
							<th style="position: sticky;top:2.6em" class="bg">
								{timestamp}
							</th>
						{:else}
							{#each c.cmds as cmd}
								<th style="position: sticky;top:2.6em" class="bg"><input type="text" bind:value={cmd.url} /></th>
							{/each}
						{/if}
					{/each}
				</tr>

			</thead>



			<!-------------------------------------------------------------------------------------->



			<tbody padding="mt1">
				{#each Array(rows) as n, idx}


					<tr style={`border-bottom: ${border}`} height="30px">
						{#each cols as c}
							{#if c.type == 'gui'}

								<!-------------------------------------------------------------------------------------->

								<td 
									on:click={e => toggleMegaPlay( idx, (idx == mega && playing) ) } 
									class="p0-4 m0"
									class:filled={ idx == mega } 
									class:alert={ idx == mega && awaitingButtons}
									class:success={ idx == mega && playing && !awaitingButtons }
									class:ok={ idx == mega && !playing && !awaitingButtons }
									style={`border-right: ${border}`}>
									<PlayIcon 
										style=""
										loading={false} 
										className="w1em h1em" 
										playing={idx == mega && playing} />
								</td>
							{:else if c.type == 'timestamp'}

								<!-------------------------------------------------------------------------------------->

								<td 
									class="p0-4 m0 pointer" 
									on:click={ e => setChunk(idx) } 
									style={`border-right: ${border}`} >
									{ getTimestamp(idx * gap ) }
								</td>
							{:else}

								<!-------------------------------------------------------------------------------------->

								{#each c.cmds as cmd, i}
									<td class="p0-4 m0 strong" style={`border-right: ${border}`}>
										{#if cmd.opts }
											<div class="select flex" class:filled={ data[idx][cmd.idx] } >
												<select class=" grow b0-solid" bind:value={ data[idx][cmd.idx] }>
													<option></option>
													{#each cmd.opts as o}
														<option value={o} name={o}>{o}</option>
													{/each}
												</select>
											</div>
										{:else if false }
											<input class:filled={ data[idx][cmd.idx] } class="b0-solid flex m0" type="number" bind:value={ data[idx][cmd.idx] } style="width:auto"/>
										{:else}
											<input class:filled={ data[idx][cmd.idx] } class="b0-solid flex m0" type="text" bind:value={ data[idx][cmd.idx] } style="width:auto" />
										{/if}
									</td>
								{/each}
								
								<!-------------------------------------------------------------------------------------->
							{/if}
						{/each}
					</tr>



				{/each}
			</tbody>


		</table>
	{/if}
</div>