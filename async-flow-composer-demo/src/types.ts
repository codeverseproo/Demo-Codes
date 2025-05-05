// src/types.ts
// Core types for the enhanced simplified async flow composer.

// A task is an async function that accepts an input object and returns an output.
// For this enhanced demo, the input will still primarily be initial inputs,
// but we'll make the output slightly more structured.
export type TaskFunction<TInput = any, TOutput = any> = (input: TInput) => Promise<TOutput>;

// Definition of a task node in the graph.
export interface TaskDefinition {
    name: string; // Unique name for the task node (e.g., 'FetchUserData')
    task: string; // The name of the actual TaskFunction to run (e.g., 'fetchUserApi')
    dependencies?: string[]; // Names of tasks that MUST complete successfully before this task runs
}

// Simplified definition of the workflow graph.
// Just a list of task definitions.
export interface GraphDefinition {
    tasks: TaskDefinition[];
}

// Possible states for a task during execution.
export enum TaskState {
    Pending = 'Pending',     // Waiting for dependencies or scheduler
    Running = 'Running',     // Currently executing
    Completed = 'Completed', // Finished successfully
    Failed = 'Failed',       // Finished with an error
    Skipped = 'Skipped',     // Did not run (e.g., if a dependency failed or returned null)
}

// Simplified result of a task's execution.
export interface TaskExecutionResult {
    state: TaskState;
    output?: any; // The value returned by the TaskFunction (could be null or undefined)
    error?: Error; // Error object if the task failed
}

// --- Define concrete (but simple) input and output types for clarity ---
// These help define what data flows into and out of specific task functions.

export interface TaskInputs {
    // Tasks with no dependencies receive initial inputs
    fetchUserData: { userId: string, [key: string]: any };
    validateOrder: { orderData: any, [key: string]: any };

    // Tasks with dependencies receive initial inputs AND dependency outputs
    processPayment: { fetchUserData: TaskOutputs['fetchUserData'], initialInputs?: any }; // Simplified: just needs user data
    sendOrderConfirmation: { processPayment: TaskOutputs['processPayment'], initialInputs?: any }; // Simplified: just needs payment status
    logOrderCompletion: { sendOrderConfirmation: TaskOutputs['sendOrderConfirmation'], initialInputs?: any }; // Simplified: just needs confirmation status
}

export interface TaskOutputs {
    fetchUserData: { id: string, email: string, name: string } | null; // Can return null if user not found
    validateOrder: { isValid: boolean, processedOrder?: any }; // Can indicate invalid order
    processPayment: { success: boolean, transactionId?: string }; // Indicates payment success/failure
    sendOrderConfirmation: void; // No specific data returned
    logOrderCompletion: void; // No specific data returned
}


