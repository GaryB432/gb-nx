import { ProjectConfiguration, joinPathFragments } from '@nx/devkit';
import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  runPackageManagerInstall,
  tmpProjPath,
  uniq,
} from '@nx/plugin/testing';
import { writeFileSync } from 'fs';
import { createSveltekitProject } from '../utils/create-project';

async function ensureSveltekitProject(
  project: string,
  subdir?: string
): Promise<void> {
  await createSveltekitProject(project, subdir);
  runPackageManagerInstall();
}

describe('svelte e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject('@gb-nx/svelte', 'dist/packages/svelte');

    writeFileSync(
      joinPathFragments(tmpProjPath(), '.npmrc'),
      'install-strategy=nested\n',
      'utf-8'
    );
    runPackageManagerInstall();
    runNxCommandAsync('add prettier');
  });

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  it('should create svelte', async () => {
    const project = uniq('svelte');
    await ensureSveltekitProject(project);
    await runNxCommandAsync(
      `generate @gb-nx/svelte:application --projectPath=apps/${project} --skipFormat --no-interactive --verbose`
    );
    const result = await runNxCommandAsync(`build ${project}`);
    expect(result.stdout).toContain('Executor ran');
  }, 120000);

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const project = uniq('svelte');
      await ensureSveltekitProject(project);
      await runNxCommandAsync(
        `generate @gb-nx/svelte:application --projectPath=apps/${project} --skipFormat --no-interactive --verbose`
      );
      const proj = readJson<ProjectConfiguration>(
        `apps/${project}/project.json`
      );
      expect(proj.name).toEqual(project);
      expect(proj.sourceRoot).toEqual(`apps/${project}/src`);
      expect(proj.namedInputs).toEqual({
        default: ['{projectRoot}/**/*'],
        production: [
          '!{projectRoot}/.svelte-kit/*',
          '!{projectRoot}/build/*',
          '!{projectRoot}/tests/*',
        ],
      });
    }, 120000);
  });

  describe('--tags', () => {
    it('should add tags to the project', async () => {
      const project = uniq('svelte');
      await ensureSveltekitProject(project);
      await runNxCommandAsync(
        `generate @gb-nx/svelte:application --projectPath=apps/${project} --skipFormat --no-interactive --verbose --tags e2etag,e2ePackage`
      );
      const proj = readJson<ProjectConfiguration>(
        `apps/${project}/project.json`
      );
      expect(proj.tags).toEqual(['e2etag', 'e2ePackage']);
    }, 120000);
  });

  describe('route runes', () => {
    it('should create route with runes', async () => {
      const project = uniq('svelte');
      await ensureSveltekitProject(project, `subdir`);
      await runNxCommandAsync(
        `generate @gb-nx/svelte:application --projectPath=subdir/${project} --skipFormat --no-interactive --verbose`
      );
      await runNxCommandAsync(
        `generate @gb-nx/svelte:route a/b/c --runes --load=shared -p=${project} --skipFormat --no-interactive`
      );
      expect(() =>
        checkFilesExist(
          `subdir/${project}/src/routes/a/b/c/+page.svelte`,
          `subdir/${project}/src/routes/a/b/c/+page.js`
        )
      ).not.toThrow();
    }, 120000);
  });

  describe('component runes', () => {
    it('should create component with runes', async () => {
      const project = uniq('svelte');
      await ensureSveltekitProject(project, `subdir`);
      await runNxCommandAsync(
        `generate @gb-nx/svelte:application --projectPath=subdir/${project} --skipFormat --no-interactive --verbose`
      );
      await runNxCommandAsync(
        `generate @gb-nx/svelte:component fun-component --directory=moar/for/you -p=${project} --skipFormat`
      );
      expect(() =>
        checkFilesExist(
          `subdir/${project}/src/lib/moar/for/you/FunComponent.svelte`
        )
      ).not.toThrow();
    }, 120000);
  });
});
