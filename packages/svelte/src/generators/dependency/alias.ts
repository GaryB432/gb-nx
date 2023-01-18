import type {
  Identifier,
  ObjectLiteralExpression,
  PropertyAssignment,
  StringLiteral,
  SyntaxList,
} from 'typescript';
import { SyntaxKind } from 'typescript';
import { type NamedPath } from '../../utils/paths';
import { stringInsert } from '../../utils/strings';
import { getKitLiteral } from '../../utils/svelte';

export interface AliasConfiguration {
  aliases: NamedPath[];
  useComma: boolean;
}
function isCommaNeeded(aliasAssignment: PropertyAssignment): boolean {
  if (aliasAssignment.getChildCount() !== 3) {
    throw new Error('expecting 3');
  }
  const aliasInitializer =
    aliasAssignment.initializer as ObjectLiteralExpression;
  const aliasSyntaxList = aliasInitializer.getChildAt(1) as SyntaxList;

  const lastToken = aliasSyntaxList.getLastToken();
  return lastToken ? lastToken.kind !== SyntaxKind.CommaToken : false;
}

function getAliasesFromPropertyAssignment(
  aliasAssignment: PropertyAssignment
): NamedPath[] {
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
    .map<NamedPath>((n) =>
      aliasFromPropertyAssignment(n as PropertyAssignment)
    );
}

export function getConfiguredAliases(configContents: string): NamedPath[] {
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

export function aliasFromPropertyAssignment(
  node: PropertyAssignment
): NamedPath {
  const identifier = node.name as Identifier;
  const name = identifier.text;

  const initializer = node.initializer as StringLiteral;
  const path = initializer.text;

  return { name, path };
}

export function addToSvelteConfiguration(
  configContents: string,
  alias: NamedPath
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
      const brace = aliasAssignment.getLastToken();
      if (brace && brace.kind === SyntaxKind.CloseBraceToken) {
        configContents = stringInsert(
          configContents,
          brace.getFullStart(),
          isCommaNeeded(aliasAssignment),
          initializerString(alias)
        );
      }
    } else {
      const brace = kitLiteral.getLastToken();
      if (brace && brace.kind === SyntaxKind.CloseBraceToken) {
        const startFresh = syntaxList.getChildCount() === 0;
        const commaAlready =
          syntaxList.getLastToken()?.kind === SyntaxKind.CommaToken;
        const skipComma = commaAlready || startFresh;
        configContents = stringInsert(
          configContents,
          brace.getFullStart(),
          !skipComma,
          `alias: {${initializerString(alias)}}`
        );
      }
    }
  }

  return configContents;
}

export function initializerString(alias: NamedPath): string {
  return `'${alias.name}': '${alias.path}'`;
}
