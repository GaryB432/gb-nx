import { context } from '../../utils/mock-executor-context';
import executor from './executor';
import { EchoExecutorSchema } from './schema';

const options: EchoExecutorSchema = { textToEcho: 'test' };

describe('Build Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
