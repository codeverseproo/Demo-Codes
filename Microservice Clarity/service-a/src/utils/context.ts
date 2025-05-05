// service-a/src/utils/context.ts

// Snippet 1: Global Variables for Context (DEMO ONLY)
// WARNING: Using global variables like this is NOT safe in a multi-request
// environment like a web server. This is a simplification for demonstration
// purposes in a single-execution script.
// In a real application, use AsyncLocalStorage (Node.js v14.5+) or similar mechanisms.
let currentCorrelationId: string | undefined;
let currentTraceId: string | undefined;
let currentSpanId: string | undefined;

// Snippet 2: Set Context Function
// Simulates setting context for the current execution flow.
export function setContext(correlationId: string | undefined, traceId: string | undefined, spanId: string | undefined) {
    currentCorrelationId = correlationId;
    currentTraceId = traceId;
    currentSpanId = spanId;
}

// Snippet 3: Get Context Functions
// Simulates getting context for the current execution flow.
export function getCorrelationId(): string | undefined {
    return currentCorrelationId;
}

export function getTraceId(): string | undefined {
    return currentTraceId;
}

export function getSpanId(): string | undefined {
    return currentSpanId;
}

// Snippet 4: Run in Context Helper (DEMO ONLY)
// Helper to wrap an async function and run it with specific context set temporarily.
export async function runInContext(correlationId: string, traceId: string, spanId: string, fn: () => Promise<void>): Promise<void> {
    setContext(correlationId, traceId, spanId); // Set context before running function
    try {
        await fn(); // Execute the provided async function
    } finally {
        // IMPORTANT in real context propagation: always clean up the context!
        setContext(undefined, undefined, undefined);
    }
}
