import { syncProjectDocs } from './_shared/contentPipeline';

async function main(): Promise<void> {
  const copied = await syncProjectDocs();

  if (copied.length === 0) {
    console.log('Nebyly nalezeny žádné zdrojové dokumenty ke zkopírování.');
    return;
  }

  console.log('Dokumentace byla synchronizována.');
  for (const relativePath of copied) {
    console.log(`- ${relativePath}`);
  }
}

void main();
