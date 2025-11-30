// Une arrays de chars recursivamente: ["f", ["o", "o"]] -> "foo"
export function flattenString(arr: any): string {
    if (typeof arr === 'string') return arr;
    if (Array.isArray(arr)) return arr.map(flattenString).join('');
    return '';
}

// Deep Merge para compactar ANDs sin perder datos (ej: age > 5 AND age < 10)
export function deepMerge(target: any, source: any) {
    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], deepMerge(target[key], source[key]));
        }
    }
    Object.assign(target || {}, source);
    return target;
}