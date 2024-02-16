import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nx/plugin/testing';

describe('browser e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject('@gb-nx/browser', 'dist/packages/browser');
  });

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  it('should create extension', async () => {
    const project = uniq('extension');
    await runNxCommandAsync(
      `generate @gb-nx/browser:extension ${project} --directory=a/b --no-interactive --skipFormat`
    );
    const result = await runNxCommandAsync(`build ${project}`);
    expect(result.stdout).toContain(
      `Successfully ran target build for project ${project}`
    );
  }, 120000);

  it('should zip extension', async () => {
    const project = uniq('extension');
    await runNxCommandAsync(
      `generate @gb-nx/browser:extension ${project} --directory=flaps/${project} --no-interactive --skipFormat`
    );
    await runNxCommandAsync(`run ${project}:build:production`);
    const result = await runNxCommandAsync(`zip ${project} --no-tagGit`);
    expect(result.stdout).toContain(
      `Successfully ran target zip for project ${project}`
    );
  }, 120000);

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const project = uniq('extension');
      await runNxCommandAsync(
        `generate @gb-nx/browser:extension ${project} --directory=d/efg --no-interactive --skipFormat`
      );
      expect(() =>
        checkFilesExist(
          'd/efg/src/environments/environment.prod.ts',
          'd/efg/src/environments/environment.ts',
          'd/efg/src/scripts/sw.ts',
          `d/efg/src/scripts/${project}.content_script.ts`,
          'd/efg/src/main.ts',
          'd/efg/src/manifest.json',
          'd/efg/src/options.html',
          'd/efg/src/options.scss',
          'd/efg/src/options.ts',
          'd/efg/src/popup.html',
          'd/efg/src/popup.scss',
          'd/efg/src/popup.ts',
          'd/efg/webpack.config.js'
        )
      ).not.toThrow();
    }, 120000);
  });

  describe('--tags', () => {
    it('should add tags to the project', async () => {
      const projectName = uniq('extension');
      ensureNxProject('@gb-nx/browser', 'dist/packages/browser');
      await runNxCommandAsync(
        `generate @gb-nx/browser:extension ${projectName} --directory=e/f/${projectName} --skipFormat --tags e2etag,e2ePackage`
      );
      const project = readJson(`e/f/${projectName}/project.json`);
      expect(project.tags).toEqual(['e2etag', 'e2ePackage']);
    }, 120000);
  });
});
