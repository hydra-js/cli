#!/usr/bin/env node

const { Command } = require('commander');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs-extra');

const program = new Command();
const git = simpleGit();

const pkg = require('./package.json');

const templateRepoUrl = 'https://github.com/hydra-js/hello-world.git';
const subdirectory = 'packages/server-nodejs';

program.name('hydra').description(pkg.description).version(pkg.version);

program
  .command('create [namespace]')
  .description(
    'Initialize a Hydra App'
  )
  .action(async (namespace = 'my-hydra-app') => {
    console.log('Creating a new Hydra app...');

    // Resolve paths
    const tempRepoPath = path.join(process.cwd(), namespace, '__hydra');
    const appPath = path.join(process.cwd(), namespace);

    if (fs.existsSync(appPath)) {
      console.error(`Error: Directory ${namespace} already exists.`);
      process.exit(1);
    }

    try {
      console.log(`Cloning repository from ${templateRepoUrl}...`);
      await git.clone(templateRepoUrl, tempRepoPath);
      console.log('Repository cloned successfully.');

      const sourcePath = tempRepoPath;

      if (!fs.existsSync(sourcePath)) {
        throw new Error(
          `Subdirectory ${subdirectory} does not exist in the repository.`
        );
      }

      console.log(`Copying ${subdirectory} to ${namespace}...`);
      await fs.copy(sourcePath, appPath);
      console.log('File structure created successfully.');

      // @TODO: Make necessory changes

      console.log('Cleaning up temporary files...');
      await fs.remove(tempRepoPath);
      console.log('Cleanup completed.');

      console.log(`Project ${namespace} generated successfully.`);

    } catch (err) {
      console.error('Failed to generate project:', err);
      await fs.remove(tempRepoPath);
      process.exit(1);
    }
  });

program.parse(process.argv);
