<script>


import { db } from '@/store-db.js'
let mode = $db.mode || 'director'

function switchMode( s ) {
	mode = s
	db.update( d => { d.mode = s; return d })
}

</script>
<h2 class:filled={ mode == 'director' } on:click={ e => switchMode('director') } class="p0-4 bright f2">Timeline</h2>
<h2 class:filled={ mode == 'manager' } on:click={ e => switchMode('manager') } class="p0-4 bright f2">PDACs</h2>