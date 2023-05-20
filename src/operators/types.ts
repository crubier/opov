export type Operators<T> = {
  binary: {
    "+": (a: T, b: T) => T;
    "-": (a: T, b: T) => T;
    "*": (a: T, b: T) => T;
    "/": (a: T, b: T) => T;
  };
  // "a%b": (a: T, b: T) => T;
  // "a**b": (a: T, b: T) => T;
  // "a//b": (a: T, b: T) => T;
  // "a@b": (a: T, b: T) => T;
  // "a<<b": (a: T, b: T) => T;
  // "a>>b": (a: T, b: T) => T;
  // "a&b": (a: T, b: T) => T;
  // "a|b": (a: T, b: T) => T;
  // "a^b": (a: T, b: T) => T;
  // "a<b": (a: T, b: T) => T;
  // "a<=b": (a: T, b: T) => T;
  // "a>b": (a: T, b: T) => T;
  // "a>=b": (a: T, b: T) => T;
  // "a==b": (a: T, b: T) => T;
  // "a!=b": (a: T, b: T) => T;
  // "a===b": (a: T, b: T) => T;
  // "a!==b": (a: T, b: T) => T;
  // "a&&b": (a: T, b: T) => T;
  // "a||b": (a: T, b: T) => T;
  // "!a": (a: T) => T;
  // "~a": (a: T) => T;
  // "+a": (a: T) => T;
  // "-a": (a: T) => T;
};
