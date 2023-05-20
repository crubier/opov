import moize from "moize";
import { parse as rawParse } from "./parser/parser";
// import { defaultOperators } from "./operators/default-operators";
import { Operators } from "./operators/types";

const validate = (tagStrings: TemplateStringsArray): null | Error => {
  if (tagStrings.length <= 0) {
    return new Error("Template string must contain at least one string");
  }
  for (let i = 0; i < tagStrings.length; i++) {
    if (tagStrings[i].includes("$")) {
      return new Error("Template string cannot contain $");
    }
  }
  return null;
};

const parse = <T>(
  tagStrings: TemplateStringsArray,
  operators: Operators<T>
) => {
  const error = validate(tagStrings);
  if (error) {
    throw error;
  }
  const [first, ...tail] = tagStrings;
  const stringToParse = tail.reduce(
    // Note the "$" before index!
    (acc, cur, index) => `${acc}$${index}${cur}`,
    first
  );
  console.log("stringToParse", stringToParse);
  return rawParse(stringToParse, { operators });
};

const memoizedParse = moize(parse);

export const makeTag = <T>({ operators }: { operators: Operators<T> }) => {
  const tag = (tagStrings: TemplateStringsArray, ...args: any[]) => {
    const parsedResult = memoizedParse(tagStrings, operators);
    return parsedResult(args);
  };
  return tag;
};
