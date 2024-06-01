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
      version: '0.0.0-e2e.0',
      scripts: { build: 'echo Executor ran' },
      devDependencies: {
        '@sveltejs/kit': '^2.0.0',
        svelte: '^5.0.0-next.1',
      },
    })
  );

  writeFileSync(
    `${root}/svelte.config.js`,
    `import adapter from '@sveltejs/adapter-auto';
    const config = {
      kit: { adapter: adapter() },
    };
    export default config;
    `
  );
}
