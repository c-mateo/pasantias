expression
  = or_expr
//  = datetime

or_expr
  = and_expr ("," and_expr)*

and_expr
  = term (";" term)*

term
  = constraint
  / "(" expression ")"

constraint
  = selector comparison value

selector
  = (unreserved / pct_encoded)+

comparison
  = "=eq=" / "=="
  / "=ne=" / "!="
  / "=lt=" / "<"
  / "=le=" / "<="
  / "=gt=" / ">"
  / "=ge=" / "<="
  / "=in=" / "=out="
  / "=regex=" / "~="
  / "=iregex=" / "=all=" / "=size=" / "=em="
  
number_comparison
  = "==" / "!=" / "<" / ">" / "<=" / ">="
  
string_comparison
  = "==" / "!="
  
list_comparison
  = "=in=" / "=out="

value
  = ( "*"? arg_char+ "*"? ) / "(" arg_char+ (","  arg_char+)* ")"
  
number_list
  = "(" number (","  number)* ")"
  
string_list
  = "(" string (","  string)* ")"

number
  = DIGIT+

string
  = arg_char+

// 2023-10-27T10:00:00Z
datetime
  = date "T" time ("Z" / timezone)

date
  = DIGIT |4| "-" DIGIT|2| "-" DIGIT|2|
  
time
  = DIGIT|2| ":" DIGIT|2| ":" DIGIT|2|

// -12:00
timezone
  = [+\-] DIGIT|2| ":" DIGIT|2|

unreserved
  = ALPHA
  / DIGIT
  / "-"
  / "."
  / "_"
  / "~"

pct_encoded
  = "%" HEXDIG HEXDIG

arg_char
  = unreserved
  / pct_encoded

ALPHA
  = [A-Za-z]

DIGIT
  = [0-9]

HEXDIG
  = DIGIT
  / [A-Fa-f]
