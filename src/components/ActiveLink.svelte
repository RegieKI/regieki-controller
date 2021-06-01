<script>
import { routes, active, matches, params, query } from 'svelte-hash-router'
export let href;
export let className;
export let exact = false;
let lastHref;
let lastQuery;
$: _selected = () => {
	if ($active.$$href != lastHref || $query != lastQuery) {
		lastHref = $active.$$href;
		lastQuery = $query;
	}
	if (exact) return window.location.hash == href;
	return window.location.hash.indexOf(href) != -1;
}

$: selected = _selected();

// console.log( 'a', $routes, 'b', $active, 'c', $matches, 'd', $params, 'e', $query);

</script>


<a class:filled={selected} {href} on:click class={className}><slot /></a>