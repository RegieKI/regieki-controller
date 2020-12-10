<script>

  import { onMount } from 'svelte';
  import { db } from '@/store-db.js'


  let cols = [
  	{ ...$db.dests["audio-machine"], type: 'machine'},
  	{ ...$db.dests["av-machine"], type: 'machine'},
  	{ ...$db.dests["ai-machine"], type: 'machine'},
  	{ ...$db.dests["stage-pdac-01"], type: 'pdac' },
  	{ ...$db.dests["stage-pdac-02"], type: 'pdac' },
  	{ ...$db.dests["stage-pdac-03"], type: 'pdac' },
  	{ ...$db.dests["stage-pdac-04"], type: 'pdac' },
  	{ ...$db.dests["stage-pdac-05"], type: 'pdac' }
  ]

  'score', 'match', 'average'
  let rows = 240
</script>

<style>

</style>

<div class="flex wrap justify-center">
</div>


<table>

	<thead>
		<tr>
			{#each cols as c}
				<td class="p0-8">{c.name}</td>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each Array(rows) as idx}
			<tr>
				{#each cols as c, i}
					<td>
						<div class="select">
							<select>
								<option>none</option>
								<option disabled>---</option>
								{#each cols[i].cmds as cmd}
									<option value={cmd} name={cmd}>{cmd}</option>
								{/each}
								<option disabled>---</option>
							</select>
						</div>
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>


</table>