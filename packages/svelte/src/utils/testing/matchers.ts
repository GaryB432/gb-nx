import { expect } from '@jest/globals';

expect.extend({
  toUseRunes(received: string) {
    const pass = ['$state', '$props', '$effect'].some((s) =>
      received.includes(s)
    );
    return {
      message: () =>
        [received, '', pass ? 'uses runes' : 'does not use runes'].join('\n'),
      pass,
    };
  },
});
