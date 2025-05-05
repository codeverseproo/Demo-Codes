// src/index.ts
// Demonstrates the enhanced simplified async flow composer with a basic graph
// and initial inputs to trigger edge cases.

import { GraphDefinition, TaskDefinition } from './types';
import { TaskFlowComposer } from './composer';
// No need to import availableTasks here, it's used inside the Composer

// --- Define an enhanced simple workflow graph ---
// FetchUserData -> ProcessPayment -> SendOrderConfirmation -> LogOrderCompletion
// ValidateOrder -> ProcessPayment (ProcessPayment depends on BOTH FetchUserData and ValidateOrder)
const enhancedSimpleGraph: GraphDefinition = {
    tasks: [
        // Task that fetches user data, can simulate not found or API error
        { name: 'FetchUserData', task: 'fetchUserData', dependencies: [] },

        // Task that validates order data, can simulate invalid data
        { name: 'ValidateOrder', task: 'validateOrder', dependencies: [] },

        // Task that processes payment, depends on user data and order validation.
        // Can simulate payment failure.
        { name: 'ProcessPayment', task: 'processPayment', dependencies: ['FetchUserData', 'ValidateOrder'] },

        // Task that sends confirmation email, depends on payment processing.
        // Will be skipped if payment failed.
        { name: 'SendOrderConfirmation', task: 'sendOrderConfirmation', dependencies: ['ProcessPayment'] },

        // Task that logs completion, depends on sending confirmation.
        { name: 'LogOrderCompletion', task: 'logOrderCompletion', dependencies: ['SendOrderConfirmation'] },
    ]
};


// --- Run the enhanced simplified flow ---

async function runEnhancedSimplifiedFlow() {
    console.log("\n--- Running Enhanced Simplified Demo Flow (Success Case) ---");
    const composer1 = new TaskFlowComposer(enhancedSimpleGraph);
    const initialData1 = {
        userId: 'user-123', // This user ID should lead to success
        orderData: { id: 'order-abc', items: [{ item: 'widget', qty: 1 }] }, // Valid order data
    };

    try {
        console.log("Executing Enhanced Simplified Flow (Success Case)...");
        const results1 = await composer1.execute(initialData1);
        console.log("\n--- Enhanced Simplified Flow Complete (Success Case) ---");
         console.log("Final Task States:");
         results1.forEach((result, name) => {
             console.log(`- ${name}: ${result.state}${result.error ? ` (Error: ${result.error.message})` : ''}${result.output !== undefined ? ` Output: ${JSON.stringify(result.output)}` : ''}`);
         });

    } catch (error: any) {
        console.error("\n--- Enhanced Simplified Flow Execution Failed Unexpectedly (Composer Error) ---", error.message);
    }

    console.log("\n--- Running Enhanced Simplified Demo Flow (User Not Found Case) ---");
    const composer2 = new TaskFlowComposer(enhancedSimpleGraph);
    const initialData2 = {
        userId: 'user-not-found', // This user ID should make FetchUserData return null
        orderData: { id: 'order-def', items: [{ item: 'gadget', qty: 2 }] }, // Valid order data
    };

    try {
        console.log("Executing Enhanced Simplified Flow (User Not Found Case)...");
        const results2 = await composer2.execute(initialData2);
        console.log("\n--- Enhanced Simplified Flow Complete (User Not Found Case) ---");
         console.log("Final Task States:");
         results2.forEach((result, name) => {
             console.log(`- ${name}: ${result.state}${result.error ? ` (Error: ${result.error.message})` : ''}${result.output !== undefined ? ` Output: ${JSON.stringify(result.output)}` : ''}`);
         });

    } catch (error: any) {
        console.error("\n--- Enhanced Simplified Flow Execution Failed Unexpectedly (Composer Error) ---", error.message);
    }

     console.log("\n--- Running Enhanced Simplified Demo Flow (Payment Failure Case) ---");
     const composer3 = new TaskFlowComposer(enhancedSimpleGraph);
     const initialData3 = {
         userId: 'user-payment-fail', // This user ID should make ProcessPayment fail
         orderData: { id: 'order-ghi', items: [{ item: 'doodad', qty: 3 }] }, // Valid order data
     };

     try {
         console.log("Executing Enhanced Simplified Flow (Payment Failure Case)...");
         const results3 = await composer3.execute(initialData3);
         console.log("\n--- Enhanced Simplified Flow Complete (Payment Failure Case) ---");
          console.log("Final Task States:");
          results3.forEach((result, name) => {
              console.log(`- ${name}: ${result.state}${result.error ? ` (Error: ${result.error.message})` : ''}${result.output !== undefined ? ` Output: ${JSON.stringify(result.output)}` : ''}`);
          });

     } catch (error: any) {
         console.error("\n--- Enhanced Simplified Flow Execution Failed Unexpectedly (Composer Error) ---", error.message);
     }
}

// Start the enhanced simplified demonstration.
runEnhancedSimplifiedFlow();

