import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers';

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

/**
 * Returns a cached, lazily-loaded singleton Hugging Face Transformers pipeline
 * using the local onnx-community/all-MiniLM-L6-v2-ONNX model.
 */
export async function getEmbeddingPipeline(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      try {
        const extractor = await pipeline('feature-extraction', 'onnx-community/all-MiniLM-L6-v2-ONNX', {
          dtype: 'fp32',
        });
        return extractor as FeatureExtractionPipeline;
      } catch (err: unknown) {
        extractorPromise = null; // allow retry on failure
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(
          `[EWH Embedding Engine] Failed to initialize local MiniLM model (onnx-community/all-MiniLM-L6-v2-ONNX): ${message}. Run 'npm run model:download' to pre-cache model weights.`
        );
      }
    })();
  }
  return extractorPromise;
}

/**
 * Generates a 384-dimensional normalized embedding vector for the provided text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error('Cannot generate embedding for empty text');
  }

  const extractor = await getEmbeddingPipeline();
  const output = await extractor(cleanText, {
    pooling: 'mean',
    normalize: true,
  });

  const vector = Array.from(output.data as Float32Array);
  if (vector.length !== 384) {
    throw new Error(`Expected 384 embedding dimensions, got ${vector.length}`);
  }

  return vector;
}

/**
 * Formats a JavaScript number array into PostgreSQL vector literal format: '[0.1,0.2,...]'
 */
export function formatVectorForPg(vector: number[]): string {
  return `[${vector.join(',')}]`;
}
