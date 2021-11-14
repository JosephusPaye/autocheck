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
  /**
   * The matching text
   */
  text: string;

  /**
   * Text before and after the match, if the match length is less than SEARCH_RESULT_SPACE
   */
  context: [string, string];

  /**
   * The one-indexed line of the match in the file
   */
  line: number;

  /**
   * How many lines does the match span
   */
  lineSpan: number;

  /**
   * The zero-indexed offset of the match relative to the start of its line
   */
  offset: number;

  /**
   * The zero-indexed offset of the match relative to the start of the file
   */
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

  return matches.sort((a, b) => a.offsetInFile - b.offsetInFile);
}

// The number of characters available to display a result in the list of
// results. It's a rough estimate, since the display font is not mono space.
const SEARCH_RESULT_SPACE = 40;

export function search(fileContent: string, patterns: RegExp[]): SearchMatch[] {
  const matches: SearchMatch[] = [];

  for (const regex of patterns) {
    Array.from(fileContent.matchAll(regex)).forEach((match) => {
      const result: SearchMatch = {
        text: match[0],
        context: ['', ''], // [before, after]
        line: 0,
        offset: 0,
        offsetInFile: 0,
        lineSpan: 1,
      };

      if (match.index !== undefined) {
        const matchLength = result.text.length;

        // Add the result position
        const startPosition = offsetToPosition(match.index, fileContent);
        result.line = startPosition.line;
        result.offset = startPosition.offset;
        result.offsetInFile = startPosition.offsetInFile;

        // Add the total number of lines
        const endPosition = offsetToPosition(match.index + matchLength - 1, fileContent);
        result.lineSpan = endPosition.line - result.line + 1;

        // Add the result context
        if (matchLength < SEARCH_RESULT_SPACE) {
          const halfContextSpace = Math.floor((SEARCH_RESULT_SPACE - matchLength) / 2);

          // Read up to half the available context space before the match
          let contextBefore = readUntilNewline(
            'backward',
            fileContent,
            match.index - 1,
            halfContextSpace
          );

          // Read up to half the available context space after the match
          let contextAfter = readUntilNewline(
            'forward',
            fileContent,
            match.index + matchLength,
            halfContextSpace
          );

          // If the context before is less than half the available space, use the remaining space
          // for the context after
          if (contextBefore.length < halfContextSpace) {
            contextAfter = readUntilNewline(
              'forward',
              fileContent,
              match.index + matchLength,
              halfContextSpace + (halfContextSpace - contextBefore.length)
            );
          }
          // If the context after is less than half the available space, use the remaining space
          // for the context before
          else if (contextAfter.length < halfContextSpace) {
            contextBefore = readUntilNewline(
              'backward',
              fileContent,
              match.index - 1,
              halfContextSpace + (halfContextSpace - contextAfter.length)
            );
          }

          result.context[0] = contextBefore;
          result.context[1] = contextAfter;
        }
      }

      matches.push(result);
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

const newLineRegex = /(\r\n)|(\n)/g;

function offsetToPosition(offset: number, text: string) {
  const position = {
    offsetInFile: offset,
    line: 0,
    offset: 0,
  };

  const newLinesBeforeOffset = (text.slice(0, offset).match(newLineRegex) ?? []).length;
  position.line = newLinesBeforeOffset + 1; // +1 since lines are 1-indexed

  if (offset > 0) {
    for (let i = offset - 1; i > -1; i--) {
      if (text[i] === '\n') {
        break;
      }

      position.offset++;
    }
  }

  return position;
}

function readUntilNewline(
  direction: 'backward' | 'forward',
  text: string,
  startIndex: number,
  maxLength: number
) {
  let readChars = '';
  let i = startIndex;

  while (true) {
    if (i < 0 || i >= text.length || readChars.length === maxLength) {
      break;
    }

    if (text[i] === '\n' || (text[i] === '\r' && text[i + 1] === '\n')) {
      break;
    }

    if (direction === 'forward') {
      readChars = readChars + text[i];
      i++;
    } else {
      readChars = text[i] + readChars;
      i--;
    }
  }

  return readChars;
}
