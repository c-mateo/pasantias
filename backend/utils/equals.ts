export function equals(a: any, b: any, comparator?: (a: any, b: any) => boolean): boolean {
  return comparator ? comparator(a, b) : a === b;
}
