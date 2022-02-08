/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { exec } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';
import { BuildExecutorContext, BuildExecutorOptions } from './schema';

export default async function build(
  options: BuildExecutorOptions,
  context: BuildExecutorContext
): Promise<{ success: boolean }> {
  const project = context.workspace.projects[context.projectName!];
  const cmds = [
    join(context.root, 'node_modules', '.bin', 'tsc'),
    `--project "${join(project.root, 'tsconfig.app.json')}"`,
    `--rootdir "${project.sourceRoot!}"`,
    `--outdir "${options.outputPath!}"`,
  ];

  if (context.isVerbose) {
    cmds.push('--listemittedfiles');
  }
  const { stdout, stderr } = await promisify(exec)(cmds.join(' '));
  console.log(stdout);
  console.error(stderr);

  const success = !stderr;
  return { success };
}
