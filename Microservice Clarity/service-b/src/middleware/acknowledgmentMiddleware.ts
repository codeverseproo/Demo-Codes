// service-b/src/middleware/acknowledgmentMiddleware.ts

// Snippet 1: Imports
import { Request, Response, NextFunction } from 'express'; // Express core types
// Import the shared DependencyAcknowledgment type definition
import { DependencyAcknowledgment } from '../../../shared/src/acknowledgment/types'; // Correct relative path from service-b/src/
import logger from '../utils/logger'; // Service B's logger
import { v4 as uuidv4 } from 'uuid'; // For generating fallback IDs

// *** REMOVE THE declare module 'express' { ... } BLOCK FROM HERE if it was present ***

// Snippet 2: The Middleware Function
// This function runs for each incoming request. It processes the acknowledgment header.
// We use 'any' casts here to bypass TypeScript errors related to custom properties
// added to the Request object at runtime.
export function acknowledgmentMiddleware(req: Request, res: Response, next: NextFunction) {
  const ackHeader = req.header('X-Dependency-Acknowledgment'); // Get our custom header
  // Also get standard tracing headers if they exist
  const correlationIdHeader = req.header('X-Correlation-ID');
  const traceIdHeader = req.header('X-Trace-ID');
  const spanIdHeader = req.header('X-Span-ID');

  let acknowledgment: DependencyAcknowledgment | undefined;

  // Snippet 3: Parse the Acknowledgment Header
  if (ackHeader) {
    try {
      acknowledgment = JSON.parse(ackHeader);
      // Attach the parsed acknowledgment to the request object.
      // *** USE (req as any) to bypass TS error here ***
      (req as any).dependencyAcknowledgment = acknowledgment;

      // Use IDs from the acknowledgment if standard headers are missing
      // *** USE (req as any) to bypass TS errors here ***
      if (!correlationIdHeader) (req as any).correlationId = acknowledgment.correlationId;
      if (!traceIdHeader) (req as any).traceId = acknowledgment.traceId;
      if (!spanIdHeader) (req as any).spanId = acknowledgment.spanId;

      // Snippet 4: Log the Received Acknowledgment (Crucial for Observability)
      // This log entry captures the intent and linking IDs at the point of reception.
      logger.info('Received request with acknowledgment', {
        // *** USE (req as any) to access properties in logging ***
        correlationId: (req as any).correlationId,
        traceId: (req as any).traceId,
        spanId: (req as any).spanId,
        intent: acknowledgment.intent,
        ackVersion: acknowledgment.ackVersion,
        callerService: acknowledgment.callerService,
        expectedOutcomeHint: acknowledgment.expectedOutcomeHint,
        path: req.path, // Standard Request properties are still available
        method: req.method,
      });

    } catch (error) {
      // Snippet 5: Handle Parsing Errors
      logger.error('Failed to parse Dependency Acknowledgment header', {
        headerValue: ackHeader,
        error: (error as Error).message, // Cast error for safer access
        path: req.path,
        // *** USE (req as any) to access correlationId if it was set earlier ***
        correlationId: correlationIdHeader || (req as any).correlationId || 'N/A', // Log any known ID
      });
    }
  } else {
    // Snippet 6: Handle Missing Header (Optional Warning/Policy)
     logger.warn('Received request without Dependency Acknowledgment header', {
       path: req.path,
       method: req.method,
       correlationId: correlationIdHeader || 'N/A',
       traceId: traceIdHeader || 'N/A',
     });
  }

  // Snippet 7: Ensure Correlation IDs are Always Set
  // *** USE (req as any) for assignments and access ***
  (req as any).correlationId = (req as any).correlationId || correlationIdHeader || uuidv4(); // Ensure correlationId is set
  (req as any).traceId = (req as any).traceId || traceIdHeader || (req as any).correlationId; // Use correlationId as fallback traceId
  (req as any).spanId = (req as any).spanId || spanIdHeader || uuidv4(); // Ensure spanId is set


  next(); // Pass control to the next middleware or route handler
}
