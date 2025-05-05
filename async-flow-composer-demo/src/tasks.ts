// src/tasks.ts
// Enhanced simplified task implementations for the demo.
// Simulate real-world operations and basic edge cases.

// Import necessary types from types.ts
import { TaskFunction, TaskInputs, TaskOutputs } from './types';

// --- Enhanced Simplified Task Function Implementations ---
// Simulate real-world async operations with logs and edge cases.

export const fetchUserApi: TaskFunction<TaskInputs['fetchUserData'], TaskOutputs['fetchUserData']> =
    async (input) => {
    const taskName = 'Fetch User Data';
    console.log(`${taskName}: Attempting to fetch user with ID: ${input.userId}...`);
    await new Promise(resolve => setTimeout(resolve, 250)); // Simulate API call delay

    // Simulate edge cases based on user ID
    if (input.userId === 'user-not-found') {
        console.log(`${taskName}: User ${input.userId} not found (simulated). Returning null.`);
        return null; // Simulate user not found
    }
    if (input.userId === 'user-api-error') {
        console.log(`${taskName}: API error fetching user ${input.userId} (simulated). Throwing error.`);
        throw new Error(`API Error: Could not fetch user ${input.userId}`); // Simulate API error
    }

    console.log(`${taskName}: Successfully fetched user ${input.userId}.`);
    // Return sample user data
    return { id: input.userId, email: `${input.userId}@example.com`, name: `User ${input.userId}` };
};

export const validateOrderLogic: TaskFunction<TaskInputs['validateOrder'], TaskOutputs['validateOrder']> =
    async (input) => {
    const taskName = 'Validate Order';
    console.log(`${taskName}: Validating order data...`);
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate validation logic

    const { orderData } = input;

    // Simulate validation failure
    if (!orderData || !orderData.items || orderData.items.length === 0) {
        console.log(`${taskName}: Validation failed: Order data is invalid or empty.`);
        // In a real scenario, this might return { isValid: false } or throw a specific validation error
        return { isValid: false, processedOrder: null }; // Indicate validation failure
    }

    console.log(`${taskName}: Order data is valid.`);
    // Return processed order data
    return { isValid: true, processedOrder: { ...orderData, validated: true } };
};

export const processPaymentGateway: TaskFunction<TaskInputs['processPayment'], TaskOutputs['processPayment']> =
    async (input) => {
    const taskName = 'Process Payment';
    console.log(`${taskName}: Attempting to process payment...`);
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate payment gateway call

    // --- Access dependency output (fetchUserData) ---
    const userData = input.fetchUserData;

    // Simulate payment failure if user data is missing (edge case)
    if (!userData) {
         console.log(`${taskName}: Payment failed: User data missing from dependency.`);
         // This task cannot proceed without user data, so we indicate failure.
         return { success: false };
    }

    // Simulate payment success/failure based on user ID or other criteria
    if (userData.id === 'user-payment-fail') {
        console.log(`${taskName}: Payment failed for user ${userData.id} (simulated).`);
        return { success: false };
    }

    console.log(`${taskName}: Payment successful for user ${userData.id}.`);
    // Return transaction details
    return { success: true, transactionId: `txn_${Math.random().toString(16).slice(2)}` };
};

export const sendOrderEmail: TaskFunction<TaskInputs['sendOrderConfirmation'], TaskOutputs['sendOrderConfirmation']> =
    async (input) => {
    const taskName = 'Send Order Confirmation Email';
    console.log(`${taskName}: Preparing to send email...`);
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate email service call

    // --- Access dependency output (processPayment) ---
    const paymentResult = input.processPayment;

    // Simulate skipping email if payment failed (edge case)
    if (!paymentResult || !paymentResult.success) {
        console.log(`${taskName}: Skipping email: Payment was not successful.`);
        return; // Task completes successfully but does nothing
    }

    console.log(`${taskName}: Email sent successfully.`);
    // Return void
};

export const logCompletion: TaskFunction<TaskInputs['logOrderCompletion'], TaskOutputs['logOrderCompletion']> =
    async (input) => {
    const taskName = 'Log Order Completion';
    console.log(`${taskName}: Logging completion status...`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate logging

    // --- Access dependency output (sendOrderConfirmation) ---
    // In this simplified model, sendOrderConfirmation is void, so its output is undefined.
    // We just depend on it for sequencing.

    console.log(`${taskName}: Order completion logged.`);
    // Return void
};


// Map task names to their implementations.
export const availableTasks = {
    fetchUserData: fetchUserApi, // Mapping 'fetchUserData' task name to fetchUserApi function
    validateOrder: validateOrderLogic,
    processPayment: processPaymentGateway,
    sendOrderConfirmation: sendOrderEmail,
    logOrderCompletion: logCompletion,
};

