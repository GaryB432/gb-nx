import { BuildExecutor } from './schema';

export default async function runExecutor(options: BuildExecutor) {
  console.log('Executor ran for Build', options);
  return {
    success: true,
  };
}
