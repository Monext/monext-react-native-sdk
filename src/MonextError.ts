export type MonextErrorCode =
  | 'E_INVALID_SESSION_TOKEN'
  | 'E_INVALID_ENVIRONMENT'
  | 'E_PAYMENT_IN_PROGRESS'
  | 'E_NO_ACTIVITY'
  | 'E_NO_VIEW_CONTROLLER'
  | 'E_PAYMENT_SHEET';

export const MonextErrorCodes = {
  /**
   * `sessionToken` was empty/whitespace-only. Thrown by `presentPaymentSheet`
   * itself, before any native call (Android/iOS mirror this check).
   */
  INVALID_SESSION_TOKEN: 'E_INVALID_SESSION_TOKEN',
  /**
   * `context.environment` was missing or not `'production'`/`'sandbox'`
   * (case-insensitive). Thrown by `presentPaymentSheet` itself, before any
   * native call (Android/iOS mirror this check).
   */
  INVALID_ENVIRONMENT: 'E_INVALID_ENVIRONMENT',
  /** A payment sheet is already being presented. Native-only (Android + iOS). */
  PAYMENT_IN_PROGRESS: 'E_PAYMENT_IN_PROGRESS',
  /** No Android Activity was available to present on. Android-only. */
  NO_ACTIVITY: 'E_NO_ACTIVITY',
  /** No iOS view controller was available to present on. iOS-only. */
  NO_VIEW_CONTROLLER: 'E_NO_VIEW_CONTROLLER',
  /**
   * The native payment sheet reported an unrecoverable error. Android-only —
   * iOS has no equivalent path today; a failing iOS payment resolves the
   * Promise with `state: 'paymentFailure'` instead of rejecting.
   */
  PAYMENT_SHEET: 'E_PAYMENT_SHEET',
} as const satisfies Record<string, MonextErrorCode>;

/**
 * Error shape shared by JS-side validation failures and native rejections:
 * both expose `code` (one of `MonextErrorCodes`) and `message`.
 */
export class MonextError extends Error {
  readonly code: MonextErrorCode;

  constructor(code: MonextErrorCode, message: string) {
    super(message);
    this.name = 'MonextError';
    this.code = code;
  }
}
