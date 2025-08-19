import { MediaDao, CategoryDao, SourceDao } from '@bloop/database';
import { DatabaseTestResult, TestWorkflowInput } from '../types';

// Initialize DAOs
const mediaDao = new MediaDao();
const categoryDao = new CategoryDao();
const sourceDao = new SourceDao();

export async function testDatabaseConnection(): Promise<DatabaseTestResult> {
  try {
    console.log('🔍 Testing database connection...');
    
    // Get counts from each table to verify database connectivity
    const [mediaItems, categories, sources] = await Promise.all([
      mediaDao.getAllMedia(),
      categoryDao.getUniqueCategories(),
      sourceDao.getUniqueSources()
    ]);

    const result = {
      mediaCount: mediaItems.length,
      categoriesCount: categories.length,
      sourcesCount: sources.length
    };

    console.log('✅ Database connection test successful:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function processTestMessage(input: TestWorkflowInput): Promise<string> {
  try {
    console.log('📝 Processing test message:', input.message);
    
    // Simulate some processing work
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const processedMessage = `Processed: ${input.message} at ${new Date().toISOString()}`;
    console.log('✅ Message processed successfully');
    
    return processedMessage;
    
  } catch (error) {
    console.error('❌ Message processing failed:', error);
    throw new Error(`Message processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getMediaById(mediaId: string) {
  try {
    console.log(`🔍 Fetching media with ID: ${mediaId}`);
    
    const media = await mediaDao.getMediaById(mediaId);
    
    if (!media) {
      throw new Error(`Media with ID ${mediaId} not found`);
    }
    
    console.log('✅ Media fetched successfully:', media.name);
    return media;
    
  } catch (error) {
    console.error('❌ Failed to fetch media:', error);
    throw error;
  }
}