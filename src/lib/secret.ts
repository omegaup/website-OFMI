export function getSecret(secretName: string): string | undefined {
  return process.env[secretName];
}

export function getSecretOrError(secretName: string): string {
  const value = getSecret(secretName);
  if (value === undefined) {
    throw Error(`No env variable found for ${secretName}`);
  }
  return value;
}
