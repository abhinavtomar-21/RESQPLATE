// start-backend.js
// Run this file from the root directory using: node start-backend.js
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n======================================================');
console.log('🚀 Starting ResQPlate Backend Server...');
console.log('======================================================\n');
console.log('NOTE: This process will keep running to serve API requests.');
console.log('Do not close this terminal if you want the backend to stay alive.\n');

const serverDir = join(__dirname, 'server');
const scriptPath = join(serverDir, 'src', 'index.ts');

const child = spawn('node', ['--import', 'tsx', `"${scriptPath}"`], {
  stdio: 'inherit',
  shell: true,
  cwd: serverDir
});

child.on('error', (err) => {
  console.error('Failed to start backend server:', err);
});
