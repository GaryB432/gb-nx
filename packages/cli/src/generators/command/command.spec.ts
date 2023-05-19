import { output, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import applicationGenerator from '../application/application';
import refreshGenerator from '../refresh/refresh';
import { type Schema as RefreshSchema } from '../refresh/schema';
import commandGenerator from './command';

let noted: { title: string };

const projectName = 'my-app';

jest.mock('../refresh/refresh', () => {
  return {
    default: jest.fn((_tree: unknown, options: RefreshSchema) => {
      if (!options.all || options.project !== projectName) {
        throw new Error('incorrect refresh options');
      }
    }),
  };
});

const mockOutputNote = jest
  .spyOn(output, 'note')
  .mockImplementation((m) => (noted = { ...m }));

describe('command', () => {
  let tree: Tree;
  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    await applicationGenerator(tree, {
      name: projectName,
    });
    jest.clearAllMocks();
  });

  it('should disallow opts parameter', async () => {
    await expect(
      commandGenerator(tree, {
        name: 'Hello',
        project: projectName,
        parameter: ['src', 'opts', 'FunDest'],
        option: ['flat'],
      })
    ).rejects.toThrow('reserved parameter name');
  });

  it('should generate command in commands directory', async () => {
    await commandGenerator(tree, {
      name: 'Hello',
      project: projectName,
      parameter: ['src', 'FunDest'],
      option: ['flat'],
    });

    expect(tree.read('apps/my-app/src/app/commands/hello.command.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "/* 
        This is a generated file. Make changes to cli.config.json and run "nx sync my-app"
        Keep logic in another file. So this one can be regenerated with minimal disruption.
      */

      import * as chalk from 'chalk';
      import { type CommandArgs } from './hello.types';

      export async function helloCommand({
        src,
        FunDest,
        opts,
      }: CommandArgs): Promise<void> {
        if (opts.verbose) {
          console.log({ src, FunDest, opts });
        }
        if (opts.dryRun) {
          console.log(chalk.yellowBright('Dry Run. Nothing written.'));
        } else {
          console.log(chalk.bgGreenBright.whiteBright('helloCommand works'));
        }
      }
      "
    `);
    expect(
      tree.exists('apps/my-app/src/app/commands/hello.command.spec.ts')
    ).toBeTruthy();

    expect(refreshGenerator).toHaveBeenCalledTimes(1);
    expect(mockOutputNote).toHaveBeenCalledTimes(1);
    expect(noted.title).toEqual('Next steps');
  });
});
