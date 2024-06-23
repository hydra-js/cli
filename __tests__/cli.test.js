const { execSync } = require('child_process');

describe('CLI', () => {
  test('init command', () => {
    // Run the init command
    const output = execSync('node ../index.js init my-hydra-app').toString();

    // Verify output
    expect(output).toContain('Project my-hydra-app generated successfully.');
    expect(output).toContain('Repository cloned successfully.');
    expect(output).toContain('Subdirectory copied successfully.');
    expect(output).toContain('Cleanup completed.');
  });
});
