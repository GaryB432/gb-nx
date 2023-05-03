/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { GeneratorCallback, TargetConfiguration, Tree } from '@nx/devkit';
import {
  addDependenciesToPackageJson,
  formatFiles,
  getProjects,
  getWorkspaceLayout,
  installPackagesTask,
  joinPathFragments,
  logger,
  names,
  updateProjectConfiguration,
} from '@nx/devkit';
import * as ts from 'typescript';
import type { Schema as NxJunitGeneratorSchema } from './schema';

interface JestTargetOptions {
  jestConfig: string;
}

function handleJestConfig(sourceFile: ts.SourceFile, rptrs: string): string {
  const sourceText = sourceFile.getFullText();
  const exportAssignment = sourceFile
    .getChildAt(0)
    .getChildAt(0) as ts.ExportAssignment;

  if (exportAssignment.kind !== ts.SyntaxKind.ExportAssignment) {
    logger.warn('unexpected configuration');
  }

  const ole = exportAssignment.expression as ts.ObjectLiteralExpression;
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

function updateJestConfig(
  tree: Tree,
  jestConfig: string,
  outputDirectory: string,
  outputName: string
) {
  const buff = tree.read(jestConfig);
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
    tree.write(jestConfig, newContents);
  }
}

function updateGitIgnore(tree: Tree) {
  const fn = '.gitignore';
  const newIgnore = '/junit';
  const buff = tree.read(fn);
  const ignoreds = buff
    ? buff.toString().split(/[\r\n]/)
    : [
        '# See http://help.github.com/ignore-files/ for more about ignoring files.',
      ];
  if (!ignoreds.includes(newIgnore)) {
    tree.write(fn, [...ignoreds, newIgnore, ''].join('\n'));
  }
}

export default async function (
  tree: Tree,
  options: NxJunitGeneratorSchema
): Promise<GeneratorCallback> {
  const ws = getWorkspaceLayout(tree);
  const ps = getProjects(tree);

  options.project = options.project ?? '';

  const proj = ps.get(options.project);

  if (!proj) {
    throw new Error('project not found');
  }

  if (proj.targets) {
    const testtarget: TargetConfiguration<JestTargetOptions> =
      proj.targets['test'];

    if (testtarget && testtarget.options) {
      const targetOutputs = testtarget.outputs ?? [];
      const outputName = names(options.project).fileName + '.xml';
      const outputDirectory = joinPathFragments(
        'junit',
        proj.projectType === 'application' ? ws.appsDir : ws.libsDir
      );

      updateJestConfig(
        tree,
        testtarget.options.jestConfig,
        outputDirectory,
        outputName
      );
      testtarget.outputs = [
        ...new Set([
          ...targetOutputs,
          joinPathFragments('{workspaceRoot}', outputDirectory, outputName),
        ]),
      ];
      updateProjectConfiguration(tree, options.project, proj);
      updateGitIgnore(tree);
    }
  }

  const installTask = addDependenciesToPackageJson(
    tree,
    {},
    {
      'jest-junit': options.reporterVersion || '*',
    }
  );

  await formatFiles(tree);

  return async () => {
    await installTask();
    installPackagesTask(tree);
  };
}
