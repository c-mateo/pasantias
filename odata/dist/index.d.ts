/**
 * Parse an OData filter string and return a Promise resolving to the
 * criteria produced by the listener walker.
 *
 * This function is intentionally exported as both a named and default
 * export so it can be imported from different module systems used in
 * the backend (Adonis/Node).
 */
export declare function parse(input: string, vars?: Record<string, 'number' | 'string' | 'boolean'>): Promise<object>;
//# sourceMappingURL=index.d.ts.map