Expression
  = head:Term tail:(_ ("+" / "-") _ Term)* {
      return (args) => tail.reduce((result, element)=> options.operators.binary[element[1]](result, element[3](args)), head(args));
    }

Term
  = head:Factor tail:(_ ("*" / "/") _ Factor)* {
      return (args) => tail.reduce((result, element)=>options.operators.binary[element[1]](result,element[3](args)), head(args));
    }

Factor
  = "(" _ expr:Expression _ ")" { return expr; }
  / Integer

Integer "integer"
  = _ "$"[0-9]+ { 
      const index = parseInt(text().replace("$",""), 10);
      return (args) => args[index];
    }

_ "whitespace"
  = [ \t\n\r]*