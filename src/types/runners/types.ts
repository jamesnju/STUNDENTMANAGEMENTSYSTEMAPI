export type JobResult = {
  ok: boolean;
  summary: Record<string, number | string | boolean | null>;
  // any runner-specific payload — kept generic for audit logging
  details?: unknown;
};

export type JobRunner<I = unknown> = (input: I | undefined) => Promise<JobResult>;