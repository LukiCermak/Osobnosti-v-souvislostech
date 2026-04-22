import { buildSearchIndex, formatIssues, loadSourceContent, validateContent } from './_shared/contentPipeline';

async function main(): Promise<void> {
  const source = await loadSourceContent();
  const validation = await validateContent(source);

  if (validation.issues.length > 0) {
    console.error('Index vyhledávání nebyl vytvořen, protože validace neprošla.');
    console.error(formatIssues(validation));
    process.exitCode = 1;
    return;
  }

  const index = await buildSearchIndex(source);
  console.log('Index vyhledávání byl vytvořen.');
  console.log(`Počet položek indexu: ${index.length}`);
}

void main();
