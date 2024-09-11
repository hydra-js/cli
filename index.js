#!/usr/bin/env node

'use strict';

var Command = require('commander').Command;
var simpleGit = require('simple-git');
var path = require('path');
var fs = require('fs-extra');
var spawn = require('child_process').spawn;

var program = new Command();
var git = simpleGit();

var pkg = require('./package.json');

var templateRepoUrl = 'https://github.com/hydra-js/hello-world.git';

program.name('hydra').description(pkg.description).version(pkg.version);

program
  .command('create [namespace]')
  .description('Initialize a Hydra App')
  .option('-f, --force', 'Force creation even if directory exists')
  .action(function (namespace, options) {
    namespace = namespace || 'my-hydra-app';
    console.log('Creating a new Hydra app...');

    // Resolve paths
    var tempRepoPath = path.join(process.cwd(), namespace, '__hydra');
    var appPath = path.join(process.cwd(), namespace);

    if (fs.existsSync(appPath) && !options.force) {
      console.error(
        'Error: Directory ' +
          namespace +
          ' already exists. Use --force to overwrite.'
      );
      process.exit(1);
    }

    if (fs.existsSync(appPath) && options.force) {
      console.log('Directory ' + namespace + ' already exists. Overwriting...');
      fs.removeSync(appPath);
    }

    git
      .clone(templateRepoUrl, tempRepoPath)
      .then(function () {
        console.log('Repository cloned successfully.');

        var sourcePath = tempRepoPath;

        if (!fs.existsSync(sourcePath)) {
          throw new Error(tempRepoPath + ' does not exist in the repository.');
        }

        console.log('Copying files to ' + namespace + '...');
        return fs.copy(sourcePath, appPath);
      })
      .then(function () {
        console.log('File structure created successfully.');

        /**
         * @TODO: Make necessary changes
         * - Improve logs
         * -- Show progress
         * -- Show next steps
         * - Create .env file
         * - Install dependencies
        */

        console.log('Cleaning up temporary files...');
        return fs.remove(tempRepoPath);
      })
      .then(function () {
        console.log('Cleanup completed.');
        console.log('Project ' + namespace + ' generated successfully.');
      })
      .catch(function (err) {
        console.error('Failed to generate project:', err);
        fs.remove(tempRepoPath);
        process.exit(1);
      });
  });

program
  .command('serve')
  .description('Start the Hydra server')
  .option('-s, --script <script>', 'Specify the npm script to run', 'start')
  .option('-d, --dev', 'Run in development mode')
  .action(function (options) {
    // Validate if the current directory is a Hydra app
    if (!fs.existsSync('package.json')) {
      console.error('Error: package.json not found. Are you in the Application root?');
      process.exit(1);
    }

    // Read package.json to check for necessary scripts and dependencies
    var packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    // Determine which script to run
    var scriptToRun = options.dev ? 'dev' : options.script;

    // Check if the specified script exists
    if (!packageJson.scripts || !packageJson.scripts[scriptToRun]) {
      console.error('Error: Script \'' + scriptToRun + '\' not found in package.json');
      process.exit(1);
    }

    // Check for essential dependencies
    var requiredDeps = ['@hydra-js/core'];
    var missingDeps = requiredDeps.filter(function(dep) {
      return !packageJson.dependencies || !packageJson.dependencies[dep];
    });

    if (missingDeps.length > 0) {
      console.error('Error: Missing essential dependencies: ' + missingDeps.join(', '));
      process.exit(1);
    }

    console.log('Application integrity check passed.');
    console.log('Running npm script: ' + scriptToRun);

    var npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    var child = spawn(npm, ['run', scriptToRun], { stdio: 'inherit' });

    child.on('close', function(code) {
      console.log('npm script exited with code ' + code);
    });

    child.on('error', function(err) {
      console.error('Failed to start npm script:', err);
      process.exit(1);
    });
  });

program.parse(process.argv);
