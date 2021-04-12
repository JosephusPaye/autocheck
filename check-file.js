// @ts-check

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
      url: url.pathToFileURL(file.path).toString(),
      relativePath: file.relativePath,
    };

    if (isText(result.type)) {
      await readStringAndCache(file.path, file.relativePath, targetDirectory);
    }

    results.push(result);
  }

  return {
    config: checkConfiguration,
    status: results.length > 0 ? 'passed' : 'failed',
    results,
    error: results.length > 0 ? undefined : 'No matching files found',
  };
};

function isText(extension) {
  return [
    'txt',
    'md',
    'c',
    'cpp',
    'cs',
    'h',
    'hpp',
    'makefile',
    'java',
    'py',
    'html',
    'css',
    'js',
    'json',
    'xml',
    'svg',
  ].includes(extension);
}
