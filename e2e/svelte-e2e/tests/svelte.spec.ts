import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nx/plugin/testing';
import { createProject } from '../utils/create-project';

describe.skip('svelte e2e', () => {
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
    await createProject(project);
    const cc = await runNxCommandAsync(
      `generate @gb-nx/svelte:application --projectPath=apps/${project} --skipFormat`
    );
    console.log(cc.stderr);
    const result = await runNxCommandAsync(`build ${project}`);
    expect(result.stdout).toContain('Executor ran');
    console.log(result.stderr);
    console.log('wtf');
  }, 120000);

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const project = uniq('svelte');
      await createProject(project);
      await runNxCommandAsync(
        `generate @gb-nx/svelte:application ${project} --projectPath=apps/${project} --skipFormat`
      );

      const proj = readJson(`apps/${project}/project.json`);
      expect(proj).toEqual({});
    }, 120000);
  });

  // describe('--tags', () => {
  //   it('should add tags to the project', async () => {
  //     const projectName = uniq('svelte');
  //     ensureNxProject('@gb-nx/svelte', 'dist/packages/svelte');
  //     await runNxCommandAsync(
  //       `generate @gb-nx/svelte:application ${projectName} --tags e2etag,e2ePackage`
  //     );
  //     const project = readJson(`libs/${projectName}/project.json`);
  //     expect(project.tags).toEqual(['e2etag', 'e2ePackage']);
  //   }, 120000);
  // });
});
