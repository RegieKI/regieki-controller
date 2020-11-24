<script>
export let checked;
export let indeterminate;

</script>



<div class="checkbox">
	<input 
		bind:checked={checked} 
		on:click
		type="checkbox" 
		{indeterminate}
		on:change />
	<span />
</div>