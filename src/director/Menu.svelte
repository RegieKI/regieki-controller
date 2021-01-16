<script>


import { db } from '@/store-db.js'
let mode = $db.mode || 'director'

function switchMode( s ) {
	mode = s
	db.update( d => { d.mode = s; return d })
}

</script>
<button class:filled={ mode == 'director' } on:click={ e => switchMode('director') } class="p0-4 bright">Timeline</button>
<button class:filled={ mode == 'manager' } on:click={ e => switchMode('manager') } class="p0-4 bright">PDACs</button>