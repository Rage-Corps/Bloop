import { Connection, Client } from '@temporalio/client';
import { testWorkflow, mediaFetchWorkflow } from './workflows/example';
import type { TestWorkflowInput } from './types';

async function run() {
  // Get configuration from environment variables
  const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  const namespace = process.env.TEMPORAL_NAMESPACE || 'default';
  const taskQueue = process.env.TASK_QUEUE || 'bloop-tasks';
  
  console.log('🔧 Temporal Client Configuration:');
  console.log(`   Address: ${temporalAddress}`);
  console.log(`   Namespace: ${namespace}`);
  console.log(`   Task Queue: ${taskQueue}`);
  
  try {
    // Create connection to Temporal service
    console.log('🔌 Connecting to Temporal service...');
    const connection = await Connection.connect({
      address: temporalAddress,
    });
    
    // Create client
    const client = new Client({
      connection,
      namespace,
    });
    console.log('✅ Connected to Temporal service');

    // Test 1: Run the test workflow
    console.log('\n🧪 Test 1: Running test workflow...');
    const testInput: TestWorkflowInput = {
      message: 'Hello from Temporal test workflow!',
      userId: 'test-user-123'
    };

    const testWorkflowHandle = await client.workflow.start(testWorkflow, {
      args: [testInput],
      taskQueue,
      workflowId: `test-workflow-${Date.now()}`,
    });

    console.log(`🔄 Test workflow started with ID: ${testWorkflowHandle.workflowId}`);
    const testResult = await testWorkflowHandle.result();
    console.log('✅ Test workflow result:', testResult);

    // Test 2: Try to fetch a media item (this will likely fail if no media exists, but tests the workflow)
    console.log('\n🎬 Test 2: Running media fetch workflow...');
    
    const mediaWorkflowHandle = await client.workflow.start(mediaFetchWorkflow, {
      args: ['test-media-id-123'],
      taskQueue,
      workflowId: `media-fetch-workflow-${Date.now()}`,
    });

    console.log(`🔄 Media fetch workflow started with ID: ${mediaWorkflowHandle.workflowId}`);
    const mediaResult = await mediaWorkflowHandle.result();
    console.log('📊 Media fetch workflow result:', mediaResult);

    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Client test failed:', error);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('❌ Failed to run client:', err);
  process.exit(1);
});