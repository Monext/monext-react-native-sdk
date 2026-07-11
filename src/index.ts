import NativeMonextPayment, {
  type PaymentSheetResult,
  type MnxtSDKContext,
  type MnxtSDKConfiguration,
  type Appearance,
  type GooglePayConfiguration,
  type ApplePayConfiguration,
} from './NativeMonextPayment';

export type {
  PaymentSheetResult,
  MnxtSDKContext,
  MnxtSDKConfiguration,
  Appearance,
  GooglePayConfiguration,
  ApplePayConfiguration,
};

export function presentPaymentSheet(sessionToken: string, context: MnxtSDKContext): Promise<PaymentSheetResult> {
  if (!sessionToken) {
    return Promise.reject(new Error('sessionToken is required'));
  }

  return NativeMonextPayment.presentPaymentSheet(sessionToken, context);
}
