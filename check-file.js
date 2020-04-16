const url = require('url');
const path = require('path');

const { expandGlobs, readStringAndCache } = require('./fs');

module.exports = async function performFileCheck(
  checkConfiguration,
  targetDirectory
) {
  const results = [];
  const matchingFiles = await expandGlobs(
    targetDirectory,
    checkConfiguration.patterns
  );

  for (const file of matchingFiles) {
    // Fallback to the basename for files without an extension (e.g. makefiles)
    const extension =
      path.extname(file.path).slice(1) || path.basename(file.path);

    const result = {
      type: extension.toLowerCase(),
      url: url.pathToFileURL(file.path),
      relativePath: file.relativePath,
    };

    if (isCode(result.type)) {
      await readStringAndCache(file.path, file.relativePath, targetDirectory);
    }

    results.push(result);
  }

  return {
    config: checkConfiguration,
    results,
  };
};

function isCode(extension) {
  return ['txt', 'md', 'c', 'cpp', 'h', 'hpp', 'makefile', 'java'].includes(
    extension
  );
}
