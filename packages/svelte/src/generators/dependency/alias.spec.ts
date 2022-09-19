import { factory } from 'typescript';
import type { Alias } from './alias';
import {
  addToSvelteConfiguration,
  aliasFromPropertyAssignment,
  getConfiguredAliases,
  initializerString,
} from './alias';

describe('Alias', () => {
  let alias: Alias;

  beforeEach(() => {
    alias = { name: 'name', path: 'path' };
  });

  // test('equals', () => {
  //   expect(alias.equals({ name: 'name', path: 'path' })).toBeTruthy();
  // });

  test('initializerString', () => {
    const alias = aliasFromPropertyAssignment(
      factory.createPropertyAssignment('a', factory.createStringLiteral('b'))
    );
    expect(initializerString(alias)).toEqual("'a': 'b'");
  });

  test('fromPropertyAssignment', () => {
    const alias = aliasFromPropertyAssignment(
      factory.createPropertyAssignment(
        'fun',
        factory.createStringLiteral('../path/to/fun')
      )
    );
    expect(alias.name).toEqual('fun');
    expect(alias.path).toEqual('../path/to/fun');
  });
});

describe('add-alias', () => {
  let alias: Alias;

  beforeEach(() => {
    alias = { name: '@name/ok', path: '../a/b/c/fun.ts' };
  });

  it('should add the given alias to a svelte configuration', () => {
    // ARRANGE
    const file = `import adapter from '@sveltejs/adapter-auto';
    import preprocess from 'svelte-preprocess';
    
    const moreThing = 34;
    
    /** @type {import('@sveltejs/kit').Config} */
    const config = {
      preprocess: preprocess(),
      kit: {
        more: { fun: 11 },
        adapter: adapter(),
        alias: {
          'my-file': 'path/to/my-file.js',
          '@lets-go-out/vector': '../../libs/vector/src/index.ts',
          'my-directory/*': 'path/to/my-directory/*',
        },
        whoKnows: true,
      },
      reallyJustForTesting: {
        answer: true,
      }
    };
    export default config;
    `;

    // ACT
    const updatedFile = addToSvelteConfiguration(file, alias);

    // ASSERT
    expect(updatedFile).toMatchInlineSnapshot(`
      "import adapter from '@sveltejs/adapter-auto';
          import preprocess from 'svelte-preprocess';
          
          const moreThing = 34;
          
          /** @type {import('@sveltejs/kit').Config} */
          const config = {
            preprocess: preprocess(),
            kit: {
              more: { fun: 11 },
              adapter: adapter(),
              alias: {
                'my-file': 'path/to/my-file.js',
                '@lets-go-out/vector': '../../libs/vector/src/index.ts',
                'my-directory/*': 'path/to/my-directory/*','@name/ok': '../a/b/c/fun.ts'
              },
              whoKnows: true,
            },
            reallyJustForTesting: {
              answer: true,
            }
          };
          export default config;
          "
    `);
  });
  it('should add the given alias to a svelte alias configuration no comma', () => {
    // ARRANGE
    const file = `const config = {
      kit: {
        alias: {
          'my-file': 'path/to/my-file.js',
          '@lets-go-out/vector': '../../libs/vector/src/index.ts',
          'my-directory/*': 'path/to/my-directory/*'
        },
      }
    };
    export default config;
    `;

    // ACT
    const updatedFile = addToSvelteConfiguration(file, alias);

    // ASSERT
    expect(updatedFile).toMatchInlineSnapshot(`
      "const config = {
            kit: {
              alias: {
                'my-file': 'path/to/my-file.js',
                '@lets-go-out/vector': '../../libs/vector/src/index.ts',
                'my-directory/*': 'path/to/my-directory/*','@name/ok': '../a/b/c/fun.ts'
              },
            }
          };
          export default config;
          "
    `);
  });

  it('should handle trailing comma', () => {
    // ARRANGE
    const file = `const config = {
      kit: {
        alias: {
          'my-file': 'path/to/my-file.js',
          '@lets-go-out/vector': '../../libs/vector/src/index.ts',
          'my-directory/*': 'path/to/my-directory/*',
        },
      }
    };
    export default config;
    `;

    // ACT
    const updatedFile = addToSvelteConfiguration(file, alias);

    // ASSERT
    expect(updatedFile).toMatchInlineSnapshot(`
      "const config = {
            kit: {
              alias: {
                'my-file': 'path/to/my-file.js',
                '@lets-go-out/vector': '../../libs/vector/src/index.ts',
                'my-directory/*': 'path/to/my-directory/*','@name/ok': '../a/b/c/fun.ts'
              },
            }
          };
          export default config;
          "
    `);
  });

  it('should add the given alias to a svelte just one alias configuration', () => {
    // ARRANGE
    const file = `const config = {
      kit: {
        alias: {
          'my-directory/*': 'path/to/my-directory/*'
        },
      }
    };
    export default config;
    `;

    // ACT
    const updatedFile = addToSvelteConfiguration(file, alias);

    // ASSERT
    expect(updatedFile).toMatchInlineSnapshot(`
      "const config = {
            kit: {
              alias: {
                'my-directory/*': 'path/to/my-directory/*','@name/ok': '../a/b/c/fun.ts'
              },
            }
          };
          export default config;
          "
    `);
  });

  it('should add the given alias to a svelte kit configuration', () => {
    // ARRANGE
    const file = `const config = {
      kit: {
        alias: {}
      }
    };
    export default config;
    `;

    // ACT
    const updatedFile = addToSvelteConfiguration(file, alias);

    // ASSERT
    expect(updatedFile).toMatchInlineSnapshot(`
      "const config = {
            kit: {
              alias: {'@name/ok': '../a/b/c/fun.ts'}
            }
          };
          export default config;
          "
    `);
  });

  it('should add the given alias to a svelte no alias but others', () => {
    // ARRANGE
    const file = `const config = {
      kit: { a: 'yes', b: 'more'   }
    };
    export default config;
    `;

    // ACT
    const updatedFile = addToSvelteConfiguration(file, alias);

    // ASSERT
    expect(updatedFile).toMatchInlineSnapshot(`
      "const config = {
            kit: { a: 'yes', b: 'more',alias: {'@name/ok': '../a/b/c/fun.ts'}   }
          };
          export default config;
          "
    `);
  });

  it('should add the given alias to a svelte no alias', () => {
    // ARRANGE
    const file = `const config = {
      kit: { }
    };
    export default config;
    `;

    // ACT
    const updatedFile = addToSvelteConfiguration(file, alias);

    // ASSERT
    expect(updatedFile).toMatchInlineSnapshot(`
      "const config = {
            kit: {alias: {'@name/ok': '../a/b/c/fun.ts'} }
          };
          export default config;
          "
    `);
  });

  it('should not change config with no kit', () => {
    // ARRANGE
    const file = `const config = {  };
    export default config;
    `;

    // ACT
    const updatedFile = addToSvelteConfiguration(file, alias);

    // ASSERT
    expect(updatedFile).toMatchInlineSnapshot(`
      "const config = {  };
          export default config;
          "
    `);
  });

  it('should get no configured aliases no kit', () => {
    // ARRANGE
    const file = `const config = {} };`;

    // ACT
    const aliases = getConfiguredAliases(file);

    // ASSERT
    expect(aliases).toEqual([]);
  });

  it('should get no configured aliases empty assignment', () => {
    // ARRANGE
    const file = `const config = {
      kit: {
        more: { fun: 11 },
        adapter: adapter(),
        alias: {},
      }
    };`;

    // ACT
    const aliases = getConfiguredAliases(file);

    // ASSERT
    expect(aliases).toEqual([]);
  });

  it('should get no configured aliases weird assignment', () => {
    // ARRANGE
    const file = `const config = {
      kit: {
        more: { fun: 11 },
        adapter: adapter(),
        alias: true,
      }
    };`;

    // ACT
    const aliases = getConfiguredAliases(file);

    // ASSERT
    expect(aliases).toEqual([]);
  });

  it('should get some configured aliases', () => {
    // ARRANGE
    const file = `import adapter from '@sveltejs/adapter-auto';
    import preprocess from 'svelte-preprocess';
    
    const moreThing = 34;
    
    /** @type {import('@sveltejs/kit').Config} */
    const config = {
      preprocess: preprocess(),
      kit: {
        more: { fun: 11 },
        adapter: adapter(),
        alias: {
          'my-file': 'path/to/my-file.js',
          '@lets-go-out/vector': '../../libs/vector/src/index.ts',
          'my-directory/*': 'path/to/my-directory/*'
        },
        whoKnows: true,
      },
      reallyJustForTesting: {
        answer: true,
      }
    };
    export default config;
    `;

    // ACT
    const aliases = getConfiguredAliases(file);

    // ASSERT
    expect(aliases).toEqual([
      { name: 'my-file', path: 'path/to/my-file.js' },
      { name: '@lets-go-out/vector', path: '../../libs/vector/src/index.ts' },
      { name: 'my-directory/*', path: 'path/to/my-directory/*' },
    ]);
  });
});

describe('comma handling', () => {
  let alias: Alias;

  beforeEach(() => {
    alias = { name: '@name/fun', path: '../a/b/c/moar.ts' };
  });

  it('one with comma', () => {
    // ARRANGE
    const file = `const config = {
      kit: {
        alias: {
          'my-file': 'path/to/my-file.js',
        },
      }
    }`;

    // ACT
    const updatedFile = addToSvelteConfiguration(file, alias);

    // ASSERT
    expect(updatedFile).toMatchInlineSnapshot(`
      "const config = {
            kit: {
              alias: {
                'my-file': 'path/to/my-file.js','@name/fun': '../a/b/c/moar.ts'
              },
            }
          }"
    `);
  });

  it('one with no comma', () => {
    // ARRANGE
    const file = `const config = {
      kit: {
        alias: {
          'my-file': 'path/to/my-file.js'
        },
      }
    }`;

    // ACT
    const updatedFile = addToSvelteConfiguration(file, alias);

    // ASSERT
    expect(updatedFile).toMatchInlineSnapshot(`
      "const config = {
            kit: {
              alias: {
                'my-file': 'path/to/my-file.js','@name/fun': '../a/b/c/moar.ts'
              },
            }
          }"
    `);
  });

  it('none without comma', () => {
    // ARRANGE
    const file = `const config = {
      kit: {
        alias: {},
      }
    }`;

    // ACT
    const updatedFile = addToSvelteConfiguration(file, alias);

    // ASSERT
    expect(updatedFile).toMatchInlineSnapshot(`
      "const config = {
            kit: {
              alias: {'@name/fun': '../a/b/c/moar.ts'},
            }
          }"
    `);
  });

  it('many with comma', () => {
    // ARRANGE
    const file = `const config = {
      kit: {
        alias: {
          'my-file': 'path/to/my-file.js',
          'apple': 'path/to/my-file.js',
          'banana': 'path/to/my-file.js',
        },
      }
    }`;

    // ACT
    const updatedFile = addToSvelteConfiguration(file, alias);

    // ASSERT
    expect(updatedFile).toMatchInlineSnapshot(`
      "const config = {
            kit: {
              alias: {
                'my-file': 'path/to/my-file.js',
                'apple': 'path/to/my-file.js',
                'banana': 'path/to/my-file.js','@name/fun': '../a/b/c/moar.ts'
              },
            }
          }"
    `);
  });

  it('many without comma', () => {
    // ARRANGE
    const file = `const config = {
      kit: {
        alias: {
          'my-file': 'path/to/my-file.js',
          'apple': 'path/to/my-file.js',
          'banana': 'path/to/my-file.js'
        },
      }
    }`;

    // ACT
    const updatedFile = addToSvelteConfiguration(file, alias);

    // ASSERT
    expect(updatedFile).toMatchInlineSnapshot(`
      "const config = {
            kit: {
              alias: {
                'my-file': 'path/to/my-file.js',
                'apple': 'path/to/my-file.js',
                'banana': 'path/to/my-file.js','@name/fun': '../a/b/c/moar.ts'
              },
            }
          }"
    `);
  });

  it('handles weirdness', () => {
    // ARRANGE
    const file = `const config = {
      kit: {
        alias: { ok: false },
      }
    }`;

    // ACT
    const updatedFile = addToSvelteConfiguration(file, alias);

    // ASSERT
    expect(updatedFile).toMatchInlineSnapshot(`
      "const config = {
            kit: {
              alias: { ok: false,'@name/fun': '../a/b/c/moar.ts' },
            }
          }"
    `);
  });

  it('handles weirdness with comma', () => {
    // ARRANGE
    const file = `const config = {
      kit: {
        alias: { ok: false, }
      }
    }`;

    // ACT
    const updatedFile = addToSvelteConfiguration(file, alias);

    // ASSERT
    expect(updatedFile).toMatchInlineSnapshot(`
      "const config = {
            kit: {
              alias: { ok: false,'@name/fun': '../a/b/c/moar.ts' }
            }
          }"
    `);
  });
});
