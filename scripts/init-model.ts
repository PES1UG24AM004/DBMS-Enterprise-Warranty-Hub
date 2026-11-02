import { getEmbeddingPipeline, generateEmbedding } from '../lib/embeddings';

async function main() {
  console.log('--- Initializing Local MiniLM Embedding Model ---');
  console.log('Model target: onnx-community/all-MiniLM-L6-v2-ONNX');
  console.log('Loading pipeline locally...');

  const startTime = Date.now();
  await getEmbeddingPipeline();
  const sampleVector = await generateEmbedding('EWH local semantic search check');
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`✔ Model ready in ${elapsed}s. Dimensions: ${sampleVector.length} (Normalized).`);
  console.log('✔ Subsequent searches will use the cached local pipeline instantly without re-downloading.');
}

main().catch((err) => {
  console.error('✘ Model initialization error:', err);
  process.exit(1);
});
