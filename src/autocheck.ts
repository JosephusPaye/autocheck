import path from 'path';
import color from 'kleur';

import { performFileCheck, FileCheckConfiguration, FileCheckResult } from './checks/file-check';
import {
  performCommandCheck,
  CommandCheckConfiguration,
  CommandCheckResult,
} from './checks/command-check';
import { performMatchCheck, MatchCheckConfiguration, MatchCheckResult } from './checks/match-check';
import {
  performSearchCheck,
  SearchCheckConfiguration,
  SearchCheckResult,
} from './checks/search-check';

import { print, println } from './util/console';
import {
  getFileCache,
  fileExists,
  directoryExists,
  listDirectories,
  cleanDirectoryContent,
} from './util/fs';
import { quote } from './util/string';

import { copySupportingFiles, createReport, generateReportsIndex } from './report/report';

export interface CommonCheckConfiguration {
  type: 'file' | 'command' | 'match' | 'search';
  label: string;
  if?: string;
  ignore?: boolean;
}

export interface CommonCheckResult {
  config: CheckConfiguration;
  status: 'passed' | 'failed' | 'skipped';
  error?: string;
  output?: string;
}

export type ChecksConfiguration = CheckConfiguration[];
export type CompletedChecksStatus = Map<string, Pick<CommonCheckResult, 'status' | 'output'>>;

export type CheckResult =
  | FileCheckResult
  | CommandCheckResult
  | MatchCheckResult
  | SearchCheckResult;

export type CheckConfiguration =
  | FileCheckConfiguration
  | CommandCheckConfiguration
  | MatchCheckConfiguration
  | SearchCheckConfiguration;

export interface Result {
  title: string;
  checks: CommonCheckResult[];
  fileContents: Record<string, string>;
}

function relative(pathToPrint: string) {
  return path.isAbsolute(pathToPrint)
    ? pathToPrint
        .replace(process.cwd() + path.sep, '.' + path.sep)
        .replace(process.cwd(), '.' + path.sep)
    : pathToPrint;
}

export async function main(
  checksFileArg: string,
  targetDirectoryArgs: string[],
  useSubfolders: boolean,
  cleanResultsDirectory: boolean
) {
  const checksFile = await findChecksFile(checksFileArg);
  const checks = getChecks(checksFile);

  println(color.blue(`running checks from ${relative(checksFile)}`));
  println();

  const targetDirectories = await resolveTargetDirectories(targetDirectoryArgs, useSubfolders);
  const results: Result[] = [];

  const resultsDirectory = path.join(process.cwd(), 'autocheck-reports');

  if (cleanResultsDirectory) {
    cleanDirectoryContent(resultsDirectory);
  }

  await copySupportingFiles(resultsDirectory);

  let i = 1;
  for (let directory of targetDirectories) {
    println(
      color.blue(`checking directory (${i++}/${targetDirectories.length}): ${relative(directory)}`)
    );

    const completedChecks: CompletedChecksStatus = new Map();
    const checkResults: CommonCheckResult[] = [];

    let j = 1;
    for (const check of checks) {
      if (check.ignore) {
        continue;
      }

      println(`  running check (${j++}/${checks.length}): `, check.label);

      let checkResult: CommonCheckResult;

      if (check.if) {
        const dependency = completedChecks.get(check.if);

        if (dependency) {
          if (dependency.status === 'passed') {
            checkResult = await performCheck(check, directory, completedChecks);
          } else {
            checkResult = {
              config: check,
              status: 'skipped',
              error: `Check skipped because the check it depends on, ${quote(check.if)}, ${
                dependency.status === 'skipped' ? 'was skipped' : 'failed'
              }.`,
            };

            println(
              color.gray(
                `    check skipped because ${quote(check.if)} ${
                  dependency.status === 'skipped' ? 'was skipped' : 'failed'
                }.`
              )
            );
          }
        } else {
          checkResult = {
            config: check,
            status: 'skipped',
            error: `Check skipped because the check it depends on, ${quote(
              check.if
            )}, was not found. Make sure the referenced check exists and appears before this check.`,
          };

          println(color.gray(`    check skipped because ${quote(check.if)} was not found`));
        }
      } else {
        checkResult = await performCheck(check, directory, completedChecks);
      }

      if (checkResult) {
        completedChecks.set(check.label, {
          status: checkResult.status,
          output: checkResult.output,
        });

        checkResults.push(checkResult);

        if (checkResult.status === 'passed') {
          println(color.green('    check ' + checkResult.status));
        } else if (checkResult.status === 'failed') {
          print(color.red('    check failed'));
          println(checkResult.error ? ': ' + checkResult.error : '');
        }
      } else {
        println(color.gray('    check has no result'));
      }
    }

    const result: Result = {
      title: path.basename(directory),
      checks: checkResults,
      fileContents: getFileCache(directory),
    };

    results.push(result);

    const reportFilePath = await createReport(result, resultsDirectory);
    println('  generated report: ', relative(reportFilePath));

    println();
  }

  if (results.length > 1) {
    println(color.blue('generating per-check reports...'));
    const perCheckResultsDirectory = await generatePerCheckReports(
      results,
      resultsDirectory,
      cleanResultsDirectory
    );

    println();
    println(color.blue('generating indexes...'));

    let outputFile = await generateReportsIndex(resultsDirectory);
    println('  per-target index: ', relative(outputFile));

    outputFile = await generateReportsIndex(perCheckResultsDirectory);
    println('  per-check index: ', relative(outputFile));

    println();
  }

  println(color.blue('done'));
}

async function resolveTargetDirectories(targetDirectoryArgs: string[], useSubfolders: boolean) {
  const targetDirectories = [];

  for (let arg of targetDirectoryArgs) {
    arg = arg.replace(/"/g, '');

    const directory = path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg);

    if (await directoryExists(directory)) {
      if (useSubfolders) {
        const directories = await listDirectories(directory, directory, {
          recursive: false,
        });
        targetDirectories.push(...directories);
      } else {
        targetDirectories.push(directory);
      }
    } else {
      console.log('target directory not found, skipping: ', directory);
    }
  }

  return targetDirectories;
}

async function findChecksFile(checksFilePath: string) {
  const resolvedChecksFilePath = path.isAbsolute(checksFilePath)
    ? checksFilePath
    : path.join(process.cwd(), checksFilePath);

  if (!(await fileExists(resolvedChecksFilePath))) {
    console.log('checks file not found:', resolvedChecksFilePath);
    process.exit();
  }

  return resolvedChecksFilePath;
}

function getChecks(filePath: string): ChecksConfiguration {
  try {
    return require(filePath);
  } catch (err) {
    console.log('unable to read checks file:', err);
    process.exit();
  }
}

async function performCheck(
  checkConfiguration: CheckConfiguration,
  targetDirectory: string,
  context: CompletedChecksStatus
) {
  switch (checkConfiguration.type) {
    case 'file':
      return performFileCheck(checkConfiguration, targetDirectory);
    case 'command':
      return performCommandCheck(checkConfiguration, targetDirectory);
    case 'match':
      return performMatchCheck(checkConfiguration, targetDirectory, context);
    case 'search':
      return performSearchCheck(checkConfiguration, targetDirectory);
  }
}

/**
 * Turns the list of per-target results to a list of per-check results,
 * in the same format that the frontend expects, just changing titles,
 * labels, and file paths.
 */
async function generatePerCheckReports(
  results: Result[],
  resultsDirectory: string,
  cleanResultsDirectory: boolean
) {
  const perCheckResults = new Map<string, Result>();

  results.forEach((result) => {
    result.checks.forEach((check) => {
      const transformedResult = perCheckResults.get(check.config.label) ?? {
        title: check.config.label,
        fileContents: {},
        checks: [],
      };

      Object.entries(result.fileContents).forEach(([key, value]) => {
        transformedResult.fileContents[result.title + '/' + key] = value;
      });

      const transformedCheck = Object.assign({}, check, {
        config: Object.assign({}, check.config, {
          label: result.title,
        }),
        results: ((check as any).results as { relativePath: string }[] | undefined)?.map((file) => {
          return Object.assign({}, file, {
            relativePath: file.relativePath ? `${result.title}/${file.relativePath}` : undefined,
          });
        }),
      });

      transformedResult.checks.push(transformedCheck);

      perCheckResults.set(check.config.label, transformedResult);
    });
  });

  const perCheckResultsDirectory = path.join(resultsDirectory, 'per-check');

  if (cleanResultsDirectory) {
    cleanDirectoryContent(resultsDirectory);
  }

  await copySupportingFiles(perCheckResultsDirectory);

  let i = 1;
  for (const check of perCheckResults.values()) {
    const outputFile = await createReport(
      check,
      perCheckResultsDirectory,
      String(i++).padStart(2, '0') + '. '
    );
    println('  check report: ', relative(outputFile));
  }

  return perCheckResultsDirectory;
}
