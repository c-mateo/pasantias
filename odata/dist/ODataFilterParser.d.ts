import { ATN, DFA, FailedPredicateException, Parser, RuleContext, ParserRuleContext, TerminalNode, TokenStream } from 'antlr4';
import ODataFilterListener from "./ODataFilterListener.js";
export default class ODataFilterParser extends Parser {
    static readonly T__0 = 1;
    static readonly T__1 = 2;
    static readonly T__2 = 3;
    static readonly T__3 = 4;
    static readonly T__4 = 5;
    static readonly T__5 = 6;
    static readonly T__6 = 7;
    static readonly T__7 = 8;
    static readonly T__8 = 9;
    static readonly T__9 = 10;
    static readonly T__10 = 11;
    static readonly T__11 = 12;
    static readonly T__12 = 13;
    static readonly T__13 = 14;
    static readonly T__14 = 15;
    static readonly T__15 = 16;
    static readonly T__16 = 17;
    static readonly T__17 = 18;
    static readonly AND = 19;
    static readonly OR = 20;
    static readonly NOT = 21;
    static readonly EQ = 22;
    static readonly NE = 23;
    static readonly GT = 24;
    static readonly GE = 25;
    static readonly LT = 26;
    static readonly LE = 27;
    static readonly IN = 28;
    static readonly IDENT = 29;
    static readonly STRING = 30;
    static readonly NUMBER = 31;
    static readonly DATETIME = 32;
    static readonly WS = 33;
    static readonly EOF: number;
    static readonly RULE_filter = 0;
    static readonly RULE_expression = 1;
    static readonly RULE_comparison = 2;
    static readonly RULE_functionCall = 3;
    static readonly RULE_stringFunction = 4;
    static readonly RULE_dateFunction = 5;
    static readonly RULE_numberFunction = 6;
    static readonly RULE_list = 7;
    static readonly RULE_literal = 8;
    static readonly RULE_identifier = 9;
    static readonly literalNames: (string | null)[];
    static readonly symbolicNames: (string | null)[];
    static readonly ruleNames: string[];
    get grammarFileName(): string;
    get literalNames(): (string | null)[];
    get symbolicNames(): (string | null)[];
    get ruleNames(): string[];
    get serializedATN(): number[];
    protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException;
    constructor(input: TokenStream);
    filter(): FilterContext;
    expression(): ExpressionContext;
    expression(_p: number): ExpressionContext;
    comparison(): ComparisonContext;
    functionCall(): FunctionCallContext;
    stringFunction(): StringFunctionContext;
    dateFunction(): DateFunctionContext;
    numberFunction(): NumberFunctionContext;
    list(): ListContext;
    literal(): LiteralContext;
    identifier(): IdentifierContext;
    sempred(localctx: RuleContext, ruleIndex: number, predIndex: number): boolean;
    private expression_sempred;
    static readonly _serializedATN: number[];
    private static __ATN;
    static get _ATN(): ATN;
    static DecisionsToDFA: DFA[];
}
export declare class FilterContext extends ParserRuleContext {
    constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number);
    expression(): ExpressionContext;
    EOF(): TerminalNode;
    get ruleIndex(): number;
    enterRule(listener: ODataFilterListener): void;
    exitRule(listener: ODataFilterListener): void;
}
export declare class ExpressionContext extends ParserRuleContext {
    constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number);
    NOT(): TerminalNode;
    expression_list(): ExpressionContext[];
    expression(i: number): ExpressionContext;
    identifier(): IdentifierContext;
    IN(): TerminalNode;
    list(): ListContext;
    comparison(): ComparisonContext;
    functionCall(): FunctionCallContext;
    literal(): LiteralContext;
    AND(): TerminalNode;
    OR(): TerminalNode;
    get ruleIndex(): number;
    enterRule(listener: ODataFilterListener): void;
    exitRule(listener: ODataFilterListener): void;
}
export declare class ComparisonContext extends ParserRuleContext {
    constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number);
    identifier(): IdentifierContext;
    EQ(): TerminalNode;
    literal(): LiteralContext;
    NE(): TerminalNode;
    GT(): TerminalNode;
    GE(): TerminalNode;
    LT(): TerminalNode;
    LE(): TerminalNode;
    IN(): TerminalNode;
    get ruleIndex(): number;
    enterRule(listener: ODataFilterListener): void;
    exitRule(listener: ODataFilterListener): void;
}
export declare class FunctionCallContext extends ParserRuleContext {
    constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number);
    stringFunction(): StringFunctionContext;
    dateFunction(): DateFunctionContext;
    numberFunction(): NumberFunctionContext;
    get ruleIndex(): number;
    enterRule(listener: ODataFilterListener): void;
    exitRule(listener: ODataFilterListener): void;
}
export declare class StringFunctionContext extends ParserRuleContext {
    constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number);
    identifier(): IdentifierContext;
    expression(): ExpressionContext;
    get ruleIndex(): number;
    enterRule(listener: ODataFilterListener): void;
    exitRule(listener: ODataFilterListener): void;
}
export declare class DateFunctionContext extends ParserRuleContext {
    constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number);
    expression(): ExpressionContext;
    get ruleIndex(): number;
    enterRule(listener: ODataFilterListener): void;
    exitRule(listener: ODataFilterListener): void;
}
export declare class NumberFunctionContext extends ParserRuleContext {
    constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number);
    expression(): ExpressionContext;
    get ruleIndex(): number;
    enterRule(listener: ODataFilterListener): void;
    exitRule(listener: ODataFilterListener): void;
}
export declare class ListContext extends ParserRuleContext {
    constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number);
    literal_list(): LiteralContext[];
    literal(i: number): LiteralContext;
    get ruleIndex(): number;
    enterRule(listener: ODataFilterListener): void;
    exitRule(listener: ODataFilterListener): void;
}
export declare class LiteralContext extends ParserRuleContext {
    constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number);
    STRING(): TerminalNode;
    NUMBER(): TerminalNode;
    DATETIME(): TerminalNode;
    get ruleIndex(): number;
    enterRule(listener: ODataFilterListener): void;
    exitRule(listener: ODataFilterListener): void;
}
export declare class IdentifierContext extends ParserRuleContext {
    constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number);
    IDENT(): TerminalNode;
    get ruleIndex(): number;
    enterRule(listener: ODataFilterListener): void;
    exitRule(listener: ODataFilterListener): void;
}
//# sourceMappingURL=ODataFilterParser.d.ts.map