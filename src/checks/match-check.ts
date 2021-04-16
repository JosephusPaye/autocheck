import path from 'path';

import { CommonCheckConfiguration, CommonCheckResult, CompletedChecksStatus } from '../autocheck';
import { fileExists, readString } from '../util/fs';
import { quote } from '../util/string';

export interface MatchResult {
  type: string;
  url: string;
  relativePath: string;
}

export interface MatchCheckConfiguration extends CommonCheckConfiguration {
  type: 'match';
  expected: string;
  actual: string;
  ignoreTrailingSpaces?: boolean;
}

export interface MatchCheckResult extends CommonCheckResult {
  expected?: string;
  actual?: string;
}

const trailingSpacesRegex = /[ \t]+([\r\n]+)/g;

export async function performMatchCheck(
  checkConfiguration: MatchCheckConfiguration,
  targetDirectory: string,
  context: CompletedChecksStatus
): Promise<MatchCheckResult> {
  if (!checkConfiguration.expected) {
    return {
      config: checkConfiguration,
      status: 'failed',
      error: 'No `expected` value specified for this check.',
    };
  }

  if (!checkConfiguration.actual) {
    return {
      config: checkConfiguration,
      status: 'failed',
      error: 'No `actual` value specified for this check.',
    };
  }

  try {
    const expected = await resolveExpression(checkConfiguration.expected, targetDirectory, context);

    const actual = await resolveExpression(checkConfiguration.actual, targetDirectory, context);

    let expectedTrimmed = expected.trim();
    let actualTrimmed = actual.trim();

    if (checkConfiguration.ignoreTrailingSpaces ?? true) {
      expectedTrimmed = expectedTrimmed.replace(trailingSpacesRegex, (_match, group1) => group1);
      actualTrimmed = actualTrimmed.replace(trailingSpacesRegex, (_match, group1) => group1);
    }

    const passed = expectedTrimmed === actualTrimmed;

    return {
      config: checkConfiguration,
      status: passed ? 'passed' : 'failed',
      expected: expectedTrimmed,
      actual: actualTrimmed,
    };
  } catch (err) {
    return {
      config: checkConfiguration,
      status: 'failed',
      error: err,
    };
  }
}

async function resolveExpression(
  value: string,
  targetDirectory: string,
  context: CompletedChecksStatus
) {
  if (value.startsWith('output:')) {
    const referenceName = value.replace('output:', '');
    const reference = context.get(referenceName);

    if (reference) {
      if (reference.output) {
        return reference.output;
      } else {
        throw `The check ${quote(referenceName)} has no output.`;
      }
    } else {
      throw `Unable to read output of check, the check ${quote(referenceName)} was not found.`;
    }
  }

  if (value.startsWith('file:')) {
    const fileName = value.replace('file:', '');
    const filePath = path.isAbsolute(fileName) ? fileName : path.join(targetDirectory, fileName);

    if (await fileExists(filePath)) {
      try {
        return await readString(filePath);
      } catch {
        throw `Unable to read file: ${filePath}`;
      }
    } else {
      throw `Unable to read file: ${filePath}`;
    }
  }

  return value;
}
