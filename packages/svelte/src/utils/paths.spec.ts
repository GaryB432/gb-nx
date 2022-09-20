import { makeAliasName } from './paths';

describe('makeAliasName', () => {
  test('a', () => {
    expect(makeAliasName('tester', 'fun')).toEqual('@fun/tester');
  });
  test('b', () => {
    expect(makeAliasName('tester', '')).toEqual('tester');
  });
  test('c', () => {
    expect(makeAliasName('tester', undefined)).toEqual('tester');
  });
  test('d', () => {
    expect(makeAliasName('', '')).toEqual('');
  });
  test('e', () => {
    expect(makeAliasName('', undefined)).toEqual('');
  });
  test('f', () => {
    expect(makeAliasName('', 'fun')).toEqual('');
  });
  test('g', () => {
    expect(makeAliasName('', '')).toEqual('');
  });
  test('h', () => {
    expect(makeAliasName('', undefined)).toEqual('');
  });
  test('i', () => {
    expect(makeAliasName('', 'fun')).toEqual('');
  });
});
