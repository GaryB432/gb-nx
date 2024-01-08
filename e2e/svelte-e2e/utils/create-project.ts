import { joinPathFragments } from '@nx/devkit';
import { tmpProjPath } from '@nx/plugin/testing';
import { mkdirSync, writeFileSync } from 'fs';

// TODO use the official thing
export async function createSveltekitProject(
  name: string,
  subdir = 'apps'
): Promise<void> {
  const root = joinPathFragments(tmpProjPath(subdir), name);
  mkdirSync(root, { recursive: true });

  writeFileSync(
    `${root}/package.json`,
    JSON.stringify({
      name,
      version: '0.0.0',
      scripts: { build: 'echo Executor ran' },
    })
  );

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
