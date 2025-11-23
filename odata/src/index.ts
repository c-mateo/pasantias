import { CharStream, CommonTokenStream, ParseTreeWalker } from 'antlr4';
import ODataFilterLexer from './ODataFilterLexer.js';
import ODataFilterParser from './ODataFilterParser.js';
import { MyTreeWalker } from './listener.ts';

/**
 * Parse an OData filter string and return a Promise resolving to the
 * criteria produced by the listener walker.
 *
 * This function is intentionally exported as both a named and default
 * export so it can be imported from different module systems used in
 * the backend (Adonis/Node).
 */
export async function parse(input: string, vars?: Record<string, 'number'|'string'|'boolean'>): Promise<object> {
    return new Promise((resolve, reject) => {
        const chars = new CharStream(input);
        const lexer = new ODataFilterLexer(chars);
        const tokens = new CommonTokenStream(lexer);
        const parser = new ODataFilterParser(tokens);
        const tree = parser.filter();

        const walker = new MyTreeWalker(resolve, vars);

        try {
            ParseTreeWalker.DEFAULT.walk(walker, tree);
        } catch (error) {
            reject(error);
        }
    });
}