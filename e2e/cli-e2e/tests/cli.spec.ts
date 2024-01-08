import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nx/plugin/testing';

describe('cli e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject('@gb-nx/cli', 'dist/packages/cli');
  });

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  it('should create cli', async () => {
    const project = uniq('cli');
    await runNxCommandAsync(`generate @gb-nx/cli:application ${project}`);
    const result = await runNxCommandAsync(`build ${project}`);
    expect(result.stdout).toContain('webpack compiled');
    expect(() => checkFilesExist(`dist/${project}/main.js`)).not.toThrow();
  }, 120000);

  describe('--directory', () => {
    it('should create config in the specified directory', async () => {
      const project = uniq('cli');
      await runNxCommandAsync(
        `generate @gb-nx/cli:application ${project} --directory subdir/${project} --no-interactive`
      );
      expect(() =>
        checkFilesExist(`subdir/${project}/cli.config.json`)
      ).not.toThrow();
    }, 120000);
  });

  describe('command', () => {
    it('should create command', async () => {
      const project = uniq('cli');
      await runNxCommandAsync(
        `generate @gb-nx/cli:application ${project} --directory subdir/${project} --no-interactive`
      );
      await runNxCommandAsync(
        `generate @gb-nx/cli:command greet --parameter=one --parameter=two --option=three --option=four -p=${project} --no-interactive`
      );
      expect(() =>
        checkFilesExist(`subdir/${project}/cli.config.json`)
      ).not.toThrow();
    }, 120000);
  });

  describe('--tags', () => {
    it('should add tags to the project', async () => {
      const projectName = uniq('cli');
      // ensureNxProject('@gb-nx/cli', 'dist/packages/cli');
      await runNxCommandAsync(
        `generate @gb-nx/cli:application ${projectName} --directory=a --tags e2etag,e2ePackage`
      );
      const project = readJson(`a/project.json`);
      expect(project.tags).toEqual(['e2etag', 'e2ePackage']);
    }, 120000);
  });
});
