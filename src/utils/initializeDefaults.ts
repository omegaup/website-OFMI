export interface Obj<Type> {
  [key: string]: Type;
}

export default function initializeDefaults<Type>(
  keys: string[],
  val: Type,
): Obj<Type> {
  const object: Obj<Type> = {};
  for (const key of keys) {
    object[key] = val;
  }
  return object;
}
