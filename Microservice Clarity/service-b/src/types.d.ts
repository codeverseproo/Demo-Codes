// service-b/src/types.d.ts

// Snippet 1: Import the Shared DependencyAcknowledgment type
// This type is needed for the augmentation below.
import { DependencyAcknowledgment } from '../../shared/src/acknowledgment/types'; // Relative path from service-b/src/

// Snippet 2: Augment the 'express' module
// This block extends the interfaces within the 'express' module,
// adding our custom properties to the standard Request object type.
declare module 'express' {
  interface Request {
    /**
     * The parsed Dependency Acknowledgment payload from the 'X-Dependency-Acknowledgment' header.
     * Added by the acknowledgment middleware. Undefined if header is missing or invalid.
     */
    dependencyAcknowledgment?: DependencyAcknowledgment;

    /**
     * The Correlation ID for this request flow.
     * Derived from standard headers, acknowledgment payload, or generated as a fallback.
     * Added by the acknowledgment middleware. Guaranteed to be present after middleware runs.
     */
    correlationId: string; // We'll ensure this is always set in the middleware

     /**
     * The Trace ID for this request flow.
     * Derived from standard headers, acknowledgment payload, or generated as a fallback.
     * Added by the acknowledgment middleware.
     */
    traceId?: string;

    /**
     * The Span ID for this specific operation within the request trace.
     * Derived from standard headers, acknowledgment payload, or generated as a fallback.
     * Added by the acknowledgment middleware.
     */
    spanId?: string;

    // Add any other custom properties you attach to the Request object via middleware here
  }

  // You could also augment Response or other types here if needed
}

// Note: This file contains ONLY type declarations. It does NOT contain executable JavaScript code.
// Its purpose is solely to provide type information to the TypeScript compiler.
