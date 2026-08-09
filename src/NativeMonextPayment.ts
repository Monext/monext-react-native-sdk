import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type MnxtSDKConfiguration = {
  language?: string;
};

export type PaymentMethodShape = 'round' | 'square';

export type Appearance = {
  primaryColor?: string;
  onPrimaryColor?: string;
  secondaryColor?: string;
  onSecondaryColor?: string;
  backgroundColor?: string;
  onBackgroundColor?: string;
  surfaceColor?: string;
  onSurfaceColor?: string;
  confirmationColor?: string;
  onConfirmationColor?: string;
  errorColor?: string;
  pendingColor?: string;
  textfieldLabelColor?: string;
  textfieldTextColor?: string;
  textfieldBorderColor?: string;
  textfieldBorderSelectedColor?: string;
  textfieldBackgroundColor?: string;
  textfieldAccessoryColor?: string;
  buttonRadius?: number;
  cardRadius?: number;
  textfieldRadius?: number;
  textfieldStroke?: number;
  textfieldStrokeSelected?: number;
  // Accepted values (case-insensitive): "round" | "square". Any other value falls back to "round".
  paymentMethodShape?: PaymentMethodShape;
  headerTitle?: string;
  headerBackgroundColor?: string;
  onHeaderBackgroundColor?: string;
  backButtonText?: string;
};

export type GooglePayTheme = 'light' | 'dark';

export type GooglePayButtonType =
  | 'buy'
  | 'donate'
  | 'book'
  | 'checkout'
  | 'order'
  | 'subscribe'
  | 'pay'
  | 'plain';

export type GooglePayConfiguration = {
  // Accepted values (case-insensitive): "light" | "dark". Any other value falls back to "dark".
  theme?: GooglePayTheme;
  // Accepted values (case-insensitive): "buy" | "donate" | "book" | "checkout" | "order" | "subscribe" | "pay".
  // Any other value falls back to "plain".
  type?: GooglePayButtonType;
};

export type ApplePayButtonLabel =
  | 'buy'
  | 'book'
  | 'checkout'
  | 'donate'
  | 'subscribe'
  | 'setup'
  | 'plain';

export type ApplePayButtonStyle =
  | 'black'
  | 'white'
  | 'whiteOutline'
  | 'whiteoutline';

export type ApplePayConfiguration = {
  // Accepted values (case-insensitive, "_" ignored): "buy" | "book" | "checkout" | "donate" | "subscribe" | "setup".
  // Any other value falls back to "plain".
  buttonLabel?: ApplePayButtonLabel;
  // Accepted values (case-insensitive, "_" ignored): "black" | "white" | "whiteoutline".
  // Any other value falls back to "black".
  buttonStyle?: ApplePayButtonStyle;
};

export type MnxtSDKContext = {
  // "production" or "sandbox" (case-insensitive). Required — rejects the promise with
  // E_INVALID_ENVIRONMENT if missing or not one of these two values.
  environment: 'production' | 'sandbox';
  config?: MnxtSDKConfiguration;
  appearance?: Appearance;
  googlePayConfiguration?: GooglePayConfiguration;
  applePayConfiguration?: ApplePayConfiguration;
};

export type PaymentSheetState =
  | 'paymentSuccess'
  | 'paymentFailure'
  | 'paymentPending'
  | 'tokenExpired'
  | 'paymentCanceled'
  | 'paymentSheetDismissedByUser'
  | 'paymentIncomplete';

export type PaymentSheetResult = {
  result: 'completed' | 'dismissed';
  state?: PaymentSheetState;
};

export interface Spec extends TurboModule {
  presentPaymentSheet(sessionToken: string, context: MnxtSDKContext): Promise<PaymentSheetResult>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('MonextPayment');
