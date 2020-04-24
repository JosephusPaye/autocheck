const fs = require('fs');
const path = require('path');
const picomatch = require('picomatch');
const rimraf = require('rimraf');
const copydir = require('copy-dir');
const upath = require('upath');

module.exports.readString = readString;
module.exports.readStringAndCache = readStringAndCache;
module.exports.getFileCache = getFileCache;
module.exports.writeString = writeString;
module.exports.listFiles = listFiles;
module.exports.listDirectories = listDirectories;
module.exports.expandGlobs = expandGlobs;
module.exports.cleanDirectoryContent = cleanDirectoryContent;
module.exports.copyDirectory = copyDirectory;
module.exports.fileExists = fileExists;
module.exports.directoryExists = directoryExists;
module.exports.createReadStream = fs.createReadStream;

const fsReadFile = promisify(fs.readFile);
const fsWriteFile = promisify(fs.writeFile);
const fsStat = promisify(fs.stat);
const fsReaddir = promisify(fs.readdir);
const rimrafPromised = promisify(rimraf);
const copydirPromised = promisify(copydir);

async function readString(filePath) {
  return fsReadFile(filePath, 'utf8');
}

const fileCache = {};
async function readStringAndCache(filePath, key, namespace) {
  const content = await fsReadFile(filePath, 'utf8');

  if (fileCache[namespace] === undefined) {
    fileCache[namespace] = {
      [key]: content,
    };
  } else {
    fileCache[namespace][key] = content;
  }

  return key;
}

function getFileCache(namespace) {
  return fileCache[namespace] || {};
}

async function writeString(filePath, string) {
  return fsWriteFile(filePath, string);
}

async function listFiles(currentDirectory, rootDirectory) {
  const files = [];
  const names = (await fsReaddir(currentDirectory)) || [];

  for (const file of names) {
    const filePath = path.join(currentDirectory, file);
    const stat = await fsStat(filePath);

    if (stat.isDirectory()) {
      files.push(...(await listFiles(filePath, rootDirectory)));
    } else {
      files.push({
        path: filePath,
        relativePath: upath
          .toUnix(filePath)
          .replace(upath.toUnix(path.join(rootDirectory, path.sep)), ''),
      });
    }
  }

  return files;
}

async function listDirectories(
  currentDirectory,
  rootDirectory,
  options = { recursive: true }
) {
  const directories = [];
  const names = (await fsReaddir(currentDirectory)) || [];

  for (const name of names) {
    const fullPath = path.join(currentDirectory, name);
    const stat = await fsStat(fullPath);

    if (stat.isDirectory()) {
      directories.push(fullPath);

      if (options.recursive) {
        directories.push(
          ...(await listDirectories(fullPath, rootDirectory, options))
        );
      }
    }
  }

  return directories;
}

async function expandGlobs(rootDirectory, globs) {
  const files = await listFiles(rootDirectory, rootDirectory);
  const isMatch = picomatch(globs, {
    nocase: true,
  });
  return files.filter((file) => {
    return isMatch(file.relativePath);
  });
}

async function cleanDirectoryContent(directory) {
  return rimrafPromised(path.join(directory, '*'));
}

async function copyDirectory(source, destination, options) {
  return copydirPromised(source, destination, options);
}

async function fileExists(filePath) {
  try {
    return (await fsStat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function directoryExists(directoryPath) {
  try {
    return (await fsStat(directoryPath)).isDirectory();
  } catch {
    return false;
  }
}

function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      return fn(...args, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };
}
