import { checkRequiredFigures, loadSourceContent, requiredFigures } from './_shared/contentPipeline';

async function main(): Promise<void> {
  const source = await loadSourceContent();
  const result = await checkRequiredFigures(source);

  if (result.missingIds.length > 0) {
    console.error('Kontrola povinných osobností neprošla.');
    console.error(`Chybí: ${result.missingIds.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  console.log('Kontrola povinných osobností proběhla v pořádku.');
  console.log(`Zkontrolováno položek: ${requiredFigures.length}`);
}

void main();
