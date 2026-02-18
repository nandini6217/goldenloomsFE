/**
 * Extract a user-facing error message from an API error (e.g. axios error with response.data.error).
 */
export function getApiErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { error?: string } } }).response;
    if (res?.data?.error && typeof res.data.error === 'string') {
      return res.data.error;
    }
  }
  return 'Something went wrong. Please try again.';
}
