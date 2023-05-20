# Opov - Operator Overloading for Typescript with tagged template literals

```typescript
import { makeTag } from "opov";

const op = makeTag({
  operators: {
    binary: {
      "+": (a, b) => a + b,
      "*": (a, b) => a * b,
      "-": (a, b) => a - b,
      "/": (a, b) => a / b,
    },
  },
});

op` ( ${12} + ${5} ) * ${3} ` == 51;
```

Nice, you just reinvented basic Javascript operators.

But what if you want to do something more interesting, like implement Python-style operator overloading for use with the awesome [WebGPU-Torch](https://github.com/praeclarum/webgpu-torch)?

```typescript
import { makeTag } from "opov";
import torch from "webgpu-torch";

const op = makeTag({
  operators: {
    binary: {
      "+": torch.add,
      "*": torch.mul,
      "-": torch.sub,
      "/": torch.div,
    },
  },
});

// Create a tensor
const a = torch.tensor([[1, 2, 3], [4, 5, 6]]);

// Create another tensor
const b = torch.tensor([[7, 8, 9], [10, 11, 12]]);

// And another tensor
const c = torch.tensor([[7, 8, 9], [10, 11, 12]]);

// Wow! This is now a tensor expression!
op` ( ${a} + ${b} ) * ${c} ` == torch.tensor(...);
```

To install dependencies:

```bash
bun install
```

To test:

```bash
bun run test
```
