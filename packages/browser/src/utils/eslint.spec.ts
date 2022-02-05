import { addCustomConfig, ESLintConfiguration } from './eslint';

const someConfig = `{
  "extends": ["../../.eslintrc.json"],
  "ignorePatterns": ["!**/*"],
  "overrides": [
    {
      "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
      "parserOptions": {
        "project": ["apps/dogfood/tsconfig.*?.json"]
      },
      "rules": {}
    },
    {
      "files": ["*.ts", "*.tsx"],
      "rules": {},
      "extends": ["../../eslint-custom.json"]
    },
    {
      "files": ["*.js", "*.jsx"],
      "rules": {}
    }
  ]
}`;

describe('eslint-config', () => {
  let config: ESLintConfiguration;
  beforeEach(() => {
    config = JSON.parse(someConfig);
  });
  it('works', () => {
    expect(addCustomConfig(config, 'abc')).toBe(config);
  });
  it('keeps overrides', () => {
    expect(addCustomConfig(config, 'abc').overrides.length).toEqual(3);
  });
  it('makes new', () => {
    expect(JSON.stringify(addCustomConfig(JSON.parse(`{}`), 'abc'))).toEqual(
      '{"overrides":[{"files":["*.ts"],"extends":["abc"]}]}'
    );
  });
  it('keeps extends', () => {
    expect(
      JSON.stringify(
        addCustomConfig(
          JSON.parse(
            '{"overrides":[{"files":["*.ts"],"extends":["something-else"]}]}'
          ),
          'abc'
        )
      )
    ).toEqual(
      '{"overrides":[{"files":["*.ts"],"extends":["something-else","abc"]}]}'
    );
  });
  it('keeps files', () => {
    expect(
      JSON.stringify(
        addCustomConfig(
          JSON.parse(
            '{"overrides":[{"files":["*.not-ts"],"extends":["something-else"]}]}'
          ),
          'abc'
        )
      )
    ).toEqual(
      '{"overrides":[{"files":["*.not-ts"],"extends":["something-else"]},{"files":["*.ts","*.tsx"],"extends":["abc"]}]}'
    );
  });
});
