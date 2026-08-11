import NativeMonextPayment, {
  type MnxtSDKContext,
  type PaymentSheetResult,
} from './NativeMonextPayment';
import { MonextError, MonextErrorCodes, type MonextErrorCode } from './MonextError';

function isValidEnvironmentValue(value: unknown): value is 'production' | 'sandbox' {
  return typeof value === 'string' && /^(production|sandbox)$/i.test(value);
}

function normalizeNativeError(error: unknown): MonextError {
  if (error instanceof MonextError) {
    return error;
  }

  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    Object.values(MonextErrorCodes).includes(error.code as MonextErrorCode)
      ? error.code as MonextErrorCode
      : MonextErrorCodes.PAYMENT_SHEET;
  const message = error instanceof Error && error.message
    ? error.message
    : 'The native payment sheet failed';

  return new MonextError(code, message);
}

export function presentPaymentSheet(sessionToken: string, context: MnxtSDKContext): Promise<PaymentSheetResult> {
  const trimmedToken = typeof sessionToken === 'string' ? sessionToken.trim() : sessionToken;
  if (!trimmedToken) {
    return Promise.reject(new MonextError(MonextErrorCodes.INVALID_SESSION_TOKEN, 'sessionToken is required'));
  }

  const environmentValue = context?.environment;
  if (!isValidEnvironmentValue(environmentValue)) {
    const message = environmentValue == null
      ? 'environment is required and must be "production" or "sandbox"'
      : `environment must be "production" or "sandbox", got "${String(environmentValue)}"`;
    return Promise.reject(new MonextError(MonextErrorCodes.INVALID_ENVIRONMENT, message));
  }

  return NativeMonextPayment.presentPaymentSheet(trimmedToken, context)
    .catch((error: unknown) => Promise.reject(normalizeNativeError(error)));
}
