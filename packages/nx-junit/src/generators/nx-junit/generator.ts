import {
  addDependenciesToPackageJson,
  formatFiles,
  getProjects,
  getWorkspaceLayout,
  names,
  Tree,
} from "@nrwl/devkit";
import * as ts from "typescript";
import { NxJunitGeneratorSchema } from "./schema";

interface NormalizedSchema extends NxJunitGeneratorSchema {
  projectName: string;
}

function handleJestConfig(sourceFile: ts.SourceFile, project: string): string {
  const exp = sourceFile.getChildAt(0).getChildAt(0) as ts.ExpressionStatement;

  const sourceText = sourceFile.getFullText();
  const bex = exp.getChildAt(0) as ts.BinaryExpression;
  if (bex.kind === ts.SyntaxKind.BinaryExpression) {
    if (bex.left.getText() === "module.exports") {
      const ole = bex.right as ts.ObjectLiteralExpression;
      const lt = ole.getLastToken();
      const position = lt.getFullStart();
      let alreadyReporters = false;
      let last: ts.PropertyAssignment | null = null;
      ole.forEachChild((pa: ts.PropertyAssignment) => {
        if (pa.name.getText() === "reporters") {
          alreadyReporters = true;
        }
        last = pa;
      });

      const rptrs = `reporters: [
        'default',
        [
          'jest-junit',
          {
            outputDirectory: 'junit/apps',
            outputName: '${project}.xml',
          },
        ],
      ]`;

      return alreadyReporters
        ? sourceText
        : [
            sourceText.slice(0, position),
            rptrs,
            sourceText.slice(position),
          ].join("");
    }
  }
}

function normalizeOptions(
  _tree: Tree,
  options: NxJunitGeneratorSchema
): NormalizedSchema {
  const projectName = options.projectName ?? "tbd";
  return { projectName };
}

export default async function (
  tree: Tree,
  options: NxJunitGeneratorSchema
): Promise<void> {
  const normalizedOptions = normalizeOptions(tree, options);
  const ps = getProjects(tree);

  const proj = ps.get(normalizedOptions.projectName);

  if (!proj) {
    throw new Error("project not found");
  }

  const testtarget = proj.targets["test"];

  if (testtarget) {
    const buff = tree.read(testtarget.options.jestConfig);
    const contents = buff ? buff.toString() : "module.exports = {};";
    const newContents = handleJestConfig(
      ts.createSourceFile(
        "",
        contents,
        ts.ScriptTarget.ES2015,
        true,
        ts.ScriptKind.JS
      ),
      normalizedOptions.projectName
    );
    if (newContents !== contents) {
      tree.write(testtarget.options.jestConfig, newContents);
    }
  }
  const cb = addDependenciesToPackageJson(
    tree,
    {},
    {
      "jest-junit": "^13.0.0",
    }
  );

  await formatFiles(tree);
  return cb();
}
