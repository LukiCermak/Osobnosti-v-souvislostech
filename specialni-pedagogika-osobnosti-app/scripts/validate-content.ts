import fs from "node:fs";

function readYamlLike(path: string): string {
  return fs.readFileSync(path, "utf8");
}

const persons = readYamlLike("content/source/mini-wikipedie-osobnosti/persons.yaml");
const concepts = readYamlLike("content/source/mini-wikipedie-osobnosti/concepts.yaml");
const relations = readYamlLike("content/source/mini-wikipedie-osobnosti/relations.yaml");

const personIds = Array.from(persons.matchAll(/^- id:\s*([a-z0-9_]+)/gm)).map(m => m[1]);
const conceptIds = Array.from(concepts.matchAll(/^- id:\s*([a-z0-9_]+)/gm)).map(m => m[1]);
const entitySet = new Set([...personIds, ...conceptIds]);

const fromIds = Array.from(relations.matchAll(/^\s*from:\s*([a-z0-9_]+)/gm)).map(m => m[1]);
const toIds = Array.from(relations.matchAll(/^\s*to:\s*([a-z0-9_]+)/gm)).map(m => m[1]);

const missing = [...fromIds, ...toIds].filter(id => !entitySet.has(id));

if (missing.length) {
  console.error("Neexistující entity v relations.yaml:", [...new Set(missing)]);
  process.exit(1);
}

console.log("OK: content relations references jsou validní.");
