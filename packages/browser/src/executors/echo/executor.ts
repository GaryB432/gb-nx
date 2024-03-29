import type { ExecutorContext } from '@nx/devkit';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { Schema as EchoExecutorSchema } from './schema';

export default async function runExecutor(
  options: EchoExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  console.info(`Executing "echo"...`);
  console.info(`Options: ${JSON.stringify(options, null, 2)}`);
  console.info(`Context: ${JSON.stringify(context, null, 2)}`);

  const { stdout, stderr } = await promisify(exec)(
    `echo ${options.textToEcho}`
  );
  console.log(stdout);
  console.error(stderr);

  const success = !stderr;
  return { success };
}
