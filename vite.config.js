import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

// Inject the current Git commit hash at build/dev time
const commitHash = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch (e) {
    // Fallback when Git is not available
    return 'dev';
  }
})();

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__COMMIT_HASH__: JSON.stringify(commitHash)
	},
	server: {
		hmr: {
			host: '7232c1dec012.ngrok-free.app',
			protocol: 'https'
		}
	}
});
