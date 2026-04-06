import { spawn } from 'child_process';
import fs from 'fs';

const DEFAULT_TIMEOUT_MS = 120000;

const COMMAND_TOKEN_REGEX = /(?:[^\s"']+|"[^"]*"|'[^']*')+/g;

const parseCommandTokens = (value = '') => {
  const matches = value.match(COMMAND_TOKEN_REGEX) || [];
  return matches.map((token) => token.replace(/^['"]|['"]$/g, ''));
};

const resolvePythonCommand = (rawValue) => {
  const candidate = (rawValue || '').trim();

  if (!candidate) {
    return { executable: 'python', executableArgs: [] };
  }

  // Support Windows absolute paths with spaces, e.g. C:/Program Files/Python312/python.exe
  if (fs.existsSync(candidate)) {
    return { executable: candidate, executableArgs: [] };
  }

  const tokens = parseCommandTokens(candidate);

  if (!tokens.length) {
    return { executable: 'python', executableArgs: [] };
  }

  const [executable, ...executableArgs] = tokens;
  return { executable, executableArgs };
};

export const runPythonScript = (scriptPath, args = [], options = {}) =>
  new Promise((resolve, reject) => {
    const pythonCommandRaw =
      options.pythonCommand ||
      process.env.RAG_PYTHON_COMMAND ||
      process.env.PYTHON_COMMAND ||
      'python';

    const { executable, executableArgs } = resolvePythonCommand(pythonCommandRaw);

    const child = spawn(executable, [...executableArgs, scriptPath, ...args], {
      cwd: options.cwd,
      env: { ...process.env, ...(options.env || {}) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let didTimeout = false;

    const timeoutMs =
      typeof options.timeoutMs === 'number' ? options.timeoutMs : DEFAULT_TIMEOUT_MS;

    const timeoutId = setTimeout(() => {
      didTimeout = true;
      child.kill('SIGTERM');
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(
        new Error(`Failed to execute Python command "${pythonCommandRaw}": ${error.message}`)
      );
    });

    child.on('close', (code) => {
      clearTimeout(timeoutId);

      if (didTimeout) {
        reject(new Error(`Python script timed out after ${timeoutMs} ms: ${scriptPath}`));
        return;
      }

      if (code !== 0) {
        const message = stderr.trim() || `Python script failed with exit code ${code}`;
        reject(new Error(message));
        return;
      }

      resolve(stdout.trim());
    });
  });
