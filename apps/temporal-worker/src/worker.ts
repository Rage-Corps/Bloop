import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities/example';

async function run() {
  // Get configuration from environment variables
  const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  const namespace = process.env.TEMPORAL_NAMESPACE || 'default';
  const taskQueue = process.env.TASK_QUEUE || 'bloop-tasks';
  
  console.log('🔧 Temporal Worker Configuration:');
  console.log(`   Address: ${temporalAddress}`);
  console.log(`   Namespace: ${namespace}`);
  console.log(`   Task Queue: ${taskQueue}`);
  
  try {
    // Create connection to Temporal service
    console.log('🔌 Connecting to Temporal service...');
    const connection = await NativeConnection.connect({
      address: temporalAddress,
    });
    console.log('✅ Connected to Temporal service');

    // Create and configure the worker
    console.log('👷 Creating Temporal worker...');
    const worker = await Worker.create({
      connection,
      namespace,
      taskQueue,
      workflowsPath: require.resolve('./workflows/example'),
      activities,
      maxConcurrentActivityTaskExecutions: 10,
      maxConcurrentWorkflowTaskExecutions: 10,
    });
    console.log('✅ Worker created successfully');

    // Set up graceful shutdown
    const shutdown = async () => {
      console.log('🛑 Shutting down worker...');
      await worker.shutdown();
      console.log('✅ Worker shutdown complete');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // Start the worker
    console.log('🚀 Starting Temporal worker...');
    await worker.run();
    
  } catch (error) {
    console.error('❌ Worker failed to start:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

run().catch((err) => {
  console.error('❌ Failed to run worker:', err);
  process.exit(1);
});