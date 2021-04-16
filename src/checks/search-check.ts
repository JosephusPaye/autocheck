import path from 'path';

import { CommonCheckConfiguration, CommonCheckResult } from '../autocheck';

import { expandGlobs, isTextFile, readStringAndCache } from '../util/fs';
import { makeMatchedDelimiterRegex, makeSingleDelimiterRegex, patternToRegex } from '../util/regex';

export interface SearchCheckConfiguration extends CommonCheckConfiguration {
  type: 'search';
  patterns: string[];
  filePatterns: string[];
  matchCase?: boolean;
  matchAsRegex?: boolean;
  skipComments?: boolean | Array<string | string[]>;
  passWhen: 'found' | 'not-found';
}

export interface SearchCheckResult extends CommonCheckResult {
  results: SearchResult[];
}

export interface SearchMatch {
  text: string;
  context: [string, string];
  line: number;
  offset: number;
  offsetInFile: number;
}

export interface SearchResult {
  type: string;
  relativePath: string;
  path: string;
  matches: SearchMatch[];
}

export async function performSearchCheck(
  checkConfiguration: SearchCheckConfiguration,
  targetDirectory: string
): Promise<SearchCheckResult> {
  const results: SearchResult[] = [];
  const matchingFiles = await expandGlobs(targetDirectory, checkConfiguration.filePatterns);

  const patternRegexes = configPatternsToRegex(checkConfiguration.patterns, {
    matchAsRegex: checkConfiguration.matchAsRegex,
    matchCase: checkConfiguration.matchCase,
  });

  for (const file of matchingFiles) {
    // Fallback to the basename for files without an extension (e.g. makefiles)
    const extension = path.extname(file.path).slice(1) || path.basename(file.path);

    const result: SearchResult = {
      type: extension.toLowerCase(),
      relativePath: file.relativePath,
      path: file.path,
      matches: [],
    };

    if (isTextFile(result.type)) {
      const fileContent = await readStringAndCache(file.path, file.relativePath, targetDirectory);
      result.matches = getSearchMatches(
        fileContent,
        patternRegexes,
        checkConfiguration.skipComments
      );
    }

    if (result.matches.length > 0) {
      results.push(result);
    }
  }

  let status: CommonCheckResult['status'];
  let error: string | undefined;

  if ((checkConfiguration.passWhen ?? 'found') === 'found') {
    status = results.length > 0 ? 'passed' : 'failed';
    error = results.length > 0 ? undefined : 'No match found';
  } else {
    status = results.length === 0 ? 'passed' : 'failed';
    error = results.length === 0 ? undefined : 'Unexpected match found';
  }

  return {
    config: checkConfiguration,
    status,
    results,
    error,
  };
}

export function configPatternsToRegex(
  patterns: string[],
  options: { matchAsRegex?: boolean; matchCase?: boolean }
) {
  const patternRegexes: RegExp[] = [];

  for (const pattern of patterns) {
    const regex = patternToRegex(pattern, {
      isRegex: options.matchAsRegex ?? false,
      matchCase: options.matchCase ?? false,
    });

    if (regex) {
      patternRegexes.push(regex);
    } else {
      console.log('unable to convert pattern to regex, skipping invalid pattern: ', pattern);
    }
  }

  return patternRegexes;
}

export function getSearchMatches(
  fileContent: string,
  patterns: RegExp[],
  skipComments?: Array<string | string[]> | boolean
): SearchMatch[] {
  let matches = search(fileContent, patterns);

  if (skipComments) {
    const delimiters = Array.isArray(skipComments) ? skipComments : [['/*', '*/'], '//'];

    const commentRanges = findCommentRanges(fileContent, delimiters);

    if (commentRanges.length > 0) {
      matches = matches.filter((match) => {
        return isInRange(commentRanges, match.offsetInFile, match.text.length) === false;
      });
    }
  }

  return matches;
}

export function search(fileContent: string, patterns: RegExp[]): SearchMatch[] {
  const matches: SearchMatch[] = [];
  const lines = fileContent.split('\n');

  for (const regex of patterns) {
    let currentLineIndex = 0;

    lines.forEach((line, lineIndex) => {
      const originalLine = line + '\n';

      let lineMatches = Array.from(originalLine.matchAll(regex)).map((match) => {
        const text = match[0];

        let context: [string, string] = ['', '']; // [before, after]

        if (match.index && text.length < 44) {
          const contextLength = Math.floor((44 - text.length) / 2);

          context[0] = originalLine.substring(match.index - contextLength, match.index);
          context[1] = originalLine.substring(
            match.index + text.length,
            match.index + text.length + contextLength
          );
        }

        const offsetOnLine = match.index ?? -Infinity;
        const offsetInFile = currentLineIndex + offsetOnLine;

        return {
          text,
          context,
          line: lineIndex + 1,
          offset: offsetOnLine,
          offsetInFile,
        };
      });

      matches.push(...lineMatches);

      currentLineIndex += originalLine.length;
    });
  }

  return matches;
}

export function findCommentRanges(text: string, commentDelimiters: Array<string | string[]>) {
  const commentRanges: [number, number][] = [];

  for (const delimiter of commentDelimiters) {
    const regex = Array.isArray(delimiter)
      ? makeMatchedDelimiterRegex(delimiter[0], delimiter[1])
      : makeSingleDelimiterRegex(delimiter);

    const matchedRanges = Array.from(text.matchAll(regex))
      .filter((match) => match[0] !== undefined && match[0] !== null)
      .map((match) => {
        return [match.index, match[0].length] as [number, number];
      })
      .filter((range) => {
        return isInRange(commentRanges, range[0], range[1]) === false;
      });

    commentRanges.push(...matchedRanges);
  }

  return commentRanges;
}

export function isInRange(existingRanges: [number, number][], index: number, length: number) {
  return existingRanges.some(([rangeIndex, rangeLength]) => {
    return index >= rangeIndex && index < rangeIndex + rangeLength && length <= rangeLength;
  });
}
