/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { execSync } from 'child_process';
import { join } from 'path';
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

  const execute = cmds.join(' ');

  try {
    console.log(`Executing command: ${execute}`);
    const { cwd } = context;
    execSync(execute, { cwd, stdio: [0, 1, 2] });
    return { success: true };
  } catch (e) {
    console.error(`Failed to execute command: ${execute}`, e);
    return { success: false };
  }
}
