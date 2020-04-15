const { pathToFileURL } = require('url');
const { extname } = require('path');
const { expandGlobs, readAndCacheString } = require('../files');

module.exports = function performFileCheck(
  checkConfiguration,
  targetDirectory
) {
  const matchingFiles = expandGlobs(
    targetDirectory,
    checkConfiguration.patterns
  );
  return {
    config: checkConfiguration,
    results: matchingFiles.map((file) => {
      const result = {
        type: extname(file.path).toLowerCase().slice(1),
        url: pathToFileURL(file.path),
        relativePath: file.relativePath,
      };

      if (isCode(result.type)) {
        readAndCacheString(file.path, file.relativePath, targetDirectory);
      }

      return result;
    }),
  };
};

function isCode(extension) {
  return ['txt', 'md', 'c', 'cpp', 'h', 'hpp', 'makefile', 'java'].includes(
    extension
  );
}
