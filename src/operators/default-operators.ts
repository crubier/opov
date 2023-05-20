import { Operators } from "./types";

export const defaultOperators: Operators<any> = {
  binary: {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => a / b,
  },
  // "a%b": (a: number, b: number) => a % b,
  // "a**b": (a: number, b: number) => a ** b,
  // "a//b": (a: number, b: number) => Math.floor(a / b),
  // "a@b": (a: number, b: number) => a * b,
  // "a<<b": (a: number, b: number) => a << b,
  // "a>>b": (a: number, b: number) => a >> b,
  // "a&b": (a: number, b: number) => a & b,
  // "a|b": (a: number, b: number) => a | b,
  // "a^b": (a: number, b: number) => a ^ b,
  // "a<b": (a: number, b: number) => (a < b ? 1 : 0),
  // "a<=b": (a: number, b: number) => (a <= b ? 1 : 0),
  // "a>b": (a: number, b: number) => (a > b ? 1 : 0),
  // "a>=b": (a: number, b: number) => (a >= b ? 1 : 0),
  // "a==b": (a: number, b: number) => (a == b ? 1 : 0),
  // "a!=b": (a: number, b: number) => (a != b ? 1 : 0),
  // "a===b": (a: number, b: number) => (a === b ? 1 : 0),
  // "a!==b": (a: number, b: number) => (a !== b ? 1 : 0),
  // "a&&b": (a: number, b: number) => (a && b ? 1 : 0),
  // "a||b": (a: number, b: number) => (a || b ? 1 : 0),
  // "!a": (a: number) => (a ? 0 : 1),
  // "~a": (a: number) => ~a,
  // "+a": (a: number) => +a,
  // "-a": (a: number) => -a,
};