import { logger } from './monitoring';

/** Minimal Sentry stub — becomes a no-op unless SENTRY_DSN is provided. */
export function initSentry(dsn?: string) {
  if (!dsn) return;
  // In a future iteration we can initialize the real Sentry SDK here.
  logger.info('Sentry initialized (stub)', 'sentry', { dsn: dsn ? '***' : undefined });
}

export function captureException(err: unknown, context?: Record<string, unknown>) {
  if (!process.env.SENTRY_DSN) return;
  logger.error('Sentry captured exception', 'sentry', context, err);
}

const Sentry = {
  initSentry,
  captureException,
};

export default Sentry;
