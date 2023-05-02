import { getCommandExamples, getCommandTs } from './sade';

const pnames = {
  name: 'TestingSubject',
  propertyName: 'testingSubject',
};

describe('sade', () => {
  it('should get action paramters', () => {
    expect(
      getCommandTs(
        {
          description: 'this here',
          parameters: { a: { type: 'unknown' }, b: { type: 'unknown' } },
          options: { a: { type: 'unknown', alias: 'q' } },
        },
        pnames
      )
    ).toMatchInlineSnapshot(`
      "prog
      .command('TestingSubject <a> <b>')
      .describe('this here')
      .option('-q, --a','description of a option')
      .action(async (a,b,opts) => { await testingSubjectCommand({ a,b,opts }); });"
    `);
  });

  it('should get action paramters without alias', () => {
    expect(
      getCommandTs(
        {
          description: 'this here',
          parameters: { a: { type: 'unknown' }, b: { type: 'unknown' } },
          options: { a: { type: 'unknown' } },
        },
        pnames
      )
    ).toMatchInlineSnapshot(`
      "prog
      .command('TestingSubject <a> <b>')
      .describe('this here')
      .option('--a','description of a option')
      .action(async (a,b,opts) => { await testingSubjectCommand({ a,b,opts }); });"
    `);
  });

  it('should handle embedded single quote', () => {
    expect(
      getCommandTs(
        {
          description: "this 'here'",
          parameters: { a: { type: 'unknown' }, b: { type: 'unknown' } },
          options: { a: { type: 'unknown' } },
        },
        pnames
      )
    ).toMatchInlineSnapshot(`
      "prog
      .command('TestingSubject <a> <b>')
      .describe(\\"this 'here'\\")
      .option('--a','description of a option')
      .action(async (a,b,opts) => { await testingSubjectCommand({ a,b,opts }); });"
    `);
  });

  it('should throw mismatch', () => {
    expect(() =>
      getCommandTs(
        {
          description: 'this here',
          parameters: {
            a: { type: 'unknown', description: 'fun stuff' },
            b: { type: 'unknown' },
          },

          options: {
            a: {
              type: 'unknown',
              description: 'some junkk',
              default: 'unknown',
            },
          },
        },
        pnames
      )
    ).toThrowError('type mismatch a unknown');
  });

  it('should handle options', () => {
    expect(
      getCommandTs(
        {
          description: 'this here',
          parameters: {
            a: { type: 'unknown', description: 'fun stuff' },
            b: { type: 'unknown' },
          },

          options: {
            a: {
              type: 'string',
              description: 'some junkk',
              default: 'unknown',
            },
          },
        },
        pnames
      )
    ).toMatchInlineSnapshot(`
      "prog
      .command('TestingSubject <a> <b>')
      .describe('this here')
      .option('--a','some junkk','unknown')
      .action(async (a,b,opts) => { await testingSubjectCommand({ a,b,opts }); });"
    `);
  });
  it('should handle options II', () => {
    expect(
      getCommandTs(
        {
          description: 'this here',
          parameters: {
            a: { type: 'unknown', description: 'fun stuff' },
            b: { type: 'unknown' },
          },

          options: {
            alfa: {
              type: 'string',
              description: 'put some quotes on me',
              default: 'testingSubject',
            },

            limit: { type: 'number', description: 'some junkk', default: 5 },
            grocery: {
              type: 'boolean',
              description: 'an important boolean argument',
              default: true,
            },
          },
        },

        pnames
      )
    ).toMatchInlineSnapshot(`
      "prog
      .command('TestingSubject <a> <b>')
      .describe('this here')
      .option('--alfa','put some quotes on me','testingSubject')
      .option('--limit','some junkk',5)
      .option('--grocery','an important boolean argument',true)
      .action(async (a,b,opts) => { if (opts.limit && typeof opts.limit !== 'number') throw new Error('limit must be a number');await testingSubjectCommand({ a,b,opts }); });"
    `);
  });
  it('should use proper case', () => {
    expect(
      getCommandTs(
        {
          description: 'this here',
          parameters: {
            a: { type: 'unknown', description: 'fun stuff' },
            b: { type: 'unknown' },
          },

          options: {
            alfa: {
              type: 'string',
              description: 'put some quotes on me',
              default: 'testingSubject',
            },

            limit: { type: 'number', description: 'some junkk', default: 5 },
            grocery: {
              type: 'boolean',
              description: 'an important boolean argument',
              default: true,
            },
          },
        },

        { name: 'DoTheWeirdestStuff', propertyName: 'doTheWeirdestStuff' }
      )
    ).toMatchInlineSnapshot(`
      "prog
      .command('DoTheWeirdestStuff <a> <b>')
      .describe('this here')
      .option('--alfa','put some quotes on me','testingSubject')
      .option('--limit','some junkk',5)
      .option('--grocery','an important boolean argument',true)
      .action(async (a,b,opts) => { if (opts.limit && typeof opts.limit !== 'number') throw new Error('limit must be a number');await doTheWeirdestStuffCommand({ a,b,opts }); });"
    `);
  });

  it('should throw non number', () => {
    expect(
      getCommandTs(
        {
          description: 'this here',
          parameters: {
            a: { type: 'unknown', description: 'fun stuff' },
            b: { type: 'unknown' },
          },

          options: {
            alfa: {
              type: 'string',
              description: 'put some quotes on me',
              default: 'testingSubject',
            },

            limit: { type: 'number', description: 'some junkk', default: 5 },
            age: { type: 'number' },
            banana: { type: 'number' },
            grocery: {
              type: 'boolean',
              description: 'an important boolean argument',
              default: true,
            },
          },
        },

        { name: 'Test', propertyName: 'test' }
      )
    ).toMatchInlineSnapshot(`
      "prog
      .command('Test <a> <b>')
      .describe('this here')
      .option('--alfa','put some quotes on me','testingSubject')
      .option('--limit','some junkk',5)
      .option('--age','description of age option')
      .option('--banana','description of banana option')
      .option('--grocery','an important boolean argument',true)
      .action(async (a,b,opts) => { if (opts.limit && typeof opts.limit !== 'number') throw new Error('limit must be a number');if (opts.age && typeof opts.age !== 'number') throw new Error('age must be a number');if (opts.banana && typeof opts.banana !== 'number') throw new Error('banana must be a number');await testCommand({ a,b,opts }); });"
    `);
  });

  it('should get command examples', () => {
    expect(
      getCommandExamples(
        {
          description: 'this here',
          parameters: {
            a: { type: 'unknown', description: 'fun stuff' },
            b: { type: 'unknown' },
          },

          options: {
            alfa: {
              type: 'string',
              description: 'put some quotes on me',
              default: 'testingSubject',
            },

            limit: { type: 'number', description: 'some junkk', default: 5 },
            age: { type: 'number' },
            banana: { type: 'number' },
            grocery: {
              type: 'boolean',
              description: 'an important boolean argument',
              default: true,
            },
          },
        },
        { name: 'Test', propertyName: 'test' }
      )
    ).toEqual(['echo Test TODO soon']);
  });
});
1;
