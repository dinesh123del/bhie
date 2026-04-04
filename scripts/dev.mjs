import { spawn } from 'node:child_process';
import process from 'node:process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [];
let isShuttingDown = false;
let pendingExitCode = 0;

const prefixes = {
  API: '\u001b[32m[API]\u001b[0m',
  WEB: '\u001b[34m[WEB]\u001b[0m',
};

const writePrefixed = (label, chunk) => {
  const text = chunk.toString();
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    if (!line) {
      continue;
    }

    process.stdout.write(`${prefixes[label]} ${line}\n`);
  }
};

const stopChildren = (signal = 'SIGTERM', excludedChild = null) => {
  for (const child of children) {
    if (!child || child === excludedChild || child.killed) {
      continue;
    }

    child.kill(signal);
  }
};

const exitProcess = (code = 0) => {
  if (!isShuttingDown) {
    isShuttingDown = true;
    pendingExitCode = code;
    stopChildren('SIGTERM');

    setTimeout(() => {
      stopChildren('SIGKILL');
      process.exit(pendingExitCode);
    }, 1200).unref();
    return;
  }

  process.exit(code);
};

const startProcess = (label, args) => {
  const child = spawn(npmCommand, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  children.push(child);

  child.stdout.on('data', (chunk) => writePrefixed(label, chunk));
  child.stderr.on('data', (chunk) => writePrefixed(label, chunk));

  child.on('error', (error) => {
    process.stderr.write(`${prefixes[label]} failed to start: ${error.message}\n`);
    exitProcess(1);
  });

  child.on('exit', (code, signal) => {
    if (isShuttingDown) {
      return;
    }

    if (signal) {
      process.stderr.write(`${prefixes[label]} exited with signal ${signal}\n`);
      exitProcess(1);
      return;
    }

    if ((code ?? 0) !== 0) {
      process.stderr.write(`${prefixes[label]} exited with code ${code}\n`);
      exitProcess(code ?? 1);
      return;
    }

    exitProcess(0);
  });
};

process.on('SIGINT', () => exitProcess(0));
process.on('SIGTERM', () => exitProcess(0));

startProcess('API', ['run', 'server']);
startProcess('WEB', ['run', 'client']);
