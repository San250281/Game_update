/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    try {
      // Attempt to parse FirestoreErrorInfo JSON if present
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed === 'object' && parsed.error) {
        return parsed.error;
      }
    } catch {
      // Not a JSON string error, return original message
    }
    return error.message;
  }
  return 'An unexpected error occurred';
};
