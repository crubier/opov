import { expect, test } from "bun:test";

import { makeTag } from "./make-tag";

const numops = makeTag({
  operators: {
    binary: {
      "+": (a: number, b: number) => a + b,
      "*": (a: number, b: number) => a * b,
      "-": (a: number, b: number) => a - b,
      "/": (a: number, b: number) => a / b,
    },
  },
});

test("const", () => {
  expect(numops`${12}`).toBe(12);
});

test("adds", () => {
  expect(numops`${12}+${5}+${3}`).toBe(20);
});

test("mult", () => {
  expect(numops`${12}*${5}*${3}`).toBe(180);
});

test("par adds", () => {
  expect(numops`(${12}+${5})+${3}`).toBe(20);
});

test("par mults", () => {
  expect(numops`(${12}*${5})*${3}`).toBe(180);
});

test("par mix", () => {
  expect(numops`(${12}+${5})*${3}`).toBe(51);
});
