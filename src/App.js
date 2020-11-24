import App from './App.svelte';
import { routes } from 'svelte-hash-router'
import About from './components/About.svelte';
import Overview from './components/Overview.svelte';
import Thing from './components/Thing.svelte'; 

routes.set( {
  '/about': About,
  '/': Overview,
  '/thing/:id': Thing
});

const app = new App({
	target: document.body,
	props: {}
});

export default app;
