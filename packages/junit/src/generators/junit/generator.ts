/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { ProjectType, Tree } from '@nrwl/devkit';
import {
  addDependenciesToPackageJson,
  formatFiles,
  getProjects,
  getWorkspaceLayout,
  installPackagesTask,
  names,
} from '@nrwl/devkit';
import { posix } from 'path';
import * as ts from 'typescript';
import type { Schema as NxJunitGeneratorSchema } from './schema';

interface NormalizedSchema extends NxJunitGeneratorSchema {
  tbd: boolean;
}

function handleJestConfig(sourceFile: ts.SourceFile, rptrs: string): string {
  const exp = sourceFile.getChildAt(0).getChildAt(0) as ts.ExpressionStatement;

  const sourceText = sourceFile.getFullText();
  const bex = exp.getChildAt(0) as ts.BinaryExpression;
  if (bex.kind === ts.SyntaxKind.BinaryExpression) {
    if (bex.left.getText() === 'module.exports') {
      const ole = bex.right as ts.ObjectLiteralExpression;
      const lt = ole.getLastToken()!;
      const position = lt.getFullStart();
      let alreadyReporters = false;
      ole.forEachChild((n: ts.Node) => {
        if (n.kind === ts.SyntaxKind.PropertyAssignment) {
          const pa = n as ts.PropertyAssignment;
          if (pa.name.getText() === 'reporters') {
            alreadyReporters = true;
          }
        }
      });

      return alreadyReporters
        ? sourceText
        : [
            sourceText.slice(0, position),
            rptrs,
            sourceText.slice(position),
          ].join('');
    }
  }
  return sourceText;
}

function normalizeOptions(
  _tree: Tree,
  options: NxJunitGeneratorSchema
): NormalizedSchema {
  const projectName = options.projectName || 'N/A';
  const reporterVersion = options.reporterVersion ?? '^13.0.0';
  return { projectName, reporterVersion, tbd: true };
}

export default async function (
  tree: Tree,
  options: NxJunitGeneratorSchema
): Promise<void> {
  const normalizedOptions = normalizeOptions(tree, options);
  const ws = getWorkspaceLayout(tree);
  const ps = getProjects(tree);

  const proj = ps.get(normalizedOptions.projectName!);

  if (!proj) {
    throw new Error('project not found');
  }

  const testtarget = proj.targets!['test'];

  const dirMap = new Map<ProjectType, string>([
    ['application', ws.appsDir],
    ['library', ws.libsDir],
  ]);

  const outputDirectory = posix.join('junit', dirMap.get(proj.projectType!)!);
  const outputName = names(normalizedOptions.projectName!).fileName + '.xml';

  if (testtarget) {
    const buff = tree.read(testtarget.options.jestConfig);
    const contents = buff ? buff.toString() : 'module.exports = {};';
    const newContents = handleJestConfig(
      ts.createSourceFile(
        '',
        contents,
        ts.ScriptTarget.ES2015,
        true,
        ts.ScriptKind.JS
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
  addDependenciesToPackageJson(
    tree,
    {},
    {
      'jest-junit': normalizedOptions.reporterVersion || '*',
    }
  );

  await formatFiles(tree);
  return installPackagesTask(tree);
}
