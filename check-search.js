// @ts-check

const path = require('path');

const { expandGlobs, readStringAndCache } = require('./fs');

module.exports = async function performSearchCheck(
  checkConfiguration,
  targetDirectory
) {
  const results = [];
  const matchingFiles = await expandGlobs(
    targetDirectory,
    checkConfiguration.filePatterns
  );

  for (const file of matchingFiles) {
    // Fallback to the basename for files without an extension (e.g. makefiles)
    const extension =
      path.extname(file.path).slice(1) || path.basename(file.path);

    const result = {
      type: extension.toLowerCase(),
      relativePath: file.relativePath,
      path: file.path,
    };

    if (isTextFile(result.type)) {
      const fileContent = await readStringAndCache(
        file.path,
        file.relativePath,
        targetDirectory
      );

      let matches = search(
        fileContent,
        checkConfiguration.patterns,
        checkConfiguration.matchCase
      );

      if (checkConfiguration.skipComments) {
        const delimiters = Array.isArray(checkConfiguration.skipComments)
          ? checkConfiguration.skipComments
          : [['/*', '*/'], '//'];

        const commentRanges = findCommentRanges(fileContent, delimiters);

        if (commentRanges.length > 0) {
          matches = matches.filter((match) => {
            return (
              isInRange(commentRanges, match.index, match.text.length) === false
            );
          });
        }
      }

      result.matches = matches;
    }

    if (result.matches.length > 0) {
      results.push(result);
    }
  }

  const passOnMatch =
    checkConfiguration.passOnMatch === undefined
      ? true
      : checkConfiguration.passOnMatch;

  return {
    config: checkConfiguration,
    status:
      results.length > 0
        ? passOnMatch
          ? 'passed'
          : 'failed'
        : passOnMatch
        ? 'failed'
        : 'passed',
    results,
    error:
      results.length > 0
        ? undefined
        : passOnMatch
        ? 'No match found'
        : 'Unexpected match found',
  };
};

function search(fileContent, patterns, matchCase = false) {
  const results = [];
  const lines = fileContent.split('\n');

  for (const pattern of patterns) {
    const regex = new RegExp(escapeForRegex(pattern), matchCase ? 'g' : 'gi');

    lines.forEach((line, index) => {
      const originalLine = line + '\n';

      regex.lastIndex = 0;

      const lineResults = matchAll(originalLine, regex).map((match) => {
        const text = match[0];
        let context;

        if (text.length < 44) {
          const contextLength = Math.floor((44 - text.length) / 2);
          context = [
            originalLine.substring(match.index - contextLength, match.index),
            originalLine.substring(
              match.index + text.length,
              match.index + text.length + contextLength
            ),
          ];
        }

        return {
          text,
          context,
          line: index + 1,
          offset: match.index,
        };
      });

      results.push(...lineResults);
    });
  }

  return results;
}

function isTextFile(extension) {
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

function findCommentRanges(text, commentDelimiters) {
  const commentRanges = [];

  for (const delimiter of commentDelimiters) {
    const regex = Array.isArray(delimiter)
      ? makeMatchedDelimiterRegex(delimiter[0], delimiter[1])
      : makeSingleDelimiterRegex(delimiter);

    const matchedRanges = matchAll(text, regex)
      .map((match) => {
        return [match.index, match[0].length];
      })
      .filter((range) => {
        return isInRange(commentRanges, range[0], range[1]) === false;
      });

    commentRanges.push(...matchedRanges);
  }

  return commentRanges;
}

function isInRange(existingRanges, index, length) {
  return existingRanges.some(([rangeIndex, rangeLength]) => {
    return index >= rangeIndex && length <= rangeLength;
  });
}

function makeMatchedDelimiterRegex(startToken, endToken) {
  return new RegExp(
    escapeForRegex(startToken) + '[\\S\\s]*?' + escapeForRegex(endToken), // https://regexr.com/53766
    'g'
  );
}

function makeSingleDelimiterRegex(delimiter) {
  return new RegExp(escapeForRegex(delimiter) + '.*?[\\r\\n]+', 'g'); // https://regexr.com/53771
}

function escapeForRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchAll(text, regex) {
  const matches = [];
  let match;

  do {
    match = regex.exec(text);
    if (match) {
      matches.push(match);
    }
  } while (match);

  return matches;
}
