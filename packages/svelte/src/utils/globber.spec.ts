import { includes } from './globber';

describe('Globber', () => {
  test('includes a', () => {
    expect(includes('apps/stuff', ['packages/*'])).toBeFalsy();
  });
  test('includes b', () => {
    expect(includes('apps/stuff', ['apps/*'])).toBeTruthy();
  });
  test('includes b', () => {
    expect(includes('apps/stuff', ['more/stuff/apps/*'])).toBeFalsy();
  });
});
