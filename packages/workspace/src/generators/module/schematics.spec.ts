import { directoryName } from './schematics';

describe('module functions', () => {
  test('directory name', () => {
    expect(
      directoryName(
        { appsDir: 'sapps', libsDir: 'slibs' },
        {
          root: '',
          projectType: undefined,
        },
        {
          name: '',
          project: 'some-value',
          directory: 'correct',
        }
      )
    ).toEqual('correct');
  });

  test('no directory name', () => {
    expect(
      directoryName(
        { appsDir: 'sapps', libsDir: 'correct' },
        {
          root: '',
          projectType: undefined
        },
        {
          name: '',
          project: 'some-value',
        }
      )
    ).toEqual('correct');
  });

  test('application', () => {
    expect(
      directoryName(
        { appsDir: 'correct', libsDir: 'slibs' },
        {
          root: '',
          projectType: 'application',
        },
        {
          name: '',
          project: 'some-value',
        }
      )
    ).toEqual('correct');
  });
  test('library', () => {
    expect(
      directoryName(
        { appsDir: 'sapps', libsDir: 'correct' },
        {
          root: '',
          projectType: 'library',
        },
        {
          name: '',
          project: 'some-value',
        }
      )
    ).toEqual('correct');
  });


});
