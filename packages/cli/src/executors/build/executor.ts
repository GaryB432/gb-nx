import type { Schema as BuildExecutorSchema } from './schema';

export default async function runExecutor(
  options: BuildExecutorSchema
): Promise<{ success: boolean }> {
  console.log('Executor ran for Build', options);
  return {
    success: true,
  };
}
