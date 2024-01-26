import { Document, bulletList, headingLevel, table } from './doc';

describe('Doc', () => {
  const br = '<<<<';
  let doc: Document;

  test('prints', () => {
    doc = new Document(['a', 'b', 'c', 'd', 'e']);
    expect(doc.print(br)).toEqual(['a', 'b', 'c', 'd', 'e', br]);
  });
  test('prints reduced', () => {
    doc = new Document(['a', 'b', '', '', 'c', 'd', '', '', 'e', '', '', '']);
    expect(doc.print(br)).toEqual(['a', 'b', '', 'c', 'd', '', 'e', '', br]);
  });

  // TODO remove extra blank line at end of sections
  test('prints reduced', () => {
    doc = new Document(['a', 'b', '', '', 'c', 'd', '', '', 'e', '', '', '']);
    expect(doc.print(br)).toMatchInlineSnapshot(`
      [
        "a",
        "b",
        "",
        "c",
        "d",
        "",
        "e",
        "",
        "<<<<",
      ]
    `);
  });

  test('prints reduced', () => {
    doc = new Document([
      '# Part 1',
      '',
      'i have a blank line here',
      '',
      '## subpart',
      '',
      'I also have a blank line',
      'and another one too',
      '',
      'another couple is here',
      'omg here',
    ]);
    expect(doc.print(br)).toMatchInlineSnapshot(`
      [
        "# Part 1",
        "",
        "i have a blank line here",
        "",
        "<<<<",
        "## subpart",
        "",
        "I also have a blank line",
        "and another one too",
        "",
        "another couple is here",
        "omg here",
        "<<<<",
      ]
    `);
  });

  test('outline', () => {
    expect(doc.outline()).toEqual(['# Part 1', '## subpart']);
  });
});

describe('functions', () => {
  test('headingLevel works', () => {
    expect(
      headingLevel('##### my heading with another # and more ## at the end')
    ).toEqual(5);
  });
  test('works', () => {
    expect(bulletList(['a', 'b', 'c'])).toEqual(['- a', '- b', '- c']);
  });

  test('table', () => {
    expect(
      table(
        ['a', 'b', 'c'],
        [
          ['d', 'e', 'f'],
          ['g', 'h', 'i'],
          ['j', 'k', 'l'],
        ]
      )
    ).toEqual([
      '| a | b | c |',
      '| --- | --- | --- |',
      '| d | e | f |',
      '| g | h | i |',
      '| j | k | l |',
    ]);
  });
});
