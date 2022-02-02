import { joinPathFragments } from '@nrwl/devkit';
import * as ts from 'typescript';
import { changeExtension } from '../../utils/path-handler';
import {
  BuildExecutorContext,
  BuildExecutorOptions,
  InOutInfo,
} from './schema';

export default async function build(
  inOuts: InOutInfo[],
  options: BuildExecutorOptions,
  context: BuildExecutorContext
): Promise<{ success: boolean }> {
  function compile(fileNames: string[], options: ts.CompilerOptions): boolean {
    let program = ts.createProgram(fileNames, options);
    let emitResult = program.emit();

    let allDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);

    allDiagnostics.forEach((diagnostic) => {
      if (diagnostic.file) {
        let { line, character } = ts.getLineAndCharacterOfPosition(
          diagnostic.file,
          diagnostic.start!
        );
        let message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          '\n'
        );
        context.logger.log(
          `${diagnostic.file.fileName} (${line + 1},${
            character + 1
          }): ${message}`
        );
      } else {
        context.logger.log(
          ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
        );
      }
    });

    const success = !emitResult.emitSkipped;
    return success;
  }

  for (const i of inOuts) {
    i.out = changeExtension(i.out, '.js');
    context.logger.log(i.out.base);
  }
  const files = inOuts.map((io) => joinPathFragments(io.in.dir, io.in.base));
  const success = compile(files, {
    types: ['chrome'],
    outDir: options.outputPath,
    noEmitOnError: true,
    strict: false,
    esModuleInterop: true,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.ES2020,
  });
  return { success };
}
