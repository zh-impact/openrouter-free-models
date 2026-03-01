/**
 * Manual sync script for local development
 *
 * Usage:
 * tsx scripts/sync.ts
 */

async function main() {
  console.log('OpenRouter Free Models - Manual Sync Script');
  console.log('=========================================\n');

  // Fetch models from OpenRouter
  console.log('Fetching models from OpenRouter...');
  const response = await fetch('https://openrouter.ai/api/v1/models');

  if (!response.ok) {
    console.error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    process.exit(1);
  }

  const data = await response.json();
  const allModels = data.data || [];

  console.log(`Found ${allModels.length} total models`);

  // Filter free models
  const freeModels = allModels.filter((model: any) => model.id.endsWith(':free'));
  console.log(`Found ${freeModels.length} free models\n`);

  // Display sample of free models
  console.log('Sample of free models:');
  freeModels.slice(0, 5).forEach((model: any) => {
    console.log(`  - ${model.name} (${model.id})`);
    console.log(`    Context: ${model.context_length?.toLocaleString() || 'N/A'} tokens`);
    console.log(`    Pricing: $${model.pricing?.prompt || '0'} / $${model.pricing?.completion || '0'}`);
  });

  if (freeModels.length > 5) {
    console.log(`  ... and ${freeModels.length - 5} more`);
  }

  console.log('\nSync complete!');
}

main().catch(console.error);
