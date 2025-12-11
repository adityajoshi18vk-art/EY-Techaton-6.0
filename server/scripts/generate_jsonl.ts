/**
 * Script to generate JSONL training data from predefined responses
 * Used for fine-tuning LLM models
 */

import { predefinedResponses } from '../src/agents/chatbotResponses';
import fs from 'fs';
import path from 'path';

interface TrainingExample {
  prompt: string;
  completion: string;
  metadata?: {
    intent: string;
    category?: string;
    keywords?: string[];
  };
}

/**
 * Generate training examples from predefined responses
 */
function generateTrainingExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];

  for (const response of predefinedResponses) {
    // Create multiple examples per response using different keyword variations
    for (const keyword of response.keywords) {
      // Basic question format
      examples.push({
        prompt: `User: ${keyword}\nAssistant:`,
        completion: ` ${response.reply}`,
        metadata: {
          intent: response.intent,
          category: response.category,
          keywords: response.keywords,
        },
      });

      // Question format
      examples.push({
        prompt: `User: Can you help me with ${keyword}?\nAssistant:`,
        completion: ` ${response.reply}`,
        metadata: {
          intent: response.intent,
          category: response.category,
          keywords: response.keywords,
        },
      });

      // Information request format
      if (response.category !== 'general') {
        examples.push({
          prompt: `User: Tell me about ${keyword}\nAssistant:`,
          completion: ` ${response.reply}`,
          metadata: {
            intent: response.intent,
            category: response.category,
            keywords: response.keywords,
          },
        });
      }
    }
  }

  return examples;
}

/**
 * Convert to OpenAI JSONL format
 */
function toOpenAIFormat(examples: TrainingExample[]): string {
  return examples
    .map(ex => 
      JSON.stringify({
        prompt: ex.prompt,
        completion: ex.completion,
      })
    )
    .join('\n');
}

/**
 * Convert to Gemini/Google format
 */
function toGeminiFormat(examples: TrainingExample[]): string {
  return examples
    .map(ex =>
      JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: ex.prompt.replace('User: ', '').replace('\nAssistant:', '') }],
          },
          {
            role: 'model',
            parts: [{ text: ex.completion.trim() }],
          },
        ],
        metadata: ex.metadata,
      })
    )
    .join('\n');
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Generating training data...');

  const examples = generateTrainingExamples();
  console.log(`📊 Generated ${examples.length} training examples`);

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Generate OpenAI format
  const openaiPath = path.join(dataDir, 'train_openai.jsonl');
  fs.writeFileSync(openaiPath, toOpenAIFormat(examples));
  console.log(`✅ OpenAI format: ${openaiPath}`);

  // Generate Gemini format
  const geminiPath = path.join(dataDir, 'train_gemini.jsonl');
  fs.writeFileSync(geminiPath, toGeminiFormat(examples));
  console.log(`✅ Gemini format: ${geminiPath}`);

  // Generate summary JSON
  const summaryPath = path.join(dataDir, 'train_summary.json');
  const summary = {
    totalExamples: examples.length,
    intents: Array.from(new Set(examples.map(ex => ex.metadata?.intent))),
    categories: Array.from(new Set(examples.map(ex => ex.metadata?.category))),
    generatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`✅ Summary: ${summaryPath}`);

  console.log('\n📝 Training Data Summary:');
  console.log(`   Total Examples: ${summary.totalExamples}`);
  console.log(`   Unique Intents: ${summary.intents.length}`);
  console.log(`   Categories: ${summary.categories.join(', ')}`);

  console.log('\n🎯 Next Steps:');
  console.log('   For OpenAI: Upload train_openai.jsonl to OpenAI fine-tuning dashboard');
  console.log('   For Gemini: Use Google AI Studio or Vertex AI for fine-tuning');
  console.log('   Command: npm run train:upload (requires API setup)');
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { generateTrainingExamples, toOpenAIFormat, toGeminiFormat };
