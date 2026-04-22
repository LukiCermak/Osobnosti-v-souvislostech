import { formatIssues, loadSourceContent, validateContent } from './_shared/contentPipeline';

async function main(): Promise<void> {
  const source = await loadSourceContent();
  const result = await validateContent(source);

  if (result.issues.length > 0) {
    console.error('Validace obsahu selhala.');
    console.error(formatIssues(result));
    process.exitCode = 1;
    return;
  }

  console.log('Validace obsahu proběhla v pořádku.');
  console.log(`Osobnosti: ${source.people.length}`);
  console.log(`Pojmy: ${source.concepts.length}`);
  console.log(`Vazby: ${source.relations.length}`);
  console.log(`Trasy: ${source.paths.length}`);
  console.log(`Případy: ${source.cases.length}`);
  console.log(`Kontrastní sady: ${source.contrastSets.length}`);
}

void main();
