const path = require('path');

const { fileExists, readString } = require('./fs');

module.exports = async function performMatchCheck(
  checkConfiguration,
  targetDirectory,
  context
) {
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
    const expected = await expandExpression(
      checkConfiguration.expected,
      targetDirectory,
      context
    );

    const actual = await expandExpression(
      checkConfiguration.actual,
      targetDirectory,
      context
    );

    const expectedTrimmed = expected.trim();
    const actualTrimmed = actual.trim();

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
};

async function expandExpression(value, targetDirectory, context) {
  if (value.startsWith('output:')) {
    const referenceName = value.replace('output:', '');
    const reference = context[referenceName];
    if (reference) {
      if (reference.output) {
        return reference.output;
      } else {
        throw `The check ${quote(referenceName)} has no output.`;
      }
    } else {
      throw `Unable to read output of check, the check ${quote(
        referenceName
      )} was not found.`;
    }
  }

  if (value.startsWith('file:')) {
    const fileName = value.replace('file:', '');
    const filePath = path.isAbsolute(fileName)
      ? fileName
      : path.join(targetDirectory, fileName);

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

function quote(text, delimiter = '`') {
  return delimiter + text + delimiter;
}
