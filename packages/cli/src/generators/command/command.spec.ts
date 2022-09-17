import type { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import applicationGenerator from '../application/application';
import commandGenerator from './command';

describe('command', () => {
  let tree: Tree;
  const projectName = 'my-app';
  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, {
      name: projectName,
    });
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
      "import colors = require('ansi-colors');
      import { CommandArgs } from './hello.types';

      export async function helloCommand({ src, FunDest, opts }: CommandArgs): Promise<void> {
        if (opts.dryRun) {
          console.log(colors.bgYellow.black('Dry Run. Nothing written.'));
        }
        console.log(colors.bgGreenBright.whiteBright('helloCommand works'));
        if (opts.verbose) {
          console.log({ src, FunDest, opts });
        }
      }
      "
    `);
    expect(
      tree.exists('apps/my-app/src/app/commands/hello.command.spec.ts')
    ).toBeTruthy();
    expect(tree.read('apps/my-app/src/main.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "#!/usr/bin/env node
      import sade = require('sade');
      import { helloCommand } from './app/commands';
      const prog = sade('my-app');
      prog
      .version('0.0.1-0')
      .option('--dryRun, -d', 'Do not write to disk')
      .option('--verbose', 'Show extra information')
      .option('-c, --config', 'Provide path to config file', 'cli.config.js');
      prog
      .command('Hello <src> <FunDest>')
      .describe('Hello description')
      .option('--flat','Description of flat')
      .action(async (src,FunDest,opts) => { await helloCommand({ src,FunDest,opts }); });
      prog.parse(process.argv);"
    `);
    expect(
      tree.read('apps/my-app/src/app/commands/hello.types.d.ts', 'utf-8')
    ).toContain('src: string;');
  });
});
