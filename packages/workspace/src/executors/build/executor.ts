import type { Schema as BuildExecutor } from './schema';

// TODO remove
export default async function runExecutor(
  options: BuildExecutor
): Promise<{ success: boolean }> {
  console.log('Executor ran for Build', options);
  return {
    success: true,
  };
}
