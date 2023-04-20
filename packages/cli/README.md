# @gb-nx/cli

This library was generated with [Nx](https://nx.dev).

[![CI](https://img.shields.io/github/actions/workflow/status/GaryB432/gb-nx/main.yml?branch=master)](https://github.com/GaryB432/gb-nx/actions)
[![npm version](https://img.shields.io/npm/v/@gb-nx/cli?style=flat-square)](https://www.npmjs.com/package/@gb-nx/cli)

> Nx Plugin adding command line applications in your Nx workspace

## Features

Here is a list of some of the coolest features of the plugin:

- ✅ Generation of command line applications
- ✅ You work with the commands and the plugin manages boilerplate
- ✅ Building, testing, etc your projects

## Prerequisite

If you have not already, [create an Nx workspace](https://github.com/nrwl/nx#creating-an-nx-workspace) with the following:

```
# npm
npx create-nx-workspace@latest

# yarn
yarn create nx-workspace@latest
```

## Getting Started

Then you need to install the plugin in order to generate cli applications later on.

### Installing Plugin

```
# npm
npm install @gb-nx/cli --save-dev

# yarn
yarn add @gb-nx/cli --dev
```

### Generating Project

Simply run the `application` generator with the following command:

```
nx g @gb-nx/cli:application my-app
```

### Working with your Project

> nx build my-app

Add a command to the project with the `command` generator

```
nx g @gb-nx/cli:command <name> --project my-app
```

See `nx g @gb-nx/cli:command --help` for examples with command parameters and options.

**You'll want to edit the generated `cli.config.json` file to document your command. The values from the config file are used to generate the boilerplate for your project.**

The `refresh` generator refreshes your project's boilerplate. See the options below. Run this command when you change your `cli.config.json` file.

```
nx g @gb-nx/cli:refresh --project my-app --main --ts --markdown --all
```

or

```
nx sync my-app
```

| OPTION       | DESCRIPTION                                          |
| ------------ | ---------------------------------------------------- |
| `--main`     | generate the build target main entry point           |
| `--markdown` | generate the `commands.md` file in your project root |
| `--ts`       | generate the typing files for your commands          |
| `--all`      | generate all the things                              |

## License

Copyright (c) 2021-2023 Gary Bortosky. Licensed under the MIT License (MIT)
