// utils/formatApiError.ts

import { ApiError } from "./apiClients";


export function explain(err: unknown): { title: string; message: string } {
  if (err instanceof ApiError) {
  switch (err.kind) {
    case 'rate_limit':
      return {
        title: 'Rate limit reached',
        message:
          typeof err.retryAfter === 'number' && err.retryAfter > 0
            ? `Please try again in about ${Math.ceil(err.retryAfter)} seconds.`
            : 'Please wait a moment or reduce the number of data requests.',
      };
    case 'timeout':
      return {
        title: 'Request timed out',
        message: 'The connection is slow. Please try again.',
      };
    case 'network':
      return {
        title: 'Network error',
        message: 'Please check your connection and try again.',
      };
    case 'server':
      return {
        title: 'Server error',
        message: 'Please try again in a moment.',
      };
    case 'bad_request':
      return {
        title: 'Invalid request',
        message: 'Please try a different action.',
      };
    default:
      return {
        title: 'An error occurred',
        message: 'Please try again later.',
      };
  }
}
return {
  title: 'An error occurred',
  message: 'Please try again later.',
};
}
