/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { GeneratorCallback, Tree } from '@nrwl/devkit';
import {
  addDependenciesToPackageJson,
  formatFiles,
  getProjects,
  getWorkspaceLayout,
  joinPathFragments,
  logger,
  names,
} from '@nrwl/devkit';
import * as ts from 'typescript';
import type { Schema as NxJunitGeneratorSchema } from './schema';

interface NormalizedSchema extends NxJunitGeneratorSchema {
  tbd: boolean;
}

function handleJestConfig(sourceFile: ts.SourceFile, rptrs: string): string {
  const sourceText = sourceFile.getFullText();
  const ea = sourceFile.getChildAt(0).getChildAt(0) as ts.ExportAssignment;

  if (ea.kind !== ts.SyntaxKind.ExportAssignment) {
    logger.warn('unexpected configuration');
  }

  const ole = ea.expression as ts.ObjectLiteralExpression;
  const lt = ole.getLastToken()!;
  const position = lt.getFullStart();
  let alreadyReporters = false;
  for (const p of ole.properties) {
    if (p.name && p.name.getText() === 'reporters') {
      alreadyReporters = true;
    }
  }
  return alreadyReporters
    ? sourceText
    : [sourceText.slice(0, position), rptrs, sourceText.slice(position)].join(
        ''
      );
}

function normalizeOptions(
  _tree: Tree,
  options: NxJunitGeneratorSchema
): NormalizedSchema {
  const project = options.project || 'N/A';
  const reporterVersion = options.reporterVersion ?? '^14.0.0';
  return { project, reporterVersion, tbd: true };
}

export default async function (
  tree: Tree,
  options: NxJunitGeneratorSchema
): Promise<GeneratorCallback> {
  const normalizedOptions = normalizeOptions(tree, options);
  const ws = getWorkspaceLayout(tree);
  const ps = getProjects(tree);

  const proj = ps.get(normalizedOptions.project ?? '');

  if (!proj) {
    throw new Error('project not found');
  }

  const testtarget = proj.targets!['test'];
  const outputDirectory = joinPathFragments(
    'junit',
    proj.projectType === 'application' ? ws.appsDir : ws.libsDir
  );
  const outputName = names(normalizedOptions.project!).fileName + '.xml';

  if (testtarget) {
    const buff = tree.read(testtarget.options.jestConfig);
    const contents = buff ? buff.toString() : 'export default {};';
    const newContents = handleJestConfig(
      ts.createSourceFile(
        '',
        contents,
        ts.ScriptTarget.ES2015,
        true,
        ts.ScriptKind.TS
      ),
      `reporters: [
        'default',
        [
          'jest-junit',
          {
            outputDirectory: '${outputDirectory}',
            outputName: '${outputName}',
          },
        ],
      ]`
    );
    if (newContents !== contents) {
      tree.write(testtarget.options.jestConfig, newContents);
    }
  }
  const installTask = addDependenciesToPackageJson(
    tree,
    {},
    {
      'jest-junit': normalizedOptions.reporterVersion || '*',
    }
  );

  await formatFiles(tree);

  return async () => {
    await installTask();
  };
}
