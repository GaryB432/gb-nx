import { type ExecutorContext } from '@nx/devkit';
import { type ZipExecutorSchema } from './schema';

export default async function runExecutor(
  options: ZipExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  console.log('Executor ran for Zip', options);
  console.log(Object.keys(context));
  console.log(context.isVerbose);
  return {
    success: true,
  };
}
