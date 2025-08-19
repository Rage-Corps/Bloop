import { Connection, Client } from '@temporalio/client';
import { testWorkflow } from '../src/workflows/example';
import type { TestWorkflowInput } from '../src/types';

async function startTestWorkflow() {
  // Get configuration from environment variables
  const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  const namespace = process.env.TEMPORAL_NAMESPACE || 'default';
  const taskQueue = process.env.TASK_QUEUE || 'bloop-tasks';
  
  console.log('🚀 Starting Test Workflow');
  console.log('========================');
  console.log(`Temporal Address: ${temporalAddress}`);
  console.log(`Namespace: ${namespace}`);
  console.log(`Task Queue: ${taskQueue}`);
  console.log('');
  
  try {
    // Create connection
    const connection = await Connection.connect({
      address: temporalAddress,
    });
    
    const client = new Client({
      connection,
      namespace,
    });

    // Prepare workflow input
    const workflowInput: TestWorkflowInput = {
      message: 'Test workflow execution from script',
      userId: 'script-user'
    };

    // Start workflow
    const workflowId = `test-workflow-script-${Date.now()}`;
    console.log(`🔄 Starting workflow with ID: ${workflowId}`);
    
    const handle = await client.workflow.start(testWorkflow, {
      args: [workflowInput],
      taskQueue,
      workflowId,
    });

    console.log('⏳ Waiting for workflow result...');
    const result = await handle.result();
    
    console.log('\n✅ Workflow completed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('\n❌ Workflow execution failed:', error);
    process.exit(1);
  }
}

// Handle command line arguments for custom message
const customMessage = process.argv[2];
if (customMessage) {
  console.log(`📝 Using custom message: "${customMessage}"`);
}

startTestWorkflow().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});