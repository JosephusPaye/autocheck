import path from 'path';

import { CommonCheckConfiguration, CommonCheckResult } from '../autocheck';

import { expandGlobs, isTextFile, readStringAndCache } from '../util/fs';
import { patternToRegex } from '../util/regex';

export interface SearchCheckConfiguration extends CommonCheckConfiguration {
  type: 'search';
  patterns: string[];
  filePatterns: string[];
  matchCase?: boolean;
  matchAsRegex?: boolean;
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
      result.matches = getSearchMatches(fileContent, patternRegexes);
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

function configPatternsToRegex(
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

function getSearchMatches(fileContent: string, patterns: RegExp[]): SearchMatch[] {
  return search(fileContent, patterns);
  // TODO: filter results from search() to remove matches inside comments here
}

function search(fileContent: string, patterns: RegExp[]): SearchMatch[] {
  const matches: SearchMatch[] = [];
  const lines = fileContent.split('\n');

  for (const regex of patterns) {
    lines.forEach((line, index) => {
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

        return {
          text,
          context,
          line: index + 1,
          offset: match.index ?? -1,
        };
      });

      matches.push(...lineMatches);
    });
  }

  return matches;
}

