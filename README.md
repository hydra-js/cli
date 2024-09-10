# @hydra-js/cli

[![npm version](https://img.shields.io/npm/v/@hydra-js/cli.svg)](https://www.npmjs.com/@hydra-js/cli)

Command-line Toolkit for Hydra.js

## Getting started

### Usage

**Install**
```bash
npm i -g @hydra-js/cli
```

**Create a new App**

*Method 1*
```bash
hydra create [-f|--force] <namespace>
```
*Method 2*
```bash
npx @hydra-js/cli create [-f|--force] <namespace>
```

**Run**
```bash
cd <namespace>
hydra serve
hydra serve --port 3000
```

*Specify npm script to run*
```bash
hydra serve --script dev // hydra serve -s dev
```

### Development Setup

**Prerequisites**

- Node.js (v14 or later)
- npm (v7 or later)

### Setting up locally

```bash
git clone git@github.com:hydra-js/cli.git hydra-cli
cd hydra-cli
npm install
```

### Running locally

To run the CLI tool locally without installing it, use:

```bash
node index.js create [-f|--force] <namespace>
```

### Running locally with `npm link`

> This section provides instructions on how to use `npm link` for local development, enabling you to test the CLI tool as if it were installed globally.

To link the CLI tool locally for development and testing, use `npm link`:

1. Run `npm link` in the project directory. This creates a symlink globally:

```bash
npm link
```

2. Now you can run the `hydra` command from anywhere on your system:

```bash
hydra create [-f|--force] <namespace>
```

This allows you to test changes to the CLI tool without needing to reinstall it each time you make modifications.

### Publishing

To publish the package to npm:

1. Ensure you are logged in to npm:

```bash
npm login
```

2. Make sure the NPM_TOKEN secret is added to your GitHub repository.

3. Create a new version tag and push it to GitHub:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The GitHub Actions workflow will automatically publish the package to npm when a new tag is pushed.

### Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss your ideas.

### License

This project is licensed under the MIT License.
