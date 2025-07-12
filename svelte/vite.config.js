import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// NL: need prettier and eslint
export default defineConfig({
	plugins: [sveltekit()],

	build: {
		rollupOptions: {
			external: ['@inertiajs/core', '@inertiajs/svelte', 'axios', 'svelte'],
		}	
	}
});
