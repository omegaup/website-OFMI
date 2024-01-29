export default function objHasKey(object: object, key: string): boolean {
  return Object.keys(object).includes(key);
}
