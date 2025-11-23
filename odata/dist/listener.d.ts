import MyGrammarListener from './ODataFilterListener.js';
import { ComparisonContext, ExpressionContext, FilterContext, IdentifierContext, ListContext, LiteralContext, StringFunctionContext } from './ODataFilterParser.js';
type type = "number" | "string" | "boolean";
type LiteralValue = number | string | boolean;
interface IdentifierNode {
    type: "Identifier";
    name: string;
}
interface LiteralNode {
    type: "Literal";
    value: LiteralValue;
}
interface ListNode {
    type: "List";
    values: LiteralValue[];
}
interface ComparisonNode {
    type: "Comparison";
    value: object;
}
type Node = IdentifierNode | LiteralNode | ListNode | ComparisonNode;
export declare class MyTreeWalker extends MyGrammarListener {
    private resolve;
    stack: Node[];
    private vars;
    constructor(resolve: (value: any) => void, vars?: Record<string, type>);
    exitIdentifier: (ctx: IdentifierContext) => void;
    exitComparison: (ctx: ComparisonContext) => void;
    exitList: (ctx: ListContext) => void;
    exitLiteral: (ctx: LiteralContext) => void;
    exitStringFunction: (ctx: StringFunctionContext) => void;
    exitExpression: (ctx: ExpressionContext) => void;
    exitFilter: (ctx: FilterContext) => void;
    private getVariable;
}
export {};
//# sourceMappingURL=listener.d.ts.map