export function areSameType(a: any, b: any): boolean {
  return a.constructor === b.constructor;
}
