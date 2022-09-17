import executor from './executor';
import type { BuildExecutor } from './schema';

const options: BuildExecutor = {};

describe('Build Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
