const fs = require('fs');
const path = require('path');
const picomatch = require('picomatch');

module.exports.expandGlobs = function expandGlobs(rootDirectory, globs) {
  const isMatch = picomatch(globs, {
    nocase: true,
  });
  return listFiles(rootDirectory, rootDirectory).filter((file) => {
    return isMatch(file.relativePath);
  });
};

module.exports.readString = function readString(filePath) {
  return fs.readFileSync(filePath, 'utf8');
};

const fileCache = {};
module.exports.readAndCacheString = function readAndCacheString(
  filePath,
  key,
  namespace
) {
  const local = fileCache[namespace] || {};
  local[key] = fs.readFileSync(filePath, 'utf8');
  fileCache[namespace] = local;
  return key;
};

module.exports.getFileCache = function getFileCache(namespace) {
  return fileCache[namespace] || {};
};

module.exports.writeString = function writeString(filePath, string) {
  return fs.writeFileSync(filePath, string);
};

function listFiles(currentDirectory, rootDirectory) {
  const files = [];
  const names = fs.readdirSync(currentDirectory) || [];

  names.forEach((file) => {
    const filePath = path.join(currentDirectory, file);

    if (fs.statSync(filePath).isDirectory()) {
      files.push(...listFiles(filePath, rootDirectory));
    } else {
      files.push({
        path: filePath,
        relativePath: filePath.replace(rootDirectory + path.sep, ''),
      });
    }
  });

  return files;
}
