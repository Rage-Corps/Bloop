"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@temporalio/client");
const example_1 = require("../src/workflows/example");
async function startTestWorkflow() {
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
        const connection = await client_1.Connection.connect({
            address: temporalAddress,
        });
        const client = new client_1.Client({
            connection,
            namespace,
        });
        const workflowInput = {
            message: 'Test workflow execution from script',
            userId: 'script-user'
        };
        const workflowId = `test-workflow-script-${Date.now()}`;
        console.log(`🔄 Starting workflow with ID: ${workflowId}`);
        const handle = await client.workflow.start(example_1.testWorkflow, {
            args: [workflowInput],
            taskQueue,
            workflowId,
        });
        console.log('⏳ Waiting for workflow result...');
        const result = await handle.result();
        console.log('\n✅ Workflow completed successfully!');
        console.log('📊 Result:', JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.error('\n❌ Workflow execution failed:', error);
        process.exit(1);
    }
}
const customMessage = process.argv[2];
if (customMessage) {
    console.log(`📝 Using custom message: "${customMessage}"`);
}
startTestWorkflow().catch((err) => {
    console.error('❌ Script failed:', err);
    process.exit(1);
});
