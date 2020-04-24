const path = require('path');
const upath = require('upath');
const execa = require('execa');

const { fileExists, directoryExists, createReadStream } = require('./fs');

module.exports = async function performCommandCheck(
  checkConfiguration,
  targetDirectory
) {
  if (
    !checkConfiguration.command ||
    checkConfiguration.command.trim().length === 0
  ) {
    return {
      config: checkConfiguration,
      status: 'failed',
      error: 'No `command` specified for this check.',
    };
  }

  if (
    checkConfiguration.runInCygwin &&
    (!checkConfiguration.cygwinBin ||
      checkConfiguration.cygwinBin.trim().length === 0)
  ) {
    return {
      config: checkConfiguration,
      status: 'failed',
      error: 'The `cygwinBin` option is required to run a command in Cygwin.',
    };
  }

  const directory =
    resolvePath(checkConfiguration.directory, targetDirectory) ||
    targetDirectory;

  if (!(await directoryExists(directory))) {
    return {
      config: checkConfiguration,
      result: { directory },
      status: 'failed',
      error: `Command working directory not found or inaccessible: ${directory}`,
    };
  }

  let command = checkConfiguration.command;
  command = checkConfiguration.runInCygwin
    ? makeCygwinCommand(command, directory, checkConfiguration.cygwinBin)
    : command.split(' ').map((part) => part.trim());

  let inputStream;
  const input = resolvePath(checkConfiguration.input, targetDirectory);
  if (input && (await fileExists(input))) {
    inputStream = createReadStream(input, { encoding: 'utf-8' });
  }

  let output, exitCode, error;

  try {
    const subprocess = execa(command[0], command.slice(1), {
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
    exitCode = err.exitCode || -1;
    if (err.isCanceled) {
      error =
        'command cancelled after timeout. if the command expects std input, set the `input` option.';
    }
  }

  return {
    config: checkConfiguration,
    status: exitCode === 0 ? 'passed' : 'failed',
    result: {
      directory: checkConfiguration.runInCygwin
        ? toCygpath(directory)
        : directory,
      exitCode,
    },
    output,
    error,
  };
};

function resolvePath(pathToResolve, targetDirectory) {
  return pathToResolve
    ? path.isAbsolute(pathToResolve)
      ? pathToResolve
      : path.join(targetDirectory, pathToResolve)
    : undefined;
}

function makeCygwinCommand(command, directory, cygwinBin) {
  const bashExecutable = path.join(cygwinBin, 'bash.exe');
  const bashArgs = ['--norc', '--noprofile', '-l'];
  const updatePath = 'export PATH=/usr/local/bin:/usr/bin:$PATH';
  const changeDirectory = `cd \\"${toCygpath(directory)}\\"`;

  // TODO: escape `command` for use in the double quotes
  // (so the user doesn't have to do that manually)
  const bashCommand = [
    '-c',
    `"${updatePath} && ${changeDirectory} && ${command}"`,
  ];

  return [bashExecutable, ...bashArgs, ...bashCommand];
}

function toCygpath(location) {
  const locationPosix = upath.toUnix(location);
  const root = path.parse(locationPosix).root;
  const rootLetter = root.replace(':/', '/');
  return locationPosix.replace(root, `/cygdrive/${rootLetter.toLowerCase()}`);
}

function killAfterTimeout(subprocess, timeout) {
  const t = setTimeout(() => {
    subprocess.cancel();
  }, timeout);

  return () => {
    clearTimeout(t);
  };
}
