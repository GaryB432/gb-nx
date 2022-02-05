export interface ExtensionGeneratorSchema {
  directory?: string;
  name: string;
  setParserOptionsProject?: boolean;
  skipFormat?: boolean;
  skipTests?: boolean;
  tags?: string;
  unitTestRunner?: 'jest' | 'none';
}
