/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ExecutorContext, joinPathFragments } from '@nrwl/devkit';
import * as fg from 'fast-glob';
import { parse, ParsedPath } from 'path';
import { Logger } from '../../utils/logger';
import { translateToOutputPath } from '../../utils/path-handler';
import buildCopy from '../build/build.copy';
import buildSass from '../build/build.sass';
import buildTsc from '../build/build.tsc';
import { Schema as BuildExecutorSchema } from './schema';

interface BuildExecutorSchemax {
  manifest: string;
  outputPath: string;
  watch?: boolean;
}

export interface InOutInfo {
  in: ParsedPath;
  out: ParsedPath;
}

interface BuildExecutorOptionsx extends BuildExecutorSchema {
  textToEcho: string;
}

export interface BuildExecutorContext extends ExecutorContext {
  logger: Logger;
}

async function getInOuts(
  schema: BuildExecutorSchema,
  context: BuildExecutorContext
): Promise<InOutInfo[]> {
  const project = context.workspace.projects[context.projectName!];

  const allSrcs = await fg(joinPathFragments(project.sourceRoot!, '**/*.*'), {
    dot: true,
    cwd: context.root,
  });

  return allSrcs.map((s) => ({
    in: parse(s),
    out: translateToOutputPath(s, project.sourceRoot!, schema.outputPath!),
  }));
}

async function normalizeOptions(
  schema: BuildExecutorSchema,
  _context: BuildExecutorContext
): Promise<BuildExecutorSchema> {
  return { ...schema, textToEcho: schema.manifest };
}

export default async function runExecutor(
  schema: BuildExecutorSchema,
  context: BuildExecutorContext
): Promise<{ success: boolean }> {
  context.logger = new Logger();
  const options = await normalizeOptions(schema, context);
  const isTsc = (p: ParsedPath) => p.ext === '.ts';
  const isSass = (p: ParsedPath) => p.ext === '.scss';
  const isOther = (p: ParsedPath) => !isTsc(p) && !isSass(p);

  const inOuts = await getInOuts(options, context);

  const ts = await buildTsc(options, context);
  context.logger.flush();

  const ss = await buildSass(
    inOuts.filter((i) => isSass(i.in)),
    context
  );
  context.logger.flush();

  const cs = await buildCopy(
    inOuts.filter((i) => isOther(i.in)),
    context
  );
  context.logger.flush();

  const success = ts.success && cs.success && ss.success;

  return { success };
}
