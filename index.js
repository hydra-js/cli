#!/usr/bin/env node

const { Command } = require('commander');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs-extra');

const program = new Command();
const git = simpleGit();

const pkg = require('./package.json');

const templateRepoUrl = 'https://github.com/hydra-js/monorepo';
const subdirectory = 'packages/server-nodejs';

program.name('hydra').description(pkg.description).version(pkg.version);

program
  .command('init [appName]')
  .description(
    'Initialize a Hydra App'
  )
  .action(async (appName = 'my-hydra-app') => {
    const tempRepoPath = path.join(process.cwd(), appName, '__tmp');
    const appPath = path.join(process.cwd(), appName);

    if (fs.existsSync(appPath)) {
      console.error(`Error: Directory ${appName} already exists.`);
      process.exit(1);
    }

    try {
      console.log(`Cloning repository from ${templateRepoUrl}...`);
      await git.clone(templateRepoUrl, tempRepoPath);
      console.log('Repository cloned successfully.');

      const sourcePath = path.join(tempRepoPath, subdirectory);

      if (!fs.existsSync(sourcePath)) {
        throw new Error(
          `Subdirectory ${subdirectory} does not exist in the repository.`
        );
      }

      console.log(`Copying ${subdirectory} to ${appName}...`);
      await fs.copy(sourcePath, appPath);
      console.log('Subdirectory copied successfully.');

      // @TODO: Make necessory changes

      console.log('Cleaning up temporary files...');
      await fs.remove(tempRepoPath);
      console.log('Cleanup completed.');

      console.log(`Project ${appName} generated successfully.`);
    } catch (err) {
      console.error('Failed to generate project:', err);
      await fs.remove(tempRepoPath);
      process.exit(1);
    }
  });

program.parse(process.argv);
