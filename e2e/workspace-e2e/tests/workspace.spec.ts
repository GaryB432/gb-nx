import {
  checkFilesExist,
  ensureNxProject,
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

    it('should create snake case class module', async () => {
      const project = uniq('workspace');
      await runNxCommandAsync(
        `generate @nx/js:library ${project} --directory=a/b/c/${project} --projectNameAndRootFormat=as-provided --skipFormat --no-interactive`
      );
      await runNxCommandAsync(
        `generate @gb-nx/workspace:module tiddly-winks -p=${project} --kind=class --pascalCaseFiles --directory=subdir`
      );
      await runNxCommandAsync(
        `generate @gb-nx/workspace:module AlsoHere -p=${project} --kind=class --directory=subdir`
      );
      expect(() =>
        checkFilesExist(
          `a/b/c/${project}/src/subdir/TiddlyWinks.ts`,
          `a/b/c/${project}/src/subdir/TiddlyWinks.spec.ts`,
          `a/b/c/${project}/src/subdir/also-here.ts`,
          `a/b/c/${project}/src/subdir/also-here.spec.ts`
        )
      ).not.toThrow();
    }, 120000);
  });
});
