import { CharStream, CommonTokenStream, InputStream } from 'antlr4';
import ODataFilterLexer from '../src/antlr/ODataFilterLexer';
import ODataFilterParser from '../src/antlr/ODataFilterParser';

function parse(input: string) {
  const chars = new CharStream(input);
  const lexer = new ODataFilterLexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new ODataFilterParser(tokens);

  const errors: string[] = [];
  parser.removeErrorListeners();
  parser.addErrorListener({
    syntaxError(_recognizer: any, _offendingSymbol: any, _line: number, _column: number, msg: string) {
      errors.push(msg);
    }
  });

  const tree = parser.filter();
  return { tree, errors, parser };
}

describe('ODataFilter parser', () => {
  test('parses simple comparison', () => {
    const { errors } = parse("name eq 'John'");
    expect(errors).toHaveLength(0);
  });

  test('parses contains function', () => {
    const { errors } = parse("contains(name,'oh')");
    expect(errors).toHaveLength(0);
  });

  test('parses complex boolean expressions', () => {
    const { errors } = parse("age gt 30 and (name eq 'John' or name eq 'Jane')");
    expect(errors).toHaveLength(0);
  });

  test('parses list in', () => {
    const { errors } = parse('id in (1,2,3)');
    expect(errors).toHaveLength(0);
  });

  test('reports error for invalid input', () => {
    const { errors } = parse("name eq ");
    expect(errors.length).toBeGreaterThan(0);
  });

  test('tree structure: comparison nodes', () => {
    const { tree } = parse("name eq 'John'");
    const comp = tree.expression().comparison();
    expect(comp).toBeTruthy();
    expect(comp!.identifier().getText()).toBe('name');
    expect(comp!.literal().getText()).toBe("'John'");
  });

  test('tree structure: contains function node', () => {
    const { tree } = parse("contains(name,'oh')");
    const func = tree.expression().functionCall()!.stringFunction();
    expect(func).toBeTruthy();
    expect(func!.identifier().getText()).toBe('name');
    expect(func!.expression().literal().getText()).toBe("'oh'");
  });

  test('tree structure: boolean AND/OR nesting', () => {
    const { tree } = parse("age gt 30 and (name eq 'John' or name eq 'Jane')");
    const expr = tree.expression();
    expect(expr.AND()).toBeTruthy();

    const left = expr.expression(0);
    expect(left.comparison()).toBeTruthy();
    expect(left.comparison()!.identifier().getText()).toBe('age');

    const right = expr.expression(1);
    expect(right.OR()).toBeTruthy();
    const rleft = right.expression(0);
    const rright = right.expression(1);
    expect(rleft.comparison()!.identifier().getText()).toBe('name');
    expect(rright.comparison()!.literal().getText()).toBe("'Jane'");
  });

  test('tree structure: list contents', () => {
    const { tree } = parse('id in (1,2,3)');
    const expr = tree.expression();
    expect(expr.IN()).toBeTruthy();
    const list = expr.list();
    // the generated ListContext exposes literal_list() helper
    const literals = list.literal_list();
    expect(literals).toHaveLength(3);
    expect(literals.map(l => l.getText())).toEqual(['1', '2', '3']);
  });

  test('tree structure: NOT with parenthesis', () => {
    const { tree } = parse("not (name eq 'John')");
    const expr = tree.expression();
    expect(expr.NOT()).toBeTruthy();
    const inner = expr.expression(0);
    expect(inner.comparison()!.identifier().getText()).toBe('name');
  });
});
