// service-a/src/index.ts

// Snippet 1: Imports
import { activateUserInServiceB } from './api/ServiceClient'; // The client function to call Service B
import { runInContext, getCorrelationId, getTraceId, getSpanId } from './utils/context'; // Import context runner and getter functions
import { v4 as uuidv4 } from 'uuid'; // For generating initial IDs
import logger from './utils/logger'; // Service A's logger

// Snippet 2: Async Example Execution Function
// Wraps the logic in an async function so we can use await.
async function runExampleCall() {
    // Generate initial IDs for this overall execution flow
    const userId = `user-${uuidv4().slice(0, 6)}`; // Unique user ID for this run
    const correlationId = uuidv4(); // Start a new correlation ID
    const traceId = correlationId; // Often traceId starts same as correlationId
    const spanId = uuidv4(); // Span ID for this top-level script execution

    // Log the start of the script execution
    logger.info('--- Starting Dependency Acknowledgment Example (Service A) ---', { correlationId, traceId });

    // Snippet 3: Run the Call within Context
    // Use the context helper to ensure correlation IDs are available
    // for logging and the Axios interceptor.
    await runInContext(correlationId, traceId, spanId, async () => {
        // Log before making the call, showing current context IDs
        logger.info(`Triggering user activation for ${userId} from Service A`, {
             userId,
             correlationId: getCorrelationId(), // Get IDs from context
             traceId: getTraceId(),
             spanId: getSpanId()
         });

        try {
            // Make the call to Service B using our client function.
            // This is where we provide the specific INTENT.
            await activateUserInServiceB(
                userId,
                'user.signup.complete', // <-- The specific business intent for this call!
                'Activate the new user account and trigger welcome flow.' // <-- Optional hint
            );
            // Log successful completion
            logger.info('Service A successfully triggered user activation in Service B.', { correlationId, traceId });
        } catch (error) {
            // Log failure, including context IDs
            logger.error('Service A failed to trigger user activation in Service B.', {
                correlationId,
                traceId,
                error: (error as Error).message, // Log error message
                // Log response details if available from Axios error
                response_data: (error as any).response?.data,
                response_status: (error as any).response?.status
            });
        }
    });

    // Snippet 4: Log Completion and Exit
    logger.info('--- Dependency Acknowledgment Example Finished (Service A) ---', { correlationId, traceId });
    // Exit the process after the async operation completes
    process.exit(0);
}

// Snippet 5: Execute the Example
// Call the async function to start the script.
runExampleCall();
