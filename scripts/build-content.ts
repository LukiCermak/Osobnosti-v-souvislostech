import { buildContentArtifacts, formatIssues, loadSourceContent, validateContent } from './_shared/contentPipeline';

async function main(): Promise<void> {
  const source = await loadSourceContent();
  const validation = await validateContent(source);

  if (validation.issues.length > 0) {
    console.error('Build obsahu byl zastaven, protože validace neprošla.');
    console.error(formatIssues(validation));
    process.exitCode = 1;
    return;
  }

  const contentVersion = await buildContentArtifacts(source);

  console.log('Build obsahu proběhl v pořádku.');
  console.log(`Verze balíčku: ${contentVersion.version}`);
  console.log(`Otisk zdroje: ${contentVersion.sourceDigest.slice(0, 12)}…`);
}

void main();
