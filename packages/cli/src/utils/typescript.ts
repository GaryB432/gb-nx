// https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API

import * as ts from 'typescript';
import { Kind, KindThing } from './types';

const typeNodes: Record<Kind, ts.TypeNode> = {
  string: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
  boolean: ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
  number: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
  unknown: ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
};

function makeTypeAliasDeclaration(
  params: Record<string, KindThing>
): ts.TypeAliasDeclaration {
  const props = Object.entries(params).map(([param, info]) =>
    ts.factory.createPropertySignature(
      undefined,
      param,
      undefined,
      typeNodes[info.kind]
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
    .map((cmdOpt) =>
      ts.factory.createPropertySignature(
        undefined,
        cmdOpt,
        undefined,
        typeNodes[cmdOpts[cmdOpt].kind]
      )
    );

  return ts.factory.createInterfaceDeclaration(
    undefined,
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
}

function makeImportDelcaration(): ts.ImportDeclaration {
  return ts.factory.createImportDeclaration(
    undefined,
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
      makeImportDelcaration(),
      makeInterfaceDeclaration(options),
      makeTypeAliasDeclaration(params),
    ])
  );

  return printer.printFile(sourceFile);
}
