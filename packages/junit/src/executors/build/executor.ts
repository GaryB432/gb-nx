import type { Schema as BuildExecutorSchema } from './schema';

export interface NxJunitExecutorResult {
  success: boolean;
}

// TODO remove
export default async function runExecutor(
  options: BuildExecutorSchema
): Promise<NxJunitExecutorResult> {
  console.log('Executor ran for Build', options);
  return {
    success: true,
  };
}
