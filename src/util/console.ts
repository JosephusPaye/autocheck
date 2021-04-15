export function print(...values: any[]) {
  for (const value of values) {
    process.stdout.write(value);
  }
}

export function println(...values: any[]) {
  for (const value of values) {
    process.stdout.write(value);
  }

  process.stdout.write('\n');
}
