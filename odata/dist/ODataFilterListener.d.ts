import { ParseTreeListener } from "antlr4";
import { FilterContext } from "./ODataFilterParser.js";
import { ExpressionContext } from "./ODataFilterParser.js";
import { ComparisonContext } from "./ODataFilterParser.js";
import { FunctionCallContext } from "./ODataFilterParser.js";
import { StringFunctionContext } from "./ODataFilterParser.js";
import { DateFunctionContext } from "./ODataFilterParser.js";
import { NumberFunctionContext } from "./ODataFilterParser.js";
import { ListContext } from "./ODataFilterParser.js";
import { LiteralContext } from "./ODataFilterParser.js";
import { IdentifierContext } from "./ODataFilterParser.js";
/**
 * This interface defines a complete listener for a parse tree produced by
 * `ODataFilterParser`.
 */
export default class ODataFilterListener extends ParseTreeListener {
    /**
     * Enter a parse tree produced by `ODataFilterParser.filter`.
     * @param ctx the parse tree
     */
    enterFilter?: (ctx: FilterContext) => void;
    /**
     * Exit a parse tree produced by `ODataFilterParser.filter`.
     * @param ctx the parse tree
     */
    exitFilter?: (ctx: FilterContext) => void;
    /**
     * Enter a parse tree produced by `ODataFilterParser.expression`.
     * @param ctx the parse tree
     */
    enterExpression?: (ctx: ExpressionContext) => void;
    /**
     * Exit a parse tree produced by `ODataFilterParser.expression`.
     * @param ctx the parse tree
     */
    exitExpression?: (ctx: ExpressionContext) => void;
    /**
     * Enter a parse tree produced by `ODataFilterParser.comparison`.
     * @param ctx the parse tree
     */
    enterComparison?: (ctx: ComparisonContext) => void;
    /**
     * Exit a parse tree produced by `ODataFilterParser.comparison`.
     * @param ctx the parse tree
     */
    exitComparison?: (ctx: ComparisonContext) => void;
    /**
     * Enter a parse tree produced by `ODataFilterParser.functionCall`.
     * @param ctx the parse tree
     */
    enterFunctionCall?: (ctx: FunctionCallContext) => void;
    /**
     * Exit a parse tree produced by `ODataFilterParser.functionCall`.
     * @param ctx the parse tree
     */
    exitFunctionCall?: (ctx: FunctionCallContext) => void;
    /**
     * Enter a parse tree produced by `ODataFilterParser.stringFunction`.
     * @param ctx the parse tree
     */
    enterStringFunction?: (ctx: StringFunctionContext) => void;
    /**
     * Exit a parse tree produced by `ODataFilterParser.stringFunction`.
     * @param ctx the parse tree
     */
    exitStringFunction?: (ctx: StringFunctionContext) => void;
    /**
     * Enter a parse tree produced by `ODataFilterParser.dateFunction`.
     * @param ctx the parse tree
     */
    enterDateFunction?: (ctx: DateFunctionContext) => void;
    /**
     * Exit a parse tree produced by `ODataFilterParser.dateFunction`.
     * @param ctx the parse tree
     */
    exitDateFunction?: (ctx: DateFunctionContext) => void;
    /**
     * Enter a parse tree produced by `ODataFilterParser.numberFunction`.
     * @param ctx the parse tree
     */
    enterNumberFunction?: (ctx: NumberFunctionContext) => void;
    /**
     * Exit a parse tree produced by `ODataFilterParser.numberFunction`.
     * @param ctx the parse tree
     */
    exitNumberFunction?: (ctx: NumberFunctionContext) => void;
    /**
     * Enter a parse tree produced by `ODataFilterParser.list`.
     * @param ctx the parse tree
     */
    enterList?: (ctx: ListContext) => void;
    /**
     * Exit a parse tree produced by `ODataFilterParser.list`.
     * @param ctx the parse tree
     */
    exitList?: (ctx: ListContext) => void;
    /**
     * Enter a parse tree produced by `ODataFilterParser.literal`.
     * @param ctx the parse tree
     */
    enterLiteral?: (ctx: LiteralContext) => void;
    /**
     * Exit a parse tree produced by `ODataFilterParser.literal`.
     * @param ctx the parse tree
     */
    exitLiteral?: (ctx: LiteralContext) => void;
    /**
     * Enter a parse tree produced by `ODataFilterParser.identifier`.
     * @param ctx the parse tree
     */
    enterIdentifier?: (ctx: IdentifierContext) => void;
    /**
     * Exit a parse tree produced by `ODataFilterParser.identifier`.
     * @param ctx the parse tree
     */
    exitIdentifier?: (ctx: IdentifierContext) => void;
}
//# sourceMappingURL=ODataFilterListener.d.ts.map