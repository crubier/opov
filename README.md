# Opov - Operator Overloading for Typescript with tagged template literals

```typescript
import { makeTag } from "opov";

const op = makeTag({
  operators: {
    binary: {
      "+": (a: number, b: number) => a + b,
      "*": (a: number, b: number) => a * b,
      "-": (a: number, b: number) => a - b,
      "/": (a: number, b: number) => a / b,
    },
  },
});

op` ( ${12} + ${5} ) * ${3} ` == 51;
```

To install dependencies:

```bash
bun install
```

To test:

```bash
bun run test
```
