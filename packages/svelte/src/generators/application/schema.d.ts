export interface ApplicationGeneratorOptions {
  eslint?: boolean;
  projectPath: string;
  skipFormat?: boolean;
  tags?: string;
}

export interface NormalizedOptions extends ApplicationGeneratorOptions {
  parsedTags: string[];
  projectRoot: Path;
}
