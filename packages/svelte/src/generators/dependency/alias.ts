import { tsquery } from '@phenomnomnominal/tsquery';
import type {
  Identifier,
  ObjectLiteralExpression,
  PropertyAssignment,
  SourceFile,
  StringLiteral,
  SyntaxList,
} from 'typescript';
import { SyntaxKind } from 'typescript';
import { stringInsert } from '../../utils/strings';

export interface Alias {
  name: string;
  path: string;
}

const SVELTE_CONFIG_KIT_OBJECT_LITERAL_SELECTOR =
  'PropertyAssignment:has(Identifier[name=kit]) ObjectLiteralExpression';

function getKitLiteral(
  configContents: string
): ObjectLiteralExpression | undefined {
  const ast: SourceFile = tsquery.ast(configContents);
  const qresults = tsquery<ObjectLiteralExpression>(
    ast,
    SVELTE_CONFIG_KIT_OBJECT_LITERAL_SELECTOR,
    { visitAllChildren: true }
  );

  return qresults[0];
}

function getAliasesFromPropertyAssignment(
  aliasAssignment: PropertyAssignment
): Alias[] {
  const objectLiteral = aliasAssignment.getChildren().find((node) => {
    return node.kind === SyntaxKind.ObjectLiteralExpression;
  }) as ObjectLiteralExpression | undefined;

  if (!objectLiteral) {
    return [];
  }

  const syntaxList = objectLiteral.getChildren().find((node) => {
    return node.kind === SyntaxKind.SyntaxList;
  }) as SyntaxList | undefined;

  if (!syntaxList) {
    return [];
  }

  return syntaxList
    .getChildren()
    .filter((node) => node.kind === SyntaxKind.PropertyAssignment)
    .map<Alias>((n) => aliasFromPropertyAssignment(n as PropertyAssignment));
}

export function getConfiguredAliases(configContents: string): Alias[] {
  const kitLiteral = getKitLiteral(configContents);

  if (kitLiteral) {
    const syntaxList = kitLiteral.getChildren().find((node) => {
      return node.kind === SyntaxKind.SyntaxList;
    }) as SyntaxList;

    const aliasAssignment = syntaxList
      .getChildren()
      .find(
        (node) =>
          node.kind === SyntaxKind.PropertyAssignment &&
          node.getChildAt(0).getText() === 'alias'
      ) as PropertyAssignment;

    if (aliasAssignment) {
      return getAliasesFromPropertyAssignment(aliasAssignment);
    }
  }
  return [];
}

export function aliasFromPropertyAssignment(node: PropertyAssignment): Alias {
  const identifier = node.name as Identifier;
  const name = identifier.text;

  const initializer = node.initializer as StringLiteral;
  const path = initializer.text;

  return { name, path };
}

export function addToSvelteConfiguration(
  configContents: string,
  alias: Alias
): string {
  const kitLiteral = getKitLiteral(configContents);

  if (kitLiteral) {
    const syntaxList = kitLiteral.getChildren().find((node) => {
      return node.kind === SyntaxKind.SyntaxList;
    }) as SyntaxList;

    const aliasAssignment = syntaxList
      .getChildren()
      .find(
        (node) =>
          node.kind === SyntaxKind.PropertyAssignment &&
          node.getChildAt(0).getText() === 'alias'
      ) as PropertyAssignment;

    if (aliasAssignment) {
      const aliases = getConfiguredAliases(configContents);
      const brace = aliasAssignment.getLastToken();
      if (brace && brace.kind === SyntaxKind.CloseBraceToken) {
        const commaNeeded = aliases.length > 1;
        configContents = stringInsert(
          configContents,
          brace.getFullStart(),
          commaNeeded,
          initializerString(alias)
        );
      }
    } else {
      const brace = kitLiteral.getLastToken();
      if (brace && brace.kind === SyntaxKind.CloseBraceToken) {
        const commaNeeded = syntaxList.getChildCount() > 0;
        configContents = stringInsert(
          configContents,
          brace.getFullStart(),
          commaNeeded,
          `alias: {${initializerString(alias)}}`
        );
      }
    }
  }

  return configContents;
}

export function initializerString(alias: Alias): string {
  return `'${alias.name}': '${alias.path}'`;
}
