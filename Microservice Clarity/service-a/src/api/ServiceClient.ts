// service-a/src/api/ServiceClient.ts

// Snippet 1: Imports - Ensure all necessary imports are present
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'; // Added AxiosResponse type
// Import the shared DependencyAcknowledgment types and helper
import { DependencyAcknowledgment, createAcknowledgment } from '../../../shared/src/acknowledgment/types'; // Correct relative path from service-a/src/
import { v4 as uuidv4 } from 'uuid'; // For generating new Span IDs
import logger from '../utils/logger'; // Service A's logger
// Import context helpers
import { getCorrelationId, getTraceId, getSpanId } from '../utils/context';

// Snippet 2: Augment Axios Request Config Type
// This tells TypeScript that the config object passed to axios methods
// can have 'intent' and 'expectedOutcomeHint' properties.
// This declaration should be picked up by TypeScript globally within service-a.
declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        intent?: string; // Allow adding a custom 'intent' property to the config
        expectedOutcomeHint?: string; // Allow adding a custom 'expectedOutcomeHint' property
        // Add other custom fields you might pass here
    }
}

// Snippet 3: Create Axios Instance - Basic setup for the client that calls Service B.
// This should be at the top level of the file.
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000', // The address of Service B
  headers: {
    'Content-Type': 'application/json', // Default content type
  },
  timeout: 5000, // Request timeout (5 seconds)
});

// Snippet 4: Add Request Interceptor
// This interceptor runs BEFORE a request is sent. It reads custom properties
// from the config (using the augmented type) and adds the Dependency Acknowledgment header.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const customConfig = config; // Use the augmented type here

    // Check if 'intent' was provided in the call config
    if (customConfig.intent) {
      // Get IDs from the current execution context (provided by utils/context)
      const correlationId = getCorrelationId();
      const traceId = getTraceId();
      const parentSpanId = getSpanId(); // The span ID of the operation *initiating* this call

       // Generate a NEW span ID for the *outgoing network request itself*
       const outgoingSpanId = uuidv4();

       // Optional: Log a warning if context IDs are missing (indicates a bug in calling code)
       if (!correlationId || !traceId || !parentSpanId) {
             // Use logger from imports
             logger.warn('Context IDs missing when making outgoing call with intent', { intent: customConfig.intent, url: config.url });
            // In production, you might choose to abort the call or generate IDs anyway
        }


      // Create the Dependency Acknowledgment payload using the helper
      const acknowledgment = createAcknowledgment(
        customConfig.intent,
        correlationId || 'N/A_NoContext', // Use N/A if context failed (shouldn't happen with proper context)
        'service-a', // Identify this service as the caller
        {
          expectedOutcomeHint: customConfig.expectedOutcomeHint,
          traceId: traceId || 'N/A_NoContext',
          spanId: outgoingSpanId, // Use the NEW span ID for the remote call
        }
      );

      // Snippet 5: Add the Acknowledgment Header
      // Stringify the payload and add it as our custom header.
      config.headers['X-Dependency-Acknowledgment'] = JSON.stringify(acknowledgment);
      // Also add standard tracing headers for compatibility with other tools
      config.headers['X-Correlation-ID'] = correlationId || 'N/A_NoContext';
      config.headers['X-Trace-ID'] = traceId || 'N/A_NoContext';
      config.headers['X-Span-ID'] = outgoingSpanId; // Send the NEW span ID
      if (parentSpanId) {
          config.headers['X-Parent-Span-ID'] = parentSpanId; // Optionally send the parent span ID
      }


      // Snippet 6: Log the Outgoing Call with Intent
      // Use logger from imports
      logger.debug('Adding acknowledgment header to outgoing request', {
          url: config.url,
          method: config.method,
          intent: acknowledgment.intent,
          correlationId: acknowledgment.correlationId,
          traceId: acknowledgment.traceId,
          spanId: acknowledgment.spanId, // Log the span ID being sent
          parentSpanId: parentSpanId, // Log the parent span ID if available
          callerService: acknowledgment.callerService,
      });
    } else {
        // Log a warning if a call is made without providing an intent
        // Use logger from imports
        logger.warn('Outgoing request missing intent metadata', { url: config.url, method: config.method, correlationId: getCorrelationId() || 'N/A' });
    }

    return config; // Return the modified config
  },
  (error) => {
    // Handle errors that happen *before* the request is sent (e.g., config issues)
    // Use logger from imports
    logger.error('Error in request interceptor', { error: (error as Error).message, correlationId: getCorrelationId() || 'N/A' });
    return Promise.reject(error); // Propagate the error
  }
);

// Snippet 7: Example Function Using the Client - CORRECTED
// This function makes a specific call to Service B's activation endpoint.
// It takes intent and hint as parameters and passes them to the client config.

// Define interfaces for the request body and expected response body
interface ActivateUserRequestData { userId: string; }
// Define the expected structure of the response data from Service B
interface ActivateUserResponseData { status: string; userId: string; correlationId: string; }


// Mark the function as export async so it can be imported and used by other files
export async function activateUserInServiceB(
    userId: string,
    // Require intent when calling this function
    intent: string,
    expectedOutcomeHint?: string
): Promise<ActivateUserResponseData> { // Declare that this function returns a Promise resolving to ActivateUserResponseData
    // Use logger from imports
    logger.info('Preparing activation call to Service B', { userId, intent, correlationId: getCorrelationId() });
    try {
        // Define the config object you want to pass to the Axios call
        // This object contains the custom properties 'intent' and 'expectedOutcomeHint'
        const callConfig = {
             // Pass custom properties here for the interceptor to pick up!
             intent: intent,
             expectedOutcomeHint: expectedOutcomeHint
         };

        // Make the POST request using the configured apiClient.
        // 1. Tell Axios what type to expect for the RESPONSE DATA by adding a generic type <ActivateUserResponseData>
        //    This resolves the TS2322 error on 'return response.data'.
        // 2. Cast the config object ({ intent, expectedOutcomeHint }) to 'any' when passing it as the third argument.
        //    This bypasses the TS2353 error related to the augmented type not being fully recognized here.
        const response: AxiosResponse<ActivateUserResponseData> = await apiClient.post<ActivateUserResponseData>( // <-- ADD <ActivateUserResponseData> generic type here and type hint response
            '/users/activate', // The endpoint on Service B
            { userId } as ActivateUserRequestData, // Optional: Type hint the request body if needed
            callConfig as any // <-- CAST THE CONFIG OBJECT TO 'any' TO BYPASS TS2353 error
        );

        // Log successful call completion
        // Use logger from imports
        logger.info('Service B activation call successful', { userId, correlationId: getCorrelationId() });
        return response.data; // This line should no longer error (TS2322) because response.data is now typed as ActivateUserResponseData
    } catch (error) {
         // Log call failure
         // Use logger from imports
         logger.error('Service B activation call failed', {
            userId,
            correlationId: getCorrelationId(),
            error: (error as Error).message, // Log error message
            // Log response details if available from Axios error
            response_data: (error as any).response?.data,
            response_status: (error as any).response?.status
         });
         throw error; // Re-throw the error for the caller to handle
    }
}

