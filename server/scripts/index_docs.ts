/**
 * Script to index documents into vector store
 * Reads from data/docs/*.json and creates embeddings
 */

import { vectorStore } from '../src/lib/vectorStore';
import { Document } from '../src/schemas/chatbot';
import fs from 'fs';
import path from 'path';

/**
 * Sample automotive knowledge base documents
 */
const knowledgeBaseDocuments: Document[] = [
  {
    id: 'oil-change-1',
    content: 'Oil change service is recommended every 5,000-7,500 miles or every 6 months for most vehicles. Regular oil changes prevent engine wear and maintain optimal performance. Our oil change service costs $49-89 and includes a 23-point inspection, oil filter replacement, and fluid top-off.',
    metadata: {
      title: 'Oil Change Service',
      category: 'maintenance',
      tags: ['oil', 'maintenance', 'engine', 'service'],
      source: 'service_guide',
    },
  },
  {
    id: 'brake-service-1',
    content: 'Brake service is critical for vehicle safety. Warning signs include squeaking, grinding noises, vibration when braking, or longer stopping distances. Brake pads typically need replacement every 30,000-70,000 miles. Our brake service costs $199-450 and includes inspection, pad replacement, rotor resurfacing if needed, and brake fluid check.',
    metadata: {
      title: 'Brake Service',
      category: 'maintenance',
      tags: ['brakes', 'safety', 'pads', 'service'],
      source: 'service_guide',
    },
  },
  {
    id: 'tire-service-1',
    content: 'Tire maintenance includes rotation, balancing, and pressure checks. Tire rotation should be performed every 6,000-8,000 miles to ensure even wear. Proper tire pressure is typically 30-35 PSI for most vehicles - check your door jamb sticker for exact specifications. Our tire rotation service costs $25-50.',
    metadata: {
      title: 'Tire Service',
      category: 'maintenance',
      tags: ['tires', 'rotation', 'pressure', 'service'],
      source: 'service_guide',
    },
  },
  {
    id: 'battery-service-1',
    content: 'Car batteries typically last 3-5 years. Signs of a failing battery include slow engine cranking, dimming headlights, electrical issues, or the battery warning light. We offer free battery testing and replacement services. Battery replacement costs vary by vehicle but typically range from $100-200 including installation.',
    metadata: {
      title: 'Battery Service',
      category: 'maintenance',
      tags: ['battery', 'electrical', 'replacement', 'service'],
      source: 'service_guide',
    },
  },
  {
    id: 'diagnostic-scan-1',
    content: 'Diagnostic scans use advanced computer systems to read your vehicle\'s onboard diagnostics. Our AI-powered diagnostic scan costs $89 and can detect engine problems, transmission issues, sensor failures, and emission system problems. The scan provides detailed trouble codes and recommended repairs.',
    metadata: {
      title: 'Diagnostic Scan',
      category: 'diagnostics',
      tags: ['diagnostics', 'scan', 'engine', 'computer'],
      source: 'service_guide',
    },
  },
  {
    id: 'check-engine-light-1',
    content: 'The check engine light indicates a problem detected by your vehicle\'s onboard computer. Common causes include loose gas cap, faulty oxygen sensor, catalytic converter issues, spark plug problems, or mass airflow sensor failure. A diagnostic scan is needed to identify the specific issue. Don\'t ignore it - some problems can cause serious damage if left unaddressed.',
    metadata: {
      title: 'Check Engine Light',
      category: 'diagnostics',
      tags: ['check engine', 'warning', 'diagnostics', 'sensor'],
      source: 'troubleshooting_guide',
    },
  },
  {
    id: 'maintenance-schedule-1',
    content: 'Regular maintenance schedule includes: 5,000 miles - oil change and tire rotation; 15,000 miles - oil change, tire rotation, and air filter; 30,000 miles - major service including transmission fluid, coolant, brake fluid, and full inspection; 60,000 miles - timing belt replacement (if applicable), spark plugs, and comprehensive service; 90,000 miles - full major service with all fluids and filters.',
    metadata: {
      title: 'Maintenance Schedule',
      category: 'maintenance',
      tags: ['schedule', 'maintenance', 'service', 'intervals'],
      source: 'service_guide',
    },
  },
  {
    id: 'warranty-coverage-1',
    content: 'Our service warranty covers most repairs for 12 months or 12,000 miles, whichever comes first. This includes parts and labor. Extended warranties are available for major repairs like engine or transmission work. Warranty does not cover normal wear items like brake pads, tires, or wiper blades. All warranty work must be performed at our facility.',
    metadata: {
      title: 'Warranty Coverage',
      category: 'information',
      tags: ['warranty', 'coverage', 'guarantee', 'protection'],
      source: 'policy_guide',
    },
  },
  {
    id: 'pricing-guide-1',
    content: 'Service pricing guide: Oil Change $49-89, Brake Service $199-450, Tire Rotation $25-50, Diagnostic Scan $89, Battery Replacement $100-200, Transmission Service $150-350, Coolant Flush $80-150, Air Filter Replacement $20-40, Cabin Filter $25-50, Spark Plugs $80-200, Timing Belt $400-900. Prices vary by vehicle make and model.',
    metadata: {
      title: 'Pricing Guide',
      category: 'pricing',
      tags: ['price', 'cost', 'fees', 'rates'],
      source: 'pricing_guide',
    },
  },
  {
    id: 'booking-process-1',
    content: 'Booking an appointment is easy through our online system or chatbot. Select your desired service, choose an available date and time, provide your vehicle information and contact details, and receive instant confirmation. We offer same-day appointments for urgent repairs. You can reschedule or cancel up to 2 hours before your appointment.',
    metadata: {
      title: 'Booking Process',
      category: 'booking',
      tags: ['booking', 'appointment', 'schedule', 'reservation'],
      source: 'customer_guide',
    },
  },
];

/**
 * Load documents from JSON files
 */
function loadDocumentsFromFiles(docsDir: string): Document[] {
  const documents: Document[] = [];

  if (!fs.existsSync(docsDir)) {
    console.log(`📁 Creating docs directory: ${docsDir}`);
    fs.mkdirSync(docsDir, { recursive: true });

    // Save sample documents
    const sampleFile = path.join(docsDir, 'automotive_knowledge.json');
    fs.writeFileSync(sampleFile, JSON.stringify(knowledgeBaseDocuments, null, 2));
    console.log(`✅ Created sample knowledge base: ${sampleFile}`);

    return knowledgeBaseDocuments;
  }

  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(docsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const docs = JSON.parse(content);

    if (Array.isArray(docs)) {
      documents.push(...docs);
    } else {
      documents.push(docs);
    }
  }

  return documents;
}

/**
 * Main indexing function
 */
async function main() {
  console.log('🚀 Starting document indexing...\n');

  const docsDir = path.join(process.cwd(), 'data', 'docs');
  const documents = loadDocumentsFromFiles(docsDir);

  console.log(`📄 Found ${documents.length} documents to index`);

  // Clear existing index
  vectorStore.clear();
  console.log('🗑️  Cleared existing index\n');

  // Index documents
  console.log('🔄 Generating embeddings and indexing...');
  let indexed = 0;

  for (const doc of documents) {
    try {
      await vectorStore.addDocument(doc);
      indexed++;
      process.stdout.write(`\r   Indexed: ${indexed}/${documents.length}`);
    } catch (error: any) {
      console.error(`\n❌ Failed to index ${doc.id}:`, error.message);
    }
  }

  console.log('\n\n✅ Indexing complete!');
  console.log(`📊 Statistics:`);
  console.log(`   Total documents: ${vectorStore.size()}`);
  console.log(`   Index name: coders-adda`);

  // Test search
  console.log('\n🔍 Testing search...');
  const testQueries = [
    'How often should I change my oil?',
    'My brakes are squeaking',
    'Battery warning light is on',
  ];

  for (const query of testQueries) {
    const results = await vectorStore.search(query, 2, 0.55);
    console.log(`\nQuery: "${query}"`);
    if (results.length > 0) {
      console.log(`   Top result: ${results[0].id} (score: ${results[0].score.toFixed(3)})`);
    } else {
      console.log('   No results found');
    }
  }

  console.log('\n✨ Done!');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { loadDocumentsFromFiles, knowledgeBaseDocuments };
