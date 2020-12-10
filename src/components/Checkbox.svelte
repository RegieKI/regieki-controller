<script>
export let checked;
export let indeterminate;
export let className

let id = 'checkbox' + parseInt( Math.random() * 1000 )
</script>



<div {id} class="checkbox flex flex-row align-items-center pl1-4 {className}">
	<input 
		bind:checked={checked} 
		on:click
		type="checkbox" 
		{indeterminate}
		on:change />
	<span />
	<label for={id}><slot /></label>
</div>