import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type MnxtSDKConfiguration = {
  language?: string;
};

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
  paymentMethodShape?: string;
  headerTitle?: string;
  headerBackgroundColor?: string;
  onHeaderBackgroundColor?: string;
  backButtonText?: string;
};

export type GooglePayConfiguration = {
  // Accepted values (case-insensitive): "light" | "dark". Any other value falls back to "dark".
  theme?: string;
  // Accepted values (case-insensitive): "buy" | "donate" | "book" | "checkout" | "order" | "subscribe" | "pay".
  // Any other value falls back to "plain".
  type?: string;
};

export type ApplePayConfiguration = {
  // Accepted values (case-insensitive, "_" ignored): "buy" | "book" | "checkout" | "donate" | "subscribe" | "setup".
  // Any other value falls back to "plain".
  buttonLabel?: string;
  // Accepted values (case-insensitive, "_" ignored): "black" | "white" | "whiteoutline".
  // Any other value falls back to "black".
  buttonStyle?: string;
};

export type MnxtSDKContext = {
  // "production" or "sandbox" (case-insensitive). Rejects the promise with E_INVALID_ENVIRONMENT
  // if present but not one of these two values.
  environment: 'production' | 'sandbox';
  config?: MnxtSDKConfiguration;
  appearance?: Appearance;
  googlePayConfiguration?: GooglePayConfiguration;
  applePayConfiguration?: ApplePayConfiguration;
};

export type PaymentSheetResult = {
  result: 'completed' | 'dismissed';
  state?: string;
};

export interface Spec extends TurboModule {
  presentPaymentSheet(sessionToken: string, context: MnxtSDKContext): Promise<PaymentSheetResult>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('MonextPayment');
