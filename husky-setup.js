const { execSync } = require('child_process');

console.log('Setting up Husky hooks...');

try {
  // Initialize Husky
  execSync('npx husky init', { stdio: 'inherit' });
  
  // Make the commit-msg hook executable
  execSync('chmod +x .husky/commit-msg', { stdio: 'inherit' });
  
  console.log('Husky hooks set up successfully!');
} catch (error) {
  console.error('Error setting up Husky hooks:', error);
  process.exit(1);
}