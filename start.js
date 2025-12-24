const { spawn } = require('child_process');

// Start Next.js frontend
const frontend = spawn('npm', ['run', 'start'], {
  stdio: 'inherit',
  shell: true,
});

// Start voice agent
const agent = spawn('npx', ['tsx', 'agent.ts', 'start'], {
  stdio: 'inherit',
  shell: true,
});

// Handle process termination
process.on('SIGTERM', () => {
  frontend.kill();
  agent.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  frontend.kill();
  agent.kill();
  process.exit(0);
});
