import peggy from "peggy";
import tspegjs from "ts-pegjs";

const dir = import.meta.dir;
const inputFile = Bun.file(`${dir}/grammar.pegjs`);
const outputFile = Bun.file(`${dir}/parser.ts`);
const inputText = await inputFile.text();
const outputText = peggy.generate(inputText, {
  output: "source",
  format: "es",
  plugins: [tspegjs],
  // tspegjs: {
  //   customHeader: "// import lib\nimport { Lib } from 'mylib';",
  // },
});
await Bun.write(outputFile, outputText);
