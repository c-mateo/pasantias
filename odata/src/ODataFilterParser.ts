// Generated from ODataFilter.g4 by ANTLR 4.13.2
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer, DecisionState, DFA, FailedPredicateException,
	RecognitionException, NoViableAltException, BailErrorStrategy,
	Parser, ParserATNSimulator,
	RuleContext, ParserRuleContext, PredictionMode, PredictionContextCache,
	TerminalNode, RuleNode,
	Token, TokenStream,
	Interval, IntervalSet
} from 'antlr4';
import ODataFilterListener from "./ODataFilterListener.js";
// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class ODataFilterParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly T__4 = 5;
	public static readonly T__5 = 6;
	public static readonly T__6 = 7;
	public static readonly T__7 = 8;
	public static readonly T__8 = 9;
	public static readonly T__9 = 10;
	public static readonly T__10 = 11;
	public static readonly T__11 = 12;
	public static readonly T__12 = 13;
	public static readonly T__13 = 14;
	public static readonly T__14 = 15;
	public static readonly T__15 = 16;
	public static readonly T__16 = 17;
	public static readonly T__17 = 18;
	public static readonly AND = 19;
	public static readonly OR = 20;
	public static readonly NOT = 21;
	public static readonly EQ = 22;
	public static readonly NE = 23;
	public static readonly GT = 24;
	public static readonly GE = 25;
	public static readonly LT = 26;
	public static readonly LE = 27;
	public static readonly IN = 28;
	public static readonly IDENT = 29;
	public static readonly STRING = 30;
	public static readonly NUMBER = 31;
	public static readonly DATETIME = 32;
	public static readonly WS = 33;
	public static override readonly EOF = Token.EOF;
	public static readonly RULE_filter = 0;
	public static readonly RULE_expression = 1;
	public static readonly RULE_comparison = 2;
	public static readonly RULE_functionCall = 3;
	public static readonly RULE_stringFunction = 4;
	public static readonly RULE_dateFunction = 5;
	public static readonly RULE_numberFunction = 6;
	public static readonly RULE_list = 7;
	public static readonly RULE_literal = 8;
	public static readonly RULE_identifier = 9;
	public static readonly literalNames: (string | null)[] = [ null, "'('", 
                                                            "')'", "'contains'", 
                                                            "','", "'endswith'", 
                                                            "'startswith'", 
                                                            "'day'", "'fractionalseconds'", 
                                                            "'totalseconds'", 
                                                            "'hour'", "'minute'", 
                                                            "'month'", "'now'", 
                                                            "'second'", 
                                                            "'year'", "'ceiling'", 
                                                            "'floor'", "'round'", 
                                                            "'and'", "'or'", 
                                                            "'not'", "'eq'", 
                                                            "'ne'", "'gt'", 
                                                            "'ge'", "'lt'", 
                                                            "'le'", "'in'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, "AND", 
                                                             "OR", "NOT", 
                                                             "EQ", "NE", 
                                                             "GT", "GE", 
                                                             "LT", "LE", 
                                                             "IN", "IDENT", 
                                                             "STRING", "NUMBER", 
                                                             "DATETIME", 
                                                             "WS" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"filter", "expression", "comparison", "functionCall", "stringFunction", 
		"dateFunction", "numberFunction", "list", "literal", "identifier",
	];
	public get grammarFileName(): string { return "ODataFilter.g4"; }
	public get literalNames(): (string | null)[] { return ODataFilterParser.literalNames; }
	public get symbolicNames(): (string | null)[] { return ODataFilterParser.symbolicNames; }
	public get ruleNames(): string[] { return ODataFilterParser.ruleNames; }
	public get serializedATN(): number[] { return ODataFilterParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(this, ODataFilterParser._ATN, ODataFilterParser.DecisionsToDFA, new PredictionContextCache());
	}
	// @RuleVersion(0)
	public filter(): FilterContext {
		let localctx: FilterContext = new FilterContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, ODataFilterParser.RULE_filter);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 20;
			this.expression(0);
			this.state = 21;
			this.match(ODataFilterParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public expression(): ExpressionContext;
	public expression(_p: number): ExpressionContext;
	// @RuleVersion(0)
	public expression(_p?: number): ExpressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: ExpressionContext = new ExpressionContext(this, this._ctx, _parentState);
		let _prevctx: ExpressionContext = localctx;
		let _startState: number = 2;
		this.enterRecursionRule(localctx, 2, ODataFilterParser.RULE_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 38;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 0, this._ctx) ) {
			case 1:
				{
				this.state = 24;
				this.match(ODataFilterParser.NOT);
				this.state = 25;
				this.expression(7);
				}
				break;
			case 2:
				{
				this.state = 26;
				this.match(ODataFilterParser.T__0);
				this.state = 27;
				this.expression(0);
				this.state = 28;
				this.match(ODataFilterParser.T__1);
				}
				break;
			case 3:
				{
				this.state = 30;
				this.identifier();
				this.state = 31;
				this.match(ODataFilterParser.IN);
				this.state = 32;
				this.list();
				}
				break;
			case 4:
				{
				this.state = 34;
				this.comparison();
				}
				break;
			case 5:
				{
				this.state = 35;
				this.functionCall();
				}
				break;
			case 6:
				{
				this.state = 36;
				this.literal();
				}
				break;
			case 7:
				{
				this.state = 37;
				this.identifier();
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 48;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 2, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 46;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 1, this._ctx) ) {
					case 1:
						{
						localctx = new ExpressionContext(this, _parentctx, _parentState);
						this.pushNewRecursionContext(localctx, _startState, ODataFilterParser.RULE_expression);
						this.state = 40;
						if (!(this.precpred(this._ctx, 9))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 9)");
						}
						this.state = 41;
						this.match(ODataFilterParser.AND);
						this.state = 42;
						this.expression(10);
						}
						break;
					case 2:
						{
						localctx = new ExpressionContext(this, _parentctx, _parentState);
						this.pushNewRecursionContext(localctx, _startState, ODataFilterParser.RULE_expression);
						this.state = 43;
						if (!(this.precpred(this._ctx, 8))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 8)");
						}
						this.state = 44;
						this.match(ODataFilterParser.OR);
						this.state = 45;
						this.expression(9);
						}
						break;
					}
					}
				}
				this.state = 50;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 2, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}
	// @RuleVersion(0)
	public comparison(): ComparisonContext {
		let localctx: ComparisonContext = new ComparisonContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, ODataFilterParser.RULE_comparison);
		try {
			this.state = 79;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 3, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 51;
				this.identifier();
				this.state = 52;
				this.match(ODataFilterParser.EQ);
				this.state = 53;
				this.literal();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 55;
				this.identifier();
				this.state = 56;
				this.match(ODataFilterParser.NE);
				this.state = 57;
				this.literal();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 59;
				this.identifier();
				this.state = 60;
				this.match(ODataFilterParser.GT);
				this.state = 61;
				this.literal();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 63;
				this.identifier();
				this.state = 64;
				this.match(ODataFilterParser.GE);
				this.state = 65;
				this.literal();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 67;
				this.identifier();
				this.state = 68;
				this.match(ODataFilterParser.LT);
				this.state = 69;
				this.literal();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 71;
				this.identifier();
				this.state = 72;
				this.match(ODataFilterParser.LE);
				this.state = 73;
				this.literal();
				}
				break;
			case 7:
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 75;
				this.identifier();
				this.state = 76;
				this.match(ODataFilterParser.IN);
				this.state = 77;
				this.literal();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public functionCall(): FunctionCallContext {
		let localctx: FunctionCallContext = new FunctionCallContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, ODataFilterParser.RULE_functionCall);
		try {
			this.state = 84;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 3:
			case 5:
			case 6:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 81;
				this.stringFunction();
				}
				break;
			case 7:
			case 8:
			case 9:
			case 10:
			case 11:
			case 12:
			case 13:
			case 14:
			case 15:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 82;
				this.dateFunction();
				}
				break;
			case 16:
			case 17:
			case 18:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 83;
				this.numberFunction();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public stringFunction(): StringFunctionContext {
		let localctx: StringFunctionContext = new StringFunctionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, ODataFilterParser.RULE_stringFunction);
		try {
			this.state = 107;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 3:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 86;
				this.match(ODataFilterParser.T__2);
				this.state = 87;
				this.match(ODataFilterParser.T__0);
				this.state = 88;
				this.identifier();
				this.state = 89;
				this.match(ODataFilterParser.T__3);
				this.state = 90;
				this.expression(0);
				this.state = 91;
				this.match(ODataFilterParser.T__1);
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 93;
				this.match(ODataFilterParser.T__4);
				this.state = 94;
				this.match(ODataFilterParser.T__0);
				this.state = 95;
				this.identifier();
				this.state = 96;
				this.match(ODataFilterParser.T__3);
				this.state = 97;
				this.expression(0);
				this.state = 98;
				this.match(ODataFilterParser.T__1);
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 100;
				this.match(ODataFilterParser.T__5);
				this.state = 101;
				this.match(ODataFilterParser.T__0);
				this.state = 102;
				this.identifier();
				this.state = 103;
				this.match(ODataFilterParser.T__3);
				this.state = 104;
				this.expression(0);
				this.state = 105;
				this.match(ODataFilterParser.T__1);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public dateFunction(): DateFunctionContext {
		let localctx: DateFunctionContext = new DateFunctionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, ODataFilterParser.RULE_dateFunction);
		try {
			this.state = 152;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 7:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 109;
				this.match(ODataFilterParser.T__6);
				this.state = 110;
				this.match(ODataFilterParser.T__0);
				this.state = 111;
				this.expression(0);
				this.state = 112;
				this.match(ODataFilterParser.T__1);
				}
				break;
			case 8:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 114;
				this.match(ODataFilterParser.T__7);
				this.state = 115;
				this.match(ODataFilterParser.T__0);
				this.state = 116;
				this.expression(0);
				this.state = 117;
				this.match(ODataFilterParser.T__1);
				}
				break;
			case 9:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 119;
				this.match(ODataFilterParser.T__8);
				this.state = 120;
				this.match(ODataFilterParser.T__0);
				this.state = 121;
				this.expression(0);
				this.state = 122;
				this.match(ODataFilterParser.T__1);
				}
				break;
			case 10:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 124;
				this.match(ODataFilterParser.T__9);
				this.state = 125;
				this.match(ODataFilterParser.T__0);
				this.state = 126;
				this.expression(0);
				this.state = 127;
				this.match(ODataFilterParser.T__1);
				}
				break;
			case 11:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 129;
				this.match(ODataFilterParser.T__10);
				this.state = 130;
				this.match(ODataFilterParser.T__0);
				this.state = 131;
				this.expression(0);
				this.state = 132;
				this.match(ODataFilterParser.T__1);
				}
				break;
			case 12:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 134;
				this.match(ODataFilterParser.T__11);
				this.state = 135;
				this.match(ODataFilterParser.T__0);
				this.state = 136;
				this.expression(0);
				this.state = 137;
				this.match(ODataFilterParser.T__1);
				}
				break;
			case 13:
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 139;
				this.match(ODataFilterParser.T__12);
				this.state = 140;
				this.match(ODataFilterParser.T__0);
				this.state = 141;
				this.match(ODataFilterParser.T__1);
				}
				break;
			case 14:
				this.enterOuterAlt(localctx, 8);
				{
				this.state = 142;
				this.match(ODataFilterParser.T__13);
				this.state = 143;
				this.match(ODataFilterParser.T__0);
				this.state = 144;
				this.expression(0);
				this.state = 145;
				this.match(ODataFilterParser.T__1);
				}
				break;
			case 15:
				this.enterOuterAlt(localctx, 9);
				{
				this.state = 147;
				this.match(ODataFilterParser.T__14);
				this.state = 148;
				this.match(ODataFilterParser.T__0);
				this.state = 149;
				this.expression(0);
				this.state = 150;
				this.match(ODataFilterParser.T__1);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public numberFunction(): NumberFunctionContext {
		let localctx: NumberFunctionContext = new NumberFunctionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 12, ODataFilterParser.RULE_numberFunction);
		try {
			this.state = 169;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 16:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 154;
				this.match(ODataFilterParser.T__15);
				this.state = 155;
				this.match(ODataFilterParser.T__0);
				this.state = 156;
				this.expression(0);
				this.state = 157;
				this.match(ODataFilterParser.T__1);
				}
				break;
			case 17:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 159;
				this.match(ODataFilterParser.T__16);
				this.state = 160;
				this.match(ODataFilterParser.T__0);
				this.state = 161;
				this.expression(0);
				this.state = 162;
				this.match(ODataFilterParser.T__1);
				}
				break;
			case 18:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 164;
				this.match(ODataFilterParser.T__17);
				this.state = 165;
				this.match(ODataFilterParser.T__0);
				this.state = 166;
				this.expression(0);
				this.state = 167;
				this.match(ODataFilterParser.T__1);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public list(): ListContext {
		let localctx: ListContext = new ListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 14, ODataFilterParser.RULE_list);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 171;
			this.match(ODataFilterParser.T__0);
			this.state = 180;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 30)) & ~0x1F) === 0 && ((1 << (_la - 30)) & 7) !== 0)) {
				{
				this.state = 172;
				this.literal();
				this.state = 177;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===4) {
					{
					{
					this.state = 173;
					this.match(ODataFilterParser.T__3);
					this.state = 174;
					this.literal();
					}
					}
					this.state = 179;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 182;
			this.match(ODataFilterParser.T__1);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public literal(): LiteralContext {
		let localctx: LiteralContext = new LiteralContext(this, this._ctx, this.state);
		this.enterRule(localctx, 16, ODataFilterParser.RULE_literal);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 184;
			_la = this._input.LA(1);
			if(!(((((_la - 30)) & ~0x1F) === 0 && ((1 << (_la - 30)) & 7) !== 0))) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public identifier(): IdentifierContext {
		let localctx: IdentifierContext = new IdentifierContext(this, this._ctx, this.state);
		this.enterRule(localctx, 18, ODataFilterParser.RULE_identifier);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 186;
			this.match(ODataFilterParser.IDENT);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public sempred(localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 1:
			return this.expression_sempred(localctx as ExpressionContext, predIndex);
		}
		return true;
	}
	private expression_sempred(localctx: ExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 9);
		case 1:
			return this.precpred(this._ctx, 8);
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,1,33,189,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,1,
	0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,
	1,39,8,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,47,8,1,10,1,12,1,50,9,1,1,2,1,2,1,
	2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,
	2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,3,2,80,8,2,1,3,1,3,1,3,3,3,85,8,3,1,4,1,4,
	1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,1,4,
	1,4,3,4,108,8,4,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,
	1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,
	1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,1,5,3,5,153,8,5,1,6,1,6,1,6,1,6,
	1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,1,6,3,6,170,8,6,1,7,1,7,1,7,1,7,
	5,7,176,8,7,10,7,12,7,179,9,7,3,7,181,8,7,1,7,1,7,1,8,1,8,1,9,1,9,1,9,0,
	1,2,10,0,2,4,6,8,10,12,14,16,18,0,1,1,0,30,32,208,0,20,1,0,0,0,2,38,1,0,
	0,0,4,79,1,0,0,0,6,84,1,0,0,0,8,107,1,0,0,0,10,152,1,0,0,0,12,169,1,0,0,
	0,14,171,1,0,0,0,16,184,1,0,0,0,18,186,1,0,0,0,20,21,3,2,1,0,21,22,5,0,
	0,1,22,1,1,0,0,0,23,24,6,1,-1,0,24,25,5,21,0,0,25,39,3,2,1,7,26,27,5,1,
	0,0,27,28,3,2,1,0,28,29,5,2,0,0,29,39,1,0,0,0,30,31,3,18,9,0,31,32,5,28,
	0,0,32,33,3,14,7,0,33,39,1,0,0,0,34,39,3,4,2,0,35,39,3,6,3,0,36,39,3,16,
	8,0,37,39,3,18,9,0,38,23,1,0,0,0,38,26,1,0,0,0,38,30,1,0,0,0,38,34,1,0,
	0,0,38,35,1,0,0,0,38,36,1,0,0,0,38,37,1,0,0,0,39,48,1,0,0,0,40,41,10,9,
	0,0,41,42,5,19,0,0,42,47,3,2,1,10,43,44,10,8,0,0,44,45,5,20,0,0,45,47,3,
	2,1,9,46,40,1,0,0,0,46,43,1,0,0,0,47,50,1,0,0,0,48,46,1,0,0,0,48,49,1,0,
	0,0,49,3,1,0,0,0,50,48,1,0,0,0,51,52,3,18,9,0,52,53,5,22,0,0,53,54,3,16,
	8,0,54,80,1,0,0,0,55,56,3,18,9,0,56,57,5,23,0,0,57,58,3,16,8,0,58,80,1,
	0,0,0,59,60,3,18,9,0,60,61,5,24,0,0,61,62,3,16,8,0,62,80,1,0,0,0,63,64,
	3,18,9,0,64,65,5,25,0,0,65,66,3,16,8,0,66,80,1,0,0,0,67,68,3,18,9,0,68,
	69,5,26,0,0,69,70,3,16,8,0,70,80,1,0,0,0,71,72,3,18,9,0,72,73,5,27,0,0,
	73,74,3,16,8,0,74,80,1,0,0,0,75,76,3,18,9,0,76,77,5,28,0,0,77,78,3,16,8,
	0,78,80,1,0,0,0,79,51,1,0,0,0,79,55,1,0,0,0,79,59,1,0,0,0,79,63,1,0,0,0,
	79,67,1,0,0,0,79,71,1,0,0,0,79,75,1,0,0,0,80,5,1,0,0,0,81,85,3,8,4,0,82,
	85,3,10,5,0,83,85,3,12,6,0,84,81,1,0,0,0,84,82,1,0,0,0,84,83,1,0,0,0,85,
	7,1,0,0,0,86,87,5,3,0,0,87,88,5,1,0,0,88,89,3,18,9,0,89,90,5,4,0,0,90,91,
	3,2,1,0,91,92,5,2,0,0,92,108,1,0,0,0,93,94,5,5,0,0,94,95,5,1,0,0,95,96,
	3,18,9,0,96,97,5,4,0,0,97,98,3,2,1,0,98,99,5,2,0,0,99,108,1,0,0,0,100,101,
	5,6,0,0,101,102,5,1,0,0,102,103,3,18,9,0,103,104,5,4,0,0,104,105,3,2,1,
	0,105,106,5,2,0,0,106,108,1,0,0,0,107,86,1,0,0,0,107,93,1,0,0,0,107,100,
	1,0,0,0,108,9,1,0,0,0,109,110,5,7,0,0,110,111,5,1,0,0,111,112,3,2,1,0,112,
	113,5,2,0,0,113,153,1,0,0,0,114,115,5,8,0,0,115,116,5,1,0,0,116,117,3,2,
	1,0,117,118,5,2,0,0,118,153,1,0,0,0,119,120,5,9,0,0,120,121,5,1,0,0,121,
	122,3,2,1,0,122,123,5,2,0,0,123,153,1,0,0,0,124,125,5,10,0,0,125,126,5,
	1,0,0,126,127,3,2,1,0,127,128,5,2,0,0,128,153,1,0,0,0,129,130,5,11,0,0,
	130,131,5,1,0,0,131,132,3,2,1,0,132,133,5,2,0,0,133,153,1,0,0,0,134,135,
	5,12,0,0,135,136,5,1,0,0,136,137,3,2,1,0,137,138,5,2,0,0,138,153,1,0,0,
	0,139,140,5,13,0,0,140,141,5,1,0,0,141,153,5,2,0,0,142,143,5,14,0,0,143,
	144,5,1,0,0,144,145,3,2,1,0,145,146,5,2,0,0,146,153,1,0,0,0,147,148,5,15,
	0,0,148,149,5,1,0,0,149,150,3,2,1,0,150,151,5,2,0,0,151,153,1,0,0,0,152,
	109,1,0,0,0,152,114,1,0,0,0,152,119,1,0,0,0,152,124,1,0,0,0,152,129,1,0,
	0,0,152,134,1,0,0,0,152,139,1,0,0,0,152,142,1,0,0,0,152,147,1,0,0,0,153,
	11,1,0,0,0,154,155,5,16,0,0,155,156,5,1,0,0,156,157,3,2,1,0,157,158,5,2,
	0,0,158,170,1,0,0,0,159,160,5,17,0,0,160,161,5,1,0,0,161,162,3,2,1,0,162,
	163,5,2,0,0,163,170,1,0,0,0,164,165,5,18,0,0,165,166,5,1,0,0,166,167,3,
	2,1,0,167,168,5,2,0,0,168,170,1,0,0,0,169,154,1,0,0,0,169,159,1,0,0,0,169,
	164,1,0,0,0,170,13,1,0,0,0,171,180,5,1,0,0,172,177,3,16,8,0,173,174,5,4,
	0,0,174,176,3,16,8,0,175,173,1,0,0,0,176,179,1,0,0,0,177,175,1,0,0,0,177,
	178,1,0,0,0,178,181,1,0,0,0,179,177,1,0,0,0,180,172,1,0,0,0,180,181,1,0,
	0,0,181,182,1,0,0,0,182,183,5,2,0,0,183,15,1,0,0,0,184,185,7,0,0,0,185,
	17,1,0,0,0,186,187,5,29,0,0,187,19,1,0,0,0,10,38,46,48,79,84,107,152,169,
	177,180];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!ODataFilterParser.__ATN) {
			ODataFilterParser.__ATN = new ATNDeserializer().deserialize(ODataFilterParser._serializedATN);
		}

		return ODataFilterParser.__ATN;
	}


	static DecisionsToDFA = ODataFilterParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class FilterContext extends ParserRuleContext {
	constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public EOF(): TerminalNode {
		return this.getToken(ODataFilterParser.EOF, 0);
	}
    public get ruleIndex(): number {
    	return ODataFilterParser.RULE_filter;
	}
	public enterRule(listener: ODataFilterListener): void {
	    if(listener.enterFilter) {
	 		listener.enterFilter(this);
		}
	}
	public exitRule(listener: ODataFilterListener): void {
	    if(listener.exitFilter) {
	 		listener.exitFilter(this);
		}
	}
}


export class ExpressionContext extends ParserRuleContext {
	constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public NOT(): TerminalNode {
		return this.getToken(ODataFilterParser.NOT, 0);
	}
	public expression_list(): ExpressionContext[] {
		return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
	}
	public expression(i: number): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public IN(): TerminalNode {
		return this.getToken(ODataFilterParser.IN, 0);
	}
	public list(): ListContext {
		return this.getTypedRuleContext(ListContext, 0) as ListContext;
	}
	public comparison(): ComparisonContext {
		return this.getTypedRuleContext(ComparisonContext, 0) as ComparisonContext;
	}
	public functionCall(): FunctionCallContext {
		return this.getTypedRuleContext(FunctionCallContext, 0) as FunctionCallContext;
	}
	public literal(): LiteralContext {
		return this.getTypedRuleContext(LiteralContext, 0) as LiteralContext;
	}
	public AND(): TerminalNode {
		return this.getToken(ODataFilterParser.AND, 0);
	}
	public OR(): TerminalNode {
		return this.getToken(ODataFilterParser.OR, 0);
	}
    public get ruleIndex(): number {
    	return ODataFilterParser.RULE_expression;
	}
	public enterRule(listener: ODataFilterListener): void {
	    if(listener.enterExpression) {
	 		listener.enterExpression(this);
		}
	}
	public exitRule(listener: ODataFilterListener): void {
	    if(listener.exitExpression) {
	 		listener.exitExpression(this);
		}
	}
}


export class ComparisonContext extends ParserRuleContext {
	constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public EQ(): TerminalNode {
		return this.getToken(ODataFilterParser.EQ, 0);
	}
	public literal(): LiteralContext {
		return this.getTypedRuleContext(LiteralContext, 0) as LiteralContext;
	}
	public NE(): TerminalNode {
		return this.getToken(ODataFilterParser.NE, 0);
	}
	public GT(): TerminalNode {
		return this.getToken(ODataFilterParser.GT, 0);
	}
	public GE(): TerminalNode {
		return this.getToken(ODataFilterParser.GE, 0);
	}
	public LT(): TerminalNode {
		return this.getToken(ODataFilterParser.LT, 0);
	}
	public LE(): TerminalNode {
		return this.getToken(ODataFilterParser.LE, 0);
	}
	public IN(): TerminalNode {
		return this.getToken(ODataFilterParser.IN, 0);
	}
    public get ruleIndex(): number {
    	return ODataFilterParser.RULE_comparison;
	}
	public enterRule(listener: ODataFilterListener): void {
	    if(listener.enterComparison) {
	 		listener.enterComparison(this);
		}
	}
	public exitRule(listener: ODataFilterListener): void {
	    if(listener.exitComparison) {
	 		listener.exitComparison(this);
		}
	}
}


export class FunctionCallContext extends ParserRuleContext {
	constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public stringFunction(): StringFunctionContext {
		return this.getTypedRuleContext(StringFunctionContext, 0) as StringFunctionContext;
	}
	public dateFunction(): DateFunctionContext {
		return this.getTypedRuleContext(DateFunctionContext, 0) as DateFunctionContext;
	}
	public numberFunction(): NumberFunctionContext {
		return this.getTypedRuleContext(NumberFunctionContext, 0) as NumberFunctionContext;
	}
    public get ruleIndex(): number {
    	return ODataFilterParser.RULE_functionCall;
	}
	public enterRule(listener: ODataFilterListener): void {
	    if(listener.enterFunctionCall) {
	 		listener.enterFunctionCall(this);
		}
	}
	public exitRule(listener: ODataFilterListener): void {
	    if(listener.exitFunctionCall) {
	 		listener.exitFunctionCall(this);
		}
	}
}


export class StringFunctionContext extends ParserRuleContext {
	constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return ODataFilterParser.RULE_stringFunction;
	}
	public enterRule(listener: ODataFilterListener): void {
	    if(listener.enterStringFunction) {
	 		listener.enterStringFunction(this);
		}
	}
	public exitRule(listener: ODataFilterListener): void {
	    if(listener.exitStringFunction) {
	 		listener.exitStringFunction(this);
		}
	}
}


export class DateFunctionContext extends ParserRuleContext {
	constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return ODataFilterParser.RULE_dateFunction;
	}
	public enterRule(listener: ODataFilterListener): void {
	    if(listener.enterDateFunction) {
	 		listener.enterDateFunction(this);
		}
	}
	public exitRule(listener: ODataFilterListener): void {
	    if(listener.exitDateFunction) {
	 		listener.exitDateFunction(this);
		}
	}
}


export class NumberFunctionContext extends ParserRuleContext {
	constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return ODataFilterParser.RULE_numberFunction;
	}
	public enterRule(listener: ODataFilterListener): void {
	    if(listener.enterNumberFunction) {
	 		listener.enterNumberFunction(this);
		}
	}
	public exitRule(listener: ODataFilterListener): void {
	    if(listener.exitNumberFunction) {
	 		listener.exitNumberFunction(this);
		}
	}
}


export class ListContext extends ParserRuleContext {
	constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public literal_list(): LiteralContext[] {
		return this.getTypedRuleContexts(LiteralContext) as LiteralContext[];
	}
	public literal(i: number): LiteralContext {
		return this.getTypedRuleContext(LiteralContext, i) as LiteralContext;
	}
    public get ruleIndex(): number {
    	return ODataFilterParser.RULE_list;
	}
	public enterRule(listener: ODataFilterListener): void {
	    if(listener.enterList) {
	 		listener.enterList(this);
		}
	}
	public exitRule(listener: ODataFilterListener): void {
	    if(listener.exitList) {
	 		listener.exitList(this);
		}
	}
}


export class LiteralContext extends ParserRuleContext {
	constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public STRING(): TerminalNode {
		return this.getToken(ODataFilterParser.STRING, 0);
	}
	public NUMBER(): TerminalNode {
		return this.getToken(ODataFilterParser.NUMBER, 0);
	}
	public DATETIME(): TerminalNode {
		return this.getToken(ODataFilterParser.DATETIME, 0);
	}
    public get ruleIndex(): number {
    	return ODataFilterParser.RULE_literal;
	}
	public enterRule(listener: ODataFilterListener): void {
	    if(listener.enterLiteral) {
	 		listener.enterLiteral(this);
		}
	}
	public exitRule(listener: ODataFilterListener): void {
	    if(listener.exitLiteral) {
	 		listener.exitLiteral(this);
		}
	}
}


export class IdentifierContext extends ParserRuleContext {
	constructor(parser?: ODataFilterParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public IDENT(): TerminalNode {
		return this.getToken(ODataFilterParser.IDENT, 0);
	}
    public get ruleIndex(): number {
    	return ODataFilterParser.RULE_identifier;
	}
	public enterRule(listener: ODataFilterListener): void {
	    if(listener.enterIdentifier) {
	 		listener.enterIdentifier(this);
		}
	}
	public exitRule(listener: ODataFilterListener): void {
	    if(listener.exitIdentifier) {
	 		listener.exitIdentifier(this);
		}
	}
}
