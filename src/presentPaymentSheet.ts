import NativeMonextPayment, {
  type MnxtSDKContext,
  type PaymentSheetResult,
} from './NativeMonextPayment';
import { MonextError, MonextErrorCodes } from './MonextError';

function isValidEnvironmentValue(value: unknown): value is 'production' | 'sandbox' {
  return typeof value === 'string' && /^(production|sandbox)$/i.test(value);
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

  return NativeMonextPayment.presentPaymentSheet(trimmedToken, context);
}
