import { type ErrorObject } from 'ajv';
import { getParts, schemaValidate, type ManifestSchema } from './manifest';

describe('Manifest', () => {
  test('invalid json', () => {
    expect(() => schemaValidate('')).toThrow();
  });

  test('invalid manifest_version', () => {
    const sut = schemaValidate(
      JSON.stringify({ manifest_version: 9, name: 'tester', version: '0' })
    );
    expect(sut.success).toBeFalsy();
    expect(sut.messages).toEqual([
      '/manifest_version must be equal to one of the allowed values',
    ]);
  });

  test('invalid version', () => {
    const sut = schemaValidate(
      JSON.stringify({ manifest_version: 3, name: 'tester' })
    );
    expect(sut.success).toBeFalsy();
    expect(sut.messages).toEqual([" must have required property 'version'"]);
  });

  test('good manifest_version', () => {
    expect(Array.from(getParts(someManifest).entries())).toEqual([
      ['options.html', 'page'],
      ['assets/icon16.png', 'icon'],
      ['assets/icon32.png', 'icon'],
      ['scripts/tbd.content_script.js', 'script'],
      ['scripts/sw.js', 'script'],
    ]);
  });
});

const someErrors: ErrorObject[] = [
  {
    instancePath: '/manifest_version',
    schemaPath: '#/properties/manifest_version/enum',
    keyword: 'enum',
    params: {
      allowedValues: [2, 3],
    },
    message: 'must be equal to one of the allowed values',
  },
  {
    instancePath: '',
    schemaPath: '#/required',
    keyword: 'required',
    params: {
      missingProperty: 'version',
    },
    message: "must have required property 'version'",
  },
];

const someManifest: ManifestSchema = {
  manifest_version: 3,
  name: 'DfExtension',
  description: 'DfExtension Extension',
  version: '1.5',
  options_page: 'options.html',
  action: {
    default_icon: {
      '16': 'assets/icon16.png',
      '32': 'assets/icon32.png',
    },
    default_popup: 'popup.html',
  },
  icons: {
    '16': 'assets/icon16.png',
    '32': 'assets/icon32.png',
  },
  content_scripts: [
    {
      matches: ['https://tbd.com/*'],
      js: ['scripts/tbd.content_script.js'],
    },
  ],
  background: {
    service_worker: 'scripts/sw.js',
  },
  commands: {
    'open-gn-nx': {
      description: 'Open a tab to GbNx',
      suggested_key: {
        default: 'Ctrl+Shift+L',
      },
    },
  },
  permissions: ['alarms', 'tabs', 'storage'],
};
