import { ExecutorContext } from '@nx/devkit';
import executor from './executor';
import { type ZipExecutorSchema } from './schema';

const options: ZipExecutorSchema = {
  project: 'my-app',
  outputFileName: 'zip/my-app/fun/tbd',
};

describe('Zip Executor', () => {
  it('can run', async () => {
    const f: ExecutorContext = {
      root: '',
      cwd: '',
      isVerbose: false,
    };
    const output = await executor(options, f);
    expect(output.success).toBe(true);
  });
});
