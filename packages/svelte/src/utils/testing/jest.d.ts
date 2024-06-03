declare namespace jest {
  interface Matchers<R> {
    toUseRunes(): CustomMatcherResult;
  }
}
