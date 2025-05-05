// shared/src/acknowledgment/types.ts v1.1

import { v4 as uuidv4 } from 'uuid'; // Needed for the helper function

// Snippet 1: The DependencyAcknowledgment Interface
// This defines the structure of the payload we'll pass between services.
export interface DependencyAcknowledgment {
  /**
   * v1.1: Standardized intent identifier. Follows dot-notation: domain.process.action.
   * E.g., 'user.signup.complete', 'order.payment.successful'.
   */
  intent: string;

  /**
   * v1.1: Optional hint from the caller about the expected immediate business outcome
   * in the callee service for this specific call.
   * E.g., 'Trigger welcome email', 'Update inventory count'.
   */
  expectedOutcomeHint?: string;

  /**
   * v1.1: A unique identifier tracing the overall business process this interaction belongs to.
   * Propagated across all subsequent calls/messages within the same flow.
   */
  correlationId: string;

  /** v1.1: Version of the DependencyAcknowledgment type/taxonomy structure. */
  ackVersion: '1.1'; // Explicit version field

  /**
   * v1.1: Standard tracing traceId (e.g., from OpenTelemetry).
   * Often the same as correlationId at the start of a trace.
   */
  traceId?: string;

  /**
   * v1.1: Standard tracing spanId. Identifies the current operation within the trace.
   */
  spanId?: string;

  /**
   * v1.1: Identifier for the service making the call. Helps trace the origin.
   */
  callerService: string;

  // You could add other cross-cutting metadata here (e.g., authenticated user ID, tenant ID)
}

// Snippet 2: Helper Function to Create Acknowledgment Payloads
// Provides a consistent way for services to construct the payload.
export function createAcknowledgment(
  intent: string,
  correlationId: string,
  callerService: string,
  options?: { expectedOutcomeHint?: string; traceId?: string; spanId?: string; }
): DependencyAcknowledgment {
  return {
    intent,
    correlationId,
    callerService,
    ackVersion: '1.1',
    ...options, // Merge optional fields
  };
}
