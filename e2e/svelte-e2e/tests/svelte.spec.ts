import {
  ensureNxProject,
  readJson,
  runCommandAsync,
  runNxCommandAsync,
  uniq,
} from '@nx/plugin/testing';
import { createProject } from '../utils/create-project';
import { ProjectConfiguration } from '@nx/devkit';

describe('svelte e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject('@gb-nx/svelte', 'dist/packages/svelte');
  });

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  it('should create svelte', async () => {
    const project = uniq('svelte');
    await runCommandAsync('npm add prettier -D');
    await createProject(project);
    await runNxCommandAsync(
      `generate @gb-nx/svelte:application --projectPath=apps/${project} --skipFormat`
    );
    const result = await runNxCommandAsync(`build ${project}`);
    expect(result.stdout).toContain('Executor ran');
  }, 120000);

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const project = uniq('svelte');
      await runCommandAsync('npm add prettier -D');
      await createProject(project);
      await runNxCommandAsync(
        `generate @gb-nx/svelte:application --projectPath=apps/${project} --skipFormat`
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
      const projectName = uniq('svelte');
      await runCommandAsync('npm add prettier -D');
      ensureNxProject('@gb-nx/svelte', 'dist/packages/svelte');
      await runNxCommandAsync(
        `generate @gb-nx/svelte:application --projectPath=apps/${projectName} --tags e2etag,e2ePackage`
      );
      const project = readJson(`libs/${projectName}/project.json`);
      expect(project.tags).toEqual(['e2etag', 'e2ePackage']);
    }, 120000);
  });
});
