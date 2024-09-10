#!/usr/bin/env node

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
  .action(function (namespace) {
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

        // @TODO: Make necessary changes

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
  .action(function (options) {
    // Validate if the current directory is a Hydra app
    if (!fs.existsSync('package.json')) {
      console.error('Error: package.json not found. Are you in the Application root?');
      process.exit(1);
    }

    // Read package.json to check for necessary scripts and dependencies
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    // Check if the specified script exists
    if (!packageJson.scripts || !packageJson.scripts[options.script]) {
      console.error(`Error: Script '${options.script}' not found in package.json`);
      process.exit(1);
    }

    // Check for essential dependencies
    const requiredDeps = ['@hydra-js/core', 'react', 'react-dom'];
    const missingDeps = requiredDeps.filter(dep => 
      !packageJson.dependencies || !packageJson.dependencies[dep]
    );

    if (missingDeps.length > 0) {
      console.error(`Error: Missing essential dependencies: ${missingDeps.join(', ')}`);
      process.exit(1);
    }

    console.log('Application integrity check passed.');
    console.log(`Running npm script: ${options.script}`);

    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const child = spawn(npm, ['run', options.script], { stdio: 'inherit' });

    child.on('close', (code) => {
      console.log(`npm script exited with code ${code}`);
    });

    child.on('error', (err) => {
      console.error('Failed to start npm script:', err);
      process.exit(1);
    });
  });

program.parse(process.argv);
