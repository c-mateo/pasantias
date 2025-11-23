// Generated from ODataFilter.g4 by ANTLR 4.13.2
import { ParseTreeListener } from "antlr4";
/**
 * This interface defines a complete listener for a parse tree produced by
 * `ODataFilterParser`.
 */
export default class ODataFilterListener extends ParseTreeListener {
    /**
     * Enter a parse tree produced by `ODataFilterParser.filter`.
     * @param ctx the parse tree
     */
    enterFilter;
    /**
     * Exit a parse tree produced by `ODataFilterParser.filter`.
     * @param ctx the parse tree
     */
    exitFilter;
    /**
     * Enter a parse tree produced by `ODataFilterParser.expression`.
     * @param ctx the parse tree
     */
    enterExpression;
    /**
     * Exit a parse tree produced by `ODataFilterParser.expression`.
     * @param ctx the parse tree
     */
    exitExpression;
    /**
     * Enter a parse tree produced by `ODataFilterParser.comparison`.
     * @param ctx the parse tree
     */
    enterComparison;
    /**
     * Exit a parse tree produced by `ODataFilterParser.comparison`.
     * @param ctx the parse tree
     */
    exitComparison;
    /**
     * Enter a parse tree produced by `ODataFilterParser.functionCall`.
     * @param ctx the parse tree
     */
    enterFunctionCall;
    /**
     * Exit a parse tree produced by `ODataFilterParser.functionCall`.
     * @param ctx the parse tree
     */
    exitFunctionCall;
    /**
     * Enter a parse tree produced by `ODataFilterParser.stringFunction`.
     * @param ctx the parse tree
     */
    enterStringFunction;
    /**
     * Exit a parse tree produced by `ODataFilterParser.stringFunction`.
     * @param ctx the parse tree
     */
    exitStringFunction;
    /**
     * Enter a parse tree produced by `ODataFilterParser.dateFunction`.
     * @param ctx the parse tree
     */
    enterDateFunction;
    /**
     * Exit a parse tree produced by `ODataFilterParser.dateFunction`.
     * @param ctx the parse tree
     */
    exitDateFunction;
    /**
     * Enter a parse tree produced by `ODataFilterParser.numberFunction`.
     * @param ctx the parse tree
     */
    enterNumberFunction;
    /**
     * Exit a parse tree produced by `ODataFilterParser.numberFunction`.
     * @param ctx the parse tree
     */
    exitNumberFunction;
    /**
     * Enter a parse tree produced by `ODataFilterParser.list`.
     * @param ctx the parse tree
     */
    enterList;
    /**
     * Exit a parse tree produced by `ODataFilterParser.list`.
     * @param ctx the parse tree
     */
    exitList;
    /**
     * Enter a parse tree produced by `ODataFilterParser.literal`.
     * @param ctx the parse tree
     */
    enterLiteral;
    /**
     * Exit a parse tree produced by `ODataFilterParser.literal`.
     * @param ctx the parse tree
     */
    exitLiteral;
    /**
     * Enter a parse tree produced by `ODataFilterParser.identifier`.
     * @param ctx the parse tree
     */
    enterIdentifier;
    /**
     * Exit a parse tree produced by `ODataFilterParser.identifier`.
     * @param ctx the parse tree
     */
    exitIdentifier;
}
