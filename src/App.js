import App from './App.svelte';
import { routes } from 'svelte-hash-router'
import About from './components/About.svelte';
import Overview from './components/Overview.svelte';
import PDAC from './components/PDAC.svelte'; 

routes.set( {
  '/about': About,
  '/': Overview,
  '/pdac/:id': PDAC
});

const app = new App({
	target: document.body,
	props: {}
});

export default app;
