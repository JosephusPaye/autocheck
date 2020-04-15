const { pathToFileURL } = require('url');
const { extname, basename } = require('path');
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
      // Fallback to the basename for files without an extension (e.g. makefiles)
      const extension = extname(file.path).slice(1) || basename(file.path);

      const result = {
        type: extension.toLowerCase(),
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
