import { joinPathFragments } from '@nrwl/devkit';
import { exec } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';
import { changeExtension } from '../../utils/path-handler';
import { BuildExecutorContext, InOutInfo } from './executor';

export default async function build(
  inOuts: InOutInfo[],
  context: BuildExecutorContext
): Promise<{ success: boolean }> {
  let success = true;
  for (const i of inOuts) {
    i.out = changeExtension(i.out, '.css');
    const src = joinPathFragments(i.in.dir, i.in.base);
    const dest = joinPathFragments(i.out.dir, i.out.base);
    const { stderr } = await promisify(exec)(
      `${join('node_modules', '.bin', 'sass')} ${src} ${dest}`
    );
    // context.logger.log(stdout);
    if (stderr) {
      context.logger.error(stderr);
      success = false;
    }
    context.logger.log(i.out.base);
  }

  return { success };
}
