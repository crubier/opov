const dir = import.meta.dir;

await Bun.build({
  entrypoints: [`${dir}/../src/index.ts`],
  outdir: "./build",
});
