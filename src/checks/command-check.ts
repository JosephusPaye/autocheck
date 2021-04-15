import path from 'path';
import upath from 'upath';
import execa from 'execa';
import { ReadStream } from 'fs';

import { fileExists, directoryExists, createReadStream } from '../util/fs';
import { CommonCheckConfiguration, CommonCheckResult } from '../autocheck';

export interface CommandCheckConfiguration extends CommonCheckConfiguration {
  type: 'command';
  command: string;
  directory?: string;
  input?: string;
  runInCygwin?: boolean;
  cygwinBin?: string;
}

export interface CommandCheckResult extends CommonCheckResult {
  result?: {
    directory: string;
    exitCode?: number;
  };
  output?: string;
}

export async function performCommandCheck(
  checkConfiguration: CommandCheckConfiguration,
  targetDirectory: string
): Promise<CommandCheckResult> {
  if (!checkConfiguration.command || checkConfiguration.command.trim().length === 0) {
    return {
      config: checkConfiguration,
      status: 'failed',
      error: 'No `command` specified for this check.',
    };
  }

  if (
    checkConfiguration.runInCygwin &&
    (!checkConfiguration.cygwinBin || checkConfiguration.cygwinBin.trim().length === 0)
  ) {
    return {
      config: checkConfiguration,
      status: 'failed',
      error: 'The `cygwinBin` option is required to run a command in Cygwin.',
    };
  }

  const directory = checkConfiguration.directory
    ? resolvePath(checkConfiguration.directory, targetDirectory)
    : targetDirectory;

  if (directory && !(await directoryExists(directory))) {
    return {
      config: checkConfiguration,
      result: { directory },
      status: 'failed',
      error: `Command working directory not found or inaccessible: ${directory}`,
    };
  }

  const command = checkConfiguration.command;
  const commandParts = checkConfiguration.runInCygwin
    ? makeCygwinCommand(command, directory, checkConfiguration.cygwinBin!)
    : command.split(' ').map((part) => part.trim());

  let inputStream: ReadStream | undefined;

  if (checkConfiguration.input) {
    const input = resolvePath(checkConfiguration.input, targetDirectory);

    if (input && (await fileExists(input))) {
      inputStream = createReadStream(input, { encoding: 'utf-8' });
    }
  }

  let output: string | undefined;
  let error: string | undefined;
  let exitCode: number;

  try {
    const subprocess = execa(commandParts[0], commandParts.slice(1), {
      shell: true,
      localDir: directory,
      cwd: directory,
      input: inputStream,
      all: true,
    });

    const cancelTimeout = killAfterTimeout(subprocess, 10000);

    const commandResult = await subprocess;
    cancelTimeout();

    output = commandResult.all;
    exitCode = commandResult.exitCode;
  } catch (err) {
    output = err.all;
    exitCode = err.exitCode ?? -1;

    if (err.isCanceled) {
      error =
        'command cancelled after timeout. if the command expects std input, set the `input` option.';
    }
  }

  return {
    config: checkConfiguration,
    status: exitCode === 0 ? 'passed' : 'failed',
    result: {
      directory: checkConfiguration.runInCygwin ? toCygpath(directory) : directory,
      exitCode,
    },
    output,
    error,
  };
}

function resolvePath(pathToResolve: string, parentDirectory: string) {
  return path.isAbsolute(pathToResolve) ? pathToResolve : path.join(parentDirectory, pathToResolve);
}

function makeCygwinCommand(command: string, directory: string, cygwinBin: string) {
  const bashExecutable = path.join(cygwinBin, 'bash.exe');
  const bashArgs = ['--norc', '--noprofile', '-l'];
  const updatePath = 'export PATH=/usr/local/bin:/usr/bin:$PATH';
  const changeDirectory = `cd \\"${toCygpath(directory)}\\"`;

  // TODO: escape `command` for use in the double quotes
  // (so the user doesn't have to do that manually)
  const bashCommand = ['-c', `"${updatePath} && ${changeDirectory} && ${command}"`];

  return [bashExecutable, ...bashArgs, ...bashCommand];
}

function toCygpath(location: string) {
  const locationPosix = upath.toUnix(location);
  const root = path.parse(locationPosix).root;
  const rootLetter = root.replace(':/', '/');
  return locationPosix.replace(root, `/cygdrive/${rootLetter.toLowerCase()}`);
}

function killAfterTimeout(subprocess: execa.ExecaChildProcess, timeout: number) {
  const timeoutId = setTimeout(() => {
    subprocess.cancel();
  }, timeout);

  return () => {
    clearTimeout(timeoutId);
  };
}
