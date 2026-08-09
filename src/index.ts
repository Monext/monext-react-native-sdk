import NativeMonextPayment, {
  type PaymentSheetResult,
  type PaymentSheetState,
  type MnxtSDKContext,
  type MnxtSDKConfiguration,
  type Appearance,
  type PaymentMethodShape,
  type GooglePayConfiguration,
  type GooglePayTheme,
  type GooglePayButtonType,
  type ApplePayConfiguration,
  type ApplePayButtonLabel,
  type ApplePayButtonStyle,
} from './NativeMonextPayment';

export { PaymentButton } from './PaymentButton';
export type {
  PaymentButtonProps,
  PaymentButtonRenderProps,
} from './PaymentButton';

export type {
  PaymentSheetResult,
  PaymentSheetState,
  MnxtSDKContext,
  MnxtSDKConfiguration,
  Appearance,
  PaymentMethodShape,
  GooglePayConfiguration,
  GooglePayTheme,
  GooglePayButtonType,
  ApplePayConfiguration,
  ApplePayButtonLabel,
  ApplePayButtonStyle,
};

export function presentPaymentSheet(sessionToken: string, context: MnxtSDKContext): Promise<PaymentSheetResult> {
  if (!sessionToken) {
    return Promise.reject(new Error('sessionToken is required'));
  }

  return NativeMonextPayment.presentPaymentSheet(sessionToken, context);
}
