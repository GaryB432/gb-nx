import { changeExtension } from '../../utils/path-handler';
import { BuildExecutorContext, InOutInfo } from './schema';
import { copy } from 'fs-extra';
import { joinPathFragments } from '@nrwl/devkit';

export default async function build(
  inOuts: InOutInfo[],
  context: BuildExecutorContext
): Promise<{ success: boolean }> {
  for (const i of inOuts) {
    i.out = changeExtension(i.out, i.in.ext);
    const src = joinPathFragments(i.in.dir, i.in.base);
    const dest = joinPathFragments(i.out.dir, i.out.base);
    try {
      void (await copy(src, dest));
    } catch (e) {
      context.logger.error(e.message);
    }
    context.logger.log(i.out.base);
  }
  const success = true;
  return { success };
}
