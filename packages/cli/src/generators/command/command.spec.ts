import type { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import applicationGenerator from '../application/application';
import commandGenerator from './command';

describe('command', () => {
  let tree: Tree;
  const projectName = 'my-app';
  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
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
      "/* 
        This is a generated file. Make changes to cli.config.json and run \\"nx sync my-app\\"
        Keep logic in another file. So this one can be regenerated with minimal disruption.
      */

      import * as chalk from 'chalk';
      import { type CommandArgs } from './hello.types';

      export async function helloCommand({ src, FunDest, opts }: CommandArgs): Promise<void> {
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
    expect(tree.read('apps/my-app/src/main.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "#!/usr/bin/env node
      /* This is a generated file. Make changes to cli.config.json and run \\"nx sync my-app\\" */
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
