import type { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { createSvelteKitApp } from '../../utils/svelte';
import generator from './generator';
import type { Schema as ApplicationGeneratorSchema } from './schema';

const PRETTIERIGNORE = '.prettierignore';

const installPackagesTask = jest.fn();

jest.mock('@nrwl/devkit', () => {
  const devkit = { ...jest.requireActual('@nrwl/devkit') };
  return {
    ...devkit,
    installPackagesTask: jest.fn(),
  };
});

describe('application generator', () => {
  let appTree: Tree;
  const options: ApplicationGeneratorSchema = { name: 'test' };

  const version = '0.0.0-alpha.0';

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    jest.clearAllMocks();
    createSvelteKitApp(appTree, version, {
      name: 'test',
      directory: 'apps',
    });
  });

  it('should add prettier-plugin-svelte', async () => {
    await generator(appTree, options);
    const p = JSON.parse(appTree.read('package.json')!.toString());
    const v = p.devDependencies['prettier-plugin-svelte'];
    expect(v).toEqual('1.1.1');
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    // const config = readProjectConfiguration(appTree, 'test');

    const { nx } = JSON.parse(
      appTree.read('apps/test/package.json')!.toString()
    );

    expect(nx).toEqual({
      namedInputs: {
        default: ['{projectRoot}/**/*'],
        production: [
          '!{projectRoot}/.svelte-kit/*',
          '!{projectRoot}/build/*',
          '!{projectRoot}/tests/*',
        ],
      },
      targets: {
        build: {
          inputs: ['production', '^production'],
          outputs: ['{projectRoot}/build'],
          dependsOn: ['^build'],
        },
      },
    });
    // expect(installPackagesTask.mock.calls.length).toBe(2);
  });

  it('should update prettier', async () => {
    appTree.write(PRETTIERIGNORE, '# hi\n\ndist\nstuff\n');
    await generator(appTree, options);
    const p = appTree.read(PRETTIERIGNORE);
    expect(p?.toString()).toMatchInlineSnapshot(`
      "# hi

      dist
      stuff

      apps/test/.svelte-kit
      apps/test/build
      "
    `);
  });

  it('should not update prettier twice', async () => {
    appTree.write(
      PRETTIERIGNORE,
      '# hi\n\ndist\nstuff\n\napps/test/.svelte-kit\napps/test/build\n'
    );
    await generator(appTree, options);
    const p = appTree.read(PRETTIERIGNORE);
    expect(p?.toString()).toMatchInlineSnapshot(`
      "# hi

      dist
      stuff

      apps/test/.svelte-kit
      apps/test/build

      "
    `);
  });

  it('should create prettier', async () => {
    await generator(appTree, options);
    const p = appTree.read(PRETTIERIGNORE);
    expect(p?.toString()).toMatchInlineSnapshot(`
      "# Add files here to ignore them from prettier formatting

      apps/test/.svelte-kit
      apps/test/build
      "
    `);
  });

  it('should add workspace', async () => {
    await generator(appTree, options);
    const p = appTree.read('package.json');
    const s = p ? p.toString(): '';
    const q = JSON.parse(s);
    expect(q.workspaces).toEqual(['apps/test']);
  });
});
