export function patternToRegex(pattern: string, options: { isRegex: boolean; matchCase: boolean }) {
  try {
    return options.isRegex
      ? parseJsRegex(pattern)
      : new RegExp(escapeForRegex(pattern), options.matchCase ? 'g' : 'gi'); // always global
  } catch {
    return null;
  }
}

export function makeMatchedDelimiterRegex(startToken: string, endToken: string) {
  return new RegExp(
    escapeForRegex(startToken) + '[\\S\\s]*?' + escapeForRegex(endToken), // https://regexr.com/53766
    'g'
  );
}

export function makeSingleDelimiterRegex(delimiter: string) {
  return new RegExp(escapeForRegex(delimiter) + '.*?[\\r\\n]+', 'g'); // https://regexr.com/53771
}

// https://stackoverflow.com/a/55258958/5800506
export function parseJsRegex(string: string) {
  string = string.trim().startsWith('/') ? string : `/${string}/i`;

  let match = string.match(/\/(.+)\/.*/);
  if (match === null) {
    throw new Error('unable to parse regex pattern: ' + string);
  }

  const pattern = match[1];

  match = string.match(/\/.+\/(.*)/);
  if (match === null) {
    throw new Error('unable to parse regex pattern: ' + string);
  }

  const flags = match[1];

  return new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'); // always global
}

export function escapeForRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
