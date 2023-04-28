import { joinPathFragments } from '@nx/devkit';
import { copy } from 'fs-extra';
import { changeExtension } from '../../utils/path-handler';
import type { BuildExecutorContext, InOutInfo } from './executor';

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
    } catch (e: unknown) {
      if (e instanceof Error) {
        context.logger.error(e.message);
      }
    }
    context.logger.log(i.out.base);
  }
  const success = true;
  return { success };
}
