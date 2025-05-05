// service-b/src/app.ts

// Snippet 1: Imports
import express, { Request, Response, NextFunction } from 'express';
import { acknowledgmentMiddleware } from './middleware/acknowledgmentMiddleware';
import logger from './utils/logger';
import { v4 as uuidv4 } from 'uuid';

// *** REMOVE THE interface AugmentedRequest extends Request { ... } BLOCK if it was present ***


// Snippet 2: App Setup and Middleware
const app = express();
const PORT = 3000;

app.use(express.json());

// Use our custom acknowledgment middleware early in the pipeline
// The middleware signature should now match the standard (req, res, next)
app.use(acknowledgmentMiddleware);

// Snippet 3: Example Route Handler
// Use standard Request/Response types here, but cast 'req' internally.
app.post('/users/activate', async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;
  // *** CAST TO 'any' TO ACCESS PROPERTIES AT RUNTIME ***
  // This is the key change to bypass the TS2339 errors.
  const augmentedReq = req as any;

  // Access the acknowledgment and IDs from the casted request object.
  const ack = augmentedReq.dependencyAcknowledgment;
  const { correlationId, traceId, spanId } = augmentedReq;


  // Log the start of processing, linking it to the business intent and IDs
  logger.info('Processing user activation request', {
    userId,
    correlationId,
    traceId,
    spanId,
    intent: ack?.intent || 'unknown_intent', // Use intent if available
    callerService: ack?.callerService || 'unknown_caller', // Use caller service if available
  });

  // Validate input
  if (!userId) {
    logger.error('Missing userId for activation', { correlationId, traceId });
    return res.status(400).json({ error: 'userId is required', correlationId }); // Include ID in error response
  }

  // Snippet 4: Simulate Business Logic
  await new Promise(resolve => setTimeout(resolve, 100));
  logger.info('Simulating user activation in database', { userId, correlationId, traceId });

  // Snippet 5: Conditional Logic Based on Intent (Optional)
  if (ack?.intent === 'user.signup.complete') {
      logger.info('Simulating initiation of welcome flow downstream based on signup intent', { userId, correlationId, traceId });
  } else if (ack?.intent === 'admin.user.manual_override') {
       logger.info('Simulating different logic for admin override activation', { userId, correlationId, traceId });
  }


  // Snippet 6: Send Response
  logger.info('Finished processing user activation request', { userId, correlationId, traceId });
  res.status(200).json({ status: 'activated', userId, correlationId }); // Include ID in success response
});

// Snippet 7: Basic Error Handling Middleware
// Use standard Request/Response types here, but cast 'req' internally for custom properties.
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // *** CAST TO 'any' TO ACCESS PROPERTIES IN LOGGING ***
    const augmentedReq = req as any;

    logger.error('Unhandled error in request', {
        error: (err as Error).message,
        stack: (err as Error).stack,
        correlationId: augmentedReq.correlationId || 'N/A', // Access via cast
        traceId: augmentedReq.traceId || 'N/A',           // Access via cast
        path: req.path, // These exist on standard Request
        method: req.method, // These exist on standard Request
    });
    res.status(500).json({ error: 'Internal Server Error', correlationId: augmentedReq.correlationId || 'N/A' }); // Include ID via cast
});


// Snippet 8: Start the Server
app.listen(PORT, () => logger.info(`Service B listening on port ${PORT}`));
