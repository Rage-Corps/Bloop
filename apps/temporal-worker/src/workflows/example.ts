import { proxyActivities } from '@temporalio/workflow';
import type { TestWorkflowInput, TestWorkflowResult } from '../types';

// Import activities with proper typing
import type * as activities from '../activities/example';

// Configure activity options
const { testDatabaseConnection, processTestMessage, getMediaById } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  heartbeatTimeout: '5s',
});

export async function testWorkflow(input: TestWorkflowInput): Promise<TestWorkflowResult> {
  try {
    console.log('🚀 Starting test workflow with input:', input);
    
    // Step 1: Test database connection
    const dbResult = await testDatabaseConnection();
    console.log('📊 Database test completed:', dbResult);
    
    // Step 2: Process the test message
    const processedMessage = await processTestMessage(input);
    console.log('💬 Message processing completed');
    
    // Step 3: Build result
    const result: TestWorkflowResult = {
      success: true,
      message: processedMessage,
      mediaCount: dbResult.mediaCount,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Test workflow completed successfully:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Test workflow failed:', error);
    
    const errorResult: TestWorkflowResult = {
      success: false,
      message: `Workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    };
    
    return errorResult;
  }
}

export async function mediaFetchWorkflow(mediaId: string) {
  try {
    console.log(`🎬 Starting media fetch workflow for ID: ${mediaId}`);
    
    // Fetch media details
    const media = await getMediaById(mediaId);
    
    console.log('✅ Media fetch workflow completed successfully');
    return {
      success: true,
      media,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Media fetch workflow failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}