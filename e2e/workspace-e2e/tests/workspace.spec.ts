import { type ProjectConfiguration } from '@nx/devkit';
import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nx/plugin/testing';

describe('workspace e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject('@gb-nx/workspace', 'dist/packages/workspace');
  });

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  describe('normal', () => {
    it('should create module', async () => {
      const project = uniq('workspace');
      await runNxCommandAsync(
        `generate @nx/js:library ${project} --directory=a/b/c/${project} --projectNameAndRootFormat=as-provided --skipFormat --no-interactive`
      );
      await runNxCommandAsync(
        `generate @gb-nx/workspace:module checkers -p=${project} --kind=values --directory=subdir`
      );
      expect(() =>
        checkFilesExist(
          `a/b/c/${project}/src/subdir/checkers.ts`,
          `a/b/c/${project}/src/subdir/checkers.spec.ts`
        )
      ).not.toThrow();
    }, 120000);
  });

  describe('--tags', () => {
    it.skip('should add tags to the project', async () => {
      const projectName = uniq('workspace');
      ensureNxProject('@gb-nx/workspace', 'dist/packages/workspace');
      await runNxCommandAsync(
        `generate @nx/js:library ${projectName} --directory=apps/${projectName} --projectNameAndRootFormat=as-provided --skipFormat --no-interactive`
      );
      await runNxCommandAsync(
        `generate @gb-nx/workspace:module stuff -p=${projectName} --tags e2etag,e2ePackage`
      );
      const project = readJson<ProjectConfiguration>(
        `apps/${projectName}/project.json`
      );
      expect(project.tags).toEqual(['e2etag', 'e2ePackage']);
    }, 120000);
  });
});
