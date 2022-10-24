import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';
describe('junit e2e', () => {
  it('should create junit', async () => {
    const plugin = uniq('junit');
    ensureNxProject('@gb-nx/junit', 'dist/packages/junit');
    await runNxCommandAsync(`generate @gb-nx/junit:junit ${plugin}`);

    const result = await runNxCommandAsync(`build ${plugin}`);
    expect(result.stdout).toContain('Executor ran');
  }, 120000);

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const plugin = uniq('junit');
      ensureNxProject('@gb-nx/junit', 'dist/packages/junit');
      await runNxCommandAsync(
        `generate @gb-nx/junit:junit ${plugin} --directory subdir`
      );
      expect(() =>
        checkFilesExist(`libs/subdir/${plugin}/src/index.ts`)
      ).not.toThrow();
    }, 120000);
  });

  describe('--tags', () => {
    it('should add tags to the project', async () => {
      const plugin = uniq('junit');
      ensureNxProject('@gb-nx/junit', 'dist/packages/junit');
      await runNxCommandAsync(
        `generate @gb-nx/junit:junit ${plugin} --tags e2etag,e2ePackage`
      );
      const project = readJson(`libs/${plugin}/project.json`);
      expect(project.tags).toEqual(['e2etag', 'e2ePackage']);
    }, 120000);
  });
});
