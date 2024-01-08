import { joinPathFragments } from '@nx/devkit';
import { tmpProjPath } from '@nx/plugin/testing';
import { mkdirSync, writeFileSync } from 'fs';

// TODO use the official thing
export async function createProject(name: string): Promise<void> {
  const root = joinPathFragments(tmpProjPath('apps'), name);
  mkdirSync(root, { recursive: true });

  writeFileSync(`${root}/package.json`, JSON.stringify({ name, version: '0' }));

  writeFileSync(
    `${root}/svelte.config.js`,
    `import adapter from '@sveltejs/adapter-auto';
    import { vitePreprocess } from '@sveltejs/kit/vite';
    const config = {
      preprocess: vitePreprocess(),
      kit: { adapter: adapter() },
    };
    export default config;
    `
  );
}
