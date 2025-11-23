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


function performComparison(operator: string, a: any, b: any): boolean {
    switch (operator) {
        case "eq":
            return a === b;
        case "ne":
            return a !== b;
        case "gt":
            return a > b;
        case "lt":
            return a < b;
        case "ge":
            return a >= b;
        case "le":
            return a <= b;
    }
    throw new Error("Unknown operator" + operator);
}

function performStringFunction(stack: Node[], functionName: string) {
    const arg2 = stack.pop();
    const arg1 = stack.pop();
    if (arg1?.type !== "Identifier" || arg2?.type !== "Literal")
        throw new Error("Invalid contains arguments");

    if (typeof arg2.value !== "string")
        throw new Error("Contains arguments must be strings");

    stack.push({
        type: "Comparison",
        value: {
            [arg1.name]: {
                [functionName]: arg2.value
            }
        }
    });
}

function createComparisonCriteria(operator: string, identifier: string, literal: LiteralValue) {
    switch (operator.toLowerCase()) {
        case "eq":
            return {
                [identifier]: literal
            }
        case "ne":
            return {
                NOT: {
                    [identifier]: literal
                }
            }
        case "gt":
        case "lt":
        case "ge":
        case "le":
            return {
                [identifier]: {
                    [operator]: literal
                }
            }
        default:
            throw new Error("Unknown operator: " + operator);
    }
}

// function mergeCriteria(a: object, b: object): object {
//     const keysInA = new Set(Object.keys(a))
//     const keysInB = new Set(Object.keys(b))
//     if (keysInA.isDisjointFrom(keysInB)) {
//         return {
//             ...a,
//             ...b
//         }
//     }
//     const result : any = {
//         ...a,
//         ...b
//     }

//     // Shallow merge for common keys
//     keysInA.intersection(keysInB).forEach(key => {
//         result[key] = {
//             ... (a as any)[key],
//             ... (b as any)[key]
//         }
//     })
//     return result;
// }

function isPlainObject(value: any): value is Record<string, any> {
    return (
        typeof value === "object" &&
        value !== null &&
        Object.getPrototypeOf(value) === Object.prototype
    );
}

function mergeCriteria(
    a: Record<string, any>,
    b: Record<string, any>
): Record<string, any> {

    const result: Record<string, any> = { ...a };

    for (const key in b) {
        const aVal = a[key];
        const bVal = b[key];

        if (isPlainObject(aVal) && isPlainObject(bVal)) {
            // deep merge only when both sides are plain objects
            result[key] = mergeCriteria(aVal, bVal);
        } else {
            // otherwise B replaces A
            result[key] = bVal;
        }
    }

    return result;
}

export class MyTreeWalker extends MyGrammarListener {
    stack: Node[] = [];
    private vars: Record<string, type>;

    constructor(private resolve: (value: any) => void, vars?: Record<string, type>) {
        super();
        // default empty map if none provided; backend should pass expected schema
        this.vars = vars ?? {};
    }

    exitIdentifier = (ctx: IdentifierContext) => {
        const name = ctx.getText();
        if (!(name in this.vars)) {
            throw new Error("Unknown variable: " + name);
        }

        this.stack.push({
            type: "Identifier",
            name: ctx.getText()
        });
    }
    exitComparison = (ctx: ComparisonContext) => {
        // this.stack.push(ctx.getText());
        const literal = this.stack.pop();
        const identifier = this.stack.pop();

        if (literal?.type !== "Literal" || identifier?.type !== "Identifier")
            throw new Error("Invalid comparison operands");

        const variable = this.getVariable(identifier.name)
        if (typeof literal.value !== variable) {
            throw new Error("Type mismatch: " + typeof literal.value + " vs " + variable);
        }

        const operator = ctx.getChild(1).getText()
        const result = createComparisonCriteria(operator, identifier.name, literal.value);
        this.stack.push({
            type: "Comparison",
            value: result
        })
        // console.log("Comparison result: ", result);
    }
    exitList = (ctx: ListContext) => {

        const count = ctx.literal_list().length
        const items: LiteralValue[] = []

        for (let i = 0; i < count; i++) {
            const literalNode = this.stack.pop();
            if (literalNode?.type !== "Literal")
                throw new Error("Invalid list item");
            items.unshift(literalNode.value as LiteralValue);
        }
        if (items.some(item => typeof item !== typeof items[0])) {
            throw new Error("Type mismatch in list items");
        }
        this.stack.push({
            type: "List",
            values: items
        });
    }
    exitLiteral = (ctx: LiteralContext) => {
        // this.stack.push(Number(ctx.getText()));
        if (ctx.NUMBER()) {
            this.stack.push({
                type: "Literal",
                value: Number(ctx.NUMBER()!.getText())
            });
        }
        else if (ctx.STRING()) {
            const pattern = /^'([^']+)'$/
            const match = pattern.exec(ctx.STRING().getText());
            if (!match) throw new Error("Invalid string literal");

            this.stack.push({
                type: "Literal",
                value: match[1]
            });
        }
        else if (ctx.DATETIME()) {
            this.stack.push({
                type: "Literal",
                value: ctx.DATETIME().getText()
            });
        }
        // console.log("In Literal: " + ctx.getText());
    }
    exitStringFunction = (ctx: StringFunctionContext) => {
        // console.log("In StringFunction: " + ctx.getText());
        // this.stack.push(ctx.getText());
        const fun = ctx.getChild(0).getText();
        const supportedFunctions = ["contains", "startswith", "endswith"];
        if (!supportedFunctions.includes(fun.toLowerCase())) {
            throw new Error("Unsupported string function: " + fun);
        }
        
        performStringFunction(this.stack, fun.toLowerCase());
    }
    exitExpression = (ctx: ExpressionContext) => {
        if (ctx.getChildCount() === 3) {
            const first = ctx.getChild(0).getText();
            const second = ctx.getChild(1).getText();
            const third = ctx.getChild(2).getText();

            if (first === "(" && third === ")") {
                // it's a parenthesized expression
                return;
            }

            const operator = second.toLowerCase();
            const right = this.stack.pop();
            const left = this.stack.pop();
            if (right?.type === "Comparison" && left?.type === "Comparison") {
                if (operator === "and") {
                    this.stack.push({
                        type: "Comparison",
                        value: mergeCriteria(left.value, right.value)
                    });
                }
                else if (operator === "or") {
                    this.stack.push({
                        type: "Comparison",
                        value: {
                            OR: [
                                // mergeCriteria(left.value, {}),
                                left.value,
                                right.value
                            ]
                        }
                    });
                }
            }
            else if (left?.type === "Identifier" && right?.type === "List" && operator === "in") {
                const result = {
                    [left.name]: { in: right.values }
                }
                this.stack.push({
                    type: "Comparison",
                    value: result
                })
            }

            
            // ctx.getToken(ODataFilterParser., 1);
            // c
            // const right = this.stack.pop();
            // const left = this.stack.pop();
            // this.stack.push({
            //     type: "Expression",
            //     operator: ctx.getChild(1).getText(),
            //     left,
            //     right
            // });
        }
        else if (ctx.getChildCount() === 2) {
            if (ctx.getChild(0).getText().toLowerCase() === "not") {
                const operand = this.stack.pop();
                if (operand?.type !== "Comparison")
                    throw new Error("Invalid NOT operand");

                this.stack.push({
                    type: "Comparison",
                    value: {
                        NOT: operand.value
                    }
                });
            }
        }
    }
    exitFilter = (ctx: FilterContext) => {
        // console.log("In Filter");
        // ctx.
        const filterNode = this.stack.pop();
        if (filterNode?.type !== "Comparison")
            throw new Error("Invalid filter expression");
        if (this.stack.length !== 0)
            throw new Error("Invalid filter expression");
        
        const result = filterNode.value;
        this.resolve(result);
    }
    
    private getVariable(name: string) {
        const value = this.vars[name];
        if (value === undefined) {
            throw new Error("Unknown variable: " + name);
        }
        return value;
    }

}