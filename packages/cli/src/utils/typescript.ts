// https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API

import * as ts from 'typescript';
import type { Kind, KindThing } from './types';

const typeNodes: Record<Kind, ts.TypeNode> = {
  string: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
  boolean: ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
  number: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
  unknown: ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
};

function makeTypeAliasDeclaration(
  params: Record<string, KindThing>
): ts.TypeAliasDeclaration {
  const props = Object.entries(params)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([param, info]) =>
      ts.factory.createPropertySignature(
        undefined,
        param,
        undefined,
        typeNodes[info.kind ?? 'unknown']
      )
    );
  props.push(
    ts.factory.createPropertySignature(
      undefined,
      'opts',
      undefined,
      ts.factory.createTypeReferenceNode('Options')
    )
  );
  return ts.factory.createTypeAliasDeclaration(
    undefined,
    'CommandArgs',
    undefined,
    ts.factory.createTypeLiteralNode(props)
  );
}

function makeInterfaceDeclaration(
  cmdOpts: Record<string, KindThing>
): ts.InterfaceDeclaration {
  const props = Object.keys(cmdOpts)
    .sort((a, b) => a.localeCompare(b))
    .map<ts.PropertySignature>((cmdOpt) =>
      ts.factory.createPropertySignature(
        undefined,
        cmdOpt,
        undefined,
        typeNodes[cmdOpts[cmdOpt].kind ?? 'unknown']
      )
    );

  const declaration = ts.factory.createInterfaceDeclaration(
    undefined,
    'Options',
    undefined,
    [
      ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.factory.createExpressionWithTypeArguments(
          ts.factory.createIdentifier('SharedOptions'),
          []
        ),
      ]),
    ],
    props
  );
  if (props.length === 0) {
    ts.addSyntheticLeadingComment(
      declaration,
      ts.SyntaxKind.MultiLineCommentTrivia,
      ' eslint-disable @typescript-eslint/no-empty-interface ',
      true
    );
  }
  return declaration;
}

function makeImportDelcaration(): ts.ImportDeclaration {
  return ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          true,
          undefined,
          ts.factory.createIdentifier('SharedOptions')
        ),
      ])
    ),
    ts.factory.createStringLiteral('../shared', true)
  );
}

export function makeCommandDeclarations(
  projectName: string,
  params: Record<string, KindThing>,
  options: Record<string, KindThing>
): string {
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  let sourceFile = ts.createSourceFile(
    'dummy.ts',
    '',
    ts.ScriptTarget.ESNext,
    false,
    ts.ScriptKind.TS
  );

  sourceFile = ts.factory.updateSourceFile(
    sourceFile,
    ts.factory.createNodeArray([
      ts.addSyntheticLeadingComment(
        makeImportDelcaration(),
        ts.SyntaxKind.MultiLineCommentTrivia,
        ` This is a generated file. Make changes to cli.config.json and run "nx sync ${projectName}" `,
        true
      ),
      makeInterfaceDeclaration(options),
      makeTypeAliasDeclaration(params),
    ])
  );

  return printer.printFile(sourceFile);
}
