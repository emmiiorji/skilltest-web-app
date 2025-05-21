const { execSync } = require('child_process');

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Please provide a migration name');
  process.exit(1);
}

const command = `typeorm-ts-node-commonjs migration:create src/database/migrations/${migrationName}`;

try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  if(error.stderr) {
    console.error('Migration generation failed:', error);
  }
}