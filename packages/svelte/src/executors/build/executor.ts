import { BuildExecutor } from './schema';

export default async function runExecutor(
  options: BuildExecutor
): Promise<{ success: boolean }> {
  // console.log('Executor ran for Build', options);
  return {
    success: true,
  };
}
